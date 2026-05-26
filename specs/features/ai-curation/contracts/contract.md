# Contract - AI Curation

## Worker Entry Point
- curateSummaries(processedBatchId, userTopicSet)

## Input Contract
- Reads articles_processed and preferences topic sets.

## Output Contract
- Writes article_summaries with attribution, fallbackApplied, and modelInfo fields.
