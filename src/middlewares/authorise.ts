import { Request, Response, NextFunction, Router } from "express";
import dotevn from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
dotevn.config();

function isJwtPayload(payload: string | JwtPayload | undefined): payload is JwtPayload {
  return !payload && typeof payload === "object" && "email" in payload;
}

export function authoriseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.json({
      status: "error",
      statusCode: 400,
      message: "no token",
    });
    return;
  }

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET ?? "",
    (err: jwt.VerifyErrors | null, payload: string | JwtPayload | undefined) => {
      if (err) {
        res.json({
          status: "error",
          statusCode: 403,
          message: err,
        });
        return;
      }

      if (isJwtPayload(payload)) {
        req.body.email = payload.email;
        next();
      } else {
        res.json({
          status: "error",
          statusCode: 403,
          message: "Invalid payload",
        });
        return;
      }
    }
  );
}
