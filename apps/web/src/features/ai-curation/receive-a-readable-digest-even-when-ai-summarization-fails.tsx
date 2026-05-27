"use client";

import React from "react";

interface Props {
  title: string;
  snippet: string;
  canonicalUrl: string;
  sourceName: string;
}

export function ReceiveAReadableDigestEvenWhenAiSummarizationFailsCard(props: Props): React.JSX.Element {
  return (
    <article data-testid="ai-curation-fallback-card" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      <p>{props.snippet}</p>
      <a href={props.canonicalUrl}>{props.sourceName}</a>
    </article>
  );
}
