import { Router } from "express";
import { articleController } from "./article.controller";

export const articleRoutes = Router();

articleRoutes.get("/", articleController.list);
articleRoutes.post("/", articleController.create);
