import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const refreshToken = req.cookies.get("refreshToken")?.value;
    
    // Default role is empty string if no token
    let role = "";
    
    if (refreshToken) {
        try {
            // In Next.js Middleware (Edge Runtime), we decode the JWT payload manually 
            // for routing decisions. Cryptographic verification happens at the API layer.
            const base64Url = refreshToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = JSON.parse(atob(base64));
            role = jsonPayload.role;
        } catch (e) {
            console.error("Middleware Auth: Error decoding token:", e);
        }
    }

    const isApiRequest = pathname.startsWith("/api/");

    // 1. Admin route protection
    // Only 'admin' users can access these routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (role !== "admin") {
            if (isApiRequest) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized. Admin access required." },
                    { status: 403 }
                );
            }
            // Redirect to home page for browser access
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // 2. Seller route protection
    // Normal users can access exactly /seller (to apply to be a seller), 
    // but sub-routes and APIs require seller or admin roles.
    const isSellerRoot = pathname === "/seller";
    if ((pathname.startsWith("/seller") || pathname.startsWith("/api/seller")) && !isSellerRoot) {
        if (role !== "seller" && role !== "admin") {
            if (isApiRequest) {
                return NextResponse.json(
                    { success: false, message: "Unauthorized. Seller access required." },
                    { status: 403 }
                );
            }
            // Redirect to home page for browser access
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // Allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/seller/:path*",
        "/api/seller/:path*"
    ]
}