import bcrypt from "bcryptjs";
import request from "supertest";

jest.mock("../database/prisma", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockPrisma } = require("./mocks/prisma.mock");
  return { prisma: mockPrisma };
});

import { mockPrisma, resetPrismaMock } from "./mocks/prisma.mock";

import app from "../app";

describe("Auth endpoints", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("POST /api/v1/auth/signup returns 201 for valid payload", async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: "3a8136e3-2783-4f9f-a9fc-57dcf756ece4",
      name: "Alice Writer",
      email: "alice@example.com",
      role: "author",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await request(app).post("/api/v1/auth/signup").send({
      name: "Alice Writer",
      email: "alice@example.com",
      password: "Strong@123",
      role: "author",
    });

    expect(response.status).toBe(201);
    expect(response.body.Success).toBe(true);
    expect(response.body.Message).toBe("Signup successful");
  });

  it("POST /api/v1/auth/signup returns 400 for weak password", async () => {
    const response = await request(app).post("/api/v1/auth/signup").send({
      name: "Alice Writer",
      email: "alice@example.com",
      password: "weak",
      role: "author",
    });

    expect(response.status).toBe(400);
    expect(response.body.Success).toBe(false);
  });

  it("POST /api/v1/auth/signup returns 409 for duplicate email", async () => {
    mockPrisma.user.create.mockRejectedValue({ code: "P2002" });

    const response = await request(app).post("/api/v1/auth/signup").send({
      name: "Alice Writer",
      email: "alice@example.com",
      password: "Strong@123",
      role: "author",
    });

    expect(response.status).toBe(409);
    expect(response.body.Success).toBe(false);
    expect(response.body.Errors).toContain("Email already exists");
  });

  it("POST /api/v1/auth/login returns 200 with token on valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("Strong@123", 10);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "3a8136e3-2783-4f9f-a9fc-57dcf756ece4",
      name: "Alice Writer",
      email: "alice@example.com",
      password: hashedPassword,
      role: "author",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "alice@example.com",
      password: "Strong@123",
    });

    expect(response.status).toBe(200);
    expect(response.body.Success).toBe(true);
    expect(response.body.Object.accessToken).toEqual(expect.any(String));
  });

  it("POST /api/v1/auth/login returns 401 on invalid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "missing@example.com",
      password: "Strong@123",
    });

    expect(response.status).toBe(401);
    expect(response.body.Success).toBe(false);
    expect(response.body.Message).toBe("Invalid credentials");
  });
});
