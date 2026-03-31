import dbConnect from "@/lib/dbconnect";
import ProductModel from "@/models/product";
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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }){
    await dbConnect()

    try {
        const { id } = await context.params

        const product = await ProductModel.findById(id)

        if(!product){
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found"
                },
                {
                    status: 404
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Product fetched successfully",
                data: product
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Internal error", error)

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            {
                status: 500
            }
        )
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    
    try {
        const decodedToken = authenticateUser(req);
        if (!decodedToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login." }, { status: 401 });
        }

        const { id } = await context.params;
        const product = await ProductModel.findById(id);

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        if (product.seller?.toString() !== decodedToken.id && decodedToken.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden. You can only delete your own products." },
                { status: 403 }
            );
        }

        await ProductModel.findByIdAndDelete(id);

        return NextResponse.json(
            { success: true, message: "Product deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const decodedToken = authenticateUser(req);
        if (!decodedToken) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login." }, { status: 401 });
        }

        const { id } = await context.params;
        const product = await ProductModel.findById(id);

        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        if (product.seller?.toString() !== decodedToken.id && decodedToken.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden. You can only edit your own products." },
                { status: 403 }
            );
        }

        const body = await req.json();
        
        // Allowed fields for update
        const updatableFields = ["name", "description", "price", "stockLevel", "inStock", "category", "unit", "image"];
        let updatedFields = 0;

        for (const field of updatableFields) {
            if (body[field] !== undefined) {
                (product as any)[field] = body[field];
                updatedFields++;
            }
        }
        
        // Recalculate stock boolean if stockLevel was updated
        if (body.stockLevel !== undefined) {
            product.inStock = Number(body.stockLevel) > 0;
        }

        if (updatedFields === 0) {
             return NextResponse.json({ success: false, message: "No valid fields provided for update" }, { status: 400 });
        }

        const updatedProduct = await product.save();

        return NextResponse.json(
            { success: true, message: "Product updated successfully", data: updatedProduct },
            { status: 200 }
        );

    } catch (error) {
        console.error("Edit product error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
