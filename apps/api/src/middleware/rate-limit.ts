import rateLimit from "express-rate-limit";

function keyFromUserOrIp(req: { user?: { id: string }; ip: string | undefined }): string {
  return req.user?.id ?? req.ip ?? "unknown";
}

export const uploadResumeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: keyFromUserOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Resume upload rate limit exceeded (10 per hour)." },
});

export const analyzeRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 20,
  keyGenerator: keyFromUserOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Analysis rate limit exceeded (20 per day)." },
});