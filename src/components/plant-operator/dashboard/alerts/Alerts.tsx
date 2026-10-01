import React from "react";
import { BellOff } from "lucide-react";
import { Alert } from "@/models/alert";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertsProps {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const Alerts: React.FC<AlertsProps> = ({ alerts, loading, error }) => {
  if (loading) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Alerts</h3>
        <div className="space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-1 self-stretch rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="py-4 text-sm text-red-600">{error}</p>;

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
          <EmptyState icon={BellOff} title="No alerts" description="You're up to date — nothing needs attention." className="py-8" />
        )}
      </div>
    </div>
  );
};

export default Alerts;
