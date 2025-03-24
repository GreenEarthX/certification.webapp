export const fetchCertifications = async () => {
  const res = await fetch("/api/certifications");
  if (!res.ok) throw new Error("Failed to fetch certifications");
  return res.json();
};


export const fetchCertificationById = async (certificationId: string) => {
  const res = await fetch(`/api/certifications/${certificationId}`);
  if (!res.ok) throw new Error("Failed to fetch certification");
  return res.json();
};