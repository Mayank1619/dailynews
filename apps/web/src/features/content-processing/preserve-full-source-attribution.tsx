import React from "react";
import { PreserveFullSourceAttributionService } from "../../../../api/src/features/content-processing/preserve-full-source-attribution.service";

const sampleArticles = [
  {
    id: "raw-attr-1",
    sourceId: "source-a",
    title: "Sports final ends in dramatic finish",
    url: "https://news.example.com/sports/final",
    publishedAt: "2026-05-27T08:00:00Z",
    fetchedAt: "2026-05-27T08:02:00Z",
    snippet: "The championship game was decided late.",
    rawHash: "hash-sports-1"
  },
  {
    id: "raw-attr-2",
    sourceId: "source-b",
    title: "Dramatic finish decides sports final",
    url: "https://news.example.com/sports/final/",
    publishedAt: "2026-05-27T08:04:00Z",
    fetchedAt: "2026-05-27T08:06:00Z",
    snippet: "The same result was reported from another source.",
    rawHash: "hash-sports-2"
  }
];

export function PreserveFullSourceAttributionPanel(): React.JSX.Element {
  const service = new PreserveFullSourceAttributionService();
  const result = service.preserve({ rawArticles: sampleArticles });

  return (
    <section data-testid="content-processing-attribution-panel" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Preserve full source attribution</h2>
      <ul>
        {result.processedArticles.map((article) => (
          <li key={article.id}>
            {article.sources.map((source) => source.sourceId).join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
