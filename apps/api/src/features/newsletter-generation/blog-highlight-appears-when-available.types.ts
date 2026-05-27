/**
 * US6: Blog Highlight Appears When Available (Priority: P3)
 * Types and interfaces
 */

export interface BlogHighlight {
  id: string;
  date: Date;
  title: string;
  excerpt: string;
  content?: string;
  canonicalUrl: string;
  featuredImage?: string;
  author?: string;
  category?: string;
  isActive: boolean;
}

export interface BlogHighlightRequest {
  date: Date;
}

export interface BlogHighlightResponse {
  found: boolean;
  highlight?: BlogHighlight;
  checkedAt: Date;
}

export interface NewsletterWithBlogHighlight {
  newsletterId: string;
  sections: any[];
  blogHighlight?: {
    title: string;
    excerpt: string;
    url: string;
  };
  renderBlogSection: boolean;
}
