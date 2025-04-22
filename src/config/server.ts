import mongoose from "mongoose";

const connectDb = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI environment variable is not declared");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("MongoDb connection error:", err);
    process.exit(1);
  }
};

export default connectDb;
