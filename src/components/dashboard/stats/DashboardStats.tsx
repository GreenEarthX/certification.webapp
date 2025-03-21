import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import StatCard from "./StatCard";
import { Stats } from "@/models/stat";

interface DashboardStatsProps {
  stats: Stats;
  loading: boolean;
  error: string | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading, error }) => {
  if (loading) return <p>Loading stats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 rounded-lg">
      <h2 style={{ color: "#17598d" }} className="text-xl font-semibold">Certifications</h2>
      <br/>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active" value={stats.active} icon={<FaCheckCircle />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Expired" value={stats.expired} icon={<FaExclamationCircle />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} iconColor="lightblue" bgColor="lightblue" />
      </div>
    </div>
  );
};

export default DashboardStats;
