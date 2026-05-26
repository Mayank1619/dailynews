# Contract - Content Processing

## Worker Entry Point
- processRawArticles(runId)

## Input Contract
- Consumes articles_raw collection.

## Output Contract
- Writes articles_processed with dedupGroupId, categories, sources, and pipelineVersion.
