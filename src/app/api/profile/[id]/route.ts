import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import streamUpload from "@/lib/uploadoncloudinary";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const user = await UserModel.findById(resolvedParams.id);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        const formData = await req.formData();

        const fssaino = formData.get("fssaino") as string;
        const fssailicenseFile = formData.get("fssailicense") as File | null;
        const kishancreditcardFile = formData.get("kishancreditcard") as File | null;
        const govtidFile = formData.get("govtid") as File | null;

        if (!fssaino || !fssailicenseFile || !kishancreditcardFile || !govtidFile) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required"
                },
                {
                    status: 400
                }
            );
        }

        // Helper function to upload files
        const uploadFile = async (file: File, folder: string) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            // using 'auto' for resource_type to accommodate PDFs and images
            const res = await streamUpload(buffer, folder, 'auto');
            return res.secure_url;
        };

        const fssailicenseUrl = await uploadFile(fssailicenseFile, "seller_docs");
        const kishancreditcardUrl = await uploadFile(kishancreditcardFile, "seller_docs");
        const govtidUrl = await uploadFile(govtidFile, "seller_docs");

        user.fssaino = fssaino;
        user.fssailicense = fssailicenseUrl;
        user.kishancreditcard = kishancreditcardUrl;
        user.govtid = govtidUrl;
        user.sellerstatus = "pending";

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Seller application submitted successfully",
                data: {
                    fssaino: user.fssaino,
                    fssailicense: user.fssailicense,
                    kishancreditcard: user.kishancreditcard,
                    govtid: user.govtid,
                    sellerstatus: user.sellerstatus
                }
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch user"
            },
            {
                status: 500
            }
        );
    }
}