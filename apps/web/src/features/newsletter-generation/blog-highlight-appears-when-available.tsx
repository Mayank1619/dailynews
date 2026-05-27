/**
 * US6: Blog Highlight Appears When Available
 * React component for blog highlight display
 */

'use client';

import React from 'react';

interface BlogHighlightProps {
  title: string;
  excerpt: string;
  url: string;
  author?: string;
  category?: string;
}

export function BlogHighlightComponent({
  title,
  excerpt,
  url,
  author,
  category,
}: BlogHighlightProps) {
  return (
    <section className="bg-amber-50 border-l-4 border-amber-600 p-6 my-8 rounded">
      <div className="mb-3">
        <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
          From the Blog
        </h2>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>

      <p className="text-gray-700 leading-relaxed mb-4">{excerpt}</p>

      {(author || category) && (
        <div className="text-sm text-gray-600 mb-4">
          {category && <span className="inline-block mr-4">📁 {category}</span>}
          {author && <span className="inline-block">✍️ {author}</span>}
        </div>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-900 transition-colors"
      >
        Read the full post
        <span>→</span>
      </a>
    </section>
  );
}

interface OptionalBlogHighlightProps {
  highlight?: {
    title: string;
    excerpt: string;
    url: string;
    author?: string;
    category?: string;
  };
}

export function OptionalBlogHighlight({ highlight }: OptionalBlogHighlightProps) {
  if (!highlight) {
    return null;
  }

  return <BlogHighlightComponent {...highlight} />;
}
