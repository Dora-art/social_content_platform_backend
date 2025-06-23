import mongoose, { Types, Schema, Document } from "mongoose";
import { UserDocument } from "./User";

export interface AuthorDocument extends Document {
  _id: Types.ObjectId,
  name: string;
  user: Types.ObjectId | UserDocument;
  bio: string;
  numberOfPublications?: number;
}

const Authorschema: Schema<AuthorDocument> = new Schema({
  name: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bio: { type: String },
  numberOfPublications: {type: Number, default: 0}
});

const Author = mongoose.model<AuthorDocument>("Author", Authorschema);

export { Author, UserDocument };
