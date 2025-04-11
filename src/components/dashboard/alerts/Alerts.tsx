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
      <h3 style={{ color: "#17598d" }} className="text-xl font-semibold">Alerts</h3>
      <br/>
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
