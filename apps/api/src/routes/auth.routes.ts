import { Router } from "express";
import { requestMagicLinkSchema, verifyMagicLinkSchema } from "@fairdev/shared";
import { validateBody } from "../middleware/validate.js";
import { requestMagicLink, verifyMagicLink } from "../services/auth/magic-link.service.js";

export const authRouter = Router();

authRouter.post("/magic-link/request", validateBody(requestMagicLinkSchema), async (req, res, next) => {
  try {
    const response = await requestMagicLink(req.body.email);
    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/magic-link/verify", validateBody(verifyMagicLinkSchema), async (req, res, next) => {
  try {
    const response = await verifyMagicLink(req.body.token);
    return res.status(200).json(response);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});