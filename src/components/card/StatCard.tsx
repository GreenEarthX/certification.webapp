import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon,  bgColor }) => (
  <div className="stat-card">
    <div className="flex items-center">
      <div className={`bg-${bgColor}-50 p-2 rounded-full mr-3`}>
        {icon}
      </div>
      <div>
        <span className="block text-gray-500 text-sm">{title}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  </div>
);

export default StatCard;
