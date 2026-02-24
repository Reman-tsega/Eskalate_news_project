import request from "supertest";
import { resetReadLogQueueStateForTests } from "../jobs/readLog.queue";
import { signAccessToken } from "../utils/jwt.util";

jest.mock("../database/prisma", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockPrisma } = require("./mocks/prisma.mock");
  return { prisma: mockPrisma };
});

import { mockPrisma, resetPrismaMock } from "./mocks/prisma.mock";

import app from "../app";

const authorId = "11111111-1111-4111-8111-111111111111";
const articleId = "22222222-2222-4222-8222-222222222222";
const guestArticleId = "99999999-9999-4999-8999-999999999999";

const authorToken = signAccessToken({ sub: authorId, role: "author" });
const readerToken = signAccessToken({ sub: "33333333-3333-4333-8333-333333333333", role: "reader" });

describe("Article endpoints", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetReadLogQueueStateForTests();
  });

  it("GET /api/v1/articles returns paginated published non-deleted articles", async () => {
    mockPrisma.article.findMany.mockResolvedValue([
      {
        id: articleId,
        title: "Breaking News",
        category: "Tech",
        status: "Published",
        createdAt: new Date(),
        author: {
          id: authorId,
          name: "Alice Writer",
        },
      },
    ]);
    mockPrisma.article.count.mockResolvedValue(1);

    const response = await request(app).get("/api/v1/articles?page=1&pageSize=10&category=Tech&q=Breaking");

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Object).toHaveLength(1);
    expect(response.body.TotalSize).toBe(1);
  });

  it("GET /api/v1/articles/:id returns article and queues guest read-log", async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: guestArticleId,
      title: "Public Story",
      content: "C".repeat(60),
      category: "Tech",
      status: "Published",
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      author: {
        id: authorId,
        name: "Alice Writer",
      },
    });
    mockPrisma.readLog.create.mockResolvedValue({ id: "log-id" });

    const response = await request(app).get(`/api/v1/articles/${guestArticleId}`);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(mockPrisma.readLog.create).toHaveBeenCalledTimes(1);
  });

  it("GET /api/v1/articles/:id stores readerId when JWT is present", async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: articleId,
      title: "Reader Story",
      content: "C".repeat(60),
      category: "Tech",
      status: "Published",
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      author: {
        id: authorId,
        name: "Alice Writer",
      },
    });
    mockPrisma.readLog.create.mockResolvedValue({ id: "log-id" });

    const response = await request(app)
      .get(`/api/v1/articles/${articleId}`)
      .set("Authorization", `Bearer ${readerToken}`);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.status).toBe(200);
    expect(mockPrisma.readLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          readerId: "33333333-3333-4333-8333-333333333333",
        }),
      }),
    );
  });

  it("GET /api/v1/articles/:id returns deleted message for soft-deleted article", async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: articleId,
      title: "Removed Story",
      content: "C".repeat(60),
      category: "Tech",
      status: "Published",
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      author: {
        id: authorId,
        name: "Alice Writer",
      },
    });

    const response = await request(app).get(`/api/v1/articles/${articleId}`);

    expect(response.status).toBe(404);
    expect(response.body.Success).toBe(false);
    expect(response.body.Message).toBe("News article no longer available");
  });

  it("POST /api/v1/articles returns 401 without token", async () => {
    const response = await request(app).post("/api/v1/articles").send({
      title: "A".repeat(20),
      content: "B".repeat(80),
      category: "Tech",
      status: "Draft",
    });

    expect(response.status).toBe(401);
    expect(response.body.Success).toBe(false);
  });

  it("POST /api/v1/articles returns 403 for reader role", async () => {
    const response = await request(app)
      .post("/api/v1/articles")
      .set("Authorization", `Bearer ${readerToken}`)
      .send({
        title: "A".repeat(20),
        content: "B".repeat(80),
        category: "Tech",
        status: "Draft",
      });

    expect(response.status).toBe(403);
    expect(response.body.Message).toBe("Forbidden");
  });

  it("POST /api/v1/articles returns 201 for author", async () => {
    mockPrisma.article.create.mockResolvedValue({
      id: articleId,
      title: "A".repeat(20),
      content: "B".repeat(80),
      category: "Tech",
      status: "Draft",
      authorId,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      deletedAt: null,
    });

    const response = await request(app)
      .post("/api/v1/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "A".repeat(20),
        content: "B".repeat(80),
        category: "Tech",
        status: "Draft",
      });

    expect(response.status).toBe(201);
    expect(response.body.Success).toBe(true);
  });

  it("GET /api/v1/articles/me returns paginated author articles", async () => {
    mockPrisma.article.findMany.mockResolvedValue([
      {
        id: articleId,
        title: "Title",
        content: "B".repeat(80),
        category: "Tech",
        status: "Draft",
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
    mockPrisma.article.count.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/v1/articles/me?page=1&pageSize=10")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Object).toHaveLength(1);
    expect(response.body.TotalSize).toBe(1);
  });

  it("PUT /api/v1/articles/:id returns 403 for non-owner", async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: articleId,
      authorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      deletedAt: null,
    });

    const response = await request(app)
      .put(`/api/v1/articles/${articleId}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "Updated title",
      });

    expect(response.status).toBe(403);
    expect(response.body.Success).toBe(false);
    expect(response.body.Message).toBe("Forbidden");
  });

  it("DELETE /api/v1/articles/:id returns 200 for owner and soft deletes", async () => {
    mockPrisma.article.findUnique.mockResolvedValue({
      id: articleId,
      authorId,
      deletedAt: null,
    });
    mockPrisma.article.update.mockResolvedValue({ id: articleId });

    const response = await request(app)
      .delete(`/api/v1/articles/${articleId}`)
      .set("Authorization", `Bearer ${authorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Message).toBe("Article deleted");
    expect(mockPrisma.article.update).toHaveBeenCalled();
  });
});
