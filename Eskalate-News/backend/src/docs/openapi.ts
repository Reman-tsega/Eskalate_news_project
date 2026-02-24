export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Eskalate News API",
    version: "1.0.0",
    description: "REST API for authentication, article publishing, and analytics.",
  },
  servers: [{ url: "/", description: "Root" }],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Articles" },
    { name: "Author" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": { description: "Healthy" },
        },
      },
    },
    "/api/v1/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Strong@123" },
                  role: { type: "string", enum: ["author", "reader"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": { description: "Validation error" },
          "409": { description: "Duplicate email" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Strong@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Authenticated" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/articles": {
      get: {
        tags: ["Articles"],
        summary: "List published news (public)",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10 } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "author", schema: { type: "string" } },
          { in: "query", name: "q", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Paginated list" },
        },
      },
      post: {
        tags: ["Articles"],
        summary: "Create article (author only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content", "category"],
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 150 },
                  content: { type: "string", minLength: 50 },
                  category: { type: "string", example: "Tech" },
                  status: { type: "string", enum: ["Draft", "Published"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Article created" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/v1/articles/me": {
      get: {
        tags: ["Articles"],
        summary: "List current author articles",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10 } },
          { in: "query", name: "includeDeleted", schema: { type: "boolean", default: false } },
        ],
        responses: {
          "200": { description: "Paginated list" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/v1/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Get published article by id and track read",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Fetched" },
          "404": { description: "Not found/deleted" },
        },
      },
      put: {
        tags: ["Articles"],
        summary: "Update own article",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 150 },
                  content: { type: "string", minLength: 50 },
                  category: { type: "string" },
                  status: { type: "string", enum: ["Draft", "Published"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Articles"],
        summary: "Soft delete own article",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/v1/author/dashboard": {
      get: {
        tags: ["Author"],
        summary: "Author dashboard metrics",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": { description: "Paginated metrics list" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
  },
} as const;

