import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..");
const generatedPostsPath = resolve(repoRoot, "apps", "web", "src", "app", "blog", "generated-posts.ts");
const endpoint = process.env.MARKETING_AUTOMATION_ENDPOINT ?? "https://dailynews-theta-ten.vercel.app/api/marketing/automation-run";
const token = process.env.NEWSLETTER_ADMIN_TOKEN;

const automationRun = token ? await generateAutomationRun() : generateLocalAutomationRun();
const dailyPaper = automationRun.apps.find((app) => app.appId === "daily-paper");

if (!dailyPaper?.campaign.contentKit?.blogDraft) {
  throw new Error("Daily Paper blog content was not present in the automation run.");
}

const blogDraft = dailyPaper.campaign.contentKit.blogDraft;
const now = new Date().toISOString();
const post = {
  id: blogDraft.slug,
  slug: blogDraft.slug,
  title: blogDraft.title,
  excerpt: blogDraft.excerpt,
  body: blogDraft.bodyMarkdown,
  tags: blogDraft.tags,
  category: blogDraft.category,
  status: "published",
  publishedAt: `${automationRun.date}T10:00:00.000Z`,
  updatedAt: now,
  canonicalUrl: `https://dailynews-theta-ten.vercel.app${blogDraft.canonicalPath}`
};

const existingPosts = await readGeneratedPosts();
const nextPosts = [post, ...existingPosts.filter((existing) => existing.slug !== post.slug)]
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, 90);

await writeFile(
  generatedPostsPath,
  [
    'import type { BlogPost } from "../../../../api/src/features/blog-seo/schema";',
    "",
    `export const GENERATED_BLOG_POSTS = ${JSON.stringify(nextPosts, null, 2)} satisfies BlogPost[];`,
    ""
  ].join("\n"),
  "utf8"
);

console.log(`Published Daily Paper blog post: ${post.slug}`);

async function generateAutomationRun() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      appIds: ["daily-paper"],
      provider: "github-actions",
      mode: "auto-publish-owned-sites"
    })
  });

  if (!response.ok) {
    throw new Error(`Marketing automation run failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function generateLocalAutomationRun() {
  const date = new Date().toISOString().slice(0, 10);
  const slug = `daily-news-habit-${date}`;
  return {
    date,
    apps: [
      {
        appId: "daily-paper",
        campaign: {
          contentKit: {
            blogDraft: {
              title: "How a Daily News Habit Helps You Make Better Decisions",
              slug,
              metaTitle: "How a Daily News Habit Helps You Make Better Decisions",
              metaDescription: "See how a short, personalized Daily Paper briefing can turn news overload into clearer everyday decisions.",
              excerpt: "A short daily briefing can help readers stay informed without losing the morning to endless feeds.",
              bodyMarkdown: [
                "# How a Daily News Habit Helps You Make Better Decisions",
                "",
                "Most people do not need more noise in the morning. They need a smaller, clearer briefing that helps them understand what changed, what matters, and what they can ignore for now.",
                "",
                "Daily Paper is built around that idea. Readers choose the topics they care about, such as AI, technology, politics, markets, sports, culture, horoscopes, and local news. The product then turns those preferences into a concise paper-style briefing with source-linked summaries.",
                "",
                "## Why a shorter briefing works",
                "",
                "A focused briefing gives readers a repeatable habit: scan the top changes, understand the context, and move on with the day. That matters for students, founders, professionals, and anyone who wants to sound informed without living inside a feed.",
                "",
                "## Try Daily Paper",
                "",
                "Start with the Daily Paper samples at /samples/ai-daily-paper, then create a personalized paper from /signup."
              ].join("\n"),
              tags: ["daily news", "AI newsletter", "personalized news", "productivity", "news habits"],
              category: "Productivity and news habits",
              targetKeyword: "daily news habit",
              canonicalPath: `/blog/${slug}`,
              ctaRoute: "/signup",
              sampleRoute: "/samples/ai-daily-paper"
            }
          }
        }
      }
    ]
  };
}

async function readGeneratedPosts() {
  const source = await readFile(generatedPostsPath, "utf8");
  const match = source.match(/GENERATED_BLOG_POSTS = (\[[\s\S]*?\]) satisfies BlogPost\[];/);
  if (!match) return [];
  return JSON.parse(match[1]);
}
