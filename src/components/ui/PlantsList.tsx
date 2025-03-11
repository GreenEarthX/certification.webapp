import React, { memo } from 'react';
import { Plant } from '@/models/plant';

interface PlantsListProps {
  plants: Plant[];
}

const PlantsList: React.FC<PlantsListProps> = ({ plants }) => {
  const getRiskScoreColor = (score: number): string => {
    if (score >= 70) return 'bg-red-500'; // High risk = Red
    if (score >= 40) return 'bg-orange-500'; // Medium risk = Orange
    return 'bg-green-500'; // Low risk = Green
  };

  const getRiskScoreText = (score: number): string => `${score}%`;

  // Mock function for managing a plant
  const handleManagePlant = (id: number) => {
    console.log(`Manage plant with ID: ${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm uppercase">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Address</th>
            <th className="pb-3 font-medium">Risk Score</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {plants.map(({ id, name, type, address, riskScore }) => (
            <tr key={id} className="border-t border-gray-100">
              <td className="py-4 font-medium">{name}</td>
              <td className="py-4">{type}</td>
              <td className="py-4">{address}</td>
              <td className="py-4">
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`${getRiskScoreColor(riskScore)} h-2 rounded-full`} 
                      style={{ width: `${riskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{getRiskScoreText(riskScore)}</span>
                </div>
              </td>
              <td className="py-4">
                <div
                  onClick={() => handleManagePlant(id)}
                  className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  <span className="text-sm font-medium">Manage Plant</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(PlantsList);