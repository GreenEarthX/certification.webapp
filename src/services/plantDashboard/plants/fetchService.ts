export async function fetchPlants() {
    try {
      const response = await fetch("/api/plantDashboard/plants");
      if (!response.ok) {
        throw new Error("Failed to fetch plants");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching plants:", error);
      return [];
    }
  }
  