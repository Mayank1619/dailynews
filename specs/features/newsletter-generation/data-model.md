# Data Model - Newsletter Generation

## Entities
- Newsletter: id, userId, date, subject, html, text, articleRefs[], status, generatedAt
- NewsletterSection: newsletterId, topic, orderedArticleRefs[]
- GenerationRun: id, date, generatedCount, skippedCount, fallbackCount, startedAt, finishedAt

## Relationships
- Newsletter.userId -> Firebase Auth uid from preferences owner
- Newsletter.articleRefs[] -> ArticleSummary.id

## Validation
- One generated newsletter per user per day.
- HTML/text outputs both required with unsubscribe controls.
