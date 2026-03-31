import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        
        // Ensure that the requester is an admin
        // Add authentication and authorization checks here if applicable
        // e.g., verify JWT and check if role === 'admin'

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

        const { status } = await req.json();

        if (!status || !["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status provided. Must be 'approved' or 'rejected'."
                },
                {
                    status: 400
                }
            );
        }

        user.sellerstatus = status;
        
        // If approved, you might also want to change their role to 'seller'
        if (status === "approved") {
            user.role = "seller";
        }

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: `Seller application ${status} successfully`,
                data: {
                    id: user._id,
                    sellerstatus: user.sellerstatus,
                    role: user.role
                }
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error updating seller application status:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update seller application status"
            },
            {
                status: 500
            }
        );
    }
}
