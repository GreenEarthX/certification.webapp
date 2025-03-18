interface Certification {
  name: string;
  entity: string;
  date: string;
  type: string;
  status: string;
  id: string;
}

export async function fetchCertifications(plantId: string): Promise<Certification[]> {
    try {
      const response = await fetch(`/api/plantDashboard/certifications/list?plantId=${plantId}`);
      if (!response.ok) throw new Error("Failed to fetch certifications");
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching certifications:", error);
      return []; 
    }
  }
  