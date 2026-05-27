/**
 * User Story 5: Operator health dashboard component
 */

'use client';

import { useEffect, useState } from 'react';

interface DeliveryMetrics {
  successRate: string;
  failureRate: string;
  totalSent: number;
  totalFailed: number;
  totalSkipped: number;
}

export function OperatorDashboard() {
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/email/health');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch health metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="p-4">No metrics available</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Email Delivery Health</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">{metrics.successRate}</div>
        </div>

        <div className="p-3 bg-red-50 rounded">
          <div className="text-sm text-gray-600">Failure Rate</div>
          <div className="text-2xl font-bold text-red-600">{metrics.failureRate}</div>
        </div>

        <div className="p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">Sent</div>
          <div className="text-2xl font-bold text-blue-600">{metrics.totalSent}</div>
        </div>

        <div className="p-3 bg-yellow-50 rounded">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-yellow-600">{metrics.totalFailed}</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <div className="font-semibold mb-2">Details</div>
        <div>Skipped: {metrics.totalSkipped}</div>
      </div>
    </div>
  );
}
