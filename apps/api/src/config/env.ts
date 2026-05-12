import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AI_PROVIDER: z.enum(["openai", "mock"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  // "fail" = throw on AI failure (fail closed); "allow" = degrade to mock (fail open)
  AI_FALLBACK_POLICY: z.enum(["fail", "allow"]).default("allow"),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  DELETE_UPLOADS_AFTER_PARSE: z.coerce.boolean().default(true),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
