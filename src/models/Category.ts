import mongoose, {Schema, Document} from "mongoose";

interface CategoryDocument extends Document {
  name: string;
  desc: string;
}

const categorySchema: Schema<CategoryDocument> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  desc: {
    type: String,
    trim: true,
  },
});

const Category = mongoose.model<CategoryDocument>("Category", categorySchema);

export default Category;
