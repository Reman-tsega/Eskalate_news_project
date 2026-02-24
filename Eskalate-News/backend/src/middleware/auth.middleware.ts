import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.util";
import { verifyAccessToken } from "../utils/jwt.util";

type AuthenticatedUser = {
  userId: string;
  role: "author" | "reader";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401, ["Missing or invalid authorization header"]));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.sub, role: payload.role };
    return next();
  } catch (_error) {
    return next(new AppError("Unauthorized", 401, ["Invalid or expired token"]));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.sub, role: payload.role };
  } catch (_error) {
  }

  return next();
};
