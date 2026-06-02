import { describe, expect, it } from "vitest";
import { EfficientAiNewsletterGenerator, buildCompactPrompt } from "../../../apps/api/src/features/newsletter-generation/aiNewsletterGenerator";
import { generateNewsletterWorkflow } from "../../../apps/api/src/features/newsletter-generation/newsletterWorkflow";

const preferences = {
  topics: ["New in AI", "Markets"],
  region: "Canada",
  deliveryTime: "08:00",
  frequency: "daily" as const
};

const articles = [
  {
    id: "a1",
    title: "AI search tools expand into local news",
    snippet: "Several publishers are testing AI-assisted search summaries with source links and editorial review.",
    source: "Example Tech",
    canonicalUrl: "https://example.com/ai-search",
    publicationDate: "2026-06-02T10:00:00.000Z",
    topics: ["New in AI"]
  },
  {
    id: "m1",
    title: "Markets open higher after chip stocks rally",
    snippet: "Major indexes rose as semiconductor shares led the morning session.",
    source: "Example Markets",
    canonicalUrl: "https://example.com/markets",
    publicationDate: "2026-06-02T09:00:00.000Z",
    topics: ["Markets"]
  }
];

describe("efficient AI newsletter generation", () => {
  it("builds a compact prompt from user preferences and source articles", () => {
    const prompt = buildCompactPrompt({ date: new Date("2026-06-02T08:00:00.000Z"), preferences, articles }, articles);

    expect(prompt.length).toBeLessThan(1800);
    expect(prompt).toContain("New in AI");
    expect(prompt).toContain("Example Tech");
  });

  it("falls back to deterministic generation when no AI key is configured", async () => {
    const generator = new EfficientAiNewsletterGenerator(undefined, "test-model");
    const result = await generator.generate({ date: new Date("2026-06-02T08:00:00.000Z"), preferences, articles });

    expect(result.mode).toBe("deterministic-fallback");
    expect(result.sections.map((section) => section.topic)).toEqual(["New in AI", "Markets"]);
    expect(result.sections[0].stories[0].canonicalUrl).toBe("https://example.com/ai-search");
  });

  it("renders a full newsletter preview through the workflow", async () => {
    const generator = new EfficientAiNewsletterGenerator(undefined, "test-model");
    const result = await generateNewsletterWorkflow(
      {
        userId: "user-1",
        date: new Date("2026-06-02T08:00:00.000Z"),
        preferences,
        articles
      },
      generator
    );

    expect(result.subject).toContain("Daily Paper");
    expect(result.html).toContain("AI search tools expand");
    expect(result.text).toContain("Markets open higher");
    expect(result.generation.mode).toBe("deterministic-fallback");
  });
});
