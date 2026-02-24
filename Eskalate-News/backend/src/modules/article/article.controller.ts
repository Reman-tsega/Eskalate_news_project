import { Request, Response } from "express";
import { articleService } from "./article.service";

export const articleController = {
  create: async (req: Request, res: Response) => {
    const article = await articleService.create(req.body);
    res.status(201).json({ success: true, data: article });
  },
  list: async (_req: Request, res: Response) => {
    const articles = await articleService.list();
    res.status(200).json({ success: true, data: articles });
  },
};
