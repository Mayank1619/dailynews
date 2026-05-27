/**
 * US6: Blog Highlight Appears When Available
 * Service implementation
 */

import type {
  BlogHighlight,
  BlogHighlightRequest,
  BlogHighlightResponse,
  NewsletterWithBlogHighlight,
} from './blog-highlight-appears-when-available.types';

export class BlogHighlightService {
  /**
   * Fetch blog highlight for date
   * In production, query from Firestore or CMS
   */
  async fetchBlogHighlight(request: BlogHighlightRequest): Promise<BlogHighlight | null> {
    // Mock implementation - in production, query from Firestore
    return null;
  }

  /**
   * Check if blog highlight is available
   */
  async checkBlogHighlightAvailable(
    date: Date
  ): Promise<BlogHighlightResponse> {
    try {
      const highlight = await this.fetchBlogHighlight({ date });

      if (!highlight || !highlight.isActive) {
        return {
          found: false,
          checkedAt: new Date(),
        };
      }

      return {
        found: true,
        highlight,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        found: false,
        checkedAt: new Date(),
      };
    }
  }

  /**
   * Add blog highlight to newsletter if available
   */
  async enrichNewsletterWithBlogHighlight(
    newsletter: any,
    date: Date
  ): Promise<NewsletterWithBlogHighlight> {
    const response = await this.checkBlogHighlightAvailable(date);

    const enriched: NewsletterWithBlogHighlight = {
      newsletterId: newsletter.id,
      sections: newsletter.sections,
      renderBlogSection: false,
    };

    if (response.found && response.highlight) {
      enriched.blogHighlight = {
        title: response.highlight.title,
        excerpt: response.highlight.excerpt || response.highlight.content || '',
        url: response.highlight.canonicalUrl,
      };
      enriched.renderBlogSection = true;
    }

    return enriched;
  }

  /**
   * Render blog highlight section as HTML
   */
  renderBlogHighlightHtml(highlight: BlogHighlight): string {
    return `
      <div class="blog-highlight">
        <h2>From the Blog</h2>
        <h3>${this.escapeHtml(highlight.title)}</h3>
        <p>${this.escapeHtml(highlight.excerpt)}</p>
        <a href="${this.escapeHtml(highlight.canonicalUrl)}">Read the full post →</a>
      </div>
    `;
  }

  /**
   * Render blog highlight section as text
   */
  renderBlogHighlightText(highlight: BlogHighlight): string {
    return `
FROM THE BLOG

${highlight.title}
${highlight.excerpt}

Read: ${highlight.canonicalUrl}
`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}

export const blogHighlightService = new BlogHighlightService();
