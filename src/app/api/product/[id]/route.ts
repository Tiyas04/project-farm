import dbConnect from "@/lib/dbconnect";
import ProductModel from "@/models/product";
import { NextRequest, NextResponse } from "next/server";

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