'use client';

import React, { useMemo, useState } from 'react';
import { ContentSourceRecord } from '../../../../api/src/features/content-ingestion/content-ingestion.types';
import { DESIGN_TOKENS } from '../design-system/tokens';
import { CONTENT_INGESTION_CADENCE, CONTENT_INGESTION_ROUTE, DEFAULT_SOURCES, SOURCE_STATUS_LABELS } from './contracts';

export interface ManageApprovedSourcesPanelProps {
  sources?: ContentSourceRecord[];
  onToggleSource?: (sourceId: string, enabled: boolean) => void;
}

export function ManageApprovedSourcesPanel({ sources = DEFAULT_SOURCES, onToggleSource = () => undefined }: ManageApprovedSourcesPanelProps = {}): React.JSX.Element {
  const [currentSources, setCurrentSources] = useState(sources);

  const summary = useMemo(() => {
    const enabled = currentSources.filter((source) => source.enabled).length;
    return {
      enabled,
      disabled: currentSources.length - enabled,
    };
  }, [currentSources]);

  const toggleSource = (sourceId: string) => {
    setCurrentSources((previous) =>
      previous.map((source) => {
        if (source.id !== sourceId) {
          return source;
        }

        const nextEnabled = !source.enabled;
        onToggleSource(sourceId, nextEnabled);
        return { ...source, enabled: nextEnabled };
      }),
    );
  };

  return (
    <section
      aria-label="approved ingestion sources"
      style={{
        background: DESIGN_TOKENS.colors.bgSecondary,
        borderRadius: 20,
        border: '1px solid rgba(15,23,42,0.08)',
        padding: DESIGN_TOKENS.spacing[2],
        boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
      }}
      data-testid="content-ingestion-source-panel"
      data-route={CONTENT_INGESTION_ROUTE}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: DESIGN_TOKENS.spacing[1], flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: DESIGN_TOKENS.colors.brandSecondary, fontWeight: 700 }}>Content ingestion</p>
          <h2 style={{ font: DESIGN_TOKENS.typography.h2, margin: '6px 0 0' }}>Approved ingestion sources</h2>
        </div>
        <div data-testid="content-ingestion-cadence" style={{ textAlign: 'right', color: DESIGN_TOKENS.colors.textSecondary }}>
          <div>{CONTENT_INGESTION_CADENCE}</div>
          <div>
            {summary.enabled} enabled · {summary.disabled} disabled
          </div>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: `${DESIGN_TOKENS.spacing[1]}px 0 0`, display: 'grid', gap: DESIGN_TOKENS.spacing[1] }}>
        {currentSources.map((source) => (
          <li
            key={source.id}
            data-testid="content-ingestion-source-row"
            style={{
              padding: DESIGN_TOKENS.spacing[1],
              borderRadius: 16,
              border: '1px solid rgba(15,23,42,0.08)',
              background: source.enabled ? 'rgba(22,163,74,0.05)' : 'rgba(248,113,113,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: DESIGN_TOKENS.spacing[1], alignItems: 'center' }}>
              <div>
                <h3 style={{ font: DESIGN_TOKENS.typography.h3, margin: 0 }}>{source.name}</h3>
                <p style={{ margin: '4px 0 0', color: DESIGN_TOKENS.colors.textSecondary }}>
                  {source.type} · {source.url}
                </p>
                <p style={{ margin: '4px 0 0', color: DESIGN_TOKENS.colors.textSecondary }}>
                  {source.enabled ? SOURCE_STATUS_LABELS.enabled : SOURCE_STATUS_LABELS.disabled}
                  {source.lastFetchedAt ? ` · last fetched ${source.lastFetchedAt.toISOString()}` : ''}
                </p>
              </div>
              <button
                type="button"
                data-testid={`toggle-source-${source.id}`}
                onClick={() => toggleSource(source.id)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 16px',
                  color: DESIGN_TOKENS.colors.bgSecondary,
                  background: source.enabled ? DESIGN_TOKENS.colors.error : DESIGN_TOKENS.colors.success,
                  fontWeight: 700,
                }}
              >
                {source.enabled ? 'Disable source' : 'Enable source'}
              </button>
            </div>
            <div style={{ marginTop: 8, color: DESIGN_TOKENS.colors.textSecondary }}>
              {source.categoryHint ? `Category hint: ${source.categoryHint}` : 'No category hint provided'}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}