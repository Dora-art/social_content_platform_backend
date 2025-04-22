import mongoose, { Schema, Document, Types } from "mongoose";

interface CommentDocument extends Document {
  user: Types.ObjectId;
  note: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema: Schema<CommentDocument> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model<CommentDocument>("Comment", commentSchema);

export default Comment;
