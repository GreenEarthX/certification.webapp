import { useState, useEffect, useCallback } from "react";
import { fetchComplianceScoreAndName, fetchSchemeDetails } from "@/services/recommendations/fetchRecommendationAPI";
import { useParams } from "next/navigation";
import { SchemeContent } from "@/models/overview"; // Import the interface

interface SchemeDetails {
  complianceScore: number;
  schemeName: string;
  content: SchemeContent | null; // Use the specific type here
  loading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useServiceDetails = (): SchemeDetails => {
  const { id } = useParams();
  const schemeId = Array.isArray(id) ? id[0] : id; // Ensure id is a string

  const [activeTab, setActiveTab] = useState("overview");
  const [content, setContent] = useState<SchemeContent | null>(null); // Use the specific type here
  const [loading, setLoading] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);
  const [schemeName, setSchemeName] = useState("CertifHy™ Scheme");
  const [error, setError] = useState<string | null>(null);

  // Fetch compliance score and scheme name
  const fetchComplianceScoreAndNameHandler = useCallback(async () => {
    if (!schemeId) return;

    try {
      const { complianceScore, schemeName } = await fetchComplianceScoreAndName(schemeId);
      setComplianceScore(complianceScore);
      setSchemeName(schemeName);
    } catch (error) {
      console.error("❌ Error fetching compliance score:", error);
      setError("Error fetching compliance score");
    }
  }, [schemeId]); // Add schemeId as a dependency

  // Fetch scheme details
  const fetchSchemeDetailsHandler = useCallback(async () => {
    if (!schemeId) return;

    setLoading(true);
    try {
      const data = await fetchSchemeDetails(schemeId, activeTab);
      setContent(data as SchemeContent); // Cast the data to the specific type
    } catch (error) {
      console.error("❌ Error fetching scheme details:", error);
      setError("Error fetching scheme details");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [schemeId, activeTab]); // Add schemeId and activeTab as dependencies

  // Fetch data when the component mounts or when schemeId/activeTab changes
  useEffect(() => {
    if (schemeId) {
      fetchComplianceScoreAndNameHandler();
      fetchSchemeDetailsHandler();
    }
  }, [schemeId, activeTab, fetchComplianceScoreAndNameHandler, fetchSchemeDetailsHandler]); // Add the handlers as dependencies

  return {
    complianceScore,
    schemeName,
    content,
    loading,
    error,
    activeTab,
    setActiveTab,
  };
};