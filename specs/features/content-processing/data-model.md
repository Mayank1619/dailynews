# Data Model - Content Processing

## Entities
- ArticleProcessed: id, dedupGroupId, title, snippet, canonicalUrl, publishedAt, categories[], sources[], processingTimestamp, pipelineVersion
- DedupGroup: dedupGroupId, canonicalUrl, memberRawIds[]
- ProcessingRun: id, batchSize, newCount, updatedCount, failureCount, pipelineVersion, startedAt, finishedAt

## Relationships
- ArticleProcessed.sources[].sourceId -> Source.id
- DedupGroup.memberRawIds[] -> ArticleRaw.id

## Validation
- Deterministic dedup and category assignment.
- Reprocessing updates existing records in place.
