import mongoose from "mongoose";
import ProductModel from "@/models/product";
import CartItemsModel from "@/models/cartitem";
import CartModel from "@/models/cart";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

// Helper for consistent auth extraction across routes
const getUserId = (request: NextRequest): string | null => {
    let userId = request.headers.get("userid")
    if (!userId) {
        const refreshToken = request.cookies.get("refreshToken")?.value
        if (refreshToken) {
            try {
                const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
                if (decodedToken && decodedToken.id) userId = decodedToken.id
            } catch (e) {
                // ignore
            }
        }
    }
    return userId;
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const userId = getUserId(request);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access or Invalid User ID" },
                { status: 401 }
            );
        }

        const params = await props.params;
        const productId = params.id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID in URL" },
                { status: 400 }
            );
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: "No product found" },
                { status: 404 }
            );
        }

        const cart = await CartModel.findOne({ userid: new mongoose.Types.ObjectId(userId) });
        if (!cart) {
            return NextResponse.json(
                { success: false, message: "Cart not found" },
                { status: 404 }
            );
        }

        // Find and remove the cart item
        const deletedItem = await CartItemsModel.findOneAndDelete({
            cartid: cart._id,
            productid: product._id,
        });

        if (deletedItem) {
            // Remove reference from Cart array
            await CartModel.findByIdAndUpdate(cart._id, {
                $pull: { cartitems: deletedItem._id },
            });
        }

        return NextResponse.json(
            { success: true, message: "Item removed from cart" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("[Cart] Delete error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to remove item: " + (error.message || "Unknown") },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const userId = getUserId(request);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access or Invalid User ID" },
                { status: 401 }
            );
        }

        const params = await props.params;
        const productId = params.id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: "Invalid product ID in URL" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { quantity } = body;

        if (quantity === undefined || quantity <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid quantity" },
                { status: 400 }
            );
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        if (quantity > product.stockLevel) {
            return NextResponse.json(
                { success: false, message: `Only ${product.stockLevel} items in stock.` },
                { status: 400 }
            );
        }

        const cart = await CartModel.findOne({ userid: new mongoose.Types.ObjectId(userId) });
        if (!cart) {
            return NextResponse.json(
                { success: false, message: "Cart not found" },
                { status: 404 }
            );
        }

        const updatedItem = await CartItemsModel.findOneAndUpdate(
            {
                cartid: cart._id,
                productid: product._id
            },
            {
                $set: { quantity: quantity }
            },
            { new: true }
        );

        if (!updatedItem) {
            return NextResponse.json(
                { success: false, message: "Item not in cart to update" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Cart updated successfully",
                data: updatedItem,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Cart Update Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update cart" },
            { status: 500 }
        );
    }
}
