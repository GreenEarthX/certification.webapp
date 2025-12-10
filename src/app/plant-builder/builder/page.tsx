// src/app/plant-builder/builder/page.tsx
"use client";

import "../../../app/plant-builder/plant-builder-vite.css"
import "../../../app/plant-builder/App.css"
import { TooltipProvider } from "@/components/ui/tooltip";
import PlantBuilder from "../PlantBuilder";

export default function PlantBuilderWizardPage() {
  return (
    <TooltipProvider>
      <PlantBuilder />
    </TooltipProvider>
  );
}
