import { Router } from "express";
import { analyticsService } from "./analytics.service";

export const analyticsRoutes = Router();

analyticsRoutes.get("/summary", async (_req, res) => {
  const [totalArticles, totalViews] = await Promise.all([
    analyticsService.totalArticles(),
    analyticsService.totalViews(),
  ]);
  res.status(200).json({ success: true, data: { totalArticles, totalViews } });
});
