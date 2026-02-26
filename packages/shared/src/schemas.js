import { z } from "zod";
export const companyTypeSchema = z.enum(["startup", "faang", "mid_size", "remote"]);
export const locationTierSchema = z.enum(["sf_ny_sea", "major_us_city", "rest_us_remote"]);
export const skillLevelSchema = z.enum(["junior", "mid", "senior"]);
export const fairnessStatusSchema = z.enum(["underpaid", "fair", "overpaid"]);
export const portfolioUrlSchema = z.string().trim().url();
export const emailSchema = z.string().trim().email();
export const requestMagicLinkSchema = z.object({
    email: emailSchema,
});
export const verifyMagicLinkSchema = z.object({
    token: z.string().trim().min(8).max(512),
});
export const uploadResumeResponseSchema = z.object({
    resumeId: z.string().uuid(),
    parsed: z.object({
        skills: z.array(z.string()),
        yearsExperience: z.number().min(0).max(60),
        education: z.array(z.string()),
        workHistory: z.array(z.string()),
    }),
});
export const analysisScoreSchema = z.object({
    codeQuality: z.number().min(1).max(10),
    architecture: z.number().min(1).max(10),
    testing: z.number().min(1).max(10),
    documentation: z.number().min(1).max(10),
    projectComplexity: z.number().min(1).max(10),
    finalSkillScore: z.number().min(1).max(10),
});
export const portfolioInsightsSchema = z.object({
    url: portfolioUrlSchema,
    title: z.string().nullable(),
    summary: z.string(),
    technologies: z.array(z.string()),
    projectLinks: z.array(z.string().url()),
    embeddedSiteLinks: z.array(z.string().url()),
});
export const analysisResultSchema = z.object({
    scores: analysisScoreSchema,
    skillLevel: skillLevelSchema,
    marketRangeUsd: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
        midpoint: z.number().positive(),
    }),
    offerAssessment: z.object({
        status: fairnessStatusSchema,
        differencePct: z.number(),
        deltaUsd: z.number(),
    }),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    negotiationSuggestion: z.string().min(1),
    improvementSuggestions: z.array(z.string()).min(1),
    portfolioInsights: portfolioInsightsSchema.nullable().default(null),
});
export const createAnalysisSchema = z.object({
    githubUrl: z.string().trim().url().startsWith("https://github.com/").nullable().default(null),
    resumeId: z.string().uuid().nullable(),
    portfolioUrl: portfolioUrlSchema,
    yearsExperience: z.number().int().min(0).max(60),
    locationTier: locationTierSchema,
    offeredSalaryUsd: z.number().int().min(20000).max(1000000),
    companyType: companyTypeSchema,
});
export const createAnalysisResponseSchema = z.object({
    analysisId: z.string().uuid(),
    status: z.literal("queued"),
});
export const analysisStatusSchema = z.enum(["queued", "processing", "completed", "failed"]);
export const analysisResultsResponseSchema = z.object({
    status: analysisStatusSchema,
    progress: z.number().min(0).max(100),
    result: analysisResultSchema.nullable(),
    error: z.string().nullable(),
});
export const listAnalysesQuerySchema = z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const listAnalysesResponseSchema = z.object({
    items: z.array(z.object({
        id: z.string().uuid(),
        status: analysisStatusSchema,
        progress: z.number().min(0).max(100),
        createdAt: z.string(),
        githubUrl: z.string().nullable().default(null),
        portfolioUrl: portfolioUrlSchema.nullable().default(null),
        offeredSalaryUsd: z.number(),
        companyType: companyTypeSchema,
        locationTier: locationTierSchema,
    })),
    nextCursor: z.string().uuid().nullable(),
});
export const llmEvaluationSchema = z.object({
    codeQuality: z.number().min(1).max(10),
    architecture: z.number().min(1).max(10),
    testing: z.number().min(1).max(10),
    documentation: z.number().min(1).max(10),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    rationale: z.string().min(1),
});
export const githubProfileUrlSchema = z
    .string()
    .trim()
    .url()
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/, "GitHub profile URL must be public user/org profile");
