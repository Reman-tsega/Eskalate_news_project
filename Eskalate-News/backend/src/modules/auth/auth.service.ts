import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "../../database/prisma";
import { AppError } from "../../utils/app-error.util";
import { signAccessToken } from "../../utils/jwt.util";
import { hashPassword, verifyPassword } from "../../utils/password.util";

type RegisterInput = { name: string; email: string; password: string; role: "author" | "reader" };
type LoginInput = { email: string; password: string };

export const authService = {
  register: async (input: RegisterInput) => {
    const hashedPassword = await hashPassword(input.password);

    try {
      const createdUser = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          password: hashedPassword,
          role: input.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return createdUser;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("Conflict", 409, ["Email already exists"]);
      }

      throw error;
    }
  },

  login: async (input: LoginInput) => {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401, ["Email or password is incorrect"]);
    }

    const passwordMatches = await verifyPassword(input.password, user.password);

    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401, ["Email or password is incorrect"]);
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: "24h",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
