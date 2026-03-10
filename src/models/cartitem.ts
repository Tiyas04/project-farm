import mongoose, { Document, Schema } from "mongoose"

export interface CartItems extends Document {
    cartid: mongoose.Types.ObjectId
    productid: mongoose.Types.ObjectId
    quantity: number
    price: number
}

const CartItemsSchema: Schema<CartItems> = new Schema(
    {
        cartid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart"
        },
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const CartItemsModel = (mongoose.models.CartItems as mongoose.Model<CartItems>) || mongoose.model("CartItems", CartItemsSchema)

export default CartItemsModel
