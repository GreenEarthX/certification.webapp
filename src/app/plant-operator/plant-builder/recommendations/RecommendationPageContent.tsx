'use client';

import { useSearchParams } from "next/navigation";

import { RecommendationInterface } from "./RecommendationInterface";
import { ComplianceResult } from "../types";
import { fallbackComplianceResults } from "./RecommendationInterface";

export default function RecommendationPage() {
  const searchParams = useSearchParams();
  const urlData = searchParams.get("data");

  // FETCH FROM URL OR FALLBACK
  const complianceResults: ComplianceResult[] = urlData
    ? JSON.parse(decodeURIComponent(urlData))
    : fallbackComplianceResults; // ← USE FALLBACK IF NO URL DATA

  return <RecommendationInterface complianceResults={complianceResults} />;
}