'use client';

import { Suspense } from 'react';
import PlantDetailsPage from '@/components/manage-plants-json/PlantDetailsPage'; 

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PlantDetailsPage />
    </Suspense>
  );
}
