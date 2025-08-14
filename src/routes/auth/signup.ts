import express from "express";
import dotevn from "dotenv";
import bcrypt from "bcryptjs";
// import User, { IUser } from "../../models/user";
import { PrismaClient } from '@prisma/client';
dotevn.config();

const router = express.Router();
const prisma = new PrismaClient();

router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashedPassword,
        phone: req.body.phone,
      },
    });

    // await user.save();
    // users.push(user);

    res.json({
      status: "success",
      statusCode: 201,
      message: "sign-up successful!",
    });
  } catch (e) {
    console.log(e);

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
