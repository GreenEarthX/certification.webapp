import React from "react";

interface RiskScoreProps {
  score: number;
}

const RiskScore: React.FC<RiskScoreProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 shadow-md rounded-lg">
      <span className="text-lg font-semibold text-gray-700">My Risk Score</span>
      <div className="flex items-center space-x-2">
        <div className="w-28 h-2 bg-gray-200 rounded-full">
          <div className={`${getScoreColor(score)} h-2 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-lg font-bold text-gray-900">{score}%</span>
      </div>
    </div>
  );
};

export default RiskScore;
