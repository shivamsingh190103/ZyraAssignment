import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  const message = isApiError ? error.message : "An unexpected server error occurred.";

  if (!isApiError) {
    console.error(
      JSON.stringify({
        requestId: req.requestId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );
  }

  res.status(statusCode).json({
    error: {
      message,
      requestId: req.requestId,
    },
  });
};
