import { Request, Response } from "express";
import { readLogQueue } from "../../jobs/readLog.queue";
import { AppError } from "../../utils/app-error.util";
import { getPagination } from "../../utils/pagination.util";
import { responseUtil } from "../../utils/response.util";
import { articleService } from "./article.service";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ["Authentication required"]);
  }

  return req.user;
};

const getParamId = (req: Request) => String(req.params.id);
const isTrueQueryValue = (value: unknown) => String(value).toLowerCase() === "true";

const getClientId = (req: Request) => {
  const ip = req.ip || "unknown";
  const userAgent = String(req.headers["user-agent"] || "unknown");
  return `${ip}:${userAgent}`;
};

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
    const includeDeleted = isTrueQueryValue(req.query.includeDeleted);
    const pagination = getPagination(page, pageSize);

    const { items, totalSize } = await articleService.listMine({
      authorId: user.userId,
      page: pagination.page,
      pageSize: pagination.pageSize,
      includeDeleted,
    });

    return res.status(200).json(
      responseUtil.paginated(
        "Author articles fetched",
        items,
        pagination.page,
        pagination.pageSize,
        totalSize,
      ),
    );
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

  listPublic: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const pagination = getPagination(page, pageSize);

    const { items, totalSize } = await articleService.listPublic({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: req.query.category ? String(req.query.category) : undefined,
      author: req.query.author ? String(req.query.author) : undefined,
      q: req.query.q ? String(req.query.q) : undefined,
    });

    return res.status(200).json(
      responseUtil.paginated("Published articles fetched", items, pagination.page, pagination.pageSize, totalSize),
    );
  },

  getById: async (req: Request, res: Response) => {
    const article = await articleService.findPublicById(getParamId(req));

    // Read logging must not block the response path.
    void readLogQueue.enqueue({
      articleId: article.id,
      readerId: req.user?.userId ?? null,
      clientId: getClientId(req),
    });

    return res.status(200).json(responseUtil.success("Article fetched", article));
  },
};

