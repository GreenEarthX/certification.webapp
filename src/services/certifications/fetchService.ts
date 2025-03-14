export async function fetchCertifications() {
    try {
      const response = await fetch("/api/certifications");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching certifications from API:", error);
      throw new Error("Failed to fetch certifications from API");
    }
  }
  