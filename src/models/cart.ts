import mongoose, { Document, Schema } from "mongoose"

export interface Cart extends Document {
    userid: mongoose.Types.ObjectId
    cartitems: mongoose.Types.ObjectId[]
}

const CartSchema: Schema<Cart> = new Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        cartitems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "CartItems"
        }]
    },
    {
        timestamps: true
    }
)

const CartModel = (mongoose.models.Cart as mongoose.Model<Cart>) || mongoose.model("Cart", CartSchema)

export default CartModel