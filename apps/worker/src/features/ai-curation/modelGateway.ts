import type { ModelGateway, ModelSummaryResponse, ProcessedArticleInput } from "./interfaces";

export interface ModelGatewayOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  cache?: Map<string, ModelSummaryResponse>;
}

export type InvokeModel = (article: ProcessedArticleInput) => Promise<ModelSummaryResponse>;

export class RetryableModelGateway implements ModelGateway {
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor(
    private readonly invokeModel: InvokeModel,
    private readonly options: ModelGatewayOptions = {}
  ) {
    this.maxRetries = options.maxRetries ?? 2;
    this.baseDelayMs = options.baseDelayMs ?? 50;
  }

  async summarizeArticle(article: ProcessedArticleInput): Promise<ModelSummaryResponse> {
    const cached = this.options.cache?.get(article.id);

    if (cached) {
      return cached;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const response = await this.invokeModel(article);

        if (!response.summaryText && response.bulletPoints.length === 0) {
          throw new Error("Empty model response");
        }

        this.options.cache?.set(article.id, response);
        return response;
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          await delay(this.baseDelayMs * 2 ** attempt);
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Model invocation failed");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
