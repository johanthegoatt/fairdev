import { CompanyType, LocationTier, PrismaClient, SkillLevel } from "@prisma/client";

const prisma = new PrismaClient();

type Bucket = "0-2" | "3-5" | "6-9" | "10+";

const skillBase: Record<SkillLevel, number> = {
  JUNIOR: 90000,
  MID: 140000,
  SENIOR: 200000,
};

const locationMultiplier: Record<LocationTier, number> = {
  SF_BAY_AREA: 1.3,
  NEW_YORK_CITY: 1.28,
  SEATTLE: 1.22,
  LOS_ANGELES: 1.14,
  BOSTON: 1.16,
  AUSTIN: 1.08,
  CHICAGO: 1.1,
  ATLANTA: 1.02,
  DENVER: 1.07,
  SF_NY_SEA: 1.25,
  MAJOR_US_CITY: 1.05,
  REST_US_REMOTE: 0.9,
};

const companyMultiplier: Record<CompanyType, number> = {
  STARTUP: 0.95,
  FAANG: 1.35,
  MID_SIZE: 1,
  REMOTE: 0.98,
};

const bucketMultiplier: Record<Bucket, number> = {
  "0-2": 0.8,
  "3-5": 1,
  "6-9": 1.2,
  "10+": 1.35,
};

function roundToThousand(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

async function main() {
  const buckets: Bucket[] = ["0-2", "3-5", "6-9", "10+"];
  const locations: LocationTier[] = [
    LocationTier.SF_BAY_AREA,
    LocationTier.NEW_YORK_CITY,
    LocationTier.SEATTLE,
    LocationTier.LOS_ANGELES,
    LocationTier.BOSTON,
    LocationTier.AUSTIN,
    LocationTier.CHICAGO,
    LocationTier.ATLANTA,
    LocationTier.DENVER,
    LocationTier.REST_US_REMOTE,
    // Keep legacy enums seeded for backward compatibility.
    LocationTier.SF_NY_SEA,
    LocationTier.MAJOR_US_CITY,
  ];
  const companyTypes: CompanyType[] = [CompanyType.STARTUP, CompanyType.FAANG, CompanyType.MID_SIZE, CompanyType.REMOTE];
  const skillLevels: SkillLevel[] = [SkillLevel.JUNIOR, SkillLevel.MID, SkillLevel.SENIOR];

  for (const location of locations) {
    for (const companyType of companyTypes) {
      for (const skillLevel of skillLevels) {
        for (const bucket of buckets) {
          const base =
            skillBase[skillLevel] *
            locationMultiplier[location] *
            companyMultiplier[companyType] *
            bucketMultiplier[bucket];

          const minUsd = roundToThousand(base * 0.85);
          const maxUsd = roundToThousand(base * 1.15);

          await prisma.salaryData.upsert({
            where: {
              locationTier_companyType_skillLevel_yearsExpBucket: {
                locationTier: location,
                companyType,
                skillLevel,
                yearsExpBucket: bucket,
              },
            },
            update: {
              minUsd,
              maxUsd,
              sourceLabel: "seeded_us_salary_v2",
            },
            create: {
              locationTier: location,
              companyType,
              skillLevel,
              yearsExpBucket: bucket,
              minUsd,
              maxUsd,
              sourceLabel: "seeded_us_salary_v2",
            },
          });
        }
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
