export async function fetchRecommendations() {
    try {
      const response = await fetch("/api/recommendations");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching recommendations from API:", error);
      throw new Error("Failed to fetch recommendations from API");
    }
  }
  