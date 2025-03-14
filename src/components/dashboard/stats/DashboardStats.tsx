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
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-6">Certifications Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Active" value={stats.active} icon={<FaCheckCircle />} iconColor="green" bgColor="green" />
        <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconColor="yellow" bgColor="yellow" />
        <StatCard title="Expired" value={stats.expired} icon={<FaExclamationCircle />} iconColor="orange" bgColor="orange" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} iconColor="red" bgColor="red" />
      </div>
    </div>
  );
};

export default DashboardStats;
