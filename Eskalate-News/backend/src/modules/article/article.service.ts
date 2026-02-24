import { prisma } from "../../database/prisma";

type CreateArticleInput = {
  title: string;
  slug: string;
  content: string;
  authorId: string;
};

export const articleService = {
  create: (input: CreateArticleInput) => prisma.article.create({ data: input }),
  list: () => prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
};
