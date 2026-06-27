// src/services/stats/fetchStatsAPI.ts
export async function fetchStats(plantId?: string) {
  try {
    const url = plantId ? `/api/certifications/stats?plantId=${plantId}` : `/api/certifications/stats`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats from API:", error);
    throw new Error("Failed to fetch stats from API");
  }
}
