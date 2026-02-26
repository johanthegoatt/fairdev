import { prisma } from "../../db/prisma.js";
import { toPrismaCompanyType, toPrismaLocationTier, toPrismaSkillLevel } from "../../lib/mappers.js";
import type { CreateAnalysisInput } from "@fairdev/shared";

type YearsBucket = "0-2" | "3-5" | "6-9" | "10+";

export function yearsToBucket(yearsExperience: number): YearsBucket {
  if (yearsExperience <= 2) {
    return "0-2";
  }

  if (yearsExperience <= 5) {
    return "3-5";
  }

  if (yearsExperience <= 9) {
    return "6-9";
  }

  return "10+";
}

export async function getMarketSalaryRange(input: {
  locationTier: CreateAnalysisInput["locationTier"];
  companyType: "startup" | "faang" | "mid_size" | "remote";
  skillLevel: "junior" | "mid" | "senior";
  yearsExperience: number;
}): Promise<{ minUsd: number; maxUsd: number; yearsExpBucket: string; sourceLabel: string }> {
  const yearsExpBucket = yearsToBucket(input.yearsExperience);

  const row = await prisma.salaryData.findUnique({
    where: {
      locationTier_companyType_skillLevel_yearsExpBucket: {
        locationTier: toPrismaLocationTier(input.locationTier),
        companyType: toPrismaCompanyType(input.companyType),
        skillLevel: toPrismaSkillLevel(input.skillLevel),
        yearsExpBucket,
      },
    },
  });

  if (row) {
    return {
      minUsd: row.minUsd,
      maxUsd: row.maxUsd,
      yearsExpBucket,
      sourceLabel: row.sourceLabel,
    };
  }

  const fallback = await prisma.salaryData.findFirst({
    where: {
      locationTier: toPrismaLocationTier(input.locationTier),
      skillLevel: toPrismaSkillLevel(input.skillLevel),
      yearsExpBucket,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!fallback) {
    throw new Error("Salary market data unavailable. Run prisma seed first.");
  }

  return {
    minUsd: fallback.minUsd,
    maxUsd: fallback.maxUsd,
    yearsExpBucket,
    sourceLabel: fallback.sourceLabel,
  };
}
