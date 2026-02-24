import { z } from "zod";

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().min(1),
    authorId: z.string().min(1),
  }),
});
