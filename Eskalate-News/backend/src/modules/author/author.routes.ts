import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { allowRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler.util";
import { authorController } from "./author.controller";
import { authorDashboardQuerySchema } from "./author.validation";

export const authorRoutes = Router();

authorRoutes.get(
  "/dashboard",
  requireAuth,
  allowRoles("author"),
  validate(authorDashboardQuerySchema),
  asyncHandler(authorController.getDashboard),
);

