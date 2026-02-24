import { prisma } from "../../database/prisma";

export const analyticsService = {
  totalArticles: () => prisma.article.count(),
  totalViews: async () => {
    const rows = await prisma.article.findMany({ select: { viewCount: true } });
    return rows.reduce((sum, row) => sum + row.viewCount, 0);
  },
};
