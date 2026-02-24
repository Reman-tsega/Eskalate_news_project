import { prisma } from "../../database/prisma";

export const userService = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
};
