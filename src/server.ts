import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { PrismaClient } from "./generated/prisma";
import auth from "./routes/auth";
import user from "./routes/user";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 3000;

// mongoose
//   .connect(process.env.MONGO_URI ?? "")
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", auth);
app.use("/user", user);

app.listen(PORT);
// app.listen(PORT, "0.0.0.0");
