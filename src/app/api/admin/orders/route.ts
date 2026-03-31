import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/models/order";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "@/models/user";
import ProductModel from "@/models/product";
import OrderItemsModel from "@/models/orderitem";

// Helper to authenticate admin user from token
const authenticateAdmin = (req: NextRequest) => {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return null;

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
        if (decoded.role === 'admin') {
            return decoded;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const adminToken = authenticateAdmin(req);
        if (!adminToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        // Fetch all system orders with buyer, product, and seller details
        const rawOrders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "userid",
                select: "name email phoneno",
                model: UserModel
            })
            .populate({
                path: "orderitems",
                model: OrderItemsModel,
                populate: {
                    path: "productid",
                    select: "name image seller",
                    model: ProductModel,
                    populate: {
                        path: "seller",
                        select: "name email phoneno",
                        model: UserModel
                    }
                }
            })
            .lean();

        const mappedOrders = rawOrders.map((o: any) => ({
             _id: o._id,
             status: o.status,
             totalamount: o.totalamount,
             createdAt: o.createdAt || (o._id.getTimestamp ? o._id.getTimestamp() : new Date()),
             buyer: o.userid ? {
                 name: o.userid.name,
                 email: o.userid.email,
                 phoneno: o.userid.phoneno
             } : undefined,
             items: (o.orderitems || []).map((item: any) => ({
                 quantity: item.quantity,
                 price: item.price,
                 product: item.productid ? {
                     name: item.productid.name,
                     image: item.productid.image,
                     seller: item.productid.seller ? {
                         name: item.productid.seller.name,
                         email: item.productid.seller.email,
                         phoneno: item.productid.seller.phoneno
                     } : undefined
                 } : null
             }))
        }));

        return NextResponse.json(
            {
                success: true,
                message: "All orders fetched successfully",
                data: mappedOrders
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Fetch all orders error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
