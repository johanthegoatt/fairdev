import PgBoss from "pg-boss";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let sharedBoss: PgBoss | null = null;

export const ANALYSIS_JOB_NAME = "analysis.run";

export async function getBoss(): Promise<PgBoss> {
  if (sharedBoss) {
    return sharedBoss;
  }

  const boss = new PgBoss({ connectionString: env.DATABASE_URL });
  boss.on("error", (error) => logger.error({ err: error }, "pg-boss error"));

  await boss.start();
  await boss.createQueue(ANALYSIS_JOB_NAME);

  sharedBoss = boss;
  return boss;
}

export async function stopBoss(): Promise<void> {
  if (!sharedBoss) {
    return;
  }

  await sharedBoss.stop();
  sharedBoss = null;
}