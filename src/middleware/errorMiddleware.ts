import { Request, Response, NextFunction } from 'express';
import { CustomError, BadRequestError, NotFoundError, AuthenticationError, InternalServerError } from "../utils/error"
//  You might want to use a logging library like Winston
const logger = console; //  Simplest case: use console.error

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log the error using console.error (for now, replace with a better logger later)
  logger.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error:`, err);

  let statusCode = 500; // Default to Internal Server Error
  let message = 'Internal Server Error'; // Default message
  const errorData: Record<string, unknown> = {}; // To hold extra error info

  // Prioritize specific error types
  if (err instanceof BadRequestError) {
    statusCode = err.statusCode; // 400
    message = err.message;
    if (err.field) {
      errorData.field = err.field; // Include field if available
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
  }
  else if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  }
   else if (err instanceof Error) {
    message = err.message
  }

  //  Send the error response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...errorData, // Include any extra error data
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, //  Include stack only in development
  });
};

// 404 handler for undefined routes.  This should be placed *before* your error handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route not found - ${req.method} ${req.originalUrl}`);
  //  No need to set status here, NotFoundError constructor already does it.
  next(error); // Pass the error to the error handling middleware
};
