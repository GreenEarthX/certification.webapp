import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import StatCard from "./StatCard";
import { StatCardSkeleton } from "@/components/common/LoadingState";
import { Stats } from "@/models/stat";

interface DashboardStatsProps {
  stats: Stats;
  loading: boolean;
  error: string | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Certifications</h2>
        <StatCardSkeleton count={3} />
      </section>
    );
  }
  if (error) return <p className="py-4 text-sm text-red-600">{error}</p>;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Certifications</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Valid" value={stats.active} icon={<CheckCircle2 />} iconColor="green" bgColor="green" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} iconColor="yellow" bgColor="yellow" />
        <StatCard title="Non Valid" value={+stats.rejected + +stats.expired} icon={<XCircle />} iconColor="red" bgColor="red" />
      </div>
    </section>
  );
};

export default DashboardStats;
