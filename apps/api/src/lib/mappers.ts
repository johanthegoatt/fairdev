import { CompanyType, LocationTier, SkillLevel } from "@prisma/client";
import type { companyTypeSchema, locationTierSchema, skillLevelSchema } from "@fairdev/shared";
import type { z } from "zod";

type CompanyTypeInput = z.infer<typeof companyTypeSchema>;
type LocationTierInput = z.infer<typeof locationTierSchema>;
type SkillLevelInput = z.infer<typeof skillLevelSchema>;

function assertNever(_: never): never {
  throw new Error("Unsupported enum mapping value");
}

export function toPrismaCompanyType(value: CompanyTypeInput): CompanyType {
  switch (value) {
    case "startup":
      return CompanyType.STARTUP;
    case "faang":
      return CompanyType.FAANG;
    case "mid_size":
      return CompanyType.MID_SIZE;
    case "remote":
      return CompanyType.REMOTE;
  }

  return assertNever(value);
}

export function toPrismaLocationTier(value: LocationTierInput): LocationTier {
  switch (value) {
    case "sf_bay_area":
      return LocationTier.SF_BAY_AREA;
    case "new_york_city":
      return LocationTier.NEW_YORK_CITY;
    case "seattle":
      return LocationTier.SEATTLE;
    case "los_angeles":
      return LocationTier.LOS_ANGELES;
    case "boston":
      return LocationTier.BOSTON;
    case "austin":
      return LocationTier.AUSTIN;
    case "chicago":
      return LocationTier.CHICAGO;
    case "atlanta":
      return LocationTier.ATLANTA;
    case "denver":
      return LocationTier.DENVER;
    case "sf_ny_sea":
      return LocationTier.SF_NY_SEA;
    case "major_us_city":
      return LocationTier.MAJOR_US_CITY;
    case "rest_us_remote":
      return LocationTier.REST_US_REMOTE;
  }

  return assertNever(value);
}

export function toPrismaSkillLevel(value: SkillLevelInput): SkillLevel {
  switch (value) {
    case "junior":
      return SkillLevel.JUNIOR;
    case "mid":
      return SkillLevel.MID;
    case "senior":
      return SkillLevel.SENIOR;
  }

  return assertNever(value);
}

export function fromPrismaSkillLevel(value: SkillLevel): SkillLevelInput {
  switch (value) {
    case SkillLevel.JUNIOR:
      return "junior";
    case SkillLevel.MID:
      return "mid";
    case SkillLevel.SENIOR:
      return "senior";
  }

  return assertNever(value);
}

export function fromPrismaCompanyType(value: CompanyType): CompanyTypeInput {
  switch (value) {
    case CompanyType.STARTUP:
      return "startup";
    case CompanyType.FAANG:
      return "faang";
    case CompanyType.MID_SIZE:
      return "mid_size";
    case CompanyType.REMOTE:
      return "remote";
  }

  return assertNever(value);
}

export function fromPrismaLocationTier(value: LocationTier): LocationTierInput {
  switch (value) {
    case LocationTier.SF_BAY_AREA:
      return "sf_bay_area";
    case LocationTier.NEW_YORK_CITY:
      return "new_york_city";
    case LocationTier.SEATTLE:
      return "seattle";
    case LocationTier.LOS_ANGELES:
      return "los_angeles";
    case LocationTier.BOSTON:
      return "boston";
    case LocationTier.AUSTIN:
      return "austin";
    case LocationTier.CHICAGO:
      return "chicago";
    case LocationTier.ATLANTA:
      return "atlanta";
    case LocationTier.DENVER:
      return "denver";
    case LocationTier.SF_NY_SEA:
      return "sf_ny_sea";
    case LocationTier.MAJOR_US_CITY:
      return "major_us_city";
    case LocationTier.REST_US_REMOTE:
      return "rest_us_remote";
  }

  return assertNever(value);
}
