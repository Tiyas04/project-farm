import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import GenerateAccessAndRefreshToken from "@/lib/generateaccessandrefreshtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect()

    try {
        const body = await req.json()

        const { email, password, phoneno } = body

        if (!(email && phoneno) || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All fields are required"
                },
                {
                    status: 400
                }
            )
        }

        const user = await UserModel.findOne({
            $or: [
                { email },
                { phoneno }
            ]
        })

        if (!user) {
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

        const isPasswordValid = await user.comparePassword(password)

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password"
                },
                {
                    status: 401
                }
            )
        }

        const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        const existingUser = await UserModel.findById(user._id).select("-password -_id -__v")

        const response = NextResponse.json(
            {
                success: true,
                message: "User logged in successfully",
                data: existingUser
            },
            {
                status: 200
            }
        )

        const cookiesOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "strict" as const
        }
        response.cookies.set("accessToken", accessToken, cookiesOptions)
        response.cookies.set("refreshToken", refreshToken, cookiesOptions)

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