"use client";

import React, { useState, ChangeEvent } from "react";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { useRecommendations } from "@/hooks/useRecommendations";

export default function Recommendations() {
  const { recommendations, loading, error } = useRecommendations();

  // Extract unique plants from recommendations
  const plants = Array.from(new Set(recommendations.map((rec) => rec.plantName)));

  // State for selected plant
  const [selectedPlant, setSelectedPlant] = useState("");

  // Handle dropdown change
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlant(event.target.value);
  };

  // Filter recommendations by selected plant
  const filteredRecommendations = selectedPlant
    ? recommendations.filter((rec) => rec.plantName === selectedPlant)
    : recommendations;

  return (
    <div className="p-4">
      {/* Filter Dropdown */}
      <div className="mb-4">
        <select
          value={selectedPlant}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm focus:ring focus:ring-blue-200 text-gray-700 cursor-pointer"
        >
          <option value="">All Plants</option>
          {plants.map((plant) => (
            <option key={plant} value={plant}>
              {plant}
            </option>
          ))}
        </select>
      </div>

      {/* Show loading or error message */}
      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Filtered Recommendations */}
      <div className="flex flex-col gap-6">
        {filteredRecommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}
