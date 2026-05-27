'use client';

import React from 'react';
import { ArticleRawRecord } from '../../../../api/src/features/content-ingestion/content-ingestion.types';
import { DESIGN_TOKENS } from '../design-system/tokens';
import { DEFAULT_ARTICLE } from './contracts';

export interface PreserveAttributionAndAvoidDuplicatesPanelProps {
  article?: ArticleRawRecord;
  duplicatesSkipped?: number;
}

export function PreserveAttributionAndAvoidDuplicatesPanel({
  article = DEFAULT_ARTICLE,
  duplicatesSkipped = 1,
}: PreserveAttributionAndAvoidDuplicatesPanelProps = {}): React.JSX.Element {
  return (
    <section
      aria-label="attribution and dedupe guard"
      style={{
        background: DESIGN_TOKENS.colors.bgSecondary,
        borderRadius: 20,
        border: '1px solid rgba(15,23,42,0.08)',
        padding: DESIGN_TOKENS.spacing[2],
      }}
      data-testid="content-ingestion-attribution-panel"
    >
      <p style={{ margin: 0, color: DESIGN_TOKENS.colors.brandSecondary, fontWeight: 700 }}>Trust guard</p>
      <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: '6px 0 0' }}>Preserve attribution and avoid duplicates</h2>

      <article
        data-testid="content-ingestion-article-card"
        style={{
          marginTop: DESIGN_TOKENS.spacing[1],
          padding: DESIGN_TOKENS.spacing[1],
          borderRadius: 16,
          border: '1px solid rgba(15,23,42,0.08)',
          background: 'rgba(59,130,246,0.04)',
        }}
      >
        <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{article.title}</h3>
        <div style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: 4 }}>Source: {article.sourceId}</div>
        <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Original URL: {article.url}</div>
        <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Raw hash: {article.rawHash}</div>
        {article.author ? <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Author: {article.author}</div> : null}
      </article>

      <div
        data-testid="content-ingestion-duplicate-counter"
        style={{ marginTop: DESIGN_TOKENS.spacing[1], color: DESIGN_TOKENS.colors.textSecondary }}
      >
        {duplicatesSkipped} duplicate article{duplicatesSkipped === 1 ? '' : 's'} skipped by canonical URL and raw hash checks.
      </div>
    </section>
  );
}