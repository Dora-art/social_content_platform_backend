import mongoose from "mongoose";
import { Schema,Document, Types } from "mongoose";

export interface UserDocument extends Document {
    _id: mongoose.Types.ObjectId,
    username: string,
    email: string,
    password: string,
    createdAt: Date,
    updateAt: Date,              
    notes: Types.ObjectId[],
    token?: string,
}

const UserSchema: Schema<UserDocument>  = new Schema({
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
notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notes", required:true}],
token: {type: String}
    
}, 
{timestamps: true})

const User = mongoose.model<UserDocument>("User", UserSchema)

export default User;