import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/models/order";
import ProductModel from "@/models/product";
import OrderItemsModel from "@/models/orderitem";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Helper to authenticate user from token
const authenticateUser = (req: NextRequest) => {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken) return null;

    try {
        return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
    } catch (e) {
        return null;
    }
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const decodedToken = authenticateUser(req);
        if (!decodedToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login." }, { status: 401 });
        }

        // Await dynamic route params for Next.js 15+
        const resolvedParams = await params;
        const orderId = resolvedParams.id;
        
        const { status } = await req.json();
        if (!status) {
            return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
        }

        const order = await OrderModel.findById(orderId).populate({
            path: 'orderitems',
            model: OrderItemsModel,
            populate: {
                path: 'productid',
                model: ProductModel
            }
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Immutability Rule: delivered or cancelled orders cannot be changed
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return NextResponse.json({ success: false, message: `Status is locked. Order is already ${order.status}.` }, { status: 400 });
        }

        // Seller Modification Rule: Verify they own at least one product in this order
        const belongsToSeller = order.orderitems.some((item: any) => {
            if (!item.productid || !item.productid.seller) return false;
            return item.productid.seller.toString() === decodedToken.id;
        });

        if (!belongsToSeller) {
            return NextResponse.json({ success: false, message: "Forbidden. You are not a seller of any product in this order." }, { status: 403 });
        }

        order.status = status;
        const updatedOrder = await order.save();

        return NextResponse.json(
            { success: true, message: "Order status updated successfully", data: updatedOrder },
            { status: 200 }
        );

    } catch (error) {
        console.error("Seller update order error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
