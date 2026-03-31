import mongoose, { Document, Schema } from "mongoose";

export interface Contact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "pending" | "read" | "responded";
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema<Contact> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "read", "responded"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const ContactModel = (mongoose.models.Contact as mongoose.Model<Contact>) || mongoose.model("Contact", ContactSchema);

export default ContactModel;
