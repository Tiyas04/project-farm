import mongoose from "mongoose";
import ProductModel from "@/models/product";
import CartModel from "@/models/cart";
import CartItemsModel from "@/models/cartitem";
import OrderModel from "@/models/order";
import OrderItemsModel from "@/models/orderitem";
import CheckOutModel from "@/models/checkout";
import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Helper for consistent auth extraction
const getUserId = (request: NextRequest): string | null => {
    let userId = request.headers.get("userid")
    if (!userId) {
        const refreshToken = request.cookies.get("refreshToken")?.value
        if (refreshToken) {
            try {
                const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
                if (decodedToken && decodedToken.id) userId = decodedToken.id
            } catch (e) { }
        }
    }
    return userId;
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        /* ─────────── 1️⃣ VALIDATE USER ─────────── */
        const userId = getUserId(request);
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access or Invalid User ID" },
                { status: 401 }
            );
        }

        /* ─────────── 2️⃣ VALIDATE FORM DATA ─────────── */
        const body = await request.json();
        const { fullName, email, phoneno, address, city, state, pincode, paymentMethod } = body;

        const requiredFields = { fullName, email, phoneno, address, city, state, pincode };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, message: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }



        /* ─────────── 4️⃣ FETCH & VALIDATE CART ─────────── */
        const cartData = await CartModel.aggregate([
            { $match: { userid: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "cartitems",
                    localField: "cartitems",
                    foreignField: "_id",
                    as: "cartitems",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartitems.productid",
                    foreignField: "_id",
                    as: "products",
                },
            },
            {
                $project: {
                    items: {
                        $map: {
                            input: "$cartitems",
                            as: "item",
                            in: {
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$products",
                                                as: "p",
                                                cond: { $eq: ["$$p._id", "$$item.productid"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                                quantity: "$$item.quantity",
                                price: "$$item.price",
                            },
                        },
                    },
                },
            },
        ]);

        if (!cartData.length || !cartData[0].items || cartData[0].items.length === 0) {
            return NextResponse.json(
                { success: false, message: "Cart is empty" },
                { status: 400 }
            );
        }

        const validItems = cartData[0].items.filter((item: any) => item.product && item.product._id);

        if (validItems.length === 0) {
            return NextResponse.json(
                { success: false, message: "Cart contains only invalid/deleted products" },
                { status: 400 }
            );
        }

        // Validate stock
        for (const item of validItems) {
            if (item.quantity > item.product.stockLevel) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stockLevel}, Requested: ${item.quantity}`
                    },
                    { status: 400 }
                )
            }
        }

        const subtotal = validItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + tax;

        /* ─────────── 5️⃣ CREATE DB RECORDS ─────────── */
        const order = await OrderModel.create({
            userid: new mongoose.Types.ObjectId(userId),
            orderitems: [],
            totalamount: totalAmount,
            subtotal,
            tax,
            status: "ordered",
        });

        const orderItemIds: mongoose.Types.ObjectId[] = [];
        for (const item of validItems) {
            const orderItem = await OrderItemsModel.create({
                orderid: order._id,
                productid: item.product._id,
                quantity: item.quantity,
                price: item.price,
            });
            orderItemIds.push(orderItem._id);
        }

        order.orderitems = orderItemIds;
        await order.save();

        for (const item of validItems) {
            await ProductModel.findByIdAndUpdate(item.product._id, {
                $inc: { stockLevel: -item.quantity },
            });
        }

        await UserModel.findByIdAndUpdate(userId, {
            $push: { orders: order._id }
        });

        await CheckOutModel.create({
            orderid: order._id,
            fullName,
            email,
            phoneno: Number(phoneno),
            address,
            city,
            state,
            pincode,
            paymentMethod: paymentMethod || "COD",
        });

        /* ─────────── 🧾 GENERATE & UPLOAD RECEIPT ─────────── */
        // Todo: Implement receipt generation later

        /* ─────────── 6️⃣ CLEAR CART ─────────── */
        await CartItemsModel.deleteMany({ cartid: cartData[0]._id });
        await CartModel.findOneAndUpdate(
            { userid: new mongoose.Types.ObjectId(userId) },
            { $set: { cartitems: [] } }
        );

        /* ─────────── 7️⃣ NOTIFICATIONS ─────────── */
        // Todo: Implement email notifications later

        return NextResponse.json(
            { success: true, message: "Order placed successfully", orderId: order._id, totalAmount },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("[PLACE ORDER ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Failed to place order", error: error.message },
            { status: 500 }
        );
    }
}


export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();

        const userId = getUserId(request);
        const { status } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access" },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const orderId = url.searchParams.get("id");

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                { success: false, message: "No status provided" },
                { status: 400 }
            )
        }

        const isAdmin = request.headers.get("admin") === "admin";

        const query: any = { _id: new mongoose.Types.ObjectId(orderId) };
        if (!isAdmin) {
            query.userid = new mongoose.Types.ObjectId(userId);
        }

        const order = await OrderModel.findOne(query);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        if (order.status === "cancelled") {
            return NextResponse.json(
                { success: false, message: "Cannot modify a cancelled order" },
                { status: 400 }
            );
        }

        if (!isAdmin && ["shipped", "delivered", "cancelled"].includes(order.status)) {
            return NextResponse.json(
                { success: false, message: `Cannot modify order with status: ${order.status}` },
                { status: 400 }
            );
        }

        order.status = status;

        const checkout = await CheckOutModel.findOne({ orderid: order._id });
        const orderItems = await OrderItemsModel.find({ orderid: order._id }).populate("productid");

        if (checkout && orderItems.length > 0) {
            // Todo: Implement receipt regeneration later
        }

        await order.save({ validateBeforeSave: false });

        if (status === "cancelled") {
            if (orderItems && orderItems.length > 0) {
                for (const item of orderItems) {
                    if (item.productid) {
                        await ProductModel.findByIdAndUpdate(item.productid._id, {
                            $inc: { stockLevel: item.quantity }
                        });
                    }
                }
            }

            // Todo: Send admin cancellation email later
        }

        // Todo: Send user status update email later

        return NextResponse.json(
            { success: true, message: "Order status updated successfully", order },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("[CANCEL ORDER ERROR]", error);
        return NextResponse.json(
            { success: false, message: "Failed to update order status", error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const userId = getUserId(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID not found" },
                { status: 400 }
            );
        }

        const orderdata = await OrderModel.aggregate([
            {
                $match: { userid: new mongoose.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "orderitems",
                    localField: "orderitems",
                    foreignField: "_id",
                    as: "orderitems",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "orderitems.productid",
                    foreignField: "_id",
                    as: "products",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    totalamount: 1,
                    createdAt: 1,
                    items: {
                        $map: {
                            input: "$orderitems",
                            as: "item",
                            in: {
                                quantity: "$$item.quantity",
                                price: "$$item.price",
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$products",
                                                as: "product",
                                                cond: { $eq: ["$$product._id", "$$item.productid"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        ]);

        return NextResponse.json(
            { success: true, message: "Orders fetched successfully", data: orderdata },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to get orders" },
            { status: 500 }
        );
    }
}
