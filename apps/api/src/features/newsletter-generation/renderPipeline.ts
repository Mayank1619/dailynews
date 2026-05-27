/**
 * Newsletter Render Pipeline
 * Handles HTML and text rendering with sanitization
 */

import DOMPurify from 'isomorphic-dompurify';
import {
  NewsletterRenderContext,
  NewsletterOutput,
  DEFAULT_HTML_TEMPLATE,
  DEFAULT_TEXT_TEMPLATE,
  TEMPLATE_SECTION_HTML,
  TEMPLATE_STORY_HTML,
  TEMPLATE_STORY_TEXT,
  TEMPLATE_BLOG_HIGHLIGHT_HTML,
  TEMPLATE_BLOG_HIGHLIGHT_TEXT,
  AI_SUMMARY_LABEL,
  AI_SUMMARY_LABEL_TEXT,
} from './templateContracts';

/**
 * Sanitize user-provided content to prevent XSS
 */
export function sanitizeContent(content: string): string {
  // Simple HTML escape sanitization without external dependency
  const div = { innerHTML: content } as any;
  return div.innerHTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize URLs to prevent javascript: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Render single story as HTML
 */
export function renderStoryHtml(story: any): string {
  let html = TEMPLATE_STORY_HTML;
  
  html = html.replace('{{ title }}', sanitizeContent(story.title));
  html = html.replace('{{ aiLabel }}', story.isAISummary ? ' ' + AI_SUMMARY_LABEL : '');
  html = html.replace('{{ source }}', sanitizeContent(story.source));
  html = html.replace('{{ publicationDate }}', formatDate(new Date(story.publicationDate)));
  html = html.replace('{{ snippet }}', sanitizeContent(story.snippet));
  html = html.replace('{{ url }}', sanitizeUrl(story.canonicalUrl));
  
  return html;
}

/**
 * Render single story as plain text
 */
export function renderStoryText(story: any): string {
  let text = TEMPLATE_STORY_TEXT;
  
  text = text.replace('{{ title }}', story.title);
  text = text.replace('{{ aiLabel }}', story.isAISummary ? ' ' + AI_SUMMARY_LABEL_TEXT : '');
  text = text.replace('{{ source }}', story.source);
  text = text.replace('{{ publicationDate }}', formatDate(new Date(story.publicationDate)));
  text = text.replace('{{ snippet }}', story.snippet);
  text = text.replace('{{ url }}', sanitizeUrl(story.canonicalUrl));
  
  return text;
}

/**
 * Render topic section as HTML
 */
export function renderSectionHtml(topic: string, stories: any[]): string {
  const storiesHtml = stories.map(renderStoryHtml).join('');
  
  let html = TEMPLATE_SECTION_HTML;
  html = html.replace('{{ topic }}', sanitizeContent(topic));
  html = html.replace('{{ stories }}', storiesHtml);
  
  return html;
}

/**
 * Render topic section as plain text
 */
export function renderSectionText(topic: string, stories: any[]): string {
  const storiesText = stories.map(renderStoryText).join('');
  
  return `\n${topic.toUpperCase()}\n${'='.repeat(topic.length)}\n\n${storiesText}`;
}

/**
 * Render blog highlight as HTML
 */
export function renderBlogHighlightHtml(highlight: any): string {
  let html = TEMPLATE_BLOG_HIGHLIGHT_HTML;
  
  html = html.replace('{{ blogTitle }}', sanitizeContent(highlight.title));
  html = html.replace('{{ blogExcerpt }}', sanitizeContent(highlight.excerpt));
  html = html.replace('{{ blogUrl }}', sanitizeUrl(highlight.url));
  
  return html;
}

/**
 * Render blog highlight as plain text
 */
export function renderBlogHighlightText(highlight: any): string {
  let text = TEMPLATE_BLOG_HIGHLIGHT_TEXT;
  
  text = text.replace('{{ blogTitle }}', highlight.title);
  text = text.replace('{{ blogExcerpt }}', highlight.excerpt);
  text = text.replace('{{ blogUrl }}', sanitizeUrl(highlight.url));
  
  return text;
}

/**
 * Render full newsletter
 */
export function renderNewsletter(context: NewsletterRenderContext): NewsletterOutput {
  // Render sections
  const sectionsHtml = context.sections
    .map(section => renderSectionHtml(section.topic, section.stories))
    .join('');
  
  const sectionsText = context.sections
    .map(section => renderSectionText(section.topic, section.stories))
    .join('\n');
  
  // Render blog highlight
  let blogHighlightHtml = '';
  let blogHighlightText = '';
  if (context.blogHighlight) {
    blogHighlightHtml = renderBlogHighlightHtml(context.blogHighlight);
    blogHighlightText = renderBlogHighlightText(context.blogHighlight);
  }
  
  // Final HTML
  let html = DEFAULT_HTML_TEMPLATE;
  html = html.replace('{{ subject }}', sanitizeContent(context.subject));
  html = html.replace('{{ date }}', formatDate(context.date));
  html = html.replace('{{ sections }}', sectionsHtml);
  html = html.replace('{{ blogHighlight }}', blogHighlightHtml);
  html = html.replace('{{ preferencesUrl }}', sanitizeUrl(context.preferencesUrl));
  html = html.replace('{{ unsubscribeUrl }}', sanitizeUrl(context.unsubscribeUrl));
  
  // Final text
  let text = DEFAULT_TEXT_TEMPLATE;
  text = text.replace('{{ subject }}', context.subject);
  text = text.replace('{{ date }}', formatDate(context.date));
  text = text.replace('{{ sections }}', sectionsText);
  text = text.replace('{{ blogHighlight }}', blogHighlightText);
  text = text.replace('{{ preferencesUrl }}', sanitizeUrl(context.preferencesUrl));
  text = text.replace('{{ unsubscribeUrl }}', sanitizeUrl(context.unsubscribeUrl));
  
  // Collect article refs
  const articleRefs = context.sections
    .flatMap(section => section.stories.map(story => story.id))
    .concat(context.blogHighlight ? ['blog-' + context.date.toISOString().split('T')[0]] : []);
  
  return {
    html: html.trim(),
    text: text.trim(),
    subject: context.subject,
    articleRefs,
  };
}
