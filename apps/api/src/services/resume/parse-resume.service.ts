import pdf from "pdf-parse";

const skillKeywords = [
  "typescript",
  "javascript",
  "python",
  "go",
  "java",
  "react",
  "next.js",
  "node.js",
  "express",
  "fastapi",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "graphql",
  "rest",
  "prisma",
  "jest",
  "vitest",
  "playwright",
  "terraform",
  "tailwind",
];

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

export async function parseResumeBuffer(fileBuffer: Buffer): Promise<{
  skills: string[];
  yearsExperience: number;
  education: string[];
  workHistory: string[];
  rawText: string;
}> {
  const parsedPdf = (await pdf(fileBuffer)) as { text: string };
  const text = parsedPdf.text.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  const skills = dedupe(skillKeywords.filter((keyword) => lower.includes(keyword))).slice(0, 20);

  const yearsExperiencePatterns = [
    /(\d{1,2})\+?\s+years?\s+of\s+experience/i,
    /experience\s*:\s*(\d{1,2})\+?\s+years?/i,
    /(\d{1,2})\+?\s+yrs\s+experience/i,
  ];

  let yearsExperience = 0;
  for (const pattern of yearsExperiencePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      yearsExperience = Math.min(60, Number.parseInt(match[1], 10));
      break;
    }
  }

  const education = dedupe(
    text
      .split(/\.|\n/)
      .map((line) => line.trim())
      .filter((line) => /(bachelor|master|phd|university|college|bootcamp|degree)/i.test(line)),
  ).slice(0, 8);

  const workHistory = dedupe(
    text
      .split(/\.|\n/)
      .map((line) => line.trim())
      .filter((line) => /(engineer|developer|intern|consultant|lead|manager)/i.test(line)),
  ).slice(0, 12);

  return {
    skills,
    yearsExperience,
    education,
    workHistory,
    rawText: text,
  };
}
