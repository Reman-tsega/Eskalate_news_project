import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export const validate = (schema: ZodObject<ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });

    if (!parsed.success) {
      return res.status(400).json({
        Success: false,
        Message: "Validation failed",
        Object: null,
        Errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      });
    }

    req.body = parsed.data.body ?? req.body;
    next();
  };
};
