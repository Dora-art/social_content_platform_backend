import mongoose, { Schema, Document } from "mongoose";

export interface NoteDocument extends Document {
  title: string;
  imgUrl?: string;
  content: string;
  author: mongoose.Types.ObjectId;
  noteStatus: "draft" | "pending" | "published" | "rejected";
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  categories: mongoose.Types.ObjectId[];
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
      trim: true
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
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },

    noteStatus: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
      required: true,
    },
    categories: [
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
      required: function(){
        return this.noteStatus === "published"
      },
    },
  },
  { timestamps: true }
);

const Note = mongoose.model<NoteDocument>("Note", noteSchema);

export default Note;
