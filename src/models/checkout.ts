import mongoose, { Document } from "mongoose";

export interface CheckOut extends Document {
    orderid: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    phoneno: Number;
    company?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    permissionproof: string
    paymentMethod: "COD";
}

const CheckOutSchema = new mongoose.Schema<CheckOut>(
    {
        orderid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },
        fullName: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            index: true,
            trim: true,
            toLowerCase: true
        },
        phoneno: {
            type: Number,
            required: true,
            trim: true
        },
        company: {
            type: String
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        permissionproof: {
            type: String,
            required: true,
            trim: true
        },
        paymentMethod: {
            type: String,
            default: "COD"
        }
    },
    {
        timestamps: true
    }
)

const CheckOutModel = (mongoose.models.CheckOut as mongoose.Model<CheckOut>) || mongoose.model("CheckOut", CheckOutSchema)

export default CheckOutModel