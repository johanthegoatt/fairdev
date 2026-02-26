import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  logger.error({ err: error }, "Unhandled API error");
  return res.status(500).json({ error: "Internal server error" });
}