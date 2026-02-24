export type UserRole = "admin" | "editor" | "reader";

export type UserModel = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
