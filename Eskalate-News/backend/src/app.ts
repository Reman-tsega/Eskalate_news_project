import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { articleRoutes } from "./modules/article/article.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ Success: true, Message: "OK", Object: { ok: true }, Errors: null });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
