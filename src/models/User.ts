import mongoose from "mongoose";
import { Schema, Document, Types } from "mongoose";
import { UserRole } from "../middleware/authorizationMiddleware";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updateAt: Date;
  notes: Types.ObjectId[];
  bio?: string,
  token?: string;
}

const UserSchema: Schema<UserDocument> = new Schema(
  {
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    bio: {
type: String,
required: false,
    },
    notes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notes", required: true },
    ],
    token: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<UserDocument>("User", UserSchema);

export default User;
