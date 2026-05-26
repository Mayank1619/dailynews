# Data Model - Content Ingestion

## Entities
- Source: id, name, type, url, enabled, categoryHint?, createdAt
- ArticleRaw: id, sourceId, title, url, publishedAt, author?, snippet?, fetchedAt, rawHash
- IngestionRun: id, startedAt, finishedAt, successCount, failureCount, skippedDuplicates, sourceOutcomes[]

## Relationships
- ArticleRaw.sourceId -> Source.id
- IngestionRun.sourceOutcomes[].sourceId -> Source.id

## Validation
- Deduplicate by canonical URL and rawHash.
- Disabled sources are skipped.
