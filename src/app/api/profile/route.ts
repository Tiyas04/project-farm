import UserModel from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import jwt, { JwtPayload } from "jsonwebtoken"

export async function GET(req: NextRequest) {
    await dbConnect()

    try {
     const refreshToken = req.cookies.get("refreshToken")?.value
     if(!refreshToken){
        return NextResponse.json(
            {
                success: false,
                message: "Refresh token is required"
            },
            {
                status: 400
            }
        )
     }

     const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload

     if(!decodedToken){
        return NextResponse.json(
            {
                success: false,
                message: "Invalid refresh token"
            },
            {
                status: 401
            }
        )
     }
     const user = await UserModel.findById(decodedToken.id)

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

     return NextResponse.json(
        {
            success: true,
            message: "User profile fetched successfully",
            data: user
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

export async function PATCH(req: NextRequest){
    await dbConnect()

    try {
        const refreshToken = req.cookies.get("refreshToken")?.value
        
        if(!refreshToken){
            return NextResponse.json(
                {
                    success: false,
                    message: "Refresh token is required"
                },
                {
                    status: 400
                }
            )
        }

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload

        if(!decodedToken){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid refresh token"
                },
                {
                    status: 401
                }
            )
        }
        const user = await UserModel.findById(decodedToken.id)

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

        const body = await req.json()

        const { name, email, password, phoneno } = body

        if(!name || !email || !phoneno){
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, email, and phone number are required"
                },
                {
                    status: 400
                }
            )
        }

        user.name = name;
        user.email = email;
        user.phoneno = phoneno;

        if (password && password.trim() !== '') {
            user.password = password; // This will correctly trigger the pre-save hash hook
        }

        const updatedUser = await user.save();

        if(!updatedUser){
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to update user. Unauthorised access"
                },
                {
                    status: 404
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "User updated successfully",
                data: updatedUser
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