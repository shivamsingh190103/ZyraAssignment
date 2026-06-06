import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.header("x-request-id") || nanoid(10);
  res.setHeader("x-request-id", req.requestId);
  next();
}

