import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/models/order";
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

        // 1. Fetch all product IDs that belong to the seller
        const sellerProducts = await ProductModel.find({ seller: userId }).select("_id");
        const productIds = sellerProducts.map(p => p._id);

        if (productIds.length === 0) {
            return NextResponse.json(
                { success: true, message: "No products or orders found", data: [] },
                { status: 200 }
            );
        }

        // 2. Aggregate orders containing these products
        const sellerOrdersData = await OrderModel.aggregate([
            {
                // Join orderitems collection
                $lookup: {
                    from: "orderitems",
                    localField: "orderitems",
                    foreignField: "_id",
                    as: "orderitemsData",
                },
            },
            {
                $unwind: "$orderitemsData",
            },
            {
                // Only keep orderitems that involve the seller's products
                $match: {
                    "orderitemsData.productid": { $in: productIds }
                }
            },
            {
                // Group back into orders
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    // this represents the total order amount (might include other sellers)
                    totalamount: { $first: "$totalamount" },
                    createdAt: { $first: "$createdAt" },
                    userid: { $first: "$userid" },
                    items: { $push: "$orderitemsData" }
                }
            },
            {
                // Join checkouts to get buyer contact and shipping details
                $lookup: {
                    from: "checkouts",
                    localField: "_id",
                    foreignField: "orderid",
                    as: "checkoutData",
                },
            },
            {
                // Join products to get product details inside items
                $lookup: {
                    from: "products",
                    localField: "items.productid",
                    foreignField: "_id",
                    as: "productsData",
                },
            },
            {
                $project: {
                     _id: 1,
                     status: 1,
                     createdAt: 1,
                     buyer: {
                         $let: {
                             vars: { checkoutInfo: { $arrayElemAt: ["$checkoutData", 0] } },
                             in: {
                                 name: "$$checkoutInfo.fullName",
                                 email: "$$checkoutInfo.email",
                                 phoneno: "$$checkoutInfo.phoneno",
                                 address: "$$checkoutInfo.address",
                                 city: "$$checkoutInfo.city",
                                 state: "$$checkoutInfo.state",
                                 pincode: "$$checkoutInfo.pincode"
                             }
                         }
                     },
                     items: {
                          $map: {
                              input: "$items",
                              as: "item",
                              in: {
                                  quantity: "$$item.quantity",
                                  price: "$$item.price",
                                  product: {
                                      $arrayElemAt: [
                                          {
                                              $filter: {
                                                  input: "$productsData",
                                                  as: "p",
                                                  cond: { $eq: ["$$p._id", "$$item.productid"] },
                                              },
                                          },
                                          0,
                                      ],
                                  },
                              }
                          }
                     }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json(
            {
                success: true,
                message: "Seller orders fetched successfully",
                data: sellerOrdersData
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Fetch seller orders error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
