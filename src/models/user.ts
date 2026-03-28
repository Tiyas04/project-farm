import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface User extends Document {
    name: string
    email: string
    password: string
    phoneno: string
    role: string
    fssaino?: string
    fssaiicense?: string
    kishancreditcard?: string
    govtid?: string
    orders: mongoose.Schema.Types.ObjectId[]
    refreshToken?: string
    comparePassword(password: string): Promise<boolean>
    generateAccessToken(): Promise<string>
    generateRefreshToken(): Promise<string>
}

const UserSchema: Schema<User> = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        phoneno: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "seller", "admin"],
            default: "user"
        },
        fssaino: {
            type: String,
            trim: true
        },
        fssaiicense: {
            type: String,
            trim: true
        },
        kishancreditcard: {
            type: String,
            trim: true
        },
        govtid: {
            type: String,
            trim: true
        },
        orders: [{
            type: Schema.Types.ObjectId,
            ref: "Order"
        }],
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = async function (): Promise<string> {
    return await jwt.sign(
        {
            id: this._id,
            role: this.role,
            name: this.name,
            email: this.email,
            phoneno: this.phoneno
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY! as any
        }
    )
}

UserSchema.methods.generateRefreshToken = async function (): Promise<string> {
    return await jwt.sign(
        {
            id: this._id,
            role: this.role,
            name: this.name,
            email: this.email,
            phoneno: this.phoneno
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY! as any
        }
    )
}

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model("User", UserSchema)

export default UserModel