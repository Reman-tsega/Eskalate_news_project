import { z } from "zod";

const articleStatusSchema = z.enum(["Draft", "Published"]);

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(150),
    content: z.string().trim().min(50),
    category: z.string().trim().min(1).max(50),
    status: articleStatusSchema.optional(),
  }),
});

export const updateArticleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(150).optional(),
      content: z.string().trim().min(50).optional(),
      category: z.string().trim().min(1).max(50).optional(),
      status: articleStatusSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

export const deleteArticleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listMyArticlesSchema = z.object({
  query: paginationQuerySchema.extend({
    includeDeleted: z
      .union([z.literal("true"), z.literal("false")])
      .optional()
      .transform((value) => value === "true"),
  }),
});

export const listPublicArticlesSchema = z.object({
  query: paginationQuerySchema.extend({
    category: z.string().trim().min(1).optional(),
    author: z.string().trim().min(1).optional(),
    q: z.string().trim().min(1).optional(),
  }),
});

export const getArticleByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

