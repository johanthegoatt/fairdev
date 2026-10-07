import { prisma } from "../../db/prisma.js";
import { createMagicToken, hashToken } from "../../lib/crypto.js";
import { signAccessToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { mailIsConfigured, sendMagicLinkEmail } from "../../lib/mail.js";

export async function requestMagicLink(email: string): Promise<{ ok: true; devToken?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: { email: normalizedEmail },
  });

  const token = createMagicToken();
  const tokenHash = hashToken(token);

  const expiresAt = new Date(Date.now() + env.MAGIC_LINK_TTL_MINUTES * 60_000);

  await prisma.magicLink.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const link = `${env.APP_BASE_URL}/login?token=${encodeURIComponent(token)}`;
  // The link itself never goes in the log: anyone who can read logs could sign in with it.
  logger.info({ userId: user.id }, "Magic link created");

  if (mailIsConfigured()) {
    const sent = await sendMagicLinkEmail(normalizedEmail, link, env.MAGIC_LINK_TTL_MINUTES);
    if (!sent) {
      throw new HttpError(502, "The sign-in email could not be sent. Try again in a minute.");
    }
    // Mail is on, so the email is the only way in. No dev token shortcut.
    return { ok: true };
  }

  if (env.MAGIC_LINK_DEV_MODE || env.NODE_ENV !== "production") {
    return { ok: true, devToken: token };
  }

  throw new HttpError(503, "Sign-in email is not set up on this server yet.");
}

export async function verifyMagicLink(token: string): Promise<{ accessToken: string; user: { id: string; email: string } }> {
  const tokenHash = hashToken(token);
  const now = new Date();

  const magicLink = await prisma.magicLink.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    include: {
      user: true,
    },
  });

  if (!magicLink) {
    throw new Error("Invalid or expired magic link token.");
  }

  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: now },
  });

  const accessToken = signAccessToken(magicLink.user);
  return {
    accessToken,
    user: {
      id: magicLink.user.id,
      email: magicLink.user.email,
    },
  };
}