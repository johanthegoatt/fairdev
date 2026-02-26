import axios from "axios";
import * as cheerio from "cheerio";
import { HttpError } from "../../lib/errors.js";

export type PortfolioSnapshot = {
  url: string;
  title: string | null;
  summary: string;
  technologies: string[];
  projectLinks: string[];
  embeddedSiteLinks: string[];
};

const techKeywords = [
  "typescript",
  "javascript",
  "react",
  "next.js",
  "nextjs",
  "node.js",
  "node",
  "express",
  "fastapi",
  "python",
  "go",
  "rust",
  "java",
  "spring",
  "postgres",
  "postgresql",
  "mysql",
  "mongodb",
  "prisma",
  "graphql",
  "rest",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "tailwind",
  "vue",
  "svelte",
  "remix",
  "nuxt",
  "playwright",
  "jest",
  "vitest",
];

const socialHosts = new Set([
  "linkedin.com",
  "www.linkedin.com",
  "twitter.com",
  "x.com",
  "www.x.com",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "youtube.com",
  "www.youtube.com",
  "medium.com",
  "www.medium.com",
]);

function normalizeUrl(rawHref: string, baseUrl: string): string | null {
  if (!rawHref) {
    return null;
  }

  try {
    const resolved = new URL(rawHref, baseUrl);
    if (!["http:", "https:"].includes(resolved.protocol)) {
      return null;
    }

    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isLikelyProjectLink(urlText: string): boolean {
  const lower = urlText.toLowerCase();
  return (
    lower.includes("github.com/") ||
    lower.includes("gitlab.com/") ||
    lower.includes("vercel.app") ||
    lower.includes("netlify.app") ||
    lower.includes("render.com") ||
    lower.includes("railway.app") ||
    /\/(project|projects|work|case-study|demo|app)\b/.test(lower)
  );
}

function inferSummary(title: string | null, metaDescription: string | null, bodyText: string): string {
  if (metaDescription && metaDescription.length >= 40) {
    return metaDescription.slice(0, 420);
  }

  if (bodyText.length > 0) {
    return bodyText.slice(0, 420);
  }

  return title ? `Portfolio website: ${title}` : "Portfolio website provided without readable text content.";
}

export async function fetchPortfolioSnapshot(portfolioUrl: string): Promise<PortfolioSnapshot> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(portfolioUrl);
  } catch {
    throw new HttpError(400, "Portfolio URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new HttpError(400, "Portfolio URL must use http(s). ");
  }

  const response = await axios.get<string>(portfolioUrl, {
    timeout: 15_000,
    maxRedirects: 5,
    responseType: "text",
    headers: {
      "User-Agent": "fairdev-portfolio-fetcher",
      Accept: "text/html,application/xhtml+xml",
    },
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new HttpError(400, `Portfolio URL returned HTTP ${response.status}.`);
  }

  const html = typeof response.data === "string" ? response.data : "";
  const contentType = String(response.headers["content-type"] ?? "").toLowerCase();

  if (!contentType.includes("text/html") && html.trim().startsWith("<") === false) {
    return {
      url: portfolioUrl,
      title: null,
      summary: "Portfolio URL is reachable but did not return parseable HTML content.",
      technologies: [],
      projectLinks: [],
      embeddedSiteLinks: [],
    };
  }

  const $ = cheerio.load(html);
  $("script,style,noscript,iframe").remove();

  const title = cleanText($("title").first().text()) || null;
  const metaDescription = cleanText(
    $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "",
  ) || null;

  const bodyText = cleanText($("body").text()).slice(0, 9000);
  const lowerText = bodyText.toLowerCase();

  const technologies = techKeywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).slice(0, 20);

  const links = dedupe(
    $("a[href]")
      .map((_, element) => normalizeUrl(String($(element).attr("href") ?? ""), portfolioUrl))
      .get()
      .filter((value): value is string => Boolean(value)),
  );

  const projectLinks = links.filter((link) => isLikelyProjectLink(link)).slice(0, 20);

  const embeddedSiteLinks = links
    .filter((link) => {
      try {
        const linkUrl = new URL(link);
        const sameHost = linkUrl.hostname.toLowerCase() === parsedUrl.hostname.toLowerCase();
        if (sameHost || socialHosts.has(linkUrl.hostname.toLowerCase())) {
          return false;
        }

        return !link.includes("github.com/");
      } catch {
        return false;
      }
    })
    .slice(0, 20);

  return {
    url: portfolioUrl,
    title,
    summary: inferSummary(title, metaDescription, bodyText),
    technologies,
    projectLinks,
    embeddedSiteLinks,
  };
}