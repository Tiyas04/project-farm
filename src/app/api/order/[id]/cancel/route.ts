import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/models/order";
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

        const resolvedParams = await params;
        const orderId = resolvedParams.id;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Verify Buyer Ownership
        if (order.userid.toString() !== decodedToken.id) {
            return NextResponse.json({ success: false, message: "Forbidden. You cannot cancel someone else's order." }, { status: 403 });
        }

        // Immutability Rule
        if (order.status === 'delivered' || order.status === 'cancelled') {
             return NextResponse.json({ success: false, message: `Status is locked. Order is already ${order.status}.` }, { status: 400 });
        }

        // Actually Cancel
        order.status = "cancelled";
        const updatedOrder = await order.save();

        return NextResponse.json(
            { success: true, message: "Order cancelled successfully.", data: updatedOrder },
            { status: 200 }
        );

    } catch (error) {
        console.error("Cancel order error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
