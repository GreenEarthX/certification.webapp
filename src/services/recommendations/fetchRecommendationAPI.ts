export const fetchRecommendations = async () => {
    const res = await fetch("/api/recommendations");
    if (!res.ok) throw new Error("Failed to fetch recommendations");
    return res.json();
  };
  
  export const fetchComplianceScoreAndName = async (id: string) => {
    const res = await fetch(`/api/recommendations/schemeDetails/${id}?type=score`);
    if (!res.ok) throw new Error("Failed to fetch compliance score");
    return res.json(); // { complianceScore, schemeName }
  };
  
  export const fetchSchemeDetails = async (id: string, section: string) => {
    const res = await fetch(`/api/recommendations/schemeDetails/${id}?section=${section}`);
    if (!res.ok) throw new Error("Failed to fetch scheme details");
    return res.json(); // string | string[] depending on section
  };
  
  // (Optional) full details without section:
  export const fetchFullSchemeDetails = async (id: string) => {
    const res = await fetch(`/api/recommendations/schemeDetails/${id}`);
    if (!res.ok) throw new Error("Failed to fetch scheme details");
    return res.json(); // full SchemeDetails object
  };
  