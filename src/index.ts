import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./config/server";

connectDb();
import userRoutes from "./routes/userRoutes"
import noteRoutes from "./routes/noteRoutes"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", userRoutes)
app.use("/api", noteRoutes)
app.use(notFoundHandler)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});


export default app;