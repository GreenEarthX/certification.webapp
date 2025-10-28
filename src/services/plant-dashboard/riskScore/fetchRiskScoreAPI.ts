export async function fetchRiskScore(plantId: string): Promise<number> {
    try {
      const response = await fetch(`/api/plant-dashboard/riskScore?plantId=${plantId}`);
      if (!response.ok) throw new Error("Failed to fetch risk score");
  
      const data = await response.json();
      return data.risk_score ?? 0;
    } catch (error) {
      console.error("Error fetching risk score:", error);
      return 0; // Default value if an error occurs
    }
  }
  