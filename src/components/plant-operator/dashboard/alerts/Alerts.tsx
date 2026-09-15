import React from "react";
import { Alert } from "@/models/alert";

interface AlertsProps {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const Alerts: React.FC<AlertsProps> = ({ alerts, loading, error }) => {
  if (loading) return <p className="text-gray-500">Loading alerts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Alerts</h3>
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div key={index} className="flex rounded-gex-sm px-2 py-1.5 -mx-2 hover:bg-slate-50">
              <div
                className={`w-1 self-stretch mr-3 rounded-full ${
                  alert.severity === "High"
                    ? "bg-red-500"
                    : alert.severity === "Low"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
              ></div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                <p className="text-sm text-slate-600">{alert.description}</p>
                <p className="mt-0.5 text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
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
