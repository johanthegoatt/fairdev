import { describe, expect, it } from "vitest";
import {
  buildAnalysisResult,
  computeFinalSkillScore,
  evaluateOffer,
  mapSkillLevel,
} from "../src/services/analysis/evaluation.service.js";
import { yearsToBucket } from "../src/services/salary/salary.service.js";

describe("evaluation service", () => {
  it("computes weighted final skill score", () => {
    const score = computeFinalSkillScore({
      codeQuality: 8,
      architecture: 7,
      testing: 6,
      documentation: 7,
      projectComplexity: 8,
    });

    expect(score).toBe(7.3);
  });

  it("maps score ranges to skill levels", () => {
    expect(mapSkillLevel(4.9)).toBe("junior");
    expect(mapSkillLevel(5)).toBe("mid");
    expect(mapSkillLevel(7.9)).toBe("mid");
    expect(mapSkillLevel(8)).toBe("senior");
  });

  it("applies fairness thresholds correctly", () => {
    expect(
      evaluateOffer({
        offeredSalaryUsd: 100000,
        minSalaryUsd: 120000,
        maxSalaryUsd: 160000,
      }).status,
    ).toBe("underpaid");

    expect(
      evaluateOffer({
        offeredSalaryUsd: 190000,
        minSalaryUsd: 120000,
        maxSalaryUsd: 160000,
      }).status,
    ).toBe("overpaid");

    expect(
      evaluateOffer({
        offeredSalaryUsd: 150000,
        minSalaryUsd: 120000,
        maxSalaryUsd: 160000,
      }).status,
    ).toBe("fair");
  });

  it("builds valid analysis result", () => {
    const result = buildAnalysisResult({
      llm: {
        codeQuality: 8,
        architecture: 7,
        testing: 6,
        documentation: 7,
        strengths: ["Clean code"],
        weaknesses: ["More integration tests needed"],
        rationale: "sample",
      },
      projectComplexity: 7,
      offeredSalaryUsd: 165000,
      marketMin: 140000,
      marketMax: 180000,
      hasResume: true,
      portfolioSnapshot: null,
    });

    expect(result.skillLevel).toBe("mid");
    expect(result.improvementSuggestions.length).toBeGreaterThan(0);
  });
});

describe("salary bucket", () => {
  it("maps years to deterministic bucket", () => {
    expect(yearsToBucket(0)).toBe("0-2");
    expect(yearsToBucket(4)).toBe("3-5");
    expect(yearsToBucket(8)).toBe("6-9");
    expect(yearsToBucket(12)).toBe("10+");
  });
});
