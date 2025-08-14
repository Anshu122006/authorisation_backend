import express from "express";
import dotevn from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
// import RefreshToken, { IRefreshToken } from "../../models/refreshToken";
// import User, { IUser } from "../../models/user";
import { PrismaClient } from '@prisma/client';;
dotevn.config();

const router = express.Router();
const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/signin", async (req, res) => {
  const signinType = req.body.signinType;

  try {
    switch (signinType) {
      case "password":
        {
          let user = await prisma.user.findUnique({ where: { email: req.body.uniquekey } });
          if (user == null) {
            user = await prisma.user.findUnique({ where: { username: req.body.uniquekey } });
          }

          if (!user) {
            res.json({
              status: "signup-pending",
              statusCode: 400,
              message: "user not found",
            });
            return;
          }

          const password = req.body.password;
          if (await bcrypt.compare(password, user.password)) {
            const tokenPayload = { email: user.email };
            if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
              throw "secret key not set";
            }
            // console.log(user);
            const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
            const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET);
            const dbRefreshToken = await prisma.refreshToken.create({
              data: { token: refreshToken },
            });

            // await refreshToken.save();
            // refreshTokens.push(refreshToken);
            res.json({
              status: "success",
              statusCode: 201,
              message: "logged-in successfully!",
              data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: {
                  userId: user.id,
                  name: user.firstname + " " + user.lastname,
                  email: user.email,
                },
              },
            });
          } else {
            res.json({
              status: "error",
              statusCode: 400,
              message: "wrong password",
            });
          }
        }
        break;

      case "google":
        {
          const idToken = req.body.idToken;

          const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          let user = await prisma.user.findUnique({ where: { email: payload?.email } });

          if (!user) {
            res.json({
              status: "signup-pending",
              statusCode: 400,
              message: "user not found",
            });
            return;
          } else {
            const tokenPayload = { email: user.email };

            if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
              throw "secret key not set";
            }

            const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
            const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET);
            const dbRefreshToken = prisma.refreshToken.create({
              data: { token: refreshToken },
            });

            res.json({
              status: "success",
              statusCode: 201,
              message: "logged-in successfully!",
              data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: {
                  userId: user.id,
                  name: user.firstname + " " + user.lastname,
                  email: user.email,
                },
              },
            });
          }
        }
        break;

      default:
        throw "signin type not specified";
    }
  } catch (e) {
    console.error(e);

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
  }
});

export default router;
