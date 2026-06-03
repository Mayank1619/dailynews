import React from "react";
import { DESIGN_TOKENS } from "../../features/design-system/tokens";

type SampleStory = {
  title: string;
  source: string;
  summary: string;
};

type SampleNewsletter = {
  slug: string;
  title: string;
  audience: string;
  description: string;
  topics: string[];
  stories: SampleStory[];
};

const samples: SampleNewsletter[] = [
  {
    slug: "ai-daily-paper",
    title: "AI Daily Paper",
    audience: "Builders, students, and curious professionals",
    description: "A focused AI and technology paper with product launches, model updates, and practical implications.",
    topics: ["New in AI", "New in Technology", "Cybersecurity"],
    stories: [
      {
        title: "AI assistants move deeper into work tools",
        source: "Sample Source Desk",
        summary: "Productivity platforms are adding AI summaries and workflow agents, with human review remaining important for accuracy."
      },
      {
        title: "Teams rethink source-aware summaries",
        source: "Sample AI Review",
        summary: "Publishers and software teams are testing summary formats that keep links visible beside generated text."
      }
    ]
  },
  {
    slug: "markets-daily-paper",
    title: "Markets Daily Paper",
    audience: "Investors and finance watchers",
    description: "A concise markets view with major movers, personal finance signals, and weekly winners.",
    topics: ["Markets", "Personal Finance", "Weekly Winners"],
    stories: [
      {
        title: "Technology shares lead market gains",
        source: "Sample Markets Desk",
        summary: "Investors continue to watch AI infrastructure demand and earnings guidance as technology names outperform."
      },
      {
        title: "Households watch rates and housing costs",
        source: "Sample Finance Brief",
        summary: "Personal finance coverage remains focused on mortgage pressure, savings rates, and household budgets."
      }
    ]
  },
  {
    slug: "sports-daily-paper",
    title: "Sports Daily Paper",
    audience: "Fans who want the day without the scroll",
    description: "A fast sports briefing covering fixtures, form, injuries, and the matchups that matter.",
    topics: ["Sports Headlines", "Football", "Cricket", "Hockey"],
    stories: [
      {
        title: "Weekend schedule sets up decisive matchups",
        source: "Sample Sports Desk",
        summary: "Major leagues move into important fixtures with playoff positioning and injuries driving the storylines."
      },
      {
        title: "Form guide highlights teams to watch",
        source: "Sample Match Preview",
        summary: "Recent performances and lineup changes give fans a compact guide before the weekend slate."
      }
    ]
  },
  {
    slug: "politics-daily-paper",
    title: "Politics Daily Paper",
    audience: "Readers following policy without noise",
    description: "A neutral digest of policy, elections, world affairs, and local government developments.",
    topics: ["Politics", "World Affairs", "Policy", "Elections"],
    stories: [
      {
        title: "Affordability remains a central policy theme",
        source: "Sample Politics Desk",
        summary: "Canadian policy discussions continue to focus on housing, productivity, and public services."
      },
      {
        title: "World affairs brief tracks diplomatic pressure",
        source: "Sample Global Desk",
        summary: "International coverage highlights negotiations, economic pressure, and regional security developments."
      }
    ]
  },
  {
    slug: "horoscope-culture-paper",
    title: "Horoscope and Culture Paper",
    audience: "Readers who want a lighter morning ritual",
    description: "Culture, entertainment, horoscopes, books, movies, and music in a compact daily format.",
    topics: ["Horoscopes", "Movies", "Music", "Books"],
    stories: [
      {
        title: "Horoscope readers look for lighter daily rituals",
        source: "Sample Culture Desk",
        summary: "Culture sections are pairing horoscopes with entertainment and wellness notes for quick morning reading."
      },
      {
        title: "Streaming releases shape weekend watchlists",
        source: "Sample Entertainment Brief",
        summary: "New releases and audience buzz help readers decide what to watch, read, or listen to."
      }
    ]
  },
  {
    slug: "local-canada-paper",
    title: "Local Canada Daily Paper",
    audience: "Canadian readers who want regional context",
    description: "A local-first sample with Canada, provincial updates, climate, housing, and city-level signals.",
    topics: ["Canada", "Local News", "Climate", "Real Estate"],
    stories: [
      {
        title: "Local housing updates remain front and center",
        source: "Sample Canada Desk",
        summary: "Regional reporting continues to track rent, affordability, permits, and the pace of new supply."
      },
      {
        title: "Climate planning tools draw local attention",
        source: "Sample Climate Brief",
        summary: "Municipal and provincial teams are testing tools for grid planning, resilience, and infrastructure decisions."
      }
    ]
  }
];

type SamplesPageProps = Readonly<{
  slug?: string;
}>;

export default function SamplesPage({ slug }: SamplesPageProps): JSX.Element {
  const selected = slug ? samples.find((sample) => sample.slug === slug) : undefined;

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <a href="/" style={navLinkStyle}>Home</a>
          <a href="/about" style={navLinkStyle}>About</a>
          <a href="/how-it-works" style={navLinkStyle}>How It Works</a>
          <a href="/pricing" style={navLinkStyle}>Pricing</a>
          <a href="/blog" style={navLinkStyle}>Blog</a>
          <a href="/signup" style={navLinkStyle}>Start Trial</a>
        </nav>
        {selected ? <SampleDetail sample={selected} /> : <SampleIndex />}
      </section>
      <footer style={{ width: "min(1060px, 100%)", margin: "18px auto 0", color: DESIGN_TOKENS.colors.textSecondary }}>
        Powered by{" "}
        <a href="https://www.netfroot.com/" style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 800 }}>
          Netfroot
        </a>
      </footer>
    </main>
  );
}

function SampleIndex(): React.JSX.Element {
  return (
    <>
      <p style={eyebrowStyle}>Sample newsletters</p>
      <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 10px" }}>See Your Daily Paper Before Signup</h1>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760 }}>
        Browse examples for different readers. Each sample shows the format, topic chips, and source-linked summary style.
      </p>
      <section style={gridStyle}>
        {samples.map((sample) => (
          <a key={sample.slug} href={`/samples/${sample.slug}`} style={sampleCardStyle}>
            <span style={eyebrowStyle}>{sample.audience}</span>
            <strong style={{ font: DESIGN_TOKENS.typography.h3 }}>{sample.title}</strong>
            <span style={{ color: DESIGN_TOKENS.colors.textSecondary }}>{sample.description}</span>
            <span style={{ color: DESIGN_TOKENS.colors.brandPrimary, fontWeight: 900 }}>View sample</span>
          </a>
        ))}
      </section>
    </>
  );
}

function SampleDetail({ sample }: { sample: SampleNewsletter }): React.JSX.Element {
  return (
    <>
      <a href="/samples" style={navLinkStyle}>Back to samples</a>
      <p style={{ ...eyebrowStyle, marginTop: 20 }}>Illustrative sample</p>
      <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 10px" }}>{sample.title}</h1>
      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760 }}>{sample.description}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
        {sample.topics.map((topic) => <span key={topic} style={chipStyle}>{topic}</span>)}
      </div>
      <section style={{ display: "grid", gap: 14 }}>
        {sample.stories.map((story) => (
          <article key={story.title} style={storyStyle}>
            <h2 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{story.title}</h2>
            <p style={{ color: DESIGN_TOKENS.colors.accentHighlight, fontWeight: 900, margin: 0 }}>{story.source}</p>
            <p style={{ color: DESIGN_TOKENS.colors.textSecondary, margin: 0 }}>{story.summary}</p>
          </article>
        ))}
      </section>
      <a href="/signup" style={ctaStyle}>Create my version</a>
    </>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 40px",
  color: DESIGN_TOKENS.colors.textPrimary,
  font: DESIGN_TOKENS.typography.body,
  background:
    "radial-gradient(circle at 8% 0%, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at 92% 8%, rgba(244,114,182,0.18), transparent 32%), linear-gradient(180deg, #070912 0%, #0B1020 100%)"
};

const panelStyle: React.CSSProperties = {
  width: "min(1060px, 100%)",
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
  fontWeight: 900
};

const eyebrowStyle: React.CSSProperties = {
  color: DESIGN_TOKENS.colors.accentHighlight,
  fontWeight: 900,
  margin: 0
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  marginTop: 22
};

const sampleCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  minHeight: 220,
  padding: 16,
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.22)",
  background: "rgba(7,9,18,0.66)",
  color: DESIGN_TOKENS.colors.textPrimary,
  textDecoration: "none"
};

const chipStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  color: "#07111F",
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  fontWeight: 900
};

const storyStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 16,
  borderRadius: 14,
  border: "1px solid rgba(167,179,200,0.18)",
  background: "rgba(7,9,18,0.66)"
};

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 22,
  padding: "12px 16px",
  borderRadius: 999,
  color: "#07111F",
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  textDecoration: "none",
  fontWeight: 900
};
