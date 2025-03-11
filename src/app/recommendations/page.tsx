"use client";

import React, { useEffect, useState } from "react";
import { RecommendationCard } from "@/components/card/RecommendationCard";
import { Recommendation } from "@/models/recommendation";


export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then(setRecommendations)
      .catch(console.error);
  }, []);

  return (
    <div>
      <br />
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}