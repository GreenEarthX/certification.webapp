"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "@/models/alert";

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/alerts")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        setAlerts(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading alerts...</p>;
  if (error) return <p className="text-red-500"> {error}</p>;

  return (
    <div>
      <h3 className="font-semibold mb-4">Alerts</h3>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div key={index} className="flex">
              <div
                className={`w-1 self-stretch mr-3 rounded ${
                  alert.severity === "High"
                    ? "bg-red-500"
                    : alert.severity === "Low"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
              ></div>
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No alerts available</p>
        )}
      </div>
    </div>
  );
};

export default Alerts;
