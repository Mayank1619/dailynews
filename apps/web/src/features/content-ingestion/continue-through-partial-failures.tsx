'use client';

import React from 'react';
import { IngestionRunRecord } from '../../../../api/src/features/content-ingestion/content-ingestion.types';
import { DESIGN_TOKENS } from '../design-system/tokens';
import { DEFAULT_INGESTION_RUN } from './contracts';

export interface ContinueThroughPartialFailuresPanelProps {
  run?: IngestionRunRecord;
}

export function ContinueThroughPartialFailuresPanel({ run = DEFAULT_INGESTION_RUN }: ContinueThroughPartialFailuresPanelProps = {}): React.JSX.Element {
  const failedSources = run.sourceOutcomes.filter((outcome) => outcome.status === 'failure').length;

  return (
    <section
      aria-label="partial failure resilience"
      style={{
        background: DESIGN_TOKENS.colors.bgSecondary,
        borderRadius: 20,
        border: '1px solid rgba(15,23,42,0.08)',
        padding: DESIGN_TOKENS.spacing[2],
      }}
      data-testid="content-ingestion-partial-failure-panel"
    >
      <p style={{ margin: 0, color: DESIGN_TOKENS.colors.brandSecondary, fontWeight: 700 }}>Resilience posture</p>
      <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: '6px 0 0' }}>Continue through partial failures</h2>

      <div style={{ marginTop: DESIGN_TOKENS.spacing[1], color: DESIGN_TOKENS.colors.textSecondary }} data-testid="content-ingestion-failure-summary">
        {failedSources} sources failed, but the remaining enabled sources still completed ingestion.
      </div>

      <div style={{ display: 'grid', gap: DESIGN_TOKENS.spacing[1], marginTop: DESIGN_TOKENS.spacing[1] }}>
        {run.sourceOutcomes.map((outcome) => (
          <article
            key={`${outcome.sourceId}-${outcome.finishedAt.toISOString()}`}
            data-testid="content-ingestion-failure-row"
            style={{
              borderRadius: 16,
              padding: DESIGN_TOKENS.spacing[1],
              border: '1px solid rgba(15,23,42,0.08)',
              background:
                outcome.status === 'failure'
                  ? 'rgba(220,38,38,0.05)'
                  : outcome.status === 'success'
                    ? 'rgba(22,163,74,0.05)'
                    : 'rgba(245,158,11,0.05)',
            }}
          >
            <strong>{outcome.sourceName}</strong>
            <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
              {outcome.status} · {outcome.reason ?? 'processed normally'}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}