import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { getBoss, stopBoss } from "./lib/boss.js";
import { logger } from "./lib/logger.js";

async function start() {
  await prisma.$connect();
  await getBoss();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "FairDev API started");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down API server");
    server.close(async () => {
      await stopBoss();
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(async (error) => {
  logger.error({ err: error }, "Failed to start API");
  await prisma.$disconnect();
  process.exit(1);
});