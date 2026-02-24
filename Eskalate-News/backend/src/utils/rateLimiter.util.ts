import { Request, Response, NextFunction } from "express";

const store = new Map<string, { count: number; resetAt: number }>();

export const inMemoryRateLimiter = (maxRequests = 60, windowMs = 60_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const current = store.get(key);

    if (!current || now > current.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({ success: false, message: "Too many requests" });
    }

    current.count += 1;
    store.set(key, current);
    next();
  };
};
