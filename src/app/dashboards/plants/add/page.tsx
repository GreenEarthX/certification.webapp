import React, { Suspense } from "react";
import PlantRegistrationForm from "@/components/plantRegistration/PlantRegistrationForm";

export default function PlantAddPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading form...</div>}>
      <PlantRegistrationForm />
    </Suspense>
  );
}
