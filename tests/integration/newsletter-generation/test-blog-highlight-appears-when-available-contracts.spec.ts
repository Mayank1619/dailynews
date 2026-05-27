/**
 * US6: Blog Highlight Appears When Available
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlogHighlightService } from '../../../apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.service';

describe('US6: Integration - Blog Highlight Contract', () => {
  let service: BlogHighlightService;

  beforeEach(() => {
    service = new BlogHighlightService();
  });

  it('should check for blog highlight availability', async () => {
    const response = await service.checkBlogHighlightAvailable(new Date());

    expect(response).toHaveProperty('found');
    expect(response).toHaveProperty('checkedAt');
    expect(typeof response.found).toBe('boolean');
  });

  it('should not break newsletter without blog content', async () => {
    const newsletter = { id: 'nl-1', sections: [] };
    const enriched = await service.enrichNewsletterWithBlogHighlight(
      newsletter,
      new Date()
    );

    expect(enriched.renderBlogSection).toBe(false);
    expect(enriched.blogHighlight).toBeUndefined();
  });

  it('should render optional blog section when available', () => {
    const highlight = {
      id: 'blog-test',
      date: new Date(),
      title: 'Test Post',
      excerpt: 'Test excerpt',
      canonicalUrl: 'https://blog.test.com/post',
      isActive: true,
    };

    const html = service.renderBlogHighlightHtml(highlight);
    const text = service.renderBlogHighlightText(highlight);

    expect(html).toContain('Test Post');
    expect(text).toContain('Test Post');
    expect(html).toContain('https://blog.test.com/post');
    expect(text).toContain('https://blog.test.com/post');
  });

  it('should safely handle missing blog content', async () => {
    const response = await service.checkBlogHighlightAvailable(new Date());

    // Should gracefully handle when no highlight exists
    if (!response.found) {
      expect(response.highlight).toBeUndefined();
    }
  });
});
