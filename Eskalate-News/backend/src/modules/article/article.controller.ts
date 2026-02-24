import { Request, Response } from "express";
import { AppError } from "../../utils/app-error.util";
import { responseUtil } from "../../utils/response.util";
import { articleService } from "./article.service";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ["Authentication required"]);
  }
  return req.user;
};

const getParamId = (req: Request) => String(req.params.id);

export const articleController = {
  create: async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const article = await articleService.create(user.userId, req.body);

    return res.status(201).json(responseUtil.success("Article created", article));
  },

  listMine: async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";

    const { items, totalSize } = await articleService.listMine({
      authorId: user.userId,
      page,
      pageSize,
      includeDeleted,
    });

    return res
      .status(200)
      .json(responseUtil.paginated("Author articles fetched", items, page, pageSize, totalSize));
  },

  update: async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const updated = await articleService.update(getParamId(req), user.userId, req.body);

    return res.status(200).json(responseUtil.success("Article updated", updated));
  },

  remove: async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    await articleService.softDelete(getParamId(req), user.userId);

    return res.status(200).json(responseUtil.success("Article deleted", null));
  },
};
