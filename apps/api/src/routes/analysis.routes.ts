import { AnalysisStatus } from "@prisma/client";
import {
  analysisResultSchema,
  createAnalysisSchema,
  listAnalysesQuerySchema,
  type AnalysisResult,
} from "@fairdev/shared";
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { ANALYSIS_JOB_NAME, getBoss } from "../lib/boss.js";
import {
  fromPrismaCompanyType,
  fromPrismaLocationTier,
  fromPrismaSkillLevel,
  toPrismaCompanyType,
  toPrismaLocationTier,
} from "../lib/mappers.js";
import { requireAuth } from "../middleware/auth.js";
import { analyzeRateLimit } from "../middleware/rate-limit.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { generateAnalysisReportPdf } from "../services/report/pdf-report.service.js";

export const analysisRouter = Router();

analysisRouter.post("/analyze", requireAuth, analyzeRateLimit, validateBody(createAnalysisSchema), async (req, res, next) => {
  try {
    if (req.body.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: {
          id: req.body.resumeId,
          userId: req.user!.id,
        },
      });

      if (!resume) {
        return res.status(404).json({ error: "Resume not found for this user." });
      }
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user!.id,
        resumeId: req.body.resumeId,
        githubUrl: req.body.githubUrl,
        portfolioUrl: req.body.portfolioUrl,
        yearsExperience: req.body.yearsExperience,
        locationTier: toPrismaLocationTier(req.body.locationTier),
        offeredSalary: req.body.offeredSalaryUsd,
        companyType: toPrismaCompanyType(req.body.companyType),
        status: AnalysisStatus.QUEUED,
        progress: 0,
      },
    });

    const boss = await getBoss();
    await boss.send(ANALYSIS_JOB_NAME, {
      analysisId: analysis.id,
    });

    return res.status(202).json({
      analysisId: analysis.id,
      status: "queued",
    });
  } catch (error) {
    return next(error);
  }
});

analysisRouter.get("/results/:id", requireAuth, async (req, res, next) => {
  try {
    const analysisId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!analysisId) {
      return res.status(400).json({ error: "Invalid analysis id." });
    }

    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: req.user!.id,
      },
      include: {
        report: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    const result = analysis.report?.resultJson ? analysisResultSchema.parse(analysis.report.resultJson) : null;

    return res.status(200).json({
      status: analysis.status.toLowerCase(),
      progress: analysis.progress,
      result,
      error: analysis.error,
    });
  } catch (error) {
    return next(error);
  }
});

analysisRouter.get("/results/:id/report.pdf", requireAuth, async (req, res, next) => {
  try {
    const analysisId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!analysisId) {
      return res.status(400).json({ error: "Invalid analysis id." });
    }

    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: req.user!.id,
      },
      include: {
        report: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    if (analysis.status !== AnalysisStatus.COMPLETED || !analysis.report?.resultJson) {
      return res.status(409).json({ error: "Report is available only for completed analyses." });
    }

    const result = analysisResultSchema.parse(analysis.report.resultJson) as AnalysisResult;
    const pdfBuffer = await generateAnalysisReportPdf({
      analysisId: analysis.id,
      githubUrl: analysis.githubUrl,
      offeredSalaryUsd: analysis.offeredSalary,
      createdAt: analysis.createdAt,
      result,
    });

    await prisma.analysisReport.update({
      where: {
        analysisId: analysis.id,
      },
      data: {
        pdfGeneratedAt: new Date(),
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=fairdev-report-${analysis.id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
});

analysisRouter.get("/analyses", requireAuth, validateQuery(listAnalysesQuerySchema), async (req, res, next) => {
  try {
    const { cursor, limit } = listAnalysesQuerySchema.parse(req.query);

    const analyses = await prisma.analysis.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasNextPage = analyses.length > limit;
    const pageItems = hasNextPage ? analyses.slice(0, limit) : analyses;

    return res.status(200).json({
      items: pageItems.map((analysis: (typeof pageItems)[number]) => ({
        id: analysis.id,
        status: analysis.status.toLowerCase(),
        progress: analysis.progress,
        createdAt: analysis.createdAt.toISOString(),
        githubUrl: analysis.githubUrl,
        portfolioUrl: analysis.portfolioUrl,
        offeredSalaryUsd: analysis.offeredSalary,
        companyType: fromPrismaCompanyType(analysis.companyType),
        locationTier: fromPrismaLocationTier(analysis.locationTier),
      })),
      nextCursor: hasNextPage ? pageItems[pageItems.length - 1]?.id ?? null : null,
    });
  } catch (error) {
    return next(error);
  }
});

analysisRouter.get("/scores/:id", requireAuth, async (req, res, next) => {
  try {
    const analysisId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!analysisId) {
      return res.status(400).json({ error: "Invalid analysis id." });
    }

    const score = await prisma.score.findFirst({
      where: {
        analysisId,
        analysis: {
          userId: req.user!.id,
        },
      },
    });

    if (!score) {
      return res.status(404).json({ error: "Score not found." });
    }

    return res.status(200).json({
      codeQuality: score.codeQuality,
      architecture: score.architecture,
      testing: score.testing,
      documentation: score.documentation,
      projectComplexity: score.projectComplexity,
      finalSkillScore: score.finalSkillScore,
      skillLevel: fromPrismaSkillLevel(score.skillLevel),
    });
  } catch (error) {
    return next(error);
  }
});
