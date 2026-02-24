import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const nameRegex = /^[A-Za-z ]+$/;

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .regex(nameRegex, "Name must contain only alphabets and spaces"),
    email: z.string().trim().email("Invalid email format"),
    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
      ),
    role: z.enum(["author", "reader"]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});
