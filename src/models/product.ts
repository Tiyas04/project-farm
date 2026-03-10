import mongoose, { Document, Schema } from "mongoose"

export interface Product extends Document {
    name: string;
    category: string[];
    price: number;
    fssaino: string;
    image: string;
    description: string;
    unit: string;
    inStock: boolean;
    stockLevel: number;
    seller: mongoose.Types.ObjectId;
}

const ProductSchema: Schema<Product> = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        category: [{
            type: String,
            required: true,
            index: true,
            trim: true
        }],
        price: {
            type: Number,
            required: true
        },
        fssaino: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        unit: {
            type: String,
            required: true,
            enum: ["mg", "ml", "g", "kg", "l"],
            default: "mg"
        },
        inStock: {
            type: Boolean,
            required: true
        },
        stockLevel: {
            type: Number,
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

const ProductModel = (mongoose.models.Product as mongoose.Model<Product & Document>) || mongoose.model<Product & Document>("Product", ProductSchema)

export default ProductModel
