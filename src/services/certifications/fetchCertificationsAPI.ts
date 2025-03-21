export const fetchCertifications = async () => {
  const res = await fetch("/api/certifications");
  if (!res.ok) throw new Error("Failed to fetch certifications");
  return res.json();
};
