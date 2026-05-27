"use client";

import React, { useEffect, useState } from "react";
import { ReceiveARankedSummarizedDigestOfRelevantStoriesService } from "../../../../api/src/features/ai-curation/receive-a-ranked-summarized-digest-of-relevant-stories.service";
import type { ArticleSummaryRecord, ProcessedArticle } from "../../../../api/src/features/ai-curation/contracts";

const sampleArticles: ProcessedArticle[] = [
  {
    id: "curation-ui-1",
    dedupGroupId: "dg-tech-1",
    title: "Tech stocks close higher as AI spending rises",
    snippet: "Analysts pointed to semiconductor demand and cloud growth.",
    canonicalUrl: "https://news.example.com/markets/tech-stocks",
    sourceName: "Market Desk",
    publishedAt: "2026-05-27T09:00:00.000Z",
    categories: ["markets", "tech"]
  }
];

export function ReceiveARankedSummarizedDigestPanel(): React.JSX.Element {
  const [items, setItems] = useState<ArticleSummaryRecord[]>([]);

  useEffect(() => {
    const service = new ReceiveARankedSummarizedDigestOfRelevantStoriesService();

    service
      .curate({
        articles: sampleArticles,
        preference: { userId: "ui-user", topics: ["tech", "markets"] },
        perCategoryLimit: 3
      })
      .then((result) => setItems(result.items));
  }, []);

  return (
    <section data-testid="ai-curation-ranked-digest-panel" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Ranked summaries</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <div>{item.summaryText}</div>
            <a href={item.source.canonicalUrl}>{item.source.sourceName}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
