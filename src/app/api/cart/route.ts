import mongoose from "mongoose";
import ProductModel from "@/models/product";
import CartItemsModel from "@/models/cartitem";
import CartModel from "@/models/cart";
import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(request: NextRequest) {
    await dbConnect()

    try {
        const refreshToken = request.cookies.get("refreshToken")?.value

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token is required" },
                { status: 400 }
            )
        }

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload

        if (!decodedToken) {
            return NextResponse.json(
                { success: false, message: "Invalid refresh token" },
                { status: 401 }
            )
        }

        const user = await UserModel.findById(decodedToken.id)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        const cart = await CartModel.findOne({ userid: user._id })

        if (!cart) {
            return NextResponse.json(
                { success: false, message: "Cart not found" },
                { status: 404 }
            )
        }

        const cartItems = await CartItemsModel.find({ cartid: cart._id }).populate('productid')

        return NextResponse.json(
            { success: true, message: "Cart fetched successfully", data: cartItems },
            { status: 200 }
        )
    } catch (error) {
        console.log("Internal error", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        let userId = request.headers.get("userid")
        
        // Fallback for cookie-based auth logic if header is not explicit
        if (!userId) {
            const refreshToken = request.cookies.get("refreshToken")?.value
            if (refreshToken) {
                try {
                    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
                    if (decodedToken && decodedToken.id) {
                        userId = decodedToken.id
                    }
                } catch (e) {
                     // proceed and fail below if userId is unset
                }
            }
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized access" },
                { status: 401 }
            )
        }

        const { productId } = await request.json()

        if (!productId) {
            return NextResponse.json(
                { success: false, message: "Product ID is missing in request body" },
                { status: 400 }
            )
        }

        const product = await ProductModel.findById(productId)

        if (!product) {
            return NextResponse.json(
                { success: false, message: "No product found" },
                { status: 404 }
            )
        }

        let cart = await CartModel.findOne({ userid: new mongoose.Types.ObjectId(userId) })

        if (!cart) {
            cart = await CartModel.create({
                userid: new mongoose.Types.ObjectId(userId),
                cartitems: []
            })
        }

        const existingItem = await CartItemsModel.aggregate([
            {
                $match: {
                    cartid: cart._id,
                    productid: product._id
                }
            }
        ])

        if (existingItem.length > 0) {
            if (existingItem[0].quantity + 1 > product.stockLevel) {
                return NextResponse.json(
                    { success: false, message: `Cannot add more. Only ${product.stockLevel} items in stock.` },
                    { status: 400 }
                );
            }

            await CartItemsModel.findByIdAndUpdate(
                existingItem[0]._id,
                { $inc: { quantity: 1 } }
            )
        } else {
            if (product.stockLevel < 1) {
                return NextResponse.json(
                    { success: false, message: "Product is out of stock" },
                    { status: 400 }
                );
            }

            const cartItem = await CartItemsModel.create({
                cartid: cart._id,
                productid: product._id,
                quantity: 1,
                price: product.price,
            });

            cart.cartitems.push(cartItem._id);
            await cart.save();
        }

        return NextResponse.json(
            { success: true, message: "Product added to cart" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Cart add error", error);
        return NextResponse.json(
            { success: false, message: "Failed to add to the cart, please login first" },
            { status: 500 }
        )
    }
}