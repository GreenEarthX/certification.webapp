export async function fetchCertificationsList(plantId: string) {
    const response = await fetch(`/api/plantDashboard/certifications/list?plantId=${plantId}`);
    if (!response.ok) throw new Error("Failed to fetch certifications list");
    return response.json();
  }
  
  export async function fetchCertificationsSummary(plantId: string) {
    const response = await fetch(`/api/plantDashboard/certifications/summary?plantId=${plantId}`);
    if (!response.ok) throw new Error("Failed to fetch certifications summary");
    return response.json();
  }
  

  