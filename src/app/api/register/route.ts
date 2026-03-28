import UserModel from "@/models/user";
import dbConnect from "@/lib/dbconnect";
import GenerateAccessAndRefreshToken from "@/lib/generateaccessandrefreshtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect()

    try {
        const body = await req.json()

        const { name, email, password, phoneno } = body

        if (!name || !email || !password || !phoneno) {
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

        const existingUser = await UserModel.findOne({
            $or: [
                { email },
                { phoneno }
            ]
        })

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User already exists"
                },
                {
                    status: 400
                }
            )
        }

        const newUser = await UserModel.create({
            name,
            email,
            password,
            phoneno,
            role: "user"
        })

        const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(newUser._id)

        newUser.refreshToken = refreshToken
        await newUser.save({ validateBeforeSave: false })

        const createdUser = await UserModel.findById(newUser._id).select("-password -__v")

        if (!createdUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Something went wrong while registering the user"
                },
                {
                    status: 500
                }
            )
        }

        const response = NextResponse.json(
            {
                success: true,
                message: "User created successfully",
                data: createdUser
            },
            {
                status: 201
            }
        )

        const cookiesOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "strict" as const
        }

        response.cookies.set("accessToken", accessToken, cookiesOptions)
        response.cookies.set("refreshToken", refreshToken, cookiesOptions)

        const requestHeader = new Headers(req.headers)
        requestHeader.set("userid", createdUser._id.toString())
        requestHeader.set("role", createdUser.role)

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