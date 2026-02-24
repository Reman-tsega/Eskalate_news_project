import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler.util";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRoutes = Router();

authRoutes.post("/signup", validate(registerSchema), asyncHandler(authController.register));
authRoutes.post("/login", validate(loginSchema), asyncHandler(authController.login));
