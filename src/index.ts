import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./config/server";

connectDb();
import userRoute from "./routes/userRoutes"
const app = express();
app.use(express.json());
app.use(cors());

app.use("/users", userRoute)

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});


export default app;