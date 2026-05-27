/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * Service implementation
 */

import { renderNewsletter } from './renderPipeline';
import { telemetryService } from './telemetry';
import { NewsletterRenderContext } from './templateContracts';
import type {
  PersonalizedDailyPaperRequest,
  PersonalizedDailyPaperResponse,
  Newsletter,
  ArticleSummary,
  UserPreferences,
} from './receive-a-personalized-daily-paper-in-my-inbox.types';

export class PersonalizedDailyPaperService {
  /**
   * Fetch article summaries for user's topics
   * In production, query from Firestore
   */
  async fetchArticleSummariesForTopics(
    topics: string[],
    date: Date
  ): Promise<ArticleSummary[]> {
    // Mock implementation - in production, query Firestore
    return [];
  }

  /**
   * Fetch user preferences
   * In production, query from Firestore
   */
  async fetchUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Mock implementation - in production, query Firestore
    return null;
  }

  /**
   * Generate personalized newsletter for user
   */
  async generatePersonalizedNewsletter(
    request: PersonalizedDailyPaperRequest
  ): Promise<Newsletter> {
    const startTime = Date.now();
    const newsletterId = `nl-${request.userId}-${request.date.toISOString().split('T')[0]}`;

    try {
      // Fetch articles for topics
      const articles = await this.fetchArticleSummariesForTopics(
        request.preferences.topics,
        request.date
      );

      if (articles.length === 0) {
        throw new Error('No articles available for topics');
      }

      // Group by topic
      const sections = this.groupArticlesByTopic(articles, request.preferences.topics);

      // Prepare render context
      const context: NewsletterRenderContext = {
        userId: request.userId,
        date: request.date,
        subject: this.generateSubject(request.date),
        sections,
        unsubscribeUrl: `https://app.dailynews.local/unsubscribe/${request.userId}`,
        preferencesUrl: `https://app.dailynews.local/preferences/${request.userId}`,
      };

      // Render newsletter
      const output = renderNewsletter(context);

      // Record telemetry
      const generationTimeMs = Date.now() - startTime;
      telemetryService.recordSuccess(request.userId, request.date, generationTimeMs);

      // Return newsletter
      return {
        id: newsletterId,
        userId: request.userId,
        date: request.date,
        subject: output.subject,
        html: output.html,
        text: output.text,
        articleRefs: output.articleRefs,
        status: 'generated',
        generatedAt: new Date(),
      };
    } catch (error) {
      telemetryService.recordFailure(
        error instanceof Error ? error.message : 'Unknown error',
        request.date
      );
      throw error;
    }
  }

  /**
   * Group articles by topic
   */
  private groupArticlesByTopic(articles: ArticleSummary[], topics: string[]) {
    const sections = topics
      .map(topic => ({
        topic,
        stories: articles
          .filter(a => a.topic === topic)
          .sort((a, b) => a.ranking - b.ranking)
          .map(a => ({
            id: a.id,
            title: a.title,
            snippet: a.snippet,
            source: a.source,
            canonicalUrl: a.canonicalUrl,
            publicationDate: a.publicationDate,
            isAISummary: !a.fallbackApplied,
          }))
          .slice(0, 5), // Top 5 per topic
      }))
      .filter(s => s.stories.length > 0);

    return sections;
  }

  /**
   * Generate newsletter subject
   */
  private generateSubject(date: Date): string {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `Daily News - ${dateStr}`;
  }
}

export const personalizedDailyPaperService = new PersonalizedDailyPaperService();
