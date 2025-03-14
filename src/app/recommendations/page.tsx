"use client";

import React from "react";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { useRecommendations } from "@/hooks/useRecommendations";

export default function Recommendations() {
  const { recommendations, loading, error } = useRecommendations();

  return (
    <div>
      <br />
      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}
