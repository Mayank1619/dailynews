import type { StoryBlock, TopicSection } from "./templateContracts";

export type NewsletterFrequency = "daily" | "weekdays" | "weekly";

export interface NewsletterPreferenceInput {
  topics: string[];
  region: string;
  deliveryTime: string;
  frequency?: NewsletterFrequency;
}

export interface NewsletterArticleInput {
  id: string;
  title: string;
  snippet: string;
  source: string;
  canonicalUrl: string;
  publicationDate: Date | string;
  topics: string[];
}

export interface GeneratedNewsletterDraft {
  subject: string;
  sections: TopicSection[];
  mode: "ai" | "deterministic-fallback";
  modelName: string;
  sourceCount: number;
}

export interface NewsletterGenerationInput {
  date: Date;
  preferences: NewsletterPreferenceInput;
  articles: NewsletterArticleInput[];
}

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

type AiDraftPayload = {
  subject?: string;
  sections?: Array<{
    topic?: string;
    stories?: Array<{
      id?: string;
      title?: string;
      snippet?: string;
      source?: string;
      canonicalUrl?: string;
      publicationDate?: string;
    }>;
  }>;
};

export class EfficientAiNewsletterGenerator {
  constructor(
    private readonly apiKey = process.env.OPENAI_API_KEY?.trim(),
    private readonly modelName = process.env.OPENAI_NEWSLETTER_MODEL ?? "gpt-4.1-mini"
  ) {}

  async generate(input: NewsletterGenerationInput): Promise<GeneratedNewsletterDraft> {
    const compactArticles = compactArticleInputs(input.articles, input.preferences.topics);

    if (!this.apiKey) {
      return buildDeterministicDraft(input, compactArticles, this.modelName);
    }

    try {
      const aiDraft = await this.generateWithOpenAI(input, compactArticles);
      if (!aiDraft.sections.length) {
        return buildDeterministicDraft(input, compactArticles, this.modelName);
      }

      return {
        ...aiDraft,
        mode: "ai",
        modelName: this.modelName,
        sourceCount: compactArticles.length
      };
    } catch {
      return buildDeterministicDraft(input, compactArticles, this.modelName);
    }
  }

  private async generateWithOpenAI(
    input: NewsletterGenerationInput,
    articles: NewsletterArticleInput[]
  ): Promise<Omit<GeneratedNewsletterDraft, "mode" | "modelName" | "sourceCount">> {
    const prompt = buildCompactPrompt(input, articles);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.modelName,
        instructions:
          "Create a concise, useful newsletter from the supplied source list only. Do not invent facts. Keep every story source-linked. Return valid JSON only.",
        input: prompt,
        max_output_tokens: 1400,
        text: {
          format: {
            type: "json_schema",
            name: "daily_paper_newsletter",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["subject", "sections"],
              properties: {
                subject: { type: "string" },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["topic", "stories"],
                    properties: {
                      topic: { type: "string" },
                      stories: {
                        type: "array",
                        items: {
                          type: "object",
                          additionalProperties: false,
                          required: ["id", "title", "snippet", "source", "canonicalUrl", "publicationDate"],
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            snippet: { type: "string" },
                            source: { type: "string" },
                            canonicalUrl: { type: "string" },
                            publicationDate: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI newsletter generation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenAIResponse;
    const outputText = extractOutputText(payload);
    const parsed = JSON.parse(outputText) as AiDraftPayload;

    return {
      subject: normalizeSubject(parsed.subject, input.date, input.preferences.frequency),
      sections: normalizeSections(parsed.sections, articles)
    };
  }
}

export function buildCompactPrompt(input: NewsletterGenerationInput, articles: NewsletterArticleInput[]): string {
  const payload = {
    date: input.date.toISOString().slice(0, 10),
    region: input.preferences.region,
    frequency: input.preferences.frequency ?? "daily",
    topics: input.preferences.topics,
    style: {
      maxStoriesPerTopic: 3,
      snippetWords: "35-55",
      tone: "clear, useful, source-aware, no hype"
    },
    sources: articles.map((article) => ({
      i: article.id,
      t: article.title,
      s: article.snippet.slice(0, 360),
      src: article.source,
      u: article.canonicalUrl,
      d: toIsoDate(article.publicationDate),
      c: article.topics
    }))
  };

  return JSON.stringify(payload);
}

function compactArticleInputs(articles: NewsletterArticleInput[], topics: string[]): NewsletterArticleInput[] {
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());

  return [...articles]
    .sort((left, right) => scoreArticle(right, normalizedTopics) - scoreArticle(left, normalizedTopics))
    .slice(0, 18);
}

function scoreArticle(article: NewsletterArticleInput, topics: string[]): number {
  const matches = article.topics.filter((topic) => topics.includes(topic.toLowerCase())).length;
  const published = Date.parse(String(article.publicationDate)) || 0;

  return matches * 1_000_000_000_000 + published;
}

function buildDeterministicDraft(
  input: NewsletterGenerationInput,
  articles: NewsletterArticleInput[],
  modelName: string
): GeneratedNewsletterDraft {
  const sections = input.preferences.topics
    .map((topic) => ({
      topic,
      stories: articles
        .filter((article) => article.topics.some((articleTopic) => articleTopic.toLowerCase() === topic.toLowerCase()))
        .slice(0, 3)
        .map(toStoryBlock)
    }))
    .filter((section) => section.stories.length > 0);

  const fallbackSections = sections.length
    ? sections
    : input.preferences.topics.slice(0, 3).map((topic) => ({
        topic,
        stories: [buildPlaceholderStory(topic, input.date)]
      }));

  return {
    subject: normalizeSubject(undefined, input.date, input.preferences.frequency),
    sections: fallbackSections,
    mode: "deterministic-fallback",
    modelName,
    sourceCount: articles.length
  };
}

function toStoryBlock(article: NewsletterArticleInput): StoryBlock {
  return {
    id: article.id,
    title: article.title,
    snippet: article.snippet,
    source: article.source,
    canonicalUrl: article.canonicalUrl,
    publicationDate: new Date(article.publicationDate),
    isAISummary: false
  };
}

function buildPlaceholderStory(topic: string, date: Date): StoryBlock {
  return {
    id: `placeholder-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${topic} briefing is ready to configure`,
    snippet:
      "Connect real article ingestion or pass source articles into the newsletter endpoint to generate a source-linked briefing for this topic.",
    source: "Daily Paper",
    canonicalUrl: "https://dailynews-theta-ten.vercel.app/settings",
    publicationDate: date,
    isAISummary: false
  };
}

function normalizeSections(sections: AiDraftPayload["sections"], articles: NewsletterArticleInput[]): TopicSection[] {
  const articleById = new Map(articles.map((article) => [article.id, article]));

  return (sections ?? [])
    .map((section) => ({
      topic: section.topic?.trim() || "Top Stories",
      stories: (section.stories ?? []).slice(0, 3).map((story) => {
        const sourceArticle = story.id ? articleById.get(story.id) : undefined;

        return {
          id: story.id ?? sourceArticle?.id ?? `story-${Math.random().toString(36).slice(2)}`,
          title: story.title ?? sourceArticle?.title ?? "Untitled story",
          snippet: story.snippet ?? sourceArticle?.snippet ?? "",
          source: story.source ?? sourceArticle?.source ?? "Unknown source",
          canonicalUrl: story.canonicalUrl ?? sourceArticle?.canonicalUrl ?? "",
          publicationDate: new Date(story.publicationDate ?? sourceArticle?.publicationDate ?? new Date()),
          isAISummary: true
        };
      })
    }))
    .filter((section) => section.stories.length > 0);
}

function normalizeSubject(subject: string | undefined, date: Date, frequency?: NewsletterFrequency): string {
  if (subject?.trim()) {
    return subject.trim().slice(0, 90);
  }

  const label = frequency === "weekly" ? "Weekly Paper" : "Daily Paper";
  return `${label} - ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function extractOutputText(response: OpenAIResponse): string {
  if (response.output_text) {
    return response.output_text;
  }

  const text = response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("");

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return text;
}

function toIsoDate(value: Date | string): string {
  return new Date(value).toISOString();
}

export const efficientAiNewsletterGenerator = new EfficientAiNewsletterGenerator();
