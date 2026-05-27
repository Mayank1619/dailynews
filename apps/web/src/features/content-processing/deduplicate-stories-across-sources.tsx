import React from "react";
import { DeduplicateStoriesAcrossSourcesService } from "../../../../api/src/features/content-processing/deduplicate-stories-across-sources.service";

const sampleArticles = [
  {
    id: "raw-1",
    sourceId: "source-a",
    title: "Central bank warns of inflation risks",
    url: "https://news.example.com/story/123?ref=home",
    publishedAt: "2026-05-27T08:00:00Z",
    fetchedAt: "2026-05-27T08:05:00Z",
    snippet: "Officials said price pressures may persist.",
    rawHash: "hash-central-bank"
  },
  {
    id: "raw-2",
    sourceId: "source-b",
    title: "Inflation risks warned by central bank",
    url: "https://news.example.com/story/123/",
    publishedAt: "2026-05-27T08:02:00Z",
    fetchedAt: "2026-05-27T08:07:00Z",
    snippet: "The same story from another desk.",
    rawHash: "hash-central-bank-2"
  }
];

export function DeduplicateStoriesAcrossSourcesPanel(): React.JSX.Element {
  const service = new DeduplicateStoriesAcrossSourcesService();
  const result = service.deduplicate({ rawArticles: sampleArticles });

  return (
    <section data-testid="content-processing-dedup-panel" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Deduplicate stories across sources</h2>
      <p>Processed stories: {result.processedArticles.length}</p>
      <ul>
        {result.processedArticles.map((article) => (
          <li key={article.id}>
            <strong>{article.title || "Untitled"}</strong> — {article.sources.length} sources
          </li>
        ))}
      </ul>
    </section>
  );
}
