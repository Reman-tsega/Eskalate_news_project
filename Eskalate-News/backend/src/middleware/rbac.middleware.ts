import { NextFunction, Request, Response } from "express";

export const rbacMiddleware = (..._roles: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
