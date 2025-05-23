require("dotenv").config();

const express = require("express");
const router = express.Router();

const User = require("../../models/user");

const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    });

    await user.save();

    // users.push(user);

    res.json({
      status: "success",
      statusCode: 201,
      message: "sign-up successful!",
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      statusCode: 500,
      message: err,
    });
  }
});

module.exports = router;
