import request from "supertest";
import { signAccessToken } from "../utils/jwt.util";

jest.mock("../database/prisma", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockPrisma } = require("./mocks/prisma.mock");
  return { prisma: mockPrisma };
});

import { mockPrisma, resetPrismaMock } from "./mocks/prisma.mock";

import app from "../app";

const authorId = "11111111-1111-4111-8111-111111111111";
const authorToken = signAccessToken({ sub: authorId, role: "author" });

describe("Author dashboard endpoint", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("GET /api/v1/author/dashboard returns paginated metrics", async () => {
    mockPrisma.article.findMany.mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        title: "Top Story",
        createdAt: new Date("2026-01-05T00:00:00.000Z"),
        dailyAnalytics: [{ viewCount: 12 }, { viewCount: 8 }],
      },
    ]);
    mockPrisma.article.count.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/v1/author/dashboard?page=1&pageSize=10")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Object[0].totalViews).toBe(20);
    expect(response.body.TotalSize).toBe(1);
  });
});
