import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaClock, FaTimesCircle } from "react-icons/fa"; // Importing icons from React Icons
import StatCard from "../card/StatCard";

interface Stats {
  active: number;
  pending: number;
  expired: number;
  rejected: number;
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    active: 0,
    pending: 0,
    expired: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetch("/api/certifications/stats")
      .then((res) => res.json())
      .then((data) =>
        setStats({
          active: data.active,
          pending: data.pending, // Always 0 from API
          expired: data.expired,
          rejected: data.rejected, // Always 0 from API
        })
      )
      .catch((error) => console.error("Error fetching certification stats:", error));
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg"> 
      <h2 className="text-xl font-bold mb-6">Certifications Status</h2> 
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Card */}
        <StatCard
          title="Active"
          value={stats.active}
          icon={<FaCheckCircle className="h-6 w-6 text-green-600" />} 
          iconColor="green"
          bgColor="green"
        />
        
        {/* Pending Card */}
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FaClock className="h-6 w-6 text-yellow-600" />}
          iconColor="yellow"
          bgColor="yellow"
        />

        {/* Expired Card */}
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={<FaExclamationCircle className="h-6 w-6 text-orange-600" />}
          iconColor="orange"
          bgColor="orange"
        />

        {/* Rejected Card */}
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<FaTimesCircle className="h-6 w-6 text-red-600" />}
          iconColor="red"
          bgColor="red"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
