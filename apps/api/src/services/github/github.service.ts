import axios from "axios";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/errors.js";

export type RepoSnapshot = {
  name: string;
  url: string;
  stars: number;
  forks: number;
  languages: Record<string, number>;
  readmeExcerpt: string;
  commitFrequency: Record<string, number>;
  structureSummary: string;
  codeSnippets: string[];
};

export type GitHubProfileSnapshot = {
  username: string;
  repositories: RepoSnapshot[];
  technologyStack: string[];
};

const api = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15_000,
});

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    "User-Agent": "fairdev-mvp",
  };
}

function parseGitHubUsername(profileUrl: string): string {
  const match = profileUrl.match(/^https:\/\/github\.com\/([A-Za-z0-9-]+)\/?$/);
  if (!match) {
    throw new HttpError(400, "GitHub URL must be a public profile URL.");
  }
  return match[1];
}

function summarizeRootStructure(items: Array<{ name: string; type: string }>): string {
  const directories = items.filter((item) => item.type === "dir").map((item) => item.name);
  const files = items.filter((item) => item.type === "file").map((item) => item.name);
  const hasTests = files.some((name) => /test|spec/i.test(name)) || directories.some((name) => /test/i.test(name));
  const hasCi = files.some((name) => /\.yml$/.test(name)) || directories.some((name) => /^\.github$/.test(name));

  return `dirs=${directories.slice(0, 10).join(",") || "none"};files=${files.slice(0, 10).join(",") || "none"};tests=${hasTests};ci=${hasCi}`;
}

function summarizeCommitsByWeek(commitDates: string[]): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const dateText of commitDates) {
    const date = new Date(dateText);
    const year = date.getUTCFullYear();
    const week = Math.ceil(((date.getUTCDate() - date.getUTCDay() + 1) / 7) || 1);
    const key = `${year}-W${String(Math.max(1, week)).padStart(2, "0")}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return buckets;
}

function readmeExcerpt(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.slice(0, 800);
}

function isSourceFile(name: string): boolean {
  return /\.(ts|tsx|js|jsx|py|go|java|rb|rs|cs|php|kt|swift)$/i.test(name);
}

async function fetchCodeSnippets(owner: string, repo: string): Promise<string[]> {
  try {
    const rootResponse = await api.get(`/repos/${owner}/${repo}/contents`, { headers: githubHeaders() });
    const files = (rootResponse.data as Array<{ name: string; type: string }>).filter(
      (item) => item.type === "file" && isSourceFile(item.name),
    );

    const snippets: string[] = [];

    for (const file of files.slice(0, 2)) {
      const fileResponse = await api.get(`/repos/${owner}/${repo}/contents/${encodeURIComponent(file.name)}`, {
        headers: githubHeaders(),
      });

      if (fileResponse.data && typeof fileResponse.data.content === "string") {
        const decoded = Buffer.from(fileResponse.data.content, "base64").toString("utf8");
        snippets.push(`FILE:${file.name}\n${decoded.slice(0, 1000)}`);
      }
    }

    return snippets;
  } catch {
    return [];
  }
}

export async function fetchGitHubProfileSnapshot(profileUrl: string): Promise<GitHubProfileSnapshot> {
  const username = parseGitHubUsername(profileUrl);

  const reposResponse = await api.get(`/users/${username}/repos`, {
    params: {
      sort: "updated",
      per_page: 100,
      type: "public",
    },
    headers: githubHeaders(),
  });

  const repositories = (reposResponse.data as Array<any>)
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 3);

  if (repositories.length === 0) {
    throw new HttpError(400, "No public repositories found for this GitHub profile.");
  }

  const snapshots: RepoSnapshot[] = [];
  const techStack = new Set<string>();

  for (const repo of repositories) {
    const [languagesResponse, readmeResponse, commitsResponse, contentsResponse, snippets] = await Promise.all([
      api.get(`/repos/${username}/${repo.name}/languages`, { headers: githubHeaders() }).catch(() => ({ data: {} })),
      api
        .get(`/repos/${username}/${repo.name}/readme`, {
          headers: {
            ...githubHeaders(),
            Accept: "application/vnd.github.raw+json",
          },
        })
        .catch(() => ({ data: "" })),
      api
        .get(`/repos/${username}/${repo.name}/commits`, {
          params: { per_page: 100 },
          headers: githubHeaders(),
        })
        .catch(() => ({ data: [] })),
      api.get(`/repos/${username}/${repo.name}/contents`, { headers: githubHeaders() }).catch(() => ({ data: [] })),
      fetchCodeSnippets(username, repo.name),
    ]);

    const languages = languagesResponse.data as Record<string, number>;
    Object.keys(languages).forEach((lang) => techStack.add(lang));

    const commitDates = (commitsResponse.data as Array<any>)
      .map((commit) => commit?.commit?.author?.date)
      .filter((value): value is string => typeof value === "string");

    const rootItems = Array.isArray(contentsResponse.data) ? contentsResponse.data : [];

    snapshots.push({
      name: repo.name,
      url: repo.html_url,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      languages,
      readmeExcerpt: readmeExcerpt(typeof readmeResponse.data === "string" ? readmeResponse.data : ""),
      commitFrequency: summarizeCommitsByWeek(commitDates),
      structureSummary: summarizeRootStructure(rootItems),
      codeSnippets: snippets,
    });
  }

  return {
    username,
    repositories: snapshots,
    technologyStack: Array.from(techStack).slice(0, 15),
  };
}