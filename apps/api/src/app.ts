import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { labRoutes } from "./modules/lab-analysis/lab.routes.js";
import { pdfRoutes } from "./modules/pdf-parser/pdf.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: false
    })
  );

  app.use(
    pinoHttp({
      redact: ["req.headers.authorization", "req.body", "res.body"],
      serializers: {
        req(req: { method?: string; url?: string; remoteAddress?: string }) {
          return {
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress
          };
        }
      }
    })
  );

  app.use(express.json({ limit: "1mb" }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "lab-results-api" });
  });

  app.use("/api/labs", apiLimiter, labRoutes);
  app.use("/api/labs", apiLimiter, pdfRoutes);

  app.use(errorHandler);

  return app;
}
