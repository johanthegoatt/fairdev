import { describe, expect, it } from "vitest";
import { analysisResultSchema, createAnalysisSchema } from "../src/schemas";

describe("shared schemas", () => {
  it("validates analysis creation payload", () => {
    const parsed = createAnalysisSchema.parse({
      githubUrl: null,
      resumeId: null,
      portfolioUrl: "https://octocat.dev",
      yearsExperience: 5,
      locationTier: "major_us_city",
      offeredSalaryUsd: 145000,
      companyType: "mid_size",
    });

    expect(parsed.companyType).toBe("mid_size");
    expect(parsed.portfolioUrl).toBe("https://octocat.dev");
    expect(parsed.githubUrl).toBeNull();
  });

  it("validates analysis result payload", () => {
    const parsed = analysisResultSchema.parse({
      scores: {
        codeQuality: 8,
        architecture: 7,
        testing: 6,
        documentation: 7,
        projectComplexity: 8,
        finalSkillScore: 7.4,
      },
      skillLevel: "mid",
      marketRangeUsd: { min: 130000, max: 180000, midpoint: 155000 },
      offerAssessment: { status: "fair", differencePct: 3.2, deltaUsd: 5000 },
      strengths: ["Good system decomposition"],
      weaknesses: ["Testing breadth could improve"],
      negotiationSuggestion: "Anchor on measurable project impact.",
      improvementSuggestions: ["Add integration tests"],
    });

    expect(parsed.skillLevel).toBe("mid");
  });
});
