import dbConnect from "@/lib/dbconnect";
import UserModel from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken"

export async function POST(req: NextRequest) {
    await dbConnect()

    try {
        const refreshToken = req.cookies.get("refreshToken")?.value

        if(!refreshToken){
            return NextResponse.json(
                {
                    success: true,
                    message: "User already logged out or session not found"
                },
                {
                    status: 200
                }
            )
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        )as JwtPayload

        const user = await UserModel.findById(decoded.id)

        if(!user){
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        user.refreshToken = undefined
        await user.save()

        const response = NextResponse.json(
            {
                success: true,
                message: "User logged out successfully"
            },
            {
                status: 200
            }
        )

        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/"
        })

        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/"
        })

        response.headers.delete("userId")
        response.headers.delete("role")

        return response
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