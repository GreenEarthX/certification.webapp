import React from "react";
import { StatCardProps } from "@/models/stat";

const iconBgClasses: { [key: string]: string } = {
  green: "bg-green-200 text-green-700",
  yellow: "bg-yellow-200 text-yellow-700",
  orange: "bg-orange-200 text-orange-700",
  red: "bg-red-200 text-red-700",
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColor }) => {
  return (
    <div className="p-4 rounded-lg shadow-md bg-white"> 
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBgClasses[iconColor] || "bg-gray-200 text-gray-700"}`}>
          {icon}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p> 
        </div>
      </div>
    </div>
  );
};

export default StatCard;
