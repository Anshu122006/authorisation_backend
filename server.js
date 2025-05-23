require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth");
const user = require("./routes/user");

const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(cors({ origin: "*" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", auth);
app.use("/user", user);

app.listen(PORT, "0.0.0.0");
