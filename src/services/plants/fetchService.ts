export async function fetchPlants() {
    try {
      const response = await fetch("/api/plants");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching plants from API:", error);
      throw new Error("Failed to fetch plants from API");
    }
  }
  