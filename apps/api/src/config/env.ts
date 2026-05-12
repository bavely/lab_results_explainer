import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AI_PROVIDER: z.enum(["openai", "azure_foundry_agent", "mock"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_MODEL: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().default("gpt-4o-mini"),
  AZURE_AI_PROJECT_ENDPOINT: z.string().url().optional(),
  AZURE_AI_AGENT_NAME: z.string().optional(),
  AZURE_AI_AGENT_VERSION: z.string().optional(),
  // "fail" = throw on AI failure (fail closed); "allow" = degrade to mock (fail open)
  AI_FALLBACK_POLICY: z.enum(["fail", "allow"]).default("allow"),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  DELETE_UPLOADS_AFTER_PARSE: z.coerce.boolean().default(true),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
