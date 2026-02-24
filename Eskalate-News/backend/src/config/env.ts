import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL as string,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
};
