export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  article: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  readLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  dailyAnalytics: {
    upsert: jest.fn(),
  },
};

export const resetPrismaMock = () => {
  mockPrisma.user.create.mockReset();
  mockPrisma.user.findUnique.mockReset();
  mockPrisma.article.create.mockReset();
  mockPrisma.article.findMany.mockReset();
  mockPrisma.article.count.mockReset();
  mockPrisma.article.findUnique.mockReset();
  mockPrisma.article.update.mockReset();
  mockPrisma.readLog.create.mockReset();
  mockPrisma.readLog.findMany.mockReset();
  mockPrisma.dailyAnalytics.upsert.mockReset();
};

