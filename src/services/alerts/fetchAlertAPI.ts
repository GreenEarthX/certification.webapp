export async function fetchAlerts() {
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching alerts from API:", error);
      throw new Error("Failed to fetch alerts from API");
    }
  }
  