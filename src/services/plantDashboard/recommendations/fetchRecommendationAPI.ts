export async function fetchRecommendations(plantId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/plantDashboard/recommendations?plantId=${plantId}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return []; 
    }
  }
  