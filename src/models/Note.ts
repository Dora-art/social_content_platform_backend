import mongoose, { Types, Schema, Document } from "mongoose";

export interface NoteDocument extends Document {
  title: string;
  imgUrl?: string;
  content: string;
  author: Types.ObjectId;
  status: "draft" | "pending" | "published" | "rejected";
  likes: Types.ObjectId[];
  saves: Types.ObjectId[];
  category?: Types.ObjectId[];
  createdAt: Date;
  updateAt: Date;
  rejectionReason?: string;
  tags?: string;
  publishedAt?: Date;
}

const noteSchema: Schema<NoteDocument> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
      required: true,
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    rejectionReason: {
      type: String,
      required: false,
    },
    tags: [{ type: String, required: true }],

    publishedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model<NoteDocument>("Note", noteSchema);

export default Note;
