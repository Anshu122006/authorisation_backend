require("dotenv").config();

const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const RefreshToken = require("../../models/refreshToken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

router.post("/signin", async (req, res) => {
  const signinType = req.body.signinType;

  switch (signinType) {
    case "password":
      let user = await User.findOne({ email: req.body.uniquekey });
      if (user == null) {
        user = await User.findOne({ username: req.body.uniquekey });
      }

      if (user == null) {
        res.json({
          status: "error",
          statusCode: 400,
          message: "user not found",
        });
      }

      try {
        const password = req.body.password;
        if (await bcrypt.compare(password, user.password)) {
          const email = req.body.email;
          const payload = { email: email };

          const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
          const refreshToken = new RefreshToken({ token: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET) });

          await refreshToken.save();
          // refreshTokens.push(refreshToken);

          res.json({
            status: "success",
            statusCode: 201,
            message: "logged-in successfully!",
            data: { accessToken: accessToken, refreshToken: refreshToken.token },
          });
        } else {
          res.json({
            status: "error",
            statusCode: 400,
            message: "wrong password",
          });
        }
      } catch (err) {
        console.log(err);
        res.json({
          status: "error",
          statusCode: 500,
          message: err,
        });
      }

      break;

    case "google":
      const idToken = req.body.idToken;
      // const deocded = jwt.decode(idToken);
      // console.log(deocded);

      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        let user = await User.findOne({ email: payload.email });

        if (user == null) {
          res.json({
            status: "signup-pending",
            statusCode: 400,
            message: "user not found",
          });
        } else {
          const payload = { email: user.email };

          const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
          const refreshToken = new RefreshToken({ token: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET) });

          await refreshToken.save();
          // refreshTokens.push(refreshToken);

          res.json({
            status: "success",
            statusCode: 201,
            message: "logged-in successfully!",
            data: { accessToken: accessToken, refreshToken: refreshToken.token },
          });
        }
      } catch (e) {
        console.log(e);

        res.json({
          status: "error",
          statusCode: 500,
          message: e,
          data: "",
        });
      }

      break;

    default:
      res.json({
        status: "error",
        statusCode: 400,
        message: "signin type not specified",
        data: "",
      });
  }
});

module.exports = router;
