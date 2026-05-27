/**
 * User Story 3: Unsubscribe management component
 */

'use client';

import { useState } from 'react';

export function UnsubscribeManager() {
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleToggleSubscription = async () => {
    setLoading(true);
    try {
      const action = isSubscribed ? 'unsubscribe' : 'resubscribe';
      const response = await fetch(`/api/email/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsSubscribed(!isSubscribed);
        alert(isSubscribed ? 'Unsubscribed from newsletters' : 'Resubscribed to newsletters');
      }
    } catch (error) {
      console.error(`Failed to ${isSubscribed ? 'unsubscribe' : 'resubscribe'}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Newsletter Subscription</h2>

      <div className="flex items-center justify-between">
        <span className="text-sm">
          {isSubscribed ? 'You are subscribed to daily newsletters' : 'You are unsubscribed from daily newsletters'}
        </span>
        <button
          onClick={handleToggleSubscription}
          disabled={loading}
          className={`px-4 py-2 rounded ${isSubscribed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50`}
        >
          {loading ? 'Processing...' : isSubscribed ? 'Unsubscribe' : 'Resubscribe'}
        </button>
      </div>

      {!isSubscribed && <p className="text-sm text-gray-600 mt-2">You can resubscribe at any time</p>}
    </div>
  );
}
