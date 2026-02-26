import { prisma } from "./db/prisma.js";
import { ANALYSIS_JOB_NAME, getBoss, stopBoss } from "./lib/boss.js";
import { logger } from "./lib/logger.js";
import { processAnalysisJob } from "./worker/process-analysis-job.js";

async function startWorker() {
  await prisma.$connect();
  const boss = await getBoss();

  await boss.work(ANALYSIS_JOB_NAME, async (jobOrJobs) => {
    const jobs = Array.isArray(jobOrJobs) ? jobOrJobs : [jobOrJobs];

    for (const job of jobs) {
      const payload = job.data as { analysisId: string };
      await processAnalysisJob(payload);
    }
  });

  logger.info("FairDev worker listening for analysis jobs");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker");
    await stopBoss();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

startWorker().catch(async (error) => {
  logger.error({ err: error }, "Worker startup failed");
  await prisma.$disconnect();
  process.exit(1);
});
