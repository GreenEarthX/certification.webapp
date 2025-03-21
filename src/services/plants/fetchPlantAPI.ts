export const fetchAllPlants = async () => {
  const res = await fetch("/api/plants");
  if (!res.ok) throw new Error("Failed to fetch plants");
  return res.json();
};

  