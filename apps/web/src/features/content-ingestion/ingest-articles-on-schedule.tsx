'use client';

import React from 'react';
import { IngestionRunRecord } from '../../../../api/src/features/content-ingestion/content-ingestion.types';
import { DESIGN_TOKENS } from '../design-system/tokens';
import { CONTENT_INGESTION_CADENCE, DEFAULT_INGESTION_RUN } from './contracts';

export interface IngestArticlesOnSchedulePanelProps {
  run?: IngestionRunRecord;
}

export function IngestArticlesOnSchedulePanel({ run = DEFAULT_INGESTION_RUN }: IngestArticlesOnSchedulePanelProps = {}): React.JSX.Element {
  return (
    <section
      aria-label="scheduled ingestion run"
      style={{
        background: DESIGN_TOKENS.colors.bgSecondary,
        borderRadius: 20,
        border: '1px solid rgba(15,23,42,0.08)',
        padding: DESIGN_TOKENS.spacing[2],
      }}
      data-testid="content-ingestion-run-panel"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: DESIGN_TOKENS.spacing[1], flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: DESIGN_TOKENS.colors.brandSecondary, fontWeight: 700 }}>Worker orchestration</p>
          <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: '6px 0 0' }}>Scheduled ingestion run</h2>
        </div>
        <div style={{ textAlign: 'right', color: DESIGN_TOKENS.colors.textSecondary }}>
          <div>{CONTENT_INGESTION_CADENCE}</div>
          <div data-testid="ingestion-run-counts">
            {run.successCount} stored · {run.failureCount} failures · {run.skippedDuplicates} duplicates skipped
          </div>
        </div>
      </div>

      <p style={{ color: DESIGN_TOKENS.colors.textSecondary, marginTop: DESIGN_TOKENS.spacing[1] }}>
        Run {run.id} started at {run.startedAt.toISOString()} and finished at {run.finishedAt.toISOString()}.
      </p>

      <div style={{ display: 'grid', gap: DESIGN_TOKENS.spacing[1], marginTop: DESIGN_TOKENS.spacing[1] }}>
        {run.sourceOutcomes.map((outcome) => (
          <article
            key={`${outcome.sourceId}-${outcome.finishedAt.toISOString()}`}
            data-testid="content-ingestion-source-outcome"
            style={{
              borderRadius: 16,
              padding: DESIGN_TOKENS.spacing[1],
              border: '1px solid rgba(15,23,42,0.08)',
              background:
                outcome.status === 'success'
                  ? 'rgba(22,163,74,0.05)'
                  : outcome.status === 'failure'
                    ? 'rgba(220,38,38,0.05)'
                    : 'rgba(245,158,11,0.05)',
            }}
          >
            <strong>{outcome.sourceName}</strong>
            <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>
              {outcome.status} · stored {outcome.storedCount} · duplicates {outcome.duplicateCount} · fetched {outcome.fetchedCount}
            </div>
            {outcome.reason ? <div style={{ color: DESIGN_TOKENS.colors.textSecondary }}>Reason: {outcome.reason}</div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}