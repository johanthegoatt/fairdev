import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/fairdev"),
  JWT_SECRET: z.string().min(16).default("replace-with-very-long-dev-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  LLM_PROVIDER: z.enum(["auto", "openai", "gemini"]).default("auto"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  GEMINI_FALLBACK_MODELS: z
    .string()
    .default("gemini-1.5-flash,gemini-1.5-flash-8b")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  GITHUB_TOKEN: z.string().optional(),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MAGIC_LINK_TTL_MINUTES: z.coerce.number().int().positive().max(120).default(15),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default("FairDev <fairdev@johanthegoat.xyz>"),
  MAGIC_LINK_DEV_MODE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  ENFORCE_PUBLIC_GITHUB: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
