/**
 * US6: Blog Highlight Appears When Available
 * Unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlogHighlightService } from '../../../apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.service';

describe('US6: Blog Highlight Appears When Available - Unit Tests', () => {
  let service: BlogHighlightService;

  beforeEach(() => {
    service = new BlogHighlightService();
  });

  it('should check blog highlight availability', async () => {
    const response = await service.checkBlogHighlightAvailable(new Date());

    expect(response).toHaveProperty('found');
    expect(response).toHaveProperty('checkedAt');
  });

  it('should return response when no highlight available', async () => {
    const response = await service.checkBlogHighlightAvailable(new Date());

    expect(response.found).toBe(false);
  });

  it('should enrich newsletter without modifying structure', async () => {
    const newsletter = {
      id: 'nl-test',
      sections: [],
    };

    const enriched = await service.enrichNewsletterWithBlogHighlight(
      newsletter,
      new Date()
    );

    expect(enriched.newsletterId).toBe('nl-test');
    expect(enriched.sections).toEqual([]);
    expect(enriched.renderBlogSection).toBe(false);
  });

  it('should render blog highlight as HTML', () => {
    const highlight = {
      id: 'blog-1',
      date: new Date(),
      title: 'New Features',
      excerpt: 'We released new features today',
      canonicalUrl: 'https://blog.dailynews.local/new-features',
      isActive: true,
    };

    const html = service.renderBlogHighlightHtml(highlight);

    expect(html).toContain('blog-highlight');
    expect(html).toContain('New Features');
    expect(html).toContain('We released new features today');
    expect(html).toContain('https://blog.dailynews.local/new-features');
  });

  it('should render blog highlight as text', () => {
    const highlight = {
      id: 'blog-1',
      date: new Date(),
      title: 'New Features',
      excerpt: 'We released new features today',
      canonicalUrl: 'https://blog.dailynews.local/new-features',
      isActive: true,
    };

    const text = service.renderBlogHighlightText(highlight);

    expect(text).toContain('FROM THE BLOG');
    expect(text).toContain('New Features');
    expect(text).toContain('https://blog.dailynews.local/new-features');
  });

  it('should escape HTML in blog highlight', () => {
    const highlight = {
      id: 'blog-1',
      date: new Date(),
      title: '<script>alert("xss")</script>',
      excerpt: 'Normal text with & ampersand',
      canonicalUrl: 'https://blog.dailynews.local/test',
      isActive: true,
    };

    const html = service.renderBlogHighlightHtml(highlight);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script');
    expect(html).toContain('&amp;');
  });
});
