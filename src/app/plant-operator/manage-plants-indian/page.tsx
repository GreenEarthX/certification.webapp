'use client';

import { Suspense } from 'react';
import PlantDetailsPage from '@/components/plant-operator/manage-plants-indian/PlantDetailsPage'; 
import { InlineLoading } from "@/components/common/LoadingState";

export default function Page() {
  return (
    <Suspense fallback={<InlineLoading className="p-6" />}>
      <PlantDetailsPage />
    </Suspense>
  );
}
