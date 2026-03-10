import mongoose, { Document,Schema } from "mongoose"

export interface OrderItems extends Document {
    orderid : mongoose.Types.ObjectId
    productid : mongoose.Types.ObjectId
    quantity : number
    price : number
}

const OrderItemsSchema : Schema<OrderItems> = new Schema(
    {
        orderid : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Order"
        },
        productid : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Product"
        },
        quantity : {
            type : Number,
            required : true
        },
        price : {
            type : Number,
            required : true
        }
    },
    {
        timestamps : true
    }
)

const OrderItemsModel = (mongoose.models.OrderItems as mongoose.Model<OrderItems>) || mongoose.model("OrderItems", OrderItemsSchema)

export default OrderItemsModel