require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const mongoose = require("mongoose");
const User = require("./models/user");
const RefreshToken = require("./models/refreshToken");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const PORT = process.env.port || 3000;

// let users = [];
let refreshTokens = [];

app.use(express.json());
app.use(cors({ origin: "*" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/user", authenticateToken, async (req, res) => {
  try {
    // res.json(users.filter((user) => user.username === req.body.username));
    const user = await User.findOne({ username: req.query.username });
    res.json({
      statusCode: 201,
      data: user,
    });
  } catch (err) {
    res.json({
      statusCode: 400,
      message: "user not found",
    });
  }
});

app.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null)
    res.json({
      statusCode: 401,
      message: "no token",
    });

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken)
    res.json({
      statusCode: 403,
      message: "invalid token",
    });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      res.json({
        statusCode: 403,
        message: err,
      });

    const accessToken = generateAccessToken({ username: user.username });
    console.log(accessToken);
    res.json({ statusCode: 201, message: "token generated successfully", data: { accessToken: accessToken } });
  });
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({ username: req.body.username, password: hashedPassword });

    await user.save();

    // users.push(user);

    // console.log(hashedPassword);

    res.json({
      statusCode: 201,
      message: "sign-up successful!",
    });
  } catch (err) {
    console.log(err);
    res.json({
      statusCode: 500,
      message: err,
    });
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    res.json({
      statusCode: 400,
      message: "user not found",
    });
  }

  try {
    const password = req.body.password;
    if (await bcrypt.compare(password, user.password)) {
      const username = req.body.username;
      const user = { username: username };

      const accessToken = generateAccessToken(user);
      const refreshToken = new RefreshToken({ token: jwt.sign(user, process.env.REFRESH_TOKEN_SECRET) });

      await refreshToken.save();
      // refreshTokens.push(refreshToken);

      res.json({
        statusCode: 201,
        message: "logged-in successfully!",
        data: { accessToken: accessToken, refreshToken: refreshToken.token },
      });
    } else {
      res.json({
        statusCode: 400,
        message: "wrong password",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      statusCode: 500,
      message: err,
    });
  }
});

app.delete("/logout", async (req, res) => {
  // console.log(refreshTokens);
  // refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  // console.log(refreshTokens);
  // res.sendStatus(204);

  const token = req.body.token;
  try {
    if (await RefreshToken.deleteOne({ token: token })) {
      res.json({
        statusCode: 204,
        message: "logged-out successfully!",
      });
    } else {
      res.json({
        statusCode: 400,
        message: "no such refresh key exist",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      statusCode: 500,
      message: err,
    });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  let statusCode;

  if (token == null)
    return res.json({
      statusCode: 400,
      message: "no token",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.json({
        statusCode: 403,
        message: "invalid token",
      });

    req.user = user;
    next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(PORT, "0.0.0.0");
