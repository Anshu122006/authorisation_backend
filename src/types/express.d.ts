// src/types/express.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      body: {
        email?: string;
        // add other custom fields you want here
      } & express.Request["body"]; // to keep original body fields too
    }
  }
}
