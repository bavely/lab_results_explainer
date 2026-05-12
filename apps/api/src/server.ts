import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";

const app = createApp();

if (env.NODE_ENV === "production") {
  if (env.AI_PROVIDER !== "openai") {
    logger.warn(
      { event: "production_mock_ai_startup" },
      "Running in production with AI_PROVIDER=mock. Lab explanations will use deterministic fallbacks, not real AI."
    );
  }
  if (env.AI_PROVIDER === "openai" && env.AI_FALLBACK_POLICY === "allow") {
    logger.warn(
      { event: "production_fallback_policy_open" },
      "Running in production with AI_FALLBACK_POLICY=allow. AI failures will silently fall back to mock explanations."
    );
  }
}

app.listen(env.PORT, () => {
  logger.info(
    { event: "server_start", port: env.PORT, aiProvider: env.AI_PROVIDER, aiPolicy: env.AI_FALLBACK_POLICY },
    `Lab Results API listening on port ${env.PORT}`
  );
});
