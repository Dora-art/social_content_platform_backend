import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  AuthenticationError,
  InternalServerError,
  ForbiddenError,
} from "../utils/error";

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(`Error caught in global error handler: ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"), 
    statusCode: (err instanceof CustomError) ? err.statusCode: 500,
    stack: err.stack,
  });

  let statusCode = 500;
  let message = "Internal Server Error";
  const errorData: Record<string, unknown> = {};

  if (!(err instanceof CustomError)) {
    err = new InternalServerError(err.message);
  }

  if (err instanceof BadRequestError) {
    statusCode = err.statusCode; // 400
    message = err.message;
    if (err.field) {
      errorData.field = err.field;
    }
  } else if (err instanceof NotFoundError) {
    statusCode = err.statusCode; // 404
    message = err.message;
  } else if (err instanceof AuthenticationError) {
    statusCode = err.statusCode; // 401
    message = err.message;
  } else if (err instanceof ForbiddenError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    data: errorData,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
logger.warn(`Route not found- ${req.method} ${req.originalUrl}`,
  {path: req.originalUrl, method: req.method, ip: req.ip, userAgent: req.get("User-Agent")}
)


  const error = new NotFoundError(
    `Route not found - ${req.method} ${req.originalUrl}`
  );

  next(error);
};
