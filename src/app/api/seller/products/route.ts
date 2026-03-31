import dbConnect from "@/lib/dbconnect";
import ProductModel from "@/models/product";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

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

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const decodedToken = authenticateUser(req);
        if (!decodedToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login." }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(decodedToken.id);

        // Fetch products created by this specific user
        const products = await ProductModel.find({ seller: userId }).sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                message: "Products fetched successfully",
                data: products
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Fetch seller products error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            {
                status: 500
            }
        );
    }
}
