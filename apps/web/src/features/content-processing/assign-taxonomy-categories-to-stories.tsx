import React from "react";
import { AssignTaxonomyCategoriesToStoriesService } from "../../../../api/src/features/content-processing/assign-taxonomy-categories-to-stories.service";

const sampleArticles = [
  {
    id: "processed-1",
    dedupGroupId: "grp_tech",
    canonicalUrl: "https://news.example.com/ai-launch",
    title: "AI startup launches new chip",
    snippet: "The tech company announced a new silicon platform.",
    publishedAt: "2026-05-27T08:00:00Z",
    categories: [],
    sources: [{ sourceId: "source-a", url: "https://news.example.com/ai-launch" }],
    processingTimestamp: "2026-05-27T08:10:00Z",
    pipelineVersion: "content-processing-v1.0.0"
  }
];

export function AssignTaxonomyCategoriesToStoriesPanel(): React.JSX.Element {
  const service = new AssignTaxonomyCategoriesToStoriesService();
  const result = service.assignCategories({ articles: sampleArticles });

  return (
    <section data-testid="content-processing-taxonomy-panel" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Assign taxonomy categories</h2>
      <ul>
        {result.articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong> — {article.categories.join(", ") || "needs review"}
          </li>
        ))}
      </ul>
    </section>
  );
}
