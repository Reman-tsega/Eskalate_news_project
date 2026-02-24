import request from "supertest";
import { dailyAggregationJob } from "../jobs/dailyAggregation.job";

jest.mock("../database/prisma", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockPrisma } = require("./mocks/prisma.mock");
  return { prisma: mockPrisma };
});

import app from "../app";
import { mockPrisma, resetPrismaMock } from "./mocks/prisma.mock";

describe("System and analytics endpoints", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("GET /health returns OK", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Message).toBe("OK");
  });

  it("GET /api/docs.json returns OpenAPI document", async () => {
    const response = await request(app).get("/api/docs.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
  });

  it("GET unknown route returns 404 in standard response format", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.Success).toBe(false);
    expect(response.body.Message).toBe("Route not found");
  });

  it("daily aggregation job upserts counts by article for GMT day", async () => {
    mockPrisma.readLog.findMany.mockResolvedValue([
      { articleId: "a1" },
      { articleId: "a1" },
      { articleId: "a2" },
    ]);
    mockPrisma.dailyAnalytics.upsert.mockResolvedValue({});

    const result = await dailyAggregationJob(new Date("2026-02-24T10:00:00.000Z"));

    expect(result.processed).toBe(2);
    expect(mockPrisma.dailyAnalytics.upsert).toHaveBeenCalledTimes(2);
  });
});

