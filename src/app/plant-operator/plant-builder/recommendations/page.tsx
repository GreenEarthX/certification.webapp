import { Suspense } from 'react';
// Import the component that holds your client logic
import RecommendationPageContent from './RecommendationPageContent'; 

// This Server Component adds the necessary Suspense boundary.
// It uses the default Server Component behavior (no 'use client' directive).
export default function RecommendationPage() {
  return (
    // This <Suspense> wrapper is the FIX for your build error.
    <Suspense fallback={<div>Loading recommendations...</div>}>
      {/* Your original component, renamed, is now safely wrapped */}
      <RecommendationPageContent />
    </Suspense>
  );
}