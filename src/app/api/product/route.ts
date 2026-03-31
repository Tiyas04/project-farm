import ProductModel from "@/models/product";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import streamUpload from "@/lib/uploadoncloudinary";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function POST(req: NextRequest) {
    await dbConnect()

    try {
        const contentType = req.headers.get("content-type") || ""
        let sellerId = req.headers.get("userid");

        // If no userid header, try to get from refreshToken cookie
        if (!sellerId) {
            const refreshToken = req.cookies.get("refreshToken")?.value;
            if (refreshToken) {
                try {
                    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
                    sellerId = decoded.id;
                } catch (e) {
                    console.log("Token verification failed in product POST:", e);
                }
            }
        }

        let productsData: any[] = [];
        let isArray = false;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();

            const names = formData.getAll("name");
            isArray = names.length > 1;

            if (names.length === 0) {
                return NextResponse.json(
                    { success: false, message: "No product data provided" },
                    { status: 400 }
                );
            }

            for (let i = 0; i < names.length; i++) {
                let imageFiles = formData.getAll(isArray ? `images_${i}` : "image");
                if (imageFiles.length === 0) imageFiles = formData.getAll("images"); // fallback

                let imageUrl = "";
                if (imageFiles.length > 0) {
                    const file = imageFiles[0];
                    if (file && typeof file === "object" && 'arrayBuffer' in file) {
                        const buffer = Buffer.from(await (file as File).arrayBuffer());
                        const res = await streamUpload(buffer, "products");
                        imageUrl = res.secure_url;
                    }
                }

                const inStockVal = formData.getAll("inStock")[i];
                const stockLevelVal = formData.getAll("stockLevel")[i] || formData.getAll("stock")[i];
                const categoryStr = formData.getAll("category")[i] as string;

                productsData.push({
                    name: names[i] as string,
                    description: formData.getAll("description")[i] as string,
                    price: Number(formData.getAll("price")[i]),
                    category: categoryStr ? categoryStr.split(",").map(c => c.trim()).filter(c => c) : [],
                    inStock: inStockVal === "true" || Number(stockLevelVal) > 0,
                    stockLevel: Number(stockLevelVal),
                    fssaino: formData.getAll("fssaino")[i] as string,
                    unit: (formData.getAll("unit")[i] as string) || "mg",
                    image: imageUrl || undefined,
                    seller: sellerId
                });
            }
        } else {
            const payload = await req.json();
            isArray = Array.isArray(payload);
            productsData = isArray ? payload : [payload];

            if (productsData.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "No product data provided"
                    },
                    {
                        status: 400
                    }
                );
            }

            for (let product of productsData) {
                product.stockLevel = product.stockLevel !== undefined ? Number(product.stockLevel) : Number(product.stock);
                product.inStock = product.inStock !== undefined ? product.inStock : product.stockLevel > 0;

                if (typeof product.category === "string") {
                    product.category = product.category.split(',').map((c: string) => c.trim()).filter((c: string) => c);
                }

                product.seller = sellerId;

                let imgToUpload = product.image;
                if (!imgToUpload && product.images && Array.isArray(product.images) && product.images.length > 0) {
                    imgToUpload = product.images[0];
                }

                if (imgToUpload && typeof imgToUpload === "string" && imgToUpload.startsWith("data:image")) {
                    const base64Data = imgToUpload.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    const res = await streamUpload(buffer, "products");
                    product.image = res.secure_url;
                } else if (imgToUpload) {
                    product.image = imgToUpload;
                }
            }
        }

        for (const item of productsData) {
            const { name, description, price, category, stockLevel, fssaino, unit, image } = item
            if (!name || !description || price === undefined || !category || category.length === 0 || stockLevel === undefined || !fssaino || !unit || !image) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "All fields are required for each product (name, description, price, category, stockLevel, fssaino, unit, image)"
                    },
                    {
                        status: 400
                    }
                )
            }
            if (!["mg", "ml", "g", "kg", "l"].includes(unit)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid unit provided '${unit}'. Allowed: mg, ml, g, kg, l`
                    },
                    {
                        status: 400
                    }
                )
            }
        }

        const createdProducts = await ProductModel.insertMany(productsData)

        return NextResponse.json(
            {
                success: true,
                message: isArray ? "Products created successfully" : "Product created successfully",
                product: isArray ? createdProducts : createdProducts[0]
            },
            {
                status: 201
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

export async function GET() {
    await dbConnect()

    try {
        const products = await ProductModel.find().sort({ createdAt: -1 })

        return NextResponse.json(
            {
                success: true,
                message: "Products fetched successfully",
                data: products
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