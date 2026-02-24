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

type ListPublicArticlesInput = {
  page: number;
  pageSize: number;
  category?: string;
  author?: string;
  q?: string;
};

const baseArticleSelect = {
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

const publicArticleSelect = {
  id: true,
  title: true,
  category: true,
  status: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
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
    return prisma.article.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category,
        status: input.status ?? ArticleStatus.Draft,
        authorId,
      },
      select: baseArticleSelect,
    });
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
        select: baseArticleSelect,
      }),
      prisma.article.count({ where }),
    ]);

    return { items, totalSize };
  },

  update: async (articleId: string, authorId: string, input: UpdateArticleInput) => {
    await getOwnedArticleOrThrow(articleId, authorId);

    return prisma.article.update({
      where: { id: articleId },
      data: input,
      select: baseArticleSelect,
    });
  },

  softDelete: async (articleId: string, authorId: string) => {
    await getOwnedArticleOrThrow(articleId, authorId);

    await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
    });
  },

  listPublic: async (input: ListPublicArticlesInput) => {
    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.Published,
      deletedAt: null,
      ...(input.category ? { category: input.category } : {}),
      ...(input.q
        ? {
            title: {
              contains: input.q,
              mode: "insensitive",
            },
          }
        : {}),
      ...(input.author
        ? {
            author: {
              name: {
                contains: input.author,
                mode: "insensitive",
              },
            },
          }
        : {}),
    };

    const [items, totalSize] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: publicArticleSelect,
      }),
      prisma.article.count({ where }),
    ]);

    return { items, totalSize };
  },

  findPublicById: async (articleId: string) => {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        ...baseArticleSelect,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!article) {
      throw new AppError("Article not found", 404, ["Article does not exist"]);
    }

    if (article.deletedAt) {
      throw new AppError("News article no longer available", 404, ["Article was deleted"]);
    }

    if (article.status !== ArticleStatus.Published) {
      throw new AppError("Article not found", 404, ["Article does not exist"]);
    }

    return article;
  },
};

