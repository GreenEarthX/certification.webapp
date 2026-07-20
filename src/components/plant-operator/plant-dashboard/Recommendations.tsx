"use client";

import { MoreVertical } from "lucide-react";

interface RecommendationsProps {
  recommendations: string[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg"
        >
          <div>
            <p className="text-blue-600 font-semibold">{rec}</p>
            <p className="text-gray-500 text-sm">View details</p>
          </div>
          <MoreVertical className="text-gray-400 cursor-pointer" />
        </div>
      ))}
    </div>
  );
}
