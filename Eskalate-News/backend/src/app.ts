import express from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { articleRoutes } from "./modules/article/article.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(errorHandler);

export default app;
