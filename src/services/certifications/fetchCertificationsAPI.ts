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


export const registerCertification = async (uploadedData: any) => {
  const res = await fetch("/api/plants/registration", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(uploadedData),
  });

  if (!res.ok) throw new Error("Certification registration failed.");

  const data = await res.json();
  return data.certification;
};


export const fetchCertificationOptions = async () => {
  const res = await fetch("/api/certifications/certification-options");
  if (!res.ok) throw new Error("Failed to fetch certification options");
  return res.json();
};

export const fetchOperatorId = async (plantId: string | number) => {
  const res = await fetch(`/api/plants/${plantId}/operator`);
  if (!res.ok) throw new Error("Failed to fetch operator ID");
  const data = await res.json();
  return data.operator_id;
};
