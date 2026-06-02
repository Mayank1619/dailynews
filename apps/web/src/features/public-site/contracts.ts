export type PublicRouteAction = {
  id: string;
  label: string;
  route: string;
};

export type LandingSampleDigest = {
  title: string;
  snippet: string;
  sourceName: string;
  canonicalUrl: string;
  publishedAt: string;
  label: string;
};

export const LANDING_ROUTE = "/";

export const PRIMARY_CTA: PublicRouteAction = {
  id: "primary-signup",
  label: "Get Your Daily Paper",
  route: "/signup"
};

export const PUBLIC_NAV_ACTIONS: PublicRouteAction[] = [
  PRIMARY_CTA,
  { id: "login", label: "Login", route: "/login" }
];

export const HOW_IT_WORKS_STEPS = [
  "Pick topics that matter to you.",
  "Daily Paper assembles a concise neutral digest.",
  "Read your daily brief in minutes and jump to full sources."
] as const;

export const SAMPLE_DIGEST_PREVIEW: LandingSampleDigest = {
  title: "Morning Brief: Markets, Climate, and Policy",
  snippet: "A sample of how Daily Paper summarizes key headlines with source links and timestamps.",
  sourceName: "Illustrative sample",
  canonicalUrl: "/blog",
  publishedAt: "2026-05-26T08:00:00.000Z",
  label: "Illustrative sample digest"
};

export const FOOTER_TRUST_LINKS: PublicRouteAction[] = [
  { id: "privacy", label: "Privacy", route: "/privacy" },
  { id: "terms", label: "Terms", route: "/terms" },
  { id: "contact", label: "Contact", route: "/contact" }
];
