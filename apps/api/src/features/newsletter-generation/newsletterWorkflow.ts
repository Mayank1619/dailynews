import { EfficientAiNewsletterGenerator, type NewsletterArticleInput, type NewsletterPreferenceInput } from "./aiNewsletterGenerator";
import { renderNewsletter } from "./renderPipeline";

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

export async function generateNewsletterWorkflow(
  request: NewsletterWorkflowRequest,
  generator = new EfficientAiNewsletterGenerator()
): Promise<NewsletterWorkflowResult> {
  if (!request.preferences.topics.length) {
    throw new Error("At least one topic is required to generate a newsletter.");
  }

  const date = request.date ?? new Date();
  const baseUrl = request.baseUrl ?? "https://dailynews-theta-ten.vercel.app";
  const articles = request.articles?.length ? request.articles : buildStarterArticles(request.preferences.topics, date);
  const draft = await generator.generate({ date, preferences: request.preferences, articles });
  const rendered = renderNewsletter({
    userId: request.userId,
    date,
    subject: draft.subject,
    sections: draft.sections,
    preferencesUrl: `${baseUrl}/dashboard/preferences`,
    unsubscribeUrl: `${baseUrl}/dashboard/newsletter`
  });

  return {
    newsletterId: `newsletter-${request.userId}-${date.toISOString().slice(0, 10)}`,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    articleRefs: rendered.articleRefs,
    generation: {
      mode: draft.mode,
      modelName: draft.modelName,
      sourceCount: draft.sourceCount
    }
  };
}

function buildStarterArticles(topics: string[], date: Date): NewsletterArticleInput[] {
  return topics.slice(0, 8).map((topic, index) => ({
    id: `starter-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${topic}: what changed and why it matters`,
    snippet:
      "This starter item is a safe placeholder. Connect ingestion or pass real article sources to replace it with source-linked news.",
    source: "Daily Paper",
    canonicalUrl: "https://dailynews-theta-ten.vercel.app/settings",
    publicationDate: new Date(date.getTime() - index * 60 * 60 * 1000),
    topics: [topic]
  }));
}
