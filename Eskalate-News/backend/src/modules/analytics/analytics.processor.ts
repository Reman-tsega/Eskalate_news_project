import { prisma } from "../../database/prisma";

const toGmtDateOnly = (date: Date): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return new Date(Date.UTC(year, month, day));
};

export const analyticsProcessor = {
  aggregateDailyReads: async (date = new Date()) => {
    const targetDate = toGmtDateOnly(date);
    const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const readLogs = await prisma.readLog.findMany({
      where: {
        readAt: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      select: {
        articleId: true,
      },
    });

    const countsByArticle = new Map<string, number>();
    for (const row of readLogs) {
      countsByArticle.set(row.articleId, (countsByArticle.get(row.articleId) ?? 0) + 1);
    }

    let processed = 0;
    for (const [articleId, viewCount] of countsByArticle.entries()) {
      await prisma.dailyAnalytics.upsert({
        where: {
          articleId_date: {
            articleId,
            date: targetDate,
          },
        },
        create: {
          articleId,
          date: targetDate,
          viewCount,
        },
        update: {
          viewCount,
        },
      });
      processed += 1;
    }

    return {
      processed,
      date: targetDate.toISOString(),
    };
  },
};

