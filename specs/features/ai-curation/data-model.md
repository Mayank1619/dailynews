# Data Model - AI Curation

## Entities
- ArticleSummary: id, processedArticleId, userTopicSet, summaryText, bullets, sourceName, canonicalUrl, fallbackApplied, modelInfo, rankedScore, createdAt
- ModelInfo: modelName, modelVersion, invokedAt

## Relationships
- ArticleSummary.processedArticleId -> articles_processed.id
- ArticleSummary.userTopicSet -> preferences.topics[]

## Validation
- Summary content may only use title/snippet/source metadata from processed input.
- Source attribution fields are mandatory.
