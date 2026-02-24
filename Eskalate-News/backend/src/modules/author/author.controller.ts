import { Request, Response } from "express";
import { AppError } from "../../utils/app-error.util";
import { getPagination } from "../../utils/pagination.util";
import { responseUtil } from "../../utils/response.util";
import { authorService } from "./author.service";

const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ["Authentication required"]);
  }
  return req.user;
};

export const authorController = {
  getDashboard: async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const pagination = getPagination(page, pageSize);

    const { items, totalSize } = await authorService.getDashboard({
      authorId: user.userId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return res
      .status(200)
      .json(responseUtil.paginated("Author dashboard fetched", items, pagination.page, pagination.pageSize, totalSize));
  },
};

