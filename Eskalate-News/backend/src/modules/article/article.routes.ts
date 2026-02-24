import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.middleware";
import { allowRoles } from "../../middleware/rbac.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler.util";
import { articleController } from "./article.controller";
import {
  createArticleSchema,
  deleteArticleSchema,
  getArticleByIdSchema,
  listMyArticlesSchema,
  listPublicArticlesSchema,
  updateArticleSchema,
} from "./article.validation";

export const articleRoutes = Router();

articleRoutes.get("/", validate(listPublicArticlesSchema), asyncHandler(articleController.listPublic));

articleRoutes.post(
  "/",
  requireAuth,
  allowRoles("author"),
  validate(createArticleSchema),
  asyncHandler(articleController.create),
);

articleRoutes.get(
  "/me",
  requireAuth,
  allowRoles("author"),
  validate(listMyArticlesSchema),
  asyncHandler(articleController.listMine),
);

articleRoutes.get(
  "/:id",
  optionalAuth,
  validate(getArticleByIdSchema),
  asyncHandler(articleController.getById),
);

articleRoutes.put(
  "/:id",
  requireAuth,
  allowRoles("author"),
  validate(updateArticleSchema),
  asyncHandler(articleController.update),
);

articleRoutes.delete(
  "/:id",
  requireAuth,
  allowRoles("author"),
  validate(deleteArticleSchema),
  asyncHandler(articleController.remove),
);
