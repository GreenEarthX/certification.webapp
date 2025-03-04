import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaClock, FaTimesCircle } from 'react-icons/fa'; // Importing icons from React Icons
import StatCard from '../card/StatCard';

interface StatsProps {
  stats: {
    valid: number;
    pending: number;
    expiring: number;
    rejected: number;
  };
}

const DashboardStats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg"> {/* White background, shadow for elevation */}
      <h2 className="text-xl font-bold mb-6">Certifications Status</h2> {/* Added Title */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Valid"
          value={stats.valid}
          icon={<FaCheckCircle className="h-6 w-6 text-blue-600" />}
          iconColor="blue"
          bgColor="blue"
        />
        
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FaClock className="h-6 w-6 text-yellow-600" />}
          iconColor="yellow"
          bgColor="yellow"
        />

        {/* Updated Expiring Card with Exclamation Icon */}
        <StatCard
          title="Expiring"
          value={stats.expiring}
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
