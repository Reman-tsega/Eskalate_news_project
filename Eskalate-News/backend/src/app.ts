import cors from "cors";
import express from "express";
import { mountSwagger } from "./docs/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { articleRoutes } from "./modules/article/article.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { authorRoutes } from "./modules/author/author.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { responseUtil } from "./utils/response.util";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json(responseUtil.success("OK", { ok: true }));
});

mountSwagger(app);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/author", authorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
