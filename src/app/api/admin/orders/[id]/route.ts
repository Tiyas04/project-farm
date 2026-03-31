import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/models/order";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

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

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    
    try {
        const adminToken = authenticateAdmin(req);
        if (!adminToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const { id } = await context.params;
        const order = await OrderModel.findById(id);

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // We can optionally delete associated orderitems here using order.orderitems array.
        // For now we will just delete the order container itself.
        await OrderModel.findByIdAndDelete(id);

        return NextResponse.json(
            { success: true, message: "Order deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete order error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const adminToken = authenticateAdmin(req);
        if (!adminToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const { id } = await context.params;
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
        }

        const order = await OrderModel.findById(id);

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (order.status === 'delivered' || order.status === 'cancelled') {
             return NextResponse.json({ success: false, message: `Status is locked. Order is already ${order.status}.` }, { status: 400 });
        }

        order.status = status;
        const updatedOrder = await order.save();

        return NextResponse.json(
            { success: true, message: "Order status updated successfully", data: updatedOrder },
            { status: 200 }
        );

    } catch (error) {
        console.error("Edit order error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
