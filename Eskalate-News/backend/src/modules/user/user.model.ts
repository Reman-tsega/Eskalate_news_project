export type UserRole = "author" | "reader";

export type UserModel = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
