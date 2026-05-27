/**
 * US1: Receive a Personalized Daily Paper in My Inbox
 * React component for testing/previewing
 */

'use client';

import React, { useState, useEffect } from 'react';

interface PreviewProps {
  userId?: string;
  date?: Date;
}

export function PersonalizedDailyPaperPreview({ userId = 'demo-user', date = new Date() }: PreviewProps) {
  const [newsletter, setNewsletter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  useEffect(() => {
    generatePreview();
  }, [userId, date]);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: date.toISOString(),
          preferences: {
            topics: ['technology', 'business'],
            region: 'US',
            deliveryTime: '08:00',
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to generate newsletter');
      const data = await response.json();
      setNewsletter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Newsletter Preview</h1>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setViewMode('html')}
            className={`px-4 py-2 rounded ${
              viewMode === 'html' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            HTML View
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`px-4 py-2 rounded ${
              viewMode === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Text View
          </button>
          <button
            onClick={generatePreview}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              loading ? 'bg-gray-400' : 'bg-green-600 text-white'
            }`}
          >
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {newsletter && (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          {viewMode === 'html' ? (
            <iframe
              srcDoc={newsletter.html}
              className="w-full h-screen"
              title="Newsletter HTML Preview"
            />
          ) : (
            <pre className="bg-gray-100 p-4 overflow-auto text-sm whitespace-pre-wrap">
              {newsletter.text}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
