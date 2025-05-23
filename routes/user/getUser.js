require("dotenv").config();

const express = require("express");
const router = express.Router();

const User = require("../../models/user");

const tokens = require("../auth/tokens");

router.get("/getUser", tokens.authenticateToken, async (req, res) => {
  try {
    // res.json(users.filter((user) => user.username === req.body.username));
    const user = await User.findOne({ username: req.query.username });
    res.json({
      status: "success",
      statusCode: 201,
      data: user,
    });
  } catch (err) {
    res.json({
      status: "error",
      statusCode: 400,
      message: "user not found",
    });
  }
});

module.exports = router;
