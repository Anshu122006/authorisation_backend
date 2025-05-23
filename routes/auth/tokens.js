require("dotenv").config();

const express = require("express");
const router = express.Router();

const RefreshToken = require("../../models/refreshToken");

const jwt = require("jsonwebtoken");

router.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null)
    res.json({
      status: "error",
      statusCode: 401,
      message: "no token",
    });

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken)
    res.json({
      status: "error",
      statusCode: 403,
      message: "invalid token",
    });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      res.json({
        status: "error",
        statusCode: 403,
        message: err,
      });

    const accessToken = generateAccessToken({ username: user.username });
    console.log(accessToken);
    res.json({
      status: "success",
      statusCode: 201,
      message: "token generated successfully",
      data: { accessToken: accessToken },
    });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.json({
      status: "error",
      statusCode: 400,
      message: "no token",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.json({
        status: "error",
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

module.exports = { router, authenticateToken };
