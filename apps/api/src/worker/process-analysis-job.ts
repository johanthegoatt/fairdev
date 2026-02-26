import { AnalysisStatus, type Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import {
  fromPrismaCompanyType,
  fromPrismaLocationTier,
  toPrismaSkillLevel,
} from "../lib/mappers.js";
import { logger } from "../lib/logger.js";
import { applyPortfolioSignalBoost, computeProjectComplexityScore } from "../services/analysis/complexity.service.js";
import {
  buildAnalysisResult,
  computeFinalSkillScore,
  mapSkillLevel,
} from "../services/analysis/evaluation.service.js";
import { evaluateRepositoriesWithLlm } from "../services/analysis/llm-evaluation.service.js";
import { fetchGitHubProfileSnapshot } from "../services/github/github.service.js";
import { fetchPortfolioSnapshot } from "../services/portfolio/portfolio.service.js";
import { getMarketSalaryRange } from "../services/salary/salary.service.js";

type LightweightGithubSnapshot = {
  username: string;
  repositories: Awaited<ReturnType<typeof fetchGitHubProfileSnapshot>>["repositories"];
  technologyStack: string[];
};

async function appendJobEvent(analysisId: string, stage: string, message: string): Promise<void> {
  await prisma.jobEvent.create({
    data: {
      analysisId,
      stage,
      message,
    },
  });
}

async function setAnalysisProgress(analysisId: string, progress: number, status?: AnalysisStatus): Promise<void> {
  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      progress,
      ...(status ? { status } : {}),
    },
  });
}

export async function processAnalysisJob(payload: { analysisId: string }): Promise<void> {
  const { analysisId } = payload;

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: {
      resume: true,
      user: true,
    },
  });

  if (!analysis) {
    logger.warn({ analysisId }, "Analysis not found for queued job");
    return;
  }

  try {
    await appendJobEvent(analysisId, "start", "Job started");
    await setAnalysisProgress(analysisId, 10, AnalysisStatus.PROCESSING);

    let github: LightweightGithubSnapshot = {
      username: "portfolio-only",
      repositories: [],
      technologyStack: [],
    };

    if (analysis.githubUrl) {
      github = await fetchGitHubProfileSnapshot(analysis.githubUrl);
      await appendJobEvent(analysisId, "github", `Fetched ${github.repositories.length} repositories`);

      await prisma.repository.deleteMany({ where: { analysisId } });
      if (github.repositories.length > 0) {
        await prisma.repository.createMany({
          data: github.repositories.map((repo) => ({
            analysisId,
            name: repo.name,
            url: repo.url,
            stars: repo.stars,
            forks: repo.forks,
            languagesJson: repo.languages,
            readmeExcerpt: repo.readmeExcerpt,
            commitFrequencyJson: repo.commitFrequency,
            structureSummary: repo.structureSummary,
          })),
        });
      }
    } else {
      await appendJobEvent(analysisId, "github", "No GitHub URL provided; using portfolio-only analysis path");
      await prisma.repository.deleteMany({ where: { analysisId } });
    }

    let portfolioSnapshot: Awaited<ReturnType<typeof fetchPortfolioSnapshot>> | null = null;
    if (analysis.portfolioUrl) {
      try {
        portfolioSnapshot = await fetchPortfolioSnapshot(analysis.portfolioUrl);
        await appendJobEvent(
          analysisId,
          "portfolio",
          `Portfolio analyzed with ${portfolioSnapshot.projectLinks.length} project links and ${portfolioSnapshot.technologies.length} tech signals`,
        );
      } catch (error) {
        logger.warn({ err: error, analysisId }, "Portfolio fetch failed, continuing without portfolio signals");
        await appendJobEvent(analysisId, "portfolio", "Portfolio URL was unreachable or unparseable");
      }
    }

    await setAnalysisProgress(analysisId, 45);

    const baseComplexity = computeProjectComplexityScore(github.repositories);
    const projectComplexity = applyPortfolioSignalBoost(baseComplexity, portfolioSnapshot);
    const resumeSkillsRaw = (analysis.resume?.skillsJson ?? []) as unknown;
    const resumeSkills = Array.isArray(resumeSkillsRaw)
      ? resumeSkillsRaw.filter((value): value is string => typeof value === "string")
      : [];
    const mergedSkills = Array.from(new Set([...resumeSkills, ...github.technologyStack, ...(portfolioSnapshot?.technologies ?? [])]));

    const llm = await evaluateRepositoriesWithLlm({
      githubUsername: github.username,
      yearsExperience: analysis.yearsExperience,
      resumeSkills: mergedSkills,
      portfolioSnapshot,
      repositories: github.repositories,
    });

    await appendJobEvent(analysisId, "llm", "Received LLM evaluation");
    await setAnalysisProgress(analysisId, 70);

    const preliminaryScore = computeFinalSkillScore({
      codeQuality: llm.codeQuality,
      architecture: llm.architecture,
      testing: llm.testing,
      documentation: llm.documentation,
      projectComplexity,
    });

    const skillLevel = mapSkillLevel(preliminaryScore);

    const market = await getMarketSalaryRange({
      locationTier: fromPrismaLocationTier(analysis.locationTier),
      companyType: fromPrismaCompanyType(analysis.companyType),
      skillLevel,
      yearsExperience: analysis.yearsExperience,
    });

    await appendJobEvent(analysisId, "salary", "Resolved market salary range");

    const result = buildAnalysisResult({
      llm,
      projectComplexity,
      offeredSalaryUsd: analysis.offeredSalary,
      marketMin: market.minUsd,
      marketMax: market.maxUsd,
      hasResume: Boolean(analysis.resumeId),
      portfolioSnapshot,
    });

    await setAnalysisProgress(analysisId, 90);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.score.upsert({
        where: {
          analysisId,
        },
        update: {
          codeQuality: result.scores.codeQuality,
          architecture: result.scores.architecture,
          testing: result.scores.testing,
          documentation: result.scores.documentation,
          projectComplexity: result.scores.projectComplexity,
          finalSkillScore: result.scores.finalSkillScore,
          skillLevel: toPrismaSkillLevel(result.skillLevel),
        },
        create: {
          analysisId,
          codeQuality: result.scores.codeQuality,
          architecture: result.scores.architecture,
          testing: result.scores.testing,
          documentation: result.scores.documentation,
          projectComplexity: result.scores.projectComplexity,
          finalSkillScore: result.scores.finalSkillScore,
          skillLevel: toPrismaSkillLevel(result.skillLevel),
        },
      });

      await tx.analysisReport.upsert({
        where: {
          analysisId,
        },
        update: {
          resultJson: result as unknown as object,
        },
        create: {
          analysisId,
          resultJson: result as unknown as object,
        },
      });

      await tx.analysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.COMPLETED,
          progress: 100,
          error: null,
          completedAt: new Date(),
        },
      });
    });

    await appendJobEvent(analysisId, "complete", "Analysis completed successfully");
  } catch (error) {
    logger.error({ err: error, analysisId }, "Failed analysis job");

    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: AnalysisStatus.FAILED,
        error: "Analysis failed due to a processing error.",
      },
    });

    await appendJobEvent(analysisId, "failed", "Job failed during processing");
    throw error;
  }
}
