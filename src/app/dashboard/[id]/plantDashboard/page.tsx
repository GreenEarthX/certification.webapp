"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import FacilityDropdown from "@/components/plantDashboard/FacilityDropdown";
import RiskScore from "@/components/plantDashboard/RiskScore";
import CertificationsSummary from "@/components/plantDashboard/CertificationsSummary";
import CertificationRequests from "@/components/plantDashboard/CertificationRequests";
import CertificationsTable from "@/components/plantDashboard/CertificationsTable";
import Recommendations from "@/components/plantDashboard/Recommendations";

import { useRiskScore } from "@/hooks/plantDashboard/useRiskScore";
import { useRecommendations } from "@/hooks/plantDashboard/useRecommendations";
import { useCertifications } from "@/hooks/plantDashboard/useCertificationsList";

export default function PlantDashboard() {
  const router = useRouter();
  const params = useParams();
  const [selectedPlant, setSelectedPlant] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (params.id && typeof params.id === "string") {
      setSelectedPlant(params.id);
    }
  }, [params.id]);

  const { riskScore, loading: loadingRisk } = useRiskScore(selectedPlant);
  const { recommendations, loading: loadingRecommendations } = useRecommendations(selectedPlant);
  const { certifications, loading: loadingCertifications } = useCertifications(selectedPlant);

  const handlePlantChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newPlantId = event.target.value;
    setSelectedPlant(newPlantId);
    router.push(`/dashboard/${newPlantId}/plantDashboard`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section: Only Facility Dropdown & Risk Score */}
      <div className="flex justify-between items-center p-4 rounded-lg">
        {selectedPlant && (
          <FacilityDropdown selectedPlant={selectedPlant} onChange={handlePlantChange} />
        )}
        {loadingRisk ? (
          <p className="text-gray-500 text-sm">Loading risk score...</p>
        ) : (
          <RiskScore score={riskScore ?? 0} />
        )}
      </div>

      {/* Certifications Summary */}
      <CertificationsSummary stats={{ active: 1, pending: 1, expired: 3, rejected: 1 }} />

      {/* Certification Requests & Recommendations in Two Columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Certification Requests - Takes 8/12 Columns */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-lg p-6 shadow-sm h-full">
          <h2 className="text-xl font-semibold mb-4">Certification Requests</h2>
          <CertificationRequests
            requests={[
              { name: "CertifyH™ Scheme", entity: "CertifyH", progress: 50 },
              { name: "Sustainability Certification", entity: "DNV", progress: 75 },
              { name: "Rheinland H2.21", entity: "TÜV", progress: 25 },
            ]}
          />
        </section>

        {/* Recommendations - Takes 4/12 Columns & Matches Height */}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-lg p-6 shadow-sm h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="flex-1">
            {loadingRecommendations ? (
              <p className="text-gray-500 text-sm">Loading recommendations...</p>
            ) : (
              <Recommendations recommendations={recommendations} />
            )}
          </div>
        </section>
      </div>

      {/* Full Width Certifications Table */}
      <section className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Certifications</h2>
        {loadingCertifications ? (
          <p className="text-gray-500 text-sm">Loading certifications...</p>
        ) : (
          <CertificationsTable certifications={certifications} />
        )}
      </section>
    </div>
  );
}
