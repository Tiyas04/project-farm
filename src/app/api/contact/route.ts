import dbConnect from "@/lib/dbconnect";
import ContactModel from "@/models/contact";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, message: "All fields are required." },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        const newContact = await ContactModel.create({
            name,
            email,
            subject,
            message,
        });

        if (newContact) {
            return NextResponse.json(
                { success: true, message: "Message sent successfully! We will get back to you soon." },
                { status: 201 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: "Failed to send message. Please try again." },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
