import { prisma } from "../../database/prisma";

type DashboardInput = {
  authorId: string;
  page: number;
  pageSize: number;
};

export const authorService = {
  getDashboard: async (input: DashboardInput) => {
    const where = {
      authorId: input.authorId,
      deletedAt: null,
    };

    const [articles, totalSize] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: {
          id: true,
          title: true,
          createdAt: true,
          dailyAnalytics: {
            select: {
              viewCount: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const items = articles.map((article) => ({
      id: article.id,
      title: article.title,
      createdAt: article.createdAt,
      totalViews: article.dailyAnalytics.reduce((sum, row) => sum + row.viewCount, 0),
    }));

    return { items, totalSize };
  },
};

