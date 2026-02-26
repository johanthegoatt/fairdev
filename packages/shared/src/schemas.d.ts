import { z } from "zod";
export declare const companyTypeSchema: z.ZodEnum<["startup", "faang", "mid_size", "remote"]>;
export declare const locationTierSchema: z.ZodEnum<["sf_ny_sea", "major_us_city", "rest_us_remote"]>;
export declare const skillLevelSchema: z.ZodEnum<["junior", "mid", "senior"]>;
export declare const fairnessStatusSchema: z.ZodEnum<["underpaid", "fair", "overpaid"]>;
export declare const portfolioUrlSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const requestMagicLinkSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const verifyMagicLinkSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const uploadResumeResponseSchema: z.ZodObject<{
    resumeId: z.ZodString;
    parsed: z.ZodObject<{
        skills: z.ZodArray<z.ZodString, "many">;
        yearsExperience: z.ZodNumber;
        education: z.ZodArray<z.ZodString, "many">;
        workHistory: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        skills: string[];
        yearsExperience: number;
        education: string[];
        workHistory: string[];
    }, {
        skills: string[];
        yearsExperience: number;
        education: string[];
        workHistory: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    resumeId: string;
    parsed: {
        skills: string[];
        yearsExperience: number;
        education: string[];
        workHistory: string[];
    };
}, {
    resumeId: string;
    parsed: {
        skills: string[];
        yearsExperience: number;
        education: string[];
        workHistory: string[];
    };
}>;
export declare const analysisScoreSchema: z.ZodObject<{
    codeQuality: z.ZodNumber;
    architecture: z.ZodNumber;
    testing: z.ZodNumber;
    documentation: z.ZodNumber;
    projectComplexity: z.ZodNumber;
    finalSkillScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    codeQuality: number;
    architecture: number;
    testing: number;
    documentation: number;
    projectComplexity: number;
    finalSkillScore: number;
}, {
    codeQuality: number;
    architecture: number;
    testing: number;
    documentation: number;
    projectComplexity: number;
    finalSkillScore: number;
}>;
export declare const portfolioInsightsSchema: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    summary: z.ZodString;
    technologies: z.ZodArray<z.ZodString, "many">;
    projectLinks: z.ZodArray<z.ZodString, "many">;
    embeddedSiteLinks: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    url: string;
    title: string | null;
    summary: string;
    technologies: string[];
    projectLinks: string[];
    embeddedSiteLinks: string[];
}, {
    url: string;
    title: string | null;
    summary: string;
    technologies: string[];
    projectLinks: string[];
    embeddedSiteLinks: string[];
}>;
export declare const analysisResultSchema: z.ZodObject<{
    scores: z.ZodObject<{
        codeQuality: z.ZodNumber;
        architecture: z.ZodNumber;
        testing: z.ZodNumber;
        documentation: z.ZodNumber;
        projectComplexity: z.ZodNumber;
        finalSkillScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        codeQuality: number;
        architecture: number;
        testing: number;
        documentation: number;
        projectComplexity: number;
        finalSkillScore: number;
    }, {
        codeQuality: number;
        architecture: number;
        testing: number;
        documentation: number;
        projectComplexity: number;
        finalSkillScore: number;
    }>;
    skillLevel: z.ZodEnum<["junior", "mid", "senior"]>;
    marketRangeUsd: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        midpoint: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        midpoint: number;
    }, {
        min: number;
        max: number;
        midpoint: number;
    }>;
    offerAssessment: z.ZodObject<{
        status: z.ZodEnum<["underpaid", "fair", "overpaid"]>;
        differencePct: z.ZodNumber;
        deltaUsd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "underpaid" | "fair" | "overpaid";
        differencePct: number;
        deltaUsd: number;
    }, {
        status: "underpaid" | "fair" | "overpaid";
        differencePct: number;
        deltaUsd: number;
    }>;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
    negotiationSuggestion: z.ZodString;
    improvementSuggestions: z.ZodArray<z.ZodString, "many">;
    portfolioInsights: z.ZodDefault<z.ZodNullable<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        summary: z.ZodString;
        technologies: z.ZodArray<z.ZodString, "many">;
        projectLinks: z.ZodArray<z.ZodString, "many">;
        embeddedSiteLinks: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        url: string;
        title: string | null;
        summary: string;
        technologies: string[];
        projectLinks: string[];
        embeddedSiteLinks: string[];
    }, {
        url: string;
        title: string | null;
        summary: string;
        technologies: string[];
        projectLinks: string[];
        embeddedSiteLinks: string[];
    }>>>;
}, "strip", z.ZodTypeAny, {
    scores: {
        codeQuality: number;
        architecture: number;
        testing: number;
        documentation: number;
        projectComplexity: number;
        finalSkillScore: number;
    };
    skillLevel: "junior" | "mid" | "senior";
    marketRangeUsd: {
        min: number;
        max: number;
        midpoint: number;
    };
    offerAssessment: {
        status: "underpaid" | "fair" | "overpaid";
        differencePct: number;
        deltaUsd: number;
    };
    strengths: string[];
    weaknesses: string[];
    negotiationSuggestion: string;
    improvementSuggestions: string[];
    portfolioInsights: {
        url: string;
        title: string | null;
        summary: string;
        technologies: string[];
        projectLinks: string[];
        embeddedSiteLinks: string[];
    } | null;
}, {
    scores: {
        codeQuality: number;
        architecture: number;
        testing: number;
        documentation: number;
        projectComplexity: number;
        finalSkillScore: number;
    };
    skillLevel: "junior" | "mid" | "senior";
    marketRangeUsd: {
        min: number;
        max: number;
        midpoint: number;
    };
    offerAssessment: {
        status: "underpaid" | "fair" | "overpaid";
        differencePct: number;
        deltaUsd: number;
    };
    strengths: string[];
    weaknesses: string[];
    negotiationSuggestion: string;
    improvementSuggestions: string[];
    portfolioInsights?: {
        url: string;
        title: string | null;
        summary: string;
        technologies: string[];
        projectLinks: string[];
        embeddedSiteLinks: string[];
    } | null | undefined;
}>;
export declare const createAnalysisSchema: z.ZodObject<{
    githubUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    resumeId: z.ZodNullable<z.ZodString>;
    portfolioUrl: z.ZodString;
    yearsExperience: z.ZodNumber;
    locationTier: z.ZodEnum<["sf_ny_sea", "major_us_city", "rest_us_remote"]>;
    offeredSalaryUsd: z.ZodNumber;
    companyType: z.ZodEnum<["startup", "faang", "mid_size", "remote"]>;
}, "strip", z.ZodTypeAny, {
    resumeId: string | null;
    yearsExperience: number;
    githubUrl: string | null;
    portfolioUrl: string;
    locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
    offeredSalaryUsd: number;
    companyType: "startup" | "faang" | "mid_size" | "remote";
}, {
    resumeId: string | null;
    yearsExperience: number;
    portfolioUrl: string;
    locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
    offeredSalaryUsd: number;
    companyType: "startup" | "faang" | "mid_size" | "remote";
    githubUrl?: string | null | undefined;
}>;
export declare const createAnalysisResponseSchema: z.ZodObject<{
    analysisId: z.ZodString;
    status: z.ZodLiteral<"queued">;
}, "strip", z.ZodTypeAny, {
    status: "queued";
    analysisId: string;
}, {
    status: "queued";
    analysisId: string;
}>;
export declare const analysisStatusSchema: z.ZodEnum<["queued", "processing", "completed", "failed"]>;
export declare const analysisResultsResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["queued", "processing", "completed", "failed"]>;
    progress: z.ZodNumber;
    result: z.ZodNullable<z.ZodObject<{
        scores: z.ZodObject<{
            codeQuality: z.ZodNumber;
            architecture: z.ZodNumber;
            testing: z.ZodNumber;
            documentation: z.ZodNumber;
            projectComplexity: z.ZodNumber;
            finalSkillScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        }, {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        }>;
        skillLevel: z.ZodEnum<["junior", "mid", "senior"]>;
        marketRangeUsd: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            midpoint: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            midpoint: number;
        }, {
            min: number;
            max: number;
            midpoint: number;
        }>;
        offerAssessment: z.ZodObject<{
            status: z.ZodEnum<["underpaid", "fair", "overpaid"]>;
            differencePct: z.ZodNumber;
            deltaUsd: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        }, {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        }>;
        strengths: z.ZodArray<z.ZodString, "many">;
        weaknesses: z.ZodArray<z.ZodString, "many">;
        negotiationSuggestion: z.ZodString;
        improvementSuggestions: z.ZodArray<z.ZodString, "many">;
        portfolioInsights: z.ZodDefault<z.ZodNullable<z.ZodObject<{
            url: z.ZodString;
            title: z.ZodNullable<z.ZodString>;
            summary: z.ZodString;
            technologies: z.ZodArray<z.ZodString, "many">;
            projectLinks: z.ZodArray<z.ZodString, "many">;
            embeddedSiteLinks: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        }, {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        }>>>;
    }, "strip", z.ZodTypeAny, {
        scores: {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        };
        skillLevel: "junior" | "mid" | "senior";
        marketRangeUsd: {
            min: number;
            max: number;
            midpoint: number;
        };
        offerAssessment: {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        };
        strengths: string[];
        weaknesses: string[];
        negotiationSuggestion: string;
        improvementSuggestions: string[];
        portfolioInsights: {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        } | null;
    }, {
        scores: {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        };
        skillLevel: "junior" | "mid" | "senior";
        marketRangeUsd: {
            min: number;
            max: number;
            midpoint: number;
        };
        offerAssessment: {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        };
        strengths: string[];
        weaknesses: string[];
        negotiationSuggestion: string;
        improvementSuggestions: string[];
        portfolioInsights?: {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        } | null | undefined;
    }>>;
    error: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    result: {
        scores: {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        };
        skillLevel: "junior" | "mid" | "senior";
        marketRangeUsd: {
            min: number;
            max: number;
            midpoint: number;
        };
        offerAssessment: {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        };
        strengths: string[];
        weaknesses: string[];
        negotiationSuggestion: string;
        improvementSuggestions: string[];
        portfolioInsights: {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        } | null;
    } | null;
    error: string | null;
}, {
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    result: {
        scores: {
            codeQuality: number;
            architecture: number;
            testing: number;
            documentation: number;
            projectComplexity: number;
            finalSkillScore: number;
        };
        skillLevel: "junior" | "mid" | "senior";
        marketRangeUsd: {
            min: number;
            max: number;
            midpoint: number;
        };
        offerAssessment: {
            status: "underpaid" | "fair" | "overpaid";
            differencePct: number;
            deltaUsd: number;
        };
        strengths: string[];
        weaknesses: string[];
        negotiationSuggestion: string;
        improvementSuggestions: string[];
        portfolioInsights?: {
            url: string;
            title: string | null;
            summary: string;
            technologies: string[];
            projectLinks: string[];
            embeddedSiteLinks: string[];
        } | null | undefined;
    } | null;
    error: string | null;
}>;
export declare const listAnalysesQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export declare const listAnalysesResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<["queued", "processing", "completed", "failed"]>;
        progress: z.ZodNumber;
        createdAt: z.ZodString;
        githubUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        portfolioUrl: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        offeredSalaryUsd: z.ZodNumber;
        companyType: z.ZodEnum<["startup", "faang", "mid_size", "remote"]>;
        locationTier: z.ZodEnum<["sf_ny_sea", "major_us_city", "rest_us_remote"]>;
    }, "strip", z.ZodTypeAny, {
        status: "queued" | "processing" | "completed" | "failed";
        githubUrl: string | null;
        portfolioUrl: string | null;
        locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
        offeredSalaryUsd: number;
        companyType: "startup" | "faang" | "mid_size" | "remote";
        progress: number;
        id: string;
        createdAt: string;
    }, {
        status: "queued" | "processing" | "completed" | "failed";
        locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
        offeredSalaryUsd: number;
        companyType: "startup" | "faang" | "mid_size" | "remote";
        progress: number;
        id: string;
        createdAt: string;
        githubUrl?: string | null | undefined;
        portfolioUrl?: string | null | undefined;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "queued" | "processing" | "completed" | "failed";
        githubUrl: string | null;
        portfolioUrl: string | null;
        locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
        offeredSalaryUsd: number;
        companyType: "startup" | "faang" | "mid_size" | "remote";
        progress: number;
        id: string;
        createdAt: string;
    }[];
    nextCursor: string | null;
}, {
    items: {
        status: "queued" | "processing" | "completed" | "failed";
        locationTier: "sf_ny_sea" | "major_us_city" | "rest_us_remote";
        offeredSalaryUsd: number;
        companyType: "startup" | "faang" | "mid_size" | "remote";
        progress: number;
        id: string;
        createdAt: string;
        githubUrl?: string | null | undefined;
        portfolioUrl?: string | null | undefined;
    }[];
    nextCursor: string | null;
}>;
export declare const llmEvaluationSchema: z.ZodObject<{
    codeQuality: z.ZodNumber;
    architecture: z.ZodNumber;
    testing: z.ZodNumber;
    documentation: z.ZodNumber;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
    rationale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    codeQuality: number;
    architecture: number;
    testing: number;
    documentation: number;
    strengths: string[];
    weaknesses: string[];
    rationale: string;
}, {
    codeQuality: number;
    architecture: number;
    testing: number;
    documentation: number;
    strengths: string[];
    weaknesses: string[];
    rationale: string;
}>;
export declare const githubProfileUrlSchema: z.ZodString;
//# sourceMappingURL=schemas.d.ts.map