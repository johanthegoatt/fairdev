import { analysisResultSchema, type AnalysisResult, type LlmEvaluation } from "@fairdev/shared";
import type { PortfolioSnapshot } from "../portfolio/portfolio.service.js";

function round1(value: number): number {
  return Number.parseFloat(value.toFixed(1));
}

export function computeFinalSkillScore(input: {
  codeQuality: number;
  architecture: number;
  testing: number;
  documentation: number;
  projectComplexity: number;
}): number {
  const weighted =
    0.4 * input.codeQuality +
    0.2 * input.architecture +
    0.2 * input.testing +
    0.1 * input.documentation +
    0.1 * input.projectComplexity;

  return round1(weighted);
}

export function mapSkillLevel(score: number): "junior" | "mid" | "senior" {
  if (score < 5) {
    return "junior";
  }

  if (score < 8) {
    return "mid";
  }

  return "senior";
}

export function evaluateOffer(input: {
  offeredSalaryUsd: number;
  minSalaryUsd: number;
  maxSalaryUsd: number;
}): {
  status: "underpaid" | "fair" | "overpaid";
  differencePct: number;
  deltaUsd: number;
  midpoint: number;
} {
  const { offeredSalaryUsd, minSalaryUsd, maxSalaryUsd } = input;
  const midpoint = (minSalaryUsd + maxSalaryUsd) / 2;

  const status =
    offeredSalaryUsd < minSalaryUsd * 0.95
      ? "underpaid"
      : offeredSalaryUsd > maxSalaryUsd * 1.05
        ? "overpaid"
        : "fair";

  const differencePct = round1(((offeredSalaryUsd - midpoint) / midpoint) * 100);
  const deltaUsd = Math.round(offeredSalaryUsd - midpoint);

  return { status, differencePct, deltaUsd, midpoint: Math.round(midpoint) };
}

export function buildNegotiationSuggestion(input: {
  status: "underpaid" | "fair" | "overpaid";
  skillLevel: "junior" | "mid" | "senior";
  offeredSalaryUsd: number;
  marketMin: number;
  marketMax: number;
}): string {
  if (input.status === "underpaid") {
    return `Request a salary adjustment toward $${input.marketMin.toLocaleString()}-$${input.marketMax.toLocaleString()} and anchor with concrete repository impact.`;
  }

  if (input.status === "overpaid") {
    return "Compensation is above current modeled market; focus negotiation on leveling scope, growth plan, and performance expectations.";
  }

  return "Offer is within modeled fair range; negotiate for upside via bonus, equity, and a 6-month salary review tied to measurable outcomes.";
}

export function buildImprovementSuggestions(input: {
  llm: LlmEvaluation;
  hasResume: boolean;
  hasPortfolio: boolean;
  portfolioSnapshot: PortfolioSnapshot | null;
}): string[] {
  const suggestions = [...input.llm.weaknesses.map((weakness) => `Address: ${weakness}`)];

  if (!input.hasResume && !input.hasPortfolio) {
    suggestions.push("Provide a resume PDF or portfolio website to improve experience and skills extraction confidence.");
  }

  if (input.hasPortfolio && input.portfolioSnapshot && input.portfolioSnapshot.projectLinks.length === 0) {
    suggestions.push("Add direct project/demo links to your portfolio to improve evaluator confidence.");
  }

  if (!suggestions.some((item) => /test/i.test(item))) {
    suggestions.push("Increase automated test coverage and add CI test gates.");
  }

  return suggestions.slice(0, 6);
}

export function buildAnalysisResult(input: {
  llm: LlmEvaluation;
  projectComplexity: number;
  offeredSalaryUsd: number;
  marketMin: number;
  marketMax: number;
  hasResume: boolean;
  portfolioSnapshot: PortfolioSnapshot | null;
}): AnalysisResult {
  const finalSkillScore = computeFinalSkillScore({
    codeQuality: input.llm.codeQuality,
    architecture: input.llm.architecture,
    testing: input.llm.testing,
    documentation: input.llm.documentation,
    projectComplexity: input.projectComplexity,
  });

  const skillLevel = mapSkillLevel(finalSkillScore);

  const offer = evaluateOffer({
    offeredSalaryUsd: input.offeredSalaryUsd,
    minSalaryUsd: input.marketMin,
    maxSalaryUsd: input.marketMax,
  });

  const result: AnalysisResult = {
    scores: {
      codeQuality: input.llm.codeQuality,
      architecture: input.llm.architecture,
      testing: input.llm.testing,
      documentation: input.llm.documentation,
      projectComplexity: input.projectComplexity,
      finalSkillScore,
    },
    skillLevel,
    marketRangeUsd: {
      min: input.marketMin,
      max: input.marketMax,
      midpoint: offer.midpoint,
    },
    offerAssessment: {
      status: offer.status,
      differencePct: offer.differencePct,
      deltaUsd: offer.deltaUsd,
    },
    strengths: input.llm.strengths,
    weaknesses: input.llm.weaknesses,
    negotiationSuggestion: buildNegotiationSuggestion({
      status: offer.status,
      skillLevel,
      offeredSalaryUsd: input.offeredSalaryUsd,
      marketMin: input.marketMin,
      marketMax: input.marketMax,
    }),
    improvementSuggestions: buildImprovementSuggestions({
      llm: input.llm,
      hasResume: input.hasResume,
      hasPortfolio: Boolean(input.portfolioSnapshot),
      portfolioSnapshot: input.portfolioSnapshot,
    }),
    portfolioInsights: input.portfolioSnapshot
      ? {
          url: input.portfolioSnapshot.url,
          title: input.portfolioSnapshot.title,
          summary: input.portfolioSnapshot.summary,
          technologies: input.portfolioSnapshot.technologies,
          projectLinks: input.portfolioSnapshot.projectLinks,
          embeddedSiteLinks: input.portfolioSnapshot.embeddedSiteLinks,
        }
      : null,
  };

  return analysisResultSchema.parse(result);
}
