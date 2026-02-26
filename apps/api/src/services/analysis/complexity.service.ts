import type { RepoSnapshot } from "../github/github.service.js";
import type { PortfolioSnapshot } from "../portfolio/portfolio.service.js";

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeProjectComplexityScore(repos: RepoSnapshot[]): number {
  if (repos.length === 0) {
    return 1;
  }

  const languageSet = new Set<string>();
  let testSignals = 0;
  let ciSignals = 0;
  let activitySignals = 0;
  let dependencySignals = 0;
  let repoSizeSignals = 0;

  for (const repo of repos) {
    const languageCount = Object.keys(repo.languages).length;
    Object.keys(repo.languages).forEach((language) => languageSet.add(language));

    if (/tests?=true/i.test(repo.structureSummary)) {
      testSignals += 1;
    }

    if (/ci=true/i.test(repo.structureSummary)) {
      ciSignals += 1;
    }

    const commitCount = Object.values(repo.commitFrequency).reduce((sum, value) => sum + value, 0);
    if (commitCount >= 20) {
      activitySignals += 1;
    }

    if (languageCount >= 3) {
      dependencySignals += 1;
    }

    if (repo.stars >= 10 || repo.forks >= 3) {
      repoSizeSignals += 1;
    }
  }

  const languageDiversityScore = clamp(0, languageSet.size / 8, 1);
  const testScore = testSignals / repos.length;
  const ciScore = ciSignals / repos.length;
  const activityScore = activitySignals / repos.length;
  const dependencyScore = dependencySignals / repos.length;
  const repoSizeScore = repoSizeSignals / repos.length;

  const normalized =
    0.2 * languageDiversityScore +
    0.2 * testScore +
    0.15 * ciScore +
    0.2 * activityScore +
    0.15 * dependencyScore +
    0.1 * repoSizeScore;

  return Number.parseFloat(clamp(1, normalized * 10, 10).toFixed(1));
}

export function applyPortfolioSignalBoost(baseScore: number, portfolio: PortfolioSnapshot | null): number {
  if (!portfolio) {
    return baseScore;
  }

  const projectLinkSignal = Math.min(1, portfolio.projectLinks.length / 8);
  const embeddedSignal = Math.min(1, portfolio.embeddedSiteLinks.length / 6);
  const techSignal = Math.min(1, portfolio.technologies.length / 10);

  const boost = 0.8 * projectLinkSignal + 0.4 * embeddedSignal + 0.3 * techSignal;
  return Number.parseFloat(clamp(1, baseScore + boost, 10).toFixed(1));
}
