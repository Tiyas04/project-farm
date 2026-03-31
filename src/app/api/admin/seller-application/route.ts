import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        // Ensure that the requester is an admin context
        // Check JWT and verify if the role === 'admin' here

        // Extract any status filter from search params if present (e.g., ?status=pending)
        const url = new URL(req.url);
        const statusParams = url.searchParams.get("status") || "pending"; // default to fetch pending requests

        // Find users based on sellerstatus
        const query = statusParams !== "all" ? { sellerstatus: statusParams } : { sellerstatus: { $exists: true, $ne: null } };
        
        // Excluding passwords from standard admin view responses
        const applicants = await UserModel.find(query).select("-password -refreshToken").sort({ updatedAt: -1 });

        return NextResponse.json(
            {
                success: true,
                count: applicants.length,
                data: applicants
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error fetching seller applications:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch seller applications"
            },
            {
                status: 500
            }
        );
    }
}
