import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.util";
import { responseUtil } from "../utils/response.util";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json(responseUtil.error("Route not found"));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(responseUtil.error(err.message, err.errors));
  }

  const fallbackMessage = "Internal server error";
  return res.status(500).json(responseUtil.error(fallbackMessage));
};
