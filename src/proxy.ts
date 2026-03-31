import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    //Admin access
    const role = req.headers.get("role");
    
    if (req.nextUrl.pathname.startsWith("/admin") && (role === "seller" || role === "user")) {
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
    if (req.nextUrl.pathname.startsWith("/seller") && role === "user") {
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