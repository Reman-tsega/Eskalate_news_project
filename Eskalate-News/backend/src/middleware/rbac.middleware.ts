import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.util";

export const allowRoles = (...roles: Array<"author" | "reader">) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401, ["Authentication required"]));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403, ["Insufficient role privileges"]));
    }

    return next();
  };
};
