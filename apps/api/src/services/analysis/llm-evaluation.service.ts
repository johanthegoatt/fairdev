import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { llmEvaluationSchema, type LlmEvaluation } from "@fairdev/shared";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import type { RepoSnapshot } from "../github/github.service.js";
import type { PortfolioSnapshot } from "../portfolio/portfolio.service.js";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

function clampScore(value: number): number {
  return Number.parseFloat(Math.max(1, Math.min(10, value)).toFixed(1));
}

function fallbackEvaluation(repositories: RepoSnapshot[], portfolioSnapshot: PortfolioSnapshot | null, reason?: string): LlmEvaluation {
  const averageStars =
    repositories.reduce((sum, repo) => sum + repo.stars, 0) / Math.max(1, repositories.length);
  const averageCommitVolume =
    repositories.reduce((sum, repo) => sum + Object.values(repo.commitFrequency).reduce((a, b) => a + b, 0), 0) /
    Math.max(1, repositories.length);
  const languageCount = new Set(repositories.flatMap((repo) => Object.keys(repo.languages))).size;
  const portfolioLinkBonus = portfolioSnapshot ? Math.min(1.5, portfolioSnapshot.projectLinks.length / 6) : 0;
  const portfolioTechBonus = portfolioSnapshot ? Math.min(1, portfolioSnapshot.technologies.length / 10) : 0;

  const codeQuality = clampScore(5 + averageStars / 25 + averageCommitVolume / 80 + portfolioLinkBonus * 0.3);
  const architecture = clampScore(5 + languageCount / 6 + portfolioTechBonus * 0.5);
  const testing = clampScore(
    4 +
      repositories.filter((repo) => /tests?=true/i.test(repo.structureSummary)).length /
        Math.max(1, repositories.length) *
        3 +
      portfolioLinkBonus * 0.1,
  );
  const documentation = clampScore(
    4 +
      repositories.filter((repo) => repo.readmeExcerpt.length > 250).length / Math.max(1, repositories.length) * 4 +
      (portfolioSnapshot ? 0.6 : 0),
  );

  return {
    codeQuality,
    architecture,
    testing,
    documentation,
    strengths: [
      "Consistent repository structure and active commit history",
      "Project documentation is present across primary repositories",
    ],
    weaknesses: [
      "Testing strategy appears incomplete in at least one key repository",
      "Architecture rationale is not always explicit in documentation",
    ],
    rationale: reason
      ? `Fallback heuristic evaluation used because LLM evaluation failed: ${reason}`
      : "Fallback heuristic evaluation used because no LLM provider is configured. Set GEMINI_API_KEY or OPENAI_API_KEY for rubric-based analysis.",
  };
}

function buildPrompt(input: {
  githubUsername: string;
  yearsExperience: number;
  resumeSkills: string[];
  portfolioSnapshot: PortfolioSnapshot | null;
  repositories: RepoSnapshot[];
}) {
  return {
    system: `You are a strict senior engineering interviewer. Evaluate software project quality.
Return JSON only with keys: codeQuality, architecture, testing, documentation, strengths, weaknesses, rationale.
Scores are numeric from 1 to 10, one decimal max.
Strengths and weaknesses must each have 2-5 concise bullet-style strings.`,
    user: JSON.stringify(
      {
        githubUsername: input.githubUsername,
        yearsExperience: input.yearsExperience,
        resumeSkills: input.resumeSkills,
        portfolioSnapshot: input.portfolioSnapshot
          ? {
              url: input.portfolioSnapshot.url,
              title: input.portfolioSnapshot.title,
              summary: input.portfolioSnapshot.summary,
              technologies: input.portfolioSnapshot.technologies,
              projectLinks: input.portfolioSnapshot.projectLinks,
              embeddedSiteLinks: input.portfolioSnapshot.embeddedSiteLinks,
            }
          : null,
        repositories: input.repositories.map((repo) => ({
          name: repo.name,
          url: repo.url,
          stars: repo.stars,
          forks: repo.forks,
          languages: repo.languages,
          readmeExcerpt: repo.readmeExcerpt,
          commitFrequency: repo.commitFrequency,
          structureSummary: repo.structureSummary,
          codeSnippets: repo.codeSnippets,
        })),
      },
      null,
      2,
    ),
  };
}

function resolveProvider(): "gemini" | "openai" | "none" {
  if (env.LLM_PROVIDER === "gemini") {
    return gemini ? "gemini" : "none";
  }

  if (env.LLM_PROVIDER === "openai") {
    return openai ? "openai" : "none";
  }

  if (gemini) {
    return "gemini";
  }

  if (openai) {
    return "openai";
  }

  return "none";
}

function isGeminiQuotaOrRateError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { status?: number; message?: string; statusText?: string };
  const message = `${maybeError.message ?? ""} ${maybeError.statusText ?? ""}`.toLowerCase();

  return (
    maybeError.status === 429 ||
    message.includes("quota exceeded") ||
    message.includes("too many requests") ||
    message.includes("rate limit")
  );
}

function buildGeminiModelChain(): string[] {
  const chain = [env.GEMINI_MODEL, ...env.GEMINI_FALLBACK_MODELS];
  return Array.from(new Set(chain.map((model) => model.trim()).filter(Boolean)));
}

async function evaluateWithGemini(prompt: { system: string; user: string }, modelName: string): Promise<LlmEvaluation> {
  if (!gemini) {
    throw new Error("Gemini client is not configured.");
  }

  const model = gemini.getGenerativeModel({ model: modelName });

  const response = await model.generateContent(
    `${prompt.system}\n\nInput data:\n${prompt.user}\n\nReturn JSON only.`,
  );

  const rawText = response.response.text();
  const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  return llmEvaluationSchema.parse(JSON.parse(cleanedText));
}

async function evaluateWithOpenAi(prompt: { system: string; user: string }): Promise<LlmEvaluation> {
  if (!openai) {
    throw new Error("OpenAI client is not configured.");
  }

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  return llmEvaluationSchema.parse(JSON.parse(content));
}

export async function evaluateRepositoriesWithLlm(input: {
  githubUsername: string;
  yearsExperience: number;
  resumeSkills: string[];
  portfolioSnapshot: PortfolioSnapshot | null;
  repositories: RepoSnapshot[];
}): Promise<LlmEvaluation> {
  const provider = resolveProvider();
  if (provider === "none") {
    return fallbackEvaluation(input.repositories, input.portfolioSnapshot);
  }

  const prompt = buildPrompt(input);
  let lastError: unknown;

  if (provider === "gemini") {
    const modelChain = buildGeminiModelChain();

    for (const modelName of modelChain) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          return await evaluateWithGemini(prompt, modelName);
        } catch (error) {
          lastError = error;
          logger.warn({ err: error, attempt, provider, model: modelName }, "Gemini evaluation attempt failed");

          if (isGeminiQuotaOrRateError(error)) {
            logger.warn({ model: modelName }, "Switching to next Gemini fallback model due to rate/quota error");
            break;
          }
        }
      }
    }

    logger.error({ err: lastError, provider }, "Falling back to heuristic evaluation after Gemini model chain failed");
    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    return fallbackEvaluation(input.repositories, input.portfolioSnapshot, reason);
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await evaluateWithOpenAi(prompt);
    } catch (error) {
      lastError = error;
      logger.warn({ err: error, attempt, provider }, "LLM evaluation attempt failed");
    }
  }

  logger.error({ err: lastError, provider }, "Falling back to heuristic evaluation after LLM retries");
  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  return fallbackEvaluation(input.repositories, input.portfolioSnapshot, reason);
}
