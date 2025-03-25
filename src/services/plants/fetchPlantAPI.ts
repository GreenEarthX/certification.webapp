export const fetchAllPlants = async () => {
  const res = await fetch("/api/plants");
  if (!res.ok) throw new Error("Failed to fetch plants");
  return res.json();
};

  
export const deletePlant = async (plantId: number): Promise<void> => {
  const res = await fetch(`/api/plants/${plantId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete plant.");
};
