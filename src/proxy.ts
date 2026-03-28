import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    //Admin access
    if (req.nextUrl.pathname.startsWith("/admin") && req.headers.get("role") !== "admin") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized"
            },
            {
                status: 401
            }
        )
    }

    //Seller access
    if (req.nextUrl.pathname.startsWith("/seller") && req.headers.get("role") === "user") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized"
            },
            {
                status: 401
            }
        )
    }
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/seller/:path*"
    ]
}