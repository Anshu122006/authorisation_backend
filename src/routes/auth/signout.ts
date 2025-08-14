import express from "express";
import dotevn from "dotenv";
import bcrypt from "bcryptjs";
// import RefreshToken, { IRefreshToken } from "../../models/refreshToken";
import { PrismaClient } from '@prisma/client';
import { Prisma } from "@prisma/client";
dotevn.config();

const router = express.Router();
const prisma = new PrismaClient();

router.delete("/signout", async (req, res) => {
  // console.log(refreshTokens);
  // refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  // console.log(refreshTokens);
  // res.sendStatus(204);

  const token = req.body.token;
  try {
    if (await prisma.refreshToken.delete({ where: { token: token } })) {
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
