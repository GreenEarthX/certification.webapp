// src/services/plantRegistration/fetchPlantAPI.ts
export const fetchFormData = async () => {
    const res = await fetch("/api/plants/registration");
    if (!res.ok) throw new Error("Failed to fetch form data");
    return res.json();
  };
  
  export const submitPlantRegistration = async (formData: any) => {
    const res = await fetch("/api/plants/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to submit plant data");
    return res.json();
  };
  