import mongoose from "mongoose";
import { Schema, Types, Document } from "mongoose";

export interface UserDocument extends Document {
    username: string,
    email: string,
    password: string,
    createdAt: Date,
    updateAt: Date,
    blogs: Types.ObjectId[],
    token?: string,
}

const userSChema: Schema<UserDocument>  = new Schema({
    username: {
type: String,
required: true,
    },
email: {
    type: String,
    required: true,
    unique: true,
},
password: {
    type: String,
    required: true,
    minlength: 6,
},
blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog", required:true}],
token: {type: String}
    
}, 
{timestamps: true})

const User = mongoose.model<UserDocument>("User", userSChema)

export default User;