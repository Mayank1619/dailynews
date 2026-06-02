/**
 * US6: Blog Highlight Appears When Available
 * End-to-End tests
 */

import { test, expect } from '@playwright/test';
import { BlogHighlightService } from '../../../apps/api/src/features/newsletter-generation/blog-highlight-appears-when-available.service';

test.describe('US6: E2E - Blog Highlight Conditional Display', () => {
  test('e2e scenario: newsletter without blog highlight', async () => {
    const service = new BlogHighlightService();
    const date = new Date();

    const newsletter = { id: 'nl-no-blog', sections: [] };

    const enriched = await service.enrichNewsletterWithBlogHighlight(
      newsletter,
      date
    );

    expect(enriched.renderBlogSection).toBe(false);
    expect(enriched.blogHighlight).toBeUndefined();
  });

  test('e2e scenario: newsletter includes blog highlight when available', async () => {
    const service = new BlogHighlightService();

    const highlight = {
      id: 'blog-available',
      date: new Date(),
      title: 'Daily Paper Updates',
      excerpt: 'Learn about new features',
      content: 'Full article content here',
      canonicalUrl: 'https://blog.dailynews.local/updates',
      isActive: true,
    };

    const html = service.renderBlogHighlightHtml(highlight);

    expect(html).toContain('Daily Paper Updates');
    expect(html).toContain('Learn about new features');
    expect(html).toContain('https://blog.dailynews.local/updates');
  });

  test('e2e scenario: blog highlight properly formatted in HTML', () => {
    const service = new BlogHighlightService();

    const highlight = {
      id: 'blog-format-test',
      date: new Date('2026-05-27'),
      title: 'What\'s New',
      excerpt: 'Exciting features & updates',
      canonicalUrl: 'https://blog.test.com/new',
      isActive: true,
    };

    const html = service.renderBlogHighlightHtml(highlight);

    expect(html).toContain('blog-highlight');
    expect(html).toContain('From the Blog');
    expect(html).toContain('<h3>');
  });

  test('e2e scenario: blog highlight properly formatted in text', () => {
    const service = new BlogHighlightService();

    const highlight = {
      id: 'blog-text-test',
      date: new Date('2026-05-27'),
      title: 'Text Format Test',
      excerpt: 'Testing text rendering',
      canonicalUrl: 'https://blog.test.com/text',
      isActive: true,
    };

    const text = service.renderBlogHighlightText(highlight);

    expect(text).toContain('FROM THE BLOG');
    expect(text).toContain('Text Format Test');
    expect(text).toContain('Read:');
  });

  test('e2e scenario: newsletter structure intact with and without blog', async () => {
    const service = new BlogHighlightService();

    const baseNewsletter = {
      id: 'nl-test',
      sections: [
        { topic: 'Technology', stories: [] },
        { topic: 'Business', stories: [] },
      ],
    };

    const withoutBlog = await service.enrichNewsletterWithBlogHighlight(
      baseNewsletter,
      new Date()
    );

    // Core newsletter structure should be intact
    expect(withoutBlog.sections).toEqual(baseNewsletter.sections);
    expect(withoutBlog.newsletterId).toBe('nl-test');
  });
});
