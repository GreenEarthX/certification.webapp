import React, { Suspense } from "react";
import PlantRegistrationForm from "@/components/plant-operator/plant-registration/PlantRegistrationForm";
import { InlineLoading } from "@/components/common/LoadingState";

export default function PlantAddPage() {
  return (
    <Suspense fallback={<InlineLoading label="Loading form…" className="justify-center mt-10" />}>
      <PlantRegistrationForm />
    </Suspense>
  );
}
