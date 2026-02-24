import { prisma } from "../../database/prisma";
import { hashPassword, verifyPassword } from "../../utils/password.util";

type RegisterInput = { email: string; password: string };
type LoginInput = { email: string; password: string };

export const authService = {
  register: async (input: RegisterInput) => {
    const hashed = await hashPassword(input.password);
    return prisma.user.create({
      data: { email: input.email, password: hashed },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  },
  login: async (input: LoginInput) => {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      throw new Error("Invalid credentials");
    }
    return { user: { id: user.id, email: user.email, role: user.role } };
  },
};
