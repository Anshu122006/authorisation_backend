import express from "express";
import dotevn from "dotenv";
import { authoriseToken } from "../../middlewares/authorise";
dotevn.config();

const router = express.Router();
const User = require("../../models/user");
const tokens = require("../auth/tokens");

router.get("/getUser", authoriseToken, async (req, res) => {
  try {
    // res.json(users.filter((user) => user.username === req.body.username));
    const username = req.query.username;
    if (!username || typeof username !== "string") {
      res.json({
        status: "error",
        statusCode: 401,
        message: "invalid query",
      });
      return;
    }

    const user = await User.findOne({ username: req.query.username });
    res.json({
      status: "success",
      statusCode: 201,
      data: user,
    });
    return;
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({
        status: "error",
        statusCode: 500,
        message: e.message,
        data: "",
      });
    } else {
      res.status(500).json({
        status: "error",
        statusCode: 500,
        message: "Unknown error occurred",
        data: "",
      });
    }
    return;
  }
});

export default router;
