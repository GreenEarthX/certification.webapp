// src/app/plant-builder/builder/page.tsx
"use client";

import "../plant-builder-vite.css";
import "../App.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import PlantBuilder from "../PlantBuilder";

export default function PlantBuilderWizardPage() {
  return (
    <TooltipProvider>
      <PlantBuilder />
    </TooltipProvider>
  );
}
