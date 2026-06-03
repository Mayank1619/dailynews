import React from "react";
import { DESIGN_TOKENS } from "../features/design-system/tokens";

type InfoPageKind = "about" | "how-it-works" | "pricing";

type InfoPageProps = {
  kind: InfoPageKind;
};

const pageContent = {
  about: {
    eyebrow: "About Daily Paper",
    title: "A personal newspaper for people who still like to read",
    intro:
      "Daily Paper is built for readers who miss the ritual of a real newspaper but want the control of a modern digital product. You choose the sections you care about, and the app curates a readable paper around them.",
    sections: [
      {
        title: "Why it exists",
        body:
          "Physical newspapers are harder to get, feeds are noisy, and most news apps are built for endless scrolling. Daily Paper is designed as a calm, finite reading experience: your topics, your cadence, your paper."
      },
      {
        title: "What makes it different",
        body:
          "Instead of forcing everyone into the same front page, Daily Paper lets readers choose AI, business, politics, sports, horoscopes, local news, culture, or any mix that fits their day."
      },
      {
        title: "Built by Netfroot",
        body:
          "Daily Paper is powered by Netfroot, with a focus on practical AI products that help people read, decide, and work with less noise."
      }
    ]
  },
  "how-it-works": {
    eyebrow: "How it works",
    title: "From topic choices to a personal newspaper",
    intro:
      "Daily Paper turns your selected interests into a structured newspaper-style briefing that you can read in the app and receive by email.",
    sections: [
      {
        title: "1. Choose your sections",
        body:
          "Pick broad topics or detailed beats: markets, politics, new in AI, football, cricket, local Canada, culture, horoscopes, and more."
      },
      {
        title: "2. Generate your paper",
        body:
          "Your paper is organized into sections, summaries, source context, and why-it-matters notes so it feels like reading a newspaper, not a feed."
      },
      {
        title: "3. Improve the result",
        body:
          "If a section feels too high-level, you can ask for more detail, more local context, more business analysis, or a more practical tone."
      }
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Start free, then keep your personal paper",
    intro:
      "Daily Paper includes a 15-day free trial. After that, the Plus plan keeps your personalized paper, email delivery, and improvement controls active.",
    sections: [
      {
        title: "$4.99 monthly",
        body:
          "A simple monthly plan for readers who want a personalized daily or weekly paper without committing for a full year."
      },
      {
        title: "$49 annual",
        body:
          "A lower yearly price for readers who know they want Daily Paper as part of their regular reading habit."
      },
      {
        title: "Plus features",
        body:
          "Plus is designed to include deeper newsletter refinement, saved paper history, richer topic controls, and future premium curation options."
      }
    ]
  }
} satisfies Record<InfoPageKind, { eyebrow: string; title: string; intro: string; sections: Array<{ title: string; body: string }> }>;

export function InfoPage({ kind }: InfoPageProps): React.JSX.Element {
  const content = pageContent[kind];

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <a href="/" style={navLinkStyle}>Home</a>
          <a href="/about" style={navLinkStyle}>About</a>
          <a href="/how-it-works" style={navLinkStyle}>How It Works</a>
          <a href="/pricing" style={navLinkStyle}>Pricing</a>
          <a href="/samples" style={navLinkStyle}>Samples</a>
          <a href="/signup" style={navLinkStyle}>Start Trial</a>
        </nav>
        <p style={eyebrowStyle}>{content.eyebrow}</p>
        <h1 style={{ font: DESIGN_TOKENS.typography.h1, margin: "0 0 12px", maxWidth: 860 }}>{content.title}</h1>
        <p style={{ color: DESIGN_TOKENS.colors.textSecondary, maxWidth: 760 }}>{content.intro}</p>
        <section style={gridStyle}>
          {content.sections.map((section) => (
            <article key={section.title} style={cardStyle}>
              <h2 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{section.title}</h2>
              <p style={{ color: DESIGN_TOKENS.colors.textSecondary, margin: 0 }}>{section.body}</p>
            </article>
          ))}
        </section>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <a href="/signup" style={ctaStyle}>Create My Paper</a>
          <a href="/samples" style={secondaryStyle}>View Samples</a>
        </div>
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
  boxSizing: "border-box",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))",
  gap: 14,
  marginTop: 24
};

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 18,
  borderRadius: 14,
  border: "1px solid rgba(34,211,238,0.22)",
  background: "rgba(7,9,18,0.62)"
};

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 999,
  background: `linear-gradient(120deg, ${DESIGN_TOKENS.colors.brandPrimary}, ${DESIGN_TOKENS.colors.brandSecondary})`,
  color: "#07111F",
  textDecoration: "none",
  fontWeight: 900
};

const secondaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 16px",
  borderRadius: 999,
  border: "1px solid rgba(34,211,238,0.34)",
  color: DESIGN_TOKENS.colors.textPrimary,
  background: "rgba(7,9,18,0.74)",
  textDecoration: "none",
  fontWeight: 900
};
