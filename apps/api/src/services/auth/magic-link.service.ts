import { prisma } from "../../db/prisma.js";
import { createMagicToken, hashToken } from "../../lib/crypto.js";
import { signAccessToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

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
  logger.info({ userId: user.id, link }, "Magic link created");

  if (env.MAGIC_LINK_DEV_MODE || env.NODE_ENV !== "production") {
    return { ok: true, devToken: token };
  }

  return { ok: true };
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