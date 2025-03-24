"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import FacilityDropdown from "@/components/plantDashboard/FacilityDropdown";
import RiskScore from "@/components/plantDashboard/RiskScore";
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import CertificationRequests from "@/components/plantDashboard/CertificationRequests";
import CertificationsTable from "@/components/plantDashboard/CertificationsTable";
import Recommendations from "@/components/plantDashboard/Recommendations";

import { useRiskScore } from "@/hooks/plantDashboard/useRiskScore";
import { useRecommendations } from "@/hooks/plantDashboard/useRecommendations";
import { useCertifications } from "@/hooks/plantDashboard/useCertificationsList";
import { useStats } from "@/hooks/useStats";

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
  const { stats, loading: statsLoading, error: statsError } = useStats(selectedPlant);
  

  const handlePlantChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newPlantId = event.target.value;
    setSelectedPlant(newPlantId);
    router.push(`/dashboards/dashboard/${newPlantId}/plantDashboard`);
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
      <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

      {/* Certification Requests & Recommendations in Two Columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Certification Requests - Takes 8/12 Columns */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-lg p-6 shadow-sm h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ color: "#17598d" }} className="text-xl font-semibold">
              Certification Requests
            </h2>
            <Link href="/dashboards/certifications/add">
              <button className="bg-blue-600 text-white px-5 py-1 rounded-lg hover:bg-blue-700">
                Track New Certificate
              </button>
            </Link>
          </div>
          <br/>
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
          <h2 style={{ color: "#17598d" }} className="text-xl font-semibold mb-4">
            Recommendations
          </h2>
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
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ color: "#17598d" }} className="text-xl font-semibold mb-4">
          Certifications
        </h2>
        <Link href="/dashboards/plants/add?step=2">
          <button className="bg-blue-600 text-white px-5 py-1 rounded-lg hover:bg-blue-700">
            Add Certification
          </button>
        </Link>

        </div>
        <br/>
        {loadingCertifications ? (
          <p className="text-gray-500 text-sm">Loading certifications...</p>
        ) : (
          <CertificationsTable certifications={certifications} />
        )}
      </section>
    </div>
  );
}