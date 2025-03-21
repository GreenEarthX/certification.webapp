export const fetchComplianceScoreAndName = async (id: string) => {
    try {
      const response = await fetch(`/api/recommendations/complianceScore/${id}`);
      if (!response.ok) {
        console.error(`❌ Compliance Score Error ${response.status}: ${response.statusText}`);
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json(); // Returning the response directly
    } catch (error) {
      console.error("❌ Error fetching compliance score:", error);
      throw error;
    }
  };
  
  export const fetchSchemeDetails = async (id: string, section: string) => {
    try {
      const response = await fetch(`/api/recommendations/schemeDetails/${id}?section=${section}`);
      if (!response.ok) {
        console.error(`❌ API Error ${response.status}: ${response.statusText}`);
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json(); // Returning the response directly
    } catch (error) {
      console.error("❌ Error fetching scheme details:", error);
      throw error;
    }
  };
  