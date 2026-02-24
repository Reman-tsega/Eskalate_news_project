import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type AuthTokenPayload = {
  sub: string;
  role: "author" | "reader";
};

const jwtOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

export const signAccessToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, jwtOptions);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
};
