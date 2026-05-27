/**
 * US2: My Newsletter Respects My Consent Choice
 * React component for consent management
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ConsentManagerProps {
  userId?: string;
}

export function ConsentManager({ userId = 'demo-user' }: ConsentManagerProps) {
  const [consentStatus, setConsentStatus] = useState<'enabled' | 'disabled' | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConsent();
  }, [userId]);

  const checkConsent = async () => {
    setConsentStatus('loading');
    setError(null);
    try {
      const response = await fetch(`/api/newsletter/consent/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to check consent status');
      const data = await response.json();
      setConsentStatus(data.consentGranted ? 'enabled' : 'disabled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConsentStatus('disabled');
    }
  };

  const handleToggleConsent = async () => {
    const newStatus = consentStatus === 'enabled' ? 'disabled' : 'enabled';
    setConsentStatus('loading');
    try {
      const response = await fetch(`/api/newsletter/consent/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus === 'enabled' }),
      });

      if (!response.ok) throw new Error('Failed to update consent');
      await checkConsent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      checkConsent();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Newsletter Preferences</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          {consentStatus === 'loading'
            ? 'Loading your preferences...'
            : consentStatus === 'enabled'
              ? 'You are subscribed to the Daily News newsletter.'
              : 'You are not subscribed to the Daily News newsletter.'}
        </p>

        <button
          onClick={handleToggleConsent}
          disabled={consentStatus === 'loading'}
          className={`px-6 py-2 rounded font-semibold ${
            consentStatus === 'enabled'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50`}
        >
          {consentStatus === 'loading'
            ? 'Updating...'
            : consentStatus === 'enabled'
              ? 'Unsubscribe'
              : 'Subscribe'}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          {consentStatus === 'enabled'
            ? 'You can unsubscribe at any time by clicking the unsubscribe link in the email footer.'
            : 'Subscribe to receive personalized daily news headlines based on your interests.'}
        </p>
      </div>
    </div>
  );
}
