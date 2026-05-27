/**
 * US5: Receive a Readable Email on Any Device
 * React component for responsive email preview
 */

'use client';

import React, { useState } from 'react';

interface ResponsivePreviewProps {
  emailHtml?: string;
}

export function ResponsiveEmailPreview({ emailHtml = '<p>Newsletter content here</p>' }: ResponsivePreviewProps) {
  const [selectedViewport, setSelectedViewport] = useState<'mobile' | 'tablet' | 'desktop'>(
    'mobile'
  );

  const viewports = {
    mobile: { width: 375, label: 'Mobile (375px)' },
    tablet: { width: 768, label: 'Tablet (768px)' },
    desktop: { width: 1024, label: 'Desktop (1024px)' },
  };

  const current = viewports[selectedViewport];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Responsive Email Preview</h2>

        <div className="flex gap-2">
          {(Object.entries(viewports) as [keyof typeof viewports, typeof viewports.mobile][]).map(
            ([key, viewport]) => (
              <button
                key={key}
                onClick={() => setSelectedViewport(key)}
                className={`px-4 py-2 rounded font-semibold ${
                  selectedViewport === key ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {viewport.label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded bg-gray-50 p-4">
        <div
          style={{ width: current.width, margin: '0 auto' }}
          className="bg-white border border-gray-200 rounded overflow-hidden shadow"
        >
          <iframe
            srcDoc={emailHtml}
            style={{ width: '100%', height: '600px', border: 'none' }}
            title={`Email preview - ${current.label}`}
          />
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          Preview shows how the email will render at <strong>{current.width}px</strong> width.
        </p>
        <p className="mt-2">
          ✓ Single-column layout • ✓ Touch-friendly buttons • ✓ Readable on mobile devices
        </p>
      </div>
    </div>
  );
}
