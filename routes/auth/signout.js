require("dotenv").config();

const express = require("express");
const router = express.Router();

const RefreshToken = require("../../models/refreshToken");

router.delete("/signout", async (req, res) => {
  // console.log(refreshTokens);
  // refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  // console.log(refreshTokens);
  // res.sendStatus(204);

  const token = req.body.token;
  try {
    if (await RefreshToken.deleteOne({ token: token })) {
      res.json({
        status: "success",
        statusCode: 204,
        message: "logged-out successfully!",
      });
    } else {
      res.json({
        status: "error",
        statusCode: 400,
        message: "no such refresh key exist",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      status: "error",
      statusCode: 500,
      message: err,
    });
  }
});

module.exports = router;
