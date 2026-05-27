/**
 * Newsletter Template Contracts
 * Defines templates and rendering contracts for newsletter generation
 */

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

export interface StoryBlock {
  id: string;
  title: string;
  snippet: string;
  source: string;
  canonicalUrl: string;
  publicationDate: Date;
  isAISummary: boolean;
}

export interface TopicSection {
  topic: string;
  stories: StoryBlock[];
}

export interface NewsletterRenderContext {
  userId: string;
  date: Date;
  subject: string;
  sections: TopicSection[];
  blogHighlight?: {
    title: string;
    excerpt: string;
    url: string;
  };
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export interface NewsletterOutput {
  html: string;
  text: string;
  subject: string;
  articleRefs: string[];
}

// Default templates
export const DEFAULT_HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ subject }}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; border-left: 4px solid #000; padding-left: 10px; }
    .story { margin-bottom: 20px; }
    .story-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .story-meta { font-size: 12px; color: #666; margin-bottom: 8px; }
    .story-snippet { font-size: 14px; line-height: 1.6; margin-bottom: 8px; }
    .ai-badge { display: inline-block; background-color: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; margin-left: 8px; }
    .source-link { display: inline-block; margin-top: 8px; }
    .source-link a { color: #0066cc; text-decoration: none; font-size: 12px; }
    .blog-highlight { background-color: #f9f9f9; padding: 15px; margin-bottom: 30px; border-radius: 4px; }
    .footer { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
    .footer-links { margin: 10px 0; }
    .footer-links a { color: #0066cc; text-decoration: none; margin-right: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Daily News</h1>
      <p>{{ date }}</p>
    </div>
    
    {{ sections }}
    
    {{ blogHighlight }}
    
    <div class="footer">
      <div class="footer-links">
        <a href="{{ preferencesUrl }}">Update Preferences</a>
        <a href="{{ unsubscribeUrl }}">Unsubscribe</a>
      </div>
      <p>You received this email because you subscribed to Daily News newsletter.</p>
    </div>
  </div>
</body>
</html>
`;

export const DEFAULT_TEXT_TEMPLATE = `
DAILY NEWS - {{ date }}
{{ subject }}

{{ sections }}

{{ blogHighlight }}

---

Update Preferences: {{ preferencesUrl }}
Unsubscribe: {{ unsubscribeUrl }}

You received this email because you subscribed to Daily News newsletter.
`;

export const TEMPLATE_SECTION_HTML = `
<div class="section">
  <h2 class="section-title">{{ topic }}</h2>
  {{ stories }}
</div>
`;

export const TEMPLATE_STORY_HTML = `
<div class="story">
  <h3 class="story-title">{{ title }}{{ aiLabel }}</h3>
  <div class="story-meta">
    {{ source }} - {{ publicationDate }}
  </div>
  <p class="story-snippet">{{ snippet }}</p>
  <div class="source-link">
    <a href="{{ url }}">Read full article →</a>
  </div>
</div>
`;

export const TEMPLATE_STORY_TEXT = `
{{ title }}{{ aiLabel }}
{{ source }} - {{ publicationDate }}
{{ snippet }}
Read: {{ url }}

`;

export const TEMPLATE_BLOG_HIGHLIGHT_HTML = `
<div class="blog-highlight">
  <h2>From the Blog</h2>
  <h3>{{ blogTitle }}</h3>
  <p>{{ blogExcerpt }}</p>
  <a href="{{ blogUrl }}">Read the full post →</a>
</div>
`;

export const TEMPLATE_BLOG_HIGHLIGHT_TEXT = `
FROM THE BLOG
{{ blogTitle }}
{{ blogExcerpt }}
Read: {{ blogUrl }}

`;

export const AI_SUMMARY_LABEL = '<span class="ai-badge">Summary</span>';
export const AI_SUMMARY_LABEL_TEXT = '[Summary]';
