"use client";

import React from "react";

interface Alert {
  title: string;
  severity: string;
  timestamp: string;
}

interface AlertsProps {
  alerts: Alert[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  return (
    <div>
      <h3 className="font-semibold mb-4">Alerts</h3>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex">
            <div
              className={`w-1 self-stretch mr-3 rounded ${
                alert.severity === "high"
                  ? "bg-red-500"
                  : alert.severity === "low"
                  ? "bg-green-500"
                  : "bg-orange-500"
              }`}
            ></div>
            <div>
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm text-gray-500">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;