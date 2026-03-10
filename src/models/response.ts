import mongoose,{Document,Schema} from "mongoose";

export interface Response extends Document {
    name: string;
    email: string;
    phone: string;
    message: string;
}

const ResponseSchema:Schema<Response> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const ResponseModel = (mongoose.models.Response as mongoose.Model<Response>) || mongoose.model("Response", ResponseSchema)

export default ResponseModel