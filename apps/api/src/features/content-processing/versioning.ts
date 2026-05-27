import { createHash } from "node:crypto";
import type { ArticleRaw, TaxonomyCategory } from "./contracts";

export const CONTENT_PROCESSING_PIPELINE_VERSION = "content-processing-v1.0.0";
export const CONTENT_PROCESSING_TITLE_SIMILARITY_THRESHOLD = 0.58;

export const CONTROLLED_TAXONOMY: TaxonomyCategory[] = [
  "politics",
  "markets",
  "crime",
  "tech",
  "sports",
  "horoscope",
  "local"
];

const TAXONOMY_KEYWORDS: Record<TaxonomyCategory, string[]> = {
  politics: ["election", "government", "parliament", "senate", "congress", "campaign", "policy", "vote", "minister", "president"],
  markets: ["stock", "market", "markets", "shares", "trading", "inflation", "earnings", "wall street", "bond"],
  crime: ["crime", "police", "arrest", "robbery", "fraud", "shooting", "homicide", "charges", "investigation", "suspect"],
  tech: ["tech", "ai", "startup", "software", "app", "cloud", "chip", "cybersecurity", "gadget", "silicon"],
  sports: ["game", "match", "league", "tournament", "score", "coach", "player", "championship", "season", "cup"],
  horoscope: ["horoscope", "zodiac", "astrology", "mercury retrograde", "daily sign", "lunar"],
  local: ["local", "city council", "neighborhood", "community", "municipal", "transit", "school board", "district"]
};

export function normalizeWhitespace(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function normalizeTextForComparison(value: string | null | undefined): string {
  return normalizeWhitespace(value).toLowerCase();
}

export function canonicalizeUrl(value: string | null | undefined): string {
  const raw = normalizeWhitespace(value);

  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port && !isDefaultPort(protocol, parsed.port) ? `:${parsed.port}` : "";
    const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${protocol}//${hostname}${port}${pathname}`;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

export function normalizePublishedAt(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

export function scoreTitleSimilarity(leftTitle: string, rightTitle: string): number {
  const left = normalizeTextForComparison(leftTitle);
  const right = normalizeTextForComparison(rightTitle);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  const overlap = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  const jaccard = overlap / union;
  const substringBoost = left.includes(right) || right.includes(left) ? 0.15 : 0;

  return Math.min(1, jaccard + substringBoost);
}

export function assignTaxonomyCategories(text: string): TaxonomyCategory[] {
  const normalized = normalizeTextForComparison(text);

  if (!normalized) {
    return [];
  }

  return CONTROLLED_TAXONOMY.filter((category) =>
    TAXONOMY_KEYWORDS[category].some((keyword) => normalized.includes(keyword))
  );
}

export function resolveCanonicalUrl(rawArticles: ArticleRaw[]): string {
  const canonicalUrls = rawArticles
    .map((article) => canonicalizeUrl(article.url))
    .filter((value) => value.length > 0);

  if (canonicalUrls.length > 0) {
    const counts = new Map<string, number>();

    for (const url of canonicalUrls) {
      counts.set(url, (counts.get(url) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .at(0)?.[0] ?? canonicalUrls[0];
  }

  const fallbackHash = rawArticles.map((article) => normalizeWhitespace(article.rawHash)).find(Boolean);

  return fallbackHash ? `urn:rawhash:${fallbackHash}` : "";
}

export function buildDedupGroupId(rawArticles: ArticleRaw[], canonicalUrl: string): string {
  const hashSource = canonicalUrl || rawArticles
    .map((article) => normalizeWhitespace(article.rawHash) || normalizeWhitespace(article.title))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .join("|");

  return `grp_${sha256(hashSource).slice(0, 16)}`;
}

export function chooseRepresentativeTitle(rawArticles: ArticleRaw[]): string {
  const titles = rawArticles.map((article) => normalizeWhitespace(article.title)).filter(Boolean);

  if (titles.length === 0) {
    return "";
  }

  return [...titles].sort((left, right) => right.length - left.length || left.localeCompare(right))[0];
}

export function chooseRepresentativeSnippet(rawArticles: ArticleRaw[]): string {
  const snippets = rawArticles.map((article) => normalizeWhitespace(article.snippet)).filter(Boolean);

  if (snippets.length === 0) {
    return "";
  }

  return [...snippets].sort((left, right) => right.length - left.length || left.localeCompare(right))[0];
}

export function chooseEarliestPublishedAt(rawArticles: ArticleRaw[]): string {
  const dates = rawArticles.map((article) => normalizePublishedAt(article.publishedAt));
  return [...dates].sort((left, right) => left.localeCompare(right))[0] ?? new Date(0).toISOString();
}

export function buildSources(rawArticles: ArticleRaw[]): Array<{ sourceId: string; url: string }> {
  return rawArticles.map((article) => ({
    sourceId: article.sourceId,
    url: normalizeWhitespace(article.url) || resolveSourceFallbackUrl(article)
  }));
}

export function stableArticleSort(left: ArticleRaw, right: ArticleRaw): number {
  return normalizePublishedAt(left.publishedAt).localeCompare(normalizePublishedAt(right.publishedAt)) ||
    left.sourceId.localeCompare(right.sourceId) ||
    left.id.localeCompare(right.id);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sameStoryByUrlOrSimilarity(left: ArticleRaw, right: ArticleRaw): boolean {
  const leftCanonical = canonicalizeUrl(left.url);
  const rightCanonical = canonicalizeUrl(right.url);

  if (leftCanonical && rightCanonical && leftCanonical === rightCanonical) {
    return true;
  }

  if (left.rawHash && right.rawHash && normalizeWhitespace(left.rawHash) === normalizeWhitespace(right.rawHash)) {
    return true;
  }

  return scoreTitleSimilarity(left.title, right.title) >= CONTENT_PROCESSING_TITLE_SIMILARITY_THRESHOLD;
}

function tokenize(value: string): string[] {
  return value
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length > 1);
}

function normalizeToken(token: string): string {
  let normalized = token.toLowerCase();

  if (normalized.length > 5 && normalized.endsWith("ing")) {
    normalized = normalized.slice(0, -3);
  } else if (normalized.length > 4 && (normalized.endsWith("ed") || normalized.endsWith("es"))) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 4 && normalized.endsWith("s")) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized.length > 5 && normalized.endsWith("e")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function isDefaultPort(protocol: string, port: string): boolean {
  return (protocol === "http:" && port === "80") || (protocol === "https:" && port === "443");
}

function resolveSourceFallbackUrl(article: ArticleRaw): string {
  const rawHash = normalizeWhitespace(article.rawHash);

  if (rawHash) {
    return `urn:rawhash:${rawHash}`;
  }

  return canonicalizeUrl(article.url);
}
