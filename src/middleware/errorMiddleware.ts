import { Request, Response, NextFunction } from "express";
import {
  CustomError,
  BadRequestError,
  NotFoundError,
  AuthenticationError,
  InternalServerError,
} from "../utils/error";
//  You might want to use a logging library like Winston
const logger = console; //  Simplest case: use console.error

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error:`,
    err
  );

  let statusCode = 500;
  let message = "Internal Server Error";
  const errorData: Record<string, unknown> = {};

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
  } else if (err instanceof InternalServerError) {
    statusCode = err.statusCode; // 500
    message = err.message;
  } else if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
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
  const error = new NotFoundError(
    `Route not found - ${req.method} ${req.originalUrl}`
  );

  next(error);
};
