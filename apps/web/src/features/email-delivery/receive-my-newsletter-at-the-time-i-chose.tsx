/**
 * User Story 1: Schedule delivery time component
 */

'use client';

import { useState } from 'react';

export function DeliveryTimeSelector() {
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [timezone, setTimezone] = useState('America/New_York');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryTime: selectedTime,
          timezone,
        }),
      });

      if (response.ok) {
        alert('Delivery time updated');
      }
    } catch (error) {
      console.error('Failed to update delivery time:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">When do you want your newsletter?</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Delivery Time</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="America/New_York">Eastern</option>
            <option value="America/Chicago">Central</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Los_Angeles">Pacific</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save Preference
        </button>
      </div>
    </div>
  );
}
