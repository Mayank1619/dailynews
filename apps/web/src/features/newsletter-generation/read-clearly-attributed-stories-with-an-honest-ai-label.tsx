/**
 * US3: Read Clearly Attributed Stories With an Honest AI Label
 * React component for displaying attributed stories
 */

'use client';

import React from 'react';

interface AttributedStoryDisplayProps {
  story: {
    id: string;
    title: string;
    snippet: string;
    source: string;
    canonicalUrl: string;
    publicationDate: string;
    isAISummary: boolean;
  };
}

export function AttributedStoryDisplay({ story }: AttributedStoryDisplayProps) {
  const publicationDate = new Date(story.publicationDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="border-b pb-4 mb-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold flex-1">{story.title}</h3>
        {story.isAISummary && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Summary
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        <span className="font-semibold">{story.source}</span>
        <span className="mx-2">•</span>
        <time>{publicationDate}</time>
      </div>

      <p className="text-gray-800 mb-3">{story.snippet}</p>

      <a
        href={story.canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
      >
        Read the full article
        <span>→</span>
      </a>
    </article>
  );
}

interface AttributedNewsletterSectionProps {
  topic: string;
  stories: Array<{
    id: string;
    title: string;
    snippet: string;
    source: string;
    canonicalUrl: string;
    publicationDate: string;
    isAISummary: boolean;
  }>;
}

export function AttributedNewsletterSection({
  topic,
  stories,
}: AttributedNewsletterSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 border-l-4 border-black pl-3">{topic}</h2>
      <div>
        {stories.map(story => (
          <AttributedStoryDisplay key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
