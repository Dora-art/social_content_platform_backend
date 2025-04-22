import mongoose, { Types, Schema, Document } from "mongoose";
interface NoteDocument extends Document {
  title: string;
  img: string;
  content: string;
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  saves: Types.ObjectId[];
  category: Types.ObjectId[];
  createdAt: Date;
  updateAt: Date;
}

const noteSchema: Schema<NoteDocument> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    author: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
      }],
  },
  { timestamps: true }
);

const Note = mongoose.model<NoteDocument>("Note", noteSchema)

export default Note;