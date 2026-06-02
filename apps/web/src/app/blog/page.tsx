import React from "react";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";
import { BrowsePublishedBlogContentPage } from "../../features/blog-seo/browse-published-blog-content";
import { DiscoverContentByTopicAndDatePage } from "../../features/blog-seo/discover-content-by-topic-and-date";
import { ReadBlogPostBySlugPage } from "../../features/blog-seo/read-a-blog-post-by-slug";
import type { BlogIndexEntry, BlogPost } from "../../../../api/src/features/blog-seo/schema";

const entries: BlogIndexEntry[] = [
  {
    postId: "daily-ai-news-briefing",
    slug: "daily-ai-news-briefing",
    publishedAt: "2026-05-30T08:00:00.000Z",
    category: "technology",
    tags: ["ai", "daily"]
  },
  {
    postId: "markets-without-the-noise",
    slug: "markets-without-the-noise",
    publishedAt: "2026-05-29T08:00:00.000Z",
    category: "business",
    tags: ["markets", "analysis"]
  },
  {
    postId: "climate-signals-this-week",
    slug: "climate-signals-this-week",
    publishedAt: "2026-05-28T08:00:00.000Z",
    category: "science",
    tags: ["climate", "science"]
  }
];

const posts: BlogPost[] = entries.map((entry) => ({
  id: entry.postId,
  slug: entry.slug,
  title: titleFromSlug(entry.slug),
  excerpt: "A clear, source-aware read for people who want the story without the scroll.",
  body:
    "Daily Paper turns a crowded news day into a compact briefing with source links, AI summary labels, and topic-aware context.",
  tags: entry.tags,
  category: entry.category,
  status: "published",
  publishedAt: entry.publishedAt,
  updatedAt: entry.publishedAt,
  canonicalUrl: `https://dailypaper.news/blog/${entry.slug}`
}));

type BlogPageProps = Readonly<{
  slug?: string;
}>;

export default function BlogPage({ slug }: BlogPageProps): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get("tag") ?? undefined;

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <a href="/" style={navLinkStyle}>Home</a>
          <a href="/signup" style={navLinkStyle}>Get Your Daily Paper</a>
          <a href="/dashboard/preferences" style={navLinkStyle}>Preferences</a>
        </nav>
        <style>{blogStyles}</style>
        <div className="blog-surface">
          {slug ? <PostSurface slug={slug} /> : tag ? <DiscoverSurface tag={tag} /> : <IndexSurface />}
        </div>
      </section>
    </main>
  );
}

function IndexSurface(): React.JSX.Element {
  return (
    <BrowsePublishedBlogContentPage
      result={{
        entries,
        total: entries.length,
        hasMore: true,
        currentPage: 1,
        pageSize: entries.length
      }}
    />
  );
}

function DiscoverSurface({ tag }: { tag: string }): React.JSX.Element {
  const filteredEntries = entries.filter((entry) => entry.tags.includes(tag));

  return (
    <DiscoverContentByTopicAndDatePage
      result={{
        entries: filteredEntries,
        appliedFilters: { tag }
      }}
    />
  );
}

function PostSurface({ slug }: { slug: string }): React.JSX.Element {
  return <ReadBlogPostBySlugPage post={posts.find((post) => post.slug === slug) ?? null} slug={slug} />;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 40px",
  color: DESIGN_TOKENS.colors.textPrimary,
  font: DESIGN_TOKENS.typography.body,
  background:
    "radial-gradient(circle at 8% 0%, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at 92% 8%, rgba(168,85,247,0.18), transparent 32%), linear-gradient(180deg, #070912 0%, #0B1020 100%)"
};

const panelStyle: React.CSSProperties = {
  width: "min(980px, 100%)",
  margin: "0 auto",
  padding: 24,
  borderRadius: 16,
  border: "1px solid rgba(34,211,238,0.24)",
  background: "rgba(17,24,39,0.82)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.34), 0 0 36px rgba(34,211,238,0.12)"
};

const navLinkStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.brandPrimary,
  textDecoration: "none",
  fontWeight: 800
};

const blogStyles = `
  .blog-surface h1 {
    font: ${DESIGN_TOKENS.typography.h1};
    margin: 0 0 18px;
  }

  .blog-surface ul {
    display: grid;
    gap: 12px;
    padding: 0;
    list-style: none;
  }

  .blog-surface li {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(34, 211, 238, 0.2);
    background: rgba(7, 9, 18, 0.58);
  }

  .blog-surface a {
    color: ${DESIGN_TOKENS.colors.brandPrimary};
    font-weight: 800;
  }

  .blog-surface time,
  .blog-surface [data-testid="entry-category"] {
    color: ${DESIGN_TOKENS.colors.textSecondary};
  }

  .blog-surface [data-testid="entry-category"] {
    width: fit-content;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(168, 85, 247, 0.18);
    color: ${DESIGN_TOKENS.colors.accentHighlight};
    font-weight: 700;
  }

  .blog-surface [data-testid="excerpt"] {
    color: ${DESIGN_TOKENS.colors.textSecondary};
  }

  .blog-surface [data-testid="body"] {
    margin: 16px 0;
    padding: 16px;
    border-radius: 12px;
    background: rgba(7, 9, 18, 0.58);
  }
`;
