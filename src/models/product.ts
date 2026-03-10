import mongoose, { Document, Schema } from "mongoose"

export interface Product extends Document {
    name: string;
    formula: string;
    casNumber: string;
    category: string;
    price: number;
    mfcdNo: string;
    image: string;
    description: string;
    purity: string;
    unit: string;
    molecularWeight: number;
    hazards: string[];
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
        formula: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        casNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        price: {
            type: Number,
            required: true
        },
        mfcdNo: {
            type: String,
            required: true
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
        purity: {
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
        molecularWeight: {
            type: Number,
            required: true,
            index: true
        },
        hazards: [{
            type: String,
            default: []
        }],
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
