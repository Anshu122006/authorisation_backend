import { Request, Response, NextFunction, Router } from "express";
import dotevn from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
// import RefreshToken, { IRefreshToken } from "../../models/refreshToken";
import { PrismaClient } from '@prisma/client';
dotevn.config();

const router = Router();
const prisma = new PrismaClient();

router.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken)
    res.json({
      status: "error",
      statusCode: 401,
      message: "no token",
    });

  let storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken)
    res.json({
      status: "error",
      statusCode: 403,
      message: "invalid token",
    });

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET ?? "",
    (err: jwt.VerifyErrors | null, payload: string | JwtPayload | undefined) => {
      if (err) {
        res.json({
          status: "error",
          statusCode: 403,
          message: err,
        });
      }

      if (payload && typeof payload !== "string") {
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET ?? "", { expiresIn: "15s" });
        console.log(accessToken);
        res.json({
          status: "success",
          statusCode: 201,
          message: "token generated successfully",
          data: { accessToken: accessToken },
        });
      }
    }
  );
});

export default router;
