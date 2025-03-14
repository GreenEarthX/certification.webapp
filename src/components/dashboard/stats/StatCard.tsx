import React from 'react';
import { Stat } from '@/models/stat';


const StatCard: React.FC<Stat> = ({ title, value, icon,  bgColor }) => (
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
