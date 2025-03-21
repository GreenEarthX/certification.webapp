import React from "react";

interface RiskScoreProps {
  score: number;
}

const RiskScore: React.FC<RiskScoreProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="flex items-center space-x-4 p-4">
      <span className="text-2xl font-semibold text-[#17598d]">My Risk Score</span>
      <div className="flex items-center space-x-2">
        <div className="w-28 h-3 bg-gray-200 rounded-full">
          <div className={`${getScoreColor(score).replace("text", "bg")} h-3 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>
    </div>
  );
};

export default RiskScore;