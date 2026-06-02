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

export interface NewsletterWorkflowRequest {
  userId: string;
  date?: Date;
  preferences: NewsletterPreferenceInput;
  articles?: NewsletterArticleInput[];
  baseUrl?: string;
}

export interface NewsletterWorkflowResult {
  newsletterId: string;
  subject: string;
  html: string;
  text: string;
  articleRefs: string[];
  generation: {
    mode: "ai" | "deterministic-fallback";
    modelName: string;
    sourceCount: number;
  };
}

type DraftStory = {
  id: string;
  title: string;
  snippet: string;
  source: string;
  canonicalUrl: string;
  publicationDate: string;
};

type DraftSection = {
  topic: string;
  stories: DraftStory[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
};

type AiPayload = {
  subject?: string;
  sections?: DraftSection[];
};

export async function generateNewsletterWorkflow(request: NewsletterWorkflowRequest): Promise<NewsletterWorkflowResult> {
  if (!request.preferences.topics.length) {
    throw new Error("At least one topic is required to generate a newsletter.");
  }

  const date = request.date ?? new Date();
  const baseUrl = request.baseUrl ?? "https://dailynews-theta-ten.vercel.app";
  const articles = compactArticles(request.articles?.length ? request.articles : starterArticles(request.preferences.topics, date), request.preferences.topics);
  const draft = await generateDraft(date, request.preferences, articles);
  const html = renderHtml(draft.subject, date, draft.sections, `${baseUrl}/dashboard/preferences`, `${baseUrl}/dashboard/newsletter`);
  const text = renderText(draft.subject, date, draft.sections, `${baseUrl}/dashboard/preferences`, `${baseUrl}/dashboard/newsletter`);

  return {
    newsletterId: `newsletter-${request.userId}-${date.toISOString().slice(0, 10)}`,
    subject: draft.subject,
    html,
    text,
    articleRefs: [...new Set(draft.sections.flatMap((section) => section.stories.map((story) => story.id)))],
    generation: {
      mode: draft.mode,
      modelName: draft.modelName,
      sourceCount: articles.length
    }
  };
}

export async function sendBrevoNewsletter(message: {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Daily Paper";

  if (!apiKey || !senderEmail) {
    return {
      success: false,
      errorCode: "brevo_not_configured",
      errorMessage: "Set BREVO_API_KEY and BREVO_SENDER_EMAIL before sending newsletters.",
      shouldRetry: false
    };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [message.to],
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text
    })
  });

  if (!response.ok) {
    return {
      success: false,
      errorCode: `brevo_${response.status}`,
      errorMessage: (await response.text()).slice(0, 500),
      shouldRetry: response.status >= 500 || response.status === 429
    };
  }

  const body = (await response.json()) as { messageId?: string };
  return { success: true, messageId: body.messageId, shouldRetry: false };
}

async function generateDraft(date: Date, preferences: NewsletterPreferenceInput, articles: NewsletterArticleInput[]) {
  const modelName = process.env.OPENAI_NEWSLETTER_MODEL ?? "gpt-4.1-mini";
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return deterministicDraft(date, preferences, articles, modelName);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        instructions:
          "Create a concise, useful newsletter from the supplied source list only. Do not invent facts. Keep every story source-linked. Return valid JSON only.",
        input: buildCompactPrompt(date, preferences, articles),
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
      return deterministicDraft(date, preferences, articles, modelName);
    }

    const payload = (await response.json()) as OpenAIResponse;
    const parsed = JSON.parse(extractOutputText(payload)) as AiPayload;
    const sections = (parsed.sections ?? []).map((section) => ({
      topic: section.topic,
      stories: section.stories.slice(0, 3)
    })).filter((section) => section.stories.length);

    if (!sections.length) {
      return deterministicDraft(date, preferences, articles, modelName);
    }

    return {
      subject: (parsed.subject ?? defaultSubject(date, preferences.frequency)).slice(0, 90),
      sections,
      mode: "ai" as const,
      modelName
    };
  } catch {
    return deterministicDraft(date, preferences, articles, modelName);
  }
}

function deterministicDraft(date: Date, preferences: NewsletterPreferenceInput, articles: NewsletterArticleInput[], modelName: string) {
  const sections = preferences.topics.map((topic) => ({
    topic,
    stories: articles
      .filter((article) => article.topics.some((candidate) => candidate.toLowerCase() === topic.toLowerCase()))
      .slice(0, 3)
      .map((article) => ({
        id: article.id,
        title: article.title,
        snippet: article.snippet,
        source: article.source,
        canonicalUrl: article.canonicalUrl,
        publicationDate: new Date(article.publicationDate).toISOString()
      }))
  })).filter((section) => section.stories.length);

  return {
    subject: defaultSubject(date, preferences.frequency),
    sections: sections.length ? sections : preferences.topics.slice(0, 3).map((topic) => ({
      topic,
      stories: [{
        id: `placeholder-${slug(topic)}`,
        title: `${topic} briefing is ready to configure`,
        snippet: "Connect article ingestion or pass source articles to generate a source-linked briefing for this topic.",
        source: "Daily Paper",
        canonicalUrl: "https://dailynews-theta-ten.vercel.app/settings",
        publicationDate: date.toISOString()
      }]
    })),
    mode: "deterministic-fallback" as const,
    modelName
  };
}

function buildCompactPrompt(date: Date, preferences: NewsletterPreferenceInput, articles: NewsletterArticleInput[]): string {
  return JSON.stringify({
    date: date.toISOString().slice(0, 10),
    region: preferences.region,
    frequency: preferences.frequency ?? "daily",
    topics: preferences.topics,
    style: { maxStoriesPerTopic: 3, snippetWords: "35-55", tone: "clear, useful, no hype" },
    sources: articles.map((article) => ({
      i: article.id,
      t: article.title,
      s: article.snippet.slice(0, 360),
      src: article.source,
      u: article.canonicalUrl,
      d: new Date(article.publicationDate).toISOString(),
      c: article.topics
    }))
  });
}

function compactArticles(articles: NewsletterArticleInput[], topics: string[]): NewsletterArticleInput[] {
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

function starterArticles(topics: string[], date: Date): NewsletterArticleInput[] {
  return topics.slice(0, 8).map((topic, index) => ({
    id: `starter-${slug(topic)}`,
    title: `${topic}: what changed and why it matters`,
    snippet: "This starter item is a safe placeholder for source-linked news until ingestion is connected.",
    source: "Daily Paper",
    canonicalUrl: "https://dailynews-theta-ten.vercel.app/settings",
    publicationDate: new Date(date.getTime() - index * 60 * 60 * 1000),
    topics: [topic]
  }));
}

function renderHtml(subject: string, date: Date, sections: DraftSection[], preferencesUrl: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:24px"><main style="max-width:640px;margin:0 auto;background:#fff;padding:24px;border-radius:12px"><h1>${escapeHtml(subject)}</h1><p>${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>${sections.map(renderSectionHtml).join("")}<footer style="border-top:1px solid #cbd5e1;margin-top:24px;padding-top:16px;font-size:13px"><a href="${preferencesUrl}">Update preferences</a> · <a href="${unsubscribeUrl}">Unsubscribe</a><p>You received this because you subscribed to Daily Paper.</p></footer></main></body></html>`;
}

function renderSectionHtml(section: DraftSection): string {
  return `<section><h2 style="border-left:4px solid #22d3ee;padding-left:10px">${escapeHtml(section.topic)}</h2>${section.stories.map((story) => `<article style="margin:18px 0"><h3>${escapeHtml(story.title)} <span style="font-size:11px;background:#e2e8f0;padding:2px 6px;border-radius:999px">Summary</span></h3><p style="color:#64748b">${escapeHtml(story.source)} - ${new Date(story.publicationDate).toLocaleDateString("en-US")}</p><p>${escapeHtml(story.snippet)}</p><a href="${story.canonicalUrl}">Read full article</a></article>`).join("")}</section>`;
}

function renderText(subject: string, date: Date, sections: DraftSection[], preferencesUrl: string, unsubscribeUrl: string): string {
  return [
    subject,
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    "",
    ...sections.flatMap((section) => [
      section.topic.toUpperCase(),
      ...section.stories.flatMap((story) => [
        `${story.title} [Summary]`,
        `${story.source} - ${new Date(story.publicationDate).toLocaleDateString("en-US")}`,
        story.snippet,
        `Read: ${story.canonicalUrl}`,
        ""
      ])
    ]),
    `Update preferences: ${preferencesUrl}`,
    `Unsubscribe: ${unsubscribeUrl}`
  ].join("\n");
}

function extractOutputText(response: OpenAIResponse): string {
  const text = response.output_text ?? response.output?.flatMap((item) => item.content ?? []).map((content) => content.text).filter(Boolean).join("");
  if (!text) throw new Error("OpenAI response did not include text output.");
  return text;
}

function defaultSubject(date: Date, frequency?: NewsletterFrequency): string {
  return `${frequency === "weekly" ? "Weekly Paper" : "Daily Paper"} - ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
