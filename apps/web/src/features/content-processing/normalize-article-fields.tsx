import React from "react";
import { NormalizeArticleFieldsService } from "../../../../api/src/features/content-processing/normalize-article-fields.service";

const sampleArticles = [
  {
    id: "raw-normalize-1",
    sourceId: "source-a",
    title: "  Local leaders announce transit changes  ",
    url: "https://news.example.com/local/transit?utm_source=feed",
    publishedAt: "2026-05-27T07:55:00-05:00",
    fetchedAt: "2026-05-27T08:01:00Z",
    snippet: null,
    rawHash: "hash-local-transit"
  }
];

export function NormalizeArticleFieldsPanel(): React.JSX.Element {
  const service = new NormalizeArticleFieldsService();
  const result = service.normalize({ rawArticles: sampleArticles });

  return (
    <section data-testid="content-processing-normalize-panel" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Normalize article fields</h2>
      {result.normalizedArticles.map((article) => (
        <dl key={article.id}>
          <dt>Title</dt>
          <dd>{article.title}</dd>
          <dt>Snippet</dt>
          <dd>{article.snippet || ""}</dd>
          <dt>Canonical URL</dt>
          <dd>{article.canonicalUrl}</dd>
        </dl>
      ))}
    </section>
  );
}
