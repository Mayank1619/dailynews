/**
 * US4: Unsubscribe or Update Preferences From Inside the Email
 * React component for unsubscribe/preferences flows
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UnsubscribePageProps {
  userId?: string;
}

export function UnsubscribePage({ userId = 'demo-user' }: UnsubscribePageProps) {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleUnsubscribe = async () => {
    setStatus('confirming');
    setError(null);
    try {
      const response = await fetch(`/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token,
          confirmedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to unsubscribe');
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Unsubscribe from Newsletter</h1>

      {status === 'success' ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">You have been unsubscribed</p>
          <p className="text-sm mt-2">
            You will no longer receive Daily News newsletters. You can resubscribe anytime in
            your account settings.
          </p>
        </div>
      ) : (
        <>
          <p className="text-gray-700 mb-6">
            Are you sure you want to unsubscribe from the Daily News newsletter? You can always
            resubscribe later.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleUnsubscribe}
            disabled={status === 'confirming'}
            className={`w-full px-6 py-3 rounded font-bold text-white ${
              status === 'confirming' ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {status === 'confirming' ? 'Processing...' : 'Confirm Unsubscribe'}
          </button>
        </>
      )}
    </div>
  );
}

interface PreferencesLinkProps {
  userId?: string;
}

export function PreferencesLink({ userId = 'demo-user' }: PreferencesLinkProps) {
  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Update Newsletter Preferences</h1>

      <p className="text-gray-700 mb-6">
        You can update your newsletter preferences including topics, region, and delivery time.
      </p>

      <a
        href={`/preferences/${userId}`}
        className="block w-full px-6 py-3 rounded font-bold text-white bg-blue-600 hover:bg-blue-700 text-center"
      >
        Go to Preferences
      </a>
    </div>
  );
}
