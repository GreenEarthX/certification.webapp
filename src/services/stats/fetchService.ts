export async function fetchStats() {
    try {
      const response = await fetch("/api/certifications/stats");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching stats from API:", error);
      throw new Error("Failed to fetch stats from API");
    }
  }
  