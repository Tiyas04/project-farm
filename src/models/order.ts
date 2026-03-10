import mongoose, { Document, Schema } from "mongoose"

export interface Order extends Document {
    userid: mongoose.Types.ObjectId
    orderitems: mongoose.Types.ObjectId[]
    totalamount: number
    status: string
    receiptUrl?: string
    subtotal?: number
    tax?: number
}

const OrderSchema: Schema<Order> = new Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        orderitems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItems"
        }],
        totalamount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "ordered", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        receiptUrl: {
            type: String
        },
        subtotal: {
            type: Number
        },
        tax: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

const OrderModel = (mongoose.models.Order as mongoose.Model<Order>) || mongoose.model("Order", OrderSchema)

export default OrderModel