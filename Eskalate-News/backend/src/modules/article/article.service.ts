import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { AppError } from "../../utils/app-error.util";

type CreateArticleInput = {
  title: string;
  content: string;
  category: string;
  status?: ArticleStatus;
};

type UpdateArticleInput = {
  title?: string;
  content?: string;
  category?: string;
  status?: ArticleStatus;
};

type ListAuthorArticlesInput = {
  authorId: string;
  page: number;
  pageSize: number;
  includeDeleted: boolean;
};

const articleSelect = {
  id: true,
  title: true,
  content: true,
  category: true,
  status: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ArticleSelect;

const getOwnedArticleOrThrow = async (articleId: string, authorId: string) => {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article || article.deletedAt) {
    throw new AppError("Article not found", 404, ["Article does not exist"]);
  }

  if (article.authorId !== authorId) {
    throw new AppError("Forbidden", 403, ["You cannot modify another author's article"]);
  }

  return article;
};

export const articleService = {
  create: async (authorId: string, input: CreateArticleInput) => {
    const created = await prisma.article.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category,
        status: input.status ?? ArticleStatus.Draft,
        authorId,
      },
      select: articleSelect,
    });

    return created;
  },

  listMine: async (input: ListAuthorArticlesInput) => {
    const where: Prisma.ArticleWhereInput = {
      authorId: input.authorId,
      ...(input.includeDeleted ? {} : { deletedAt: null }),
    };

    const [items, totalSize] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: articleSelect,
      }),
      prisma.article.count({ where }),
    ]);

    return { items, totalSize };
  },

  update: async (articleId: string, authorId: string, input: UpdateArticleInput) => {
    await getOwnedArticleOrThrow(articleId, authorId);

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: input,
      select: articleSelect,
    });

    return updated;
  },

  softDelete: async (articleId: string, authorId: string) => {
    await getOwnedArticleOrThrow(articleId, authorId);

    await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
    });
  },
};
