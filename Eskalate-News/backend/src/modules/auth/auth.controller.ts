import { Request, Response } from "express";
import { responseUtil } from "../../utils/response.util";
import { authService } from "./auth.service";

export const authController = {
  register: async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    return res.status(201).json(responseUtil.success("Signup successful", user));
  },

  login: async (req: Request, res: Response) => {
    const loginPayload = await authService.login(req.body);
    return res.status(200).json(responseUtil.success("Login successful", loginPayload));
  },
};
