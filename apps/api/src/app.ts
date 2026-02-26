import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import type { RequestHandler } from "express";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { analysisRouter } from "./routes/analysis.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { resumeRouter } from "./routes/resume.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  const httpLogger = (pinoHttp as unknown as (options: Record<string, unknown>) => RequestHandler)({
    logger,
    redact: ["req.headers.authorization", "req.body.token"],
  });
  app.use(httpLogger);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    return res.status(200).json({ ok: true, service: "fairdev-api" });
  });

  app.use("/auth", authRouter);
  app.use("/upload-resume", resumeRouter);
  app.use("/", analysisRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
