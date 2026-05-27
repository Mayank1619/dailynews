"use client";

import React from "react";

interface Props {
  title: string;
  summaryText: string;
  isAiSummary: boolean;
  canonicalUrl: string;
  sourceName: string;
}

export function ReadSummariesThatAreHonestAboutTheirAiOriginCard(props: Props): React.JSX.Element {
  return (
    <article data-testid="ai-curation-origin-card" style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{props.title}</h3>
      {props.isAiSummary ? <span style={{ fontSize: 12, fontWeight: 600 }}>Summary</span> : null}
      <p>{props.summaryText}</p>
      <a href={props.canonicalUrl}>{props.sourceName}</a>
    </article>
  );
}
