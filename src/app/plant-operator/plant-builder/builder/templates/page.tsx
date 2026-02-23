// src/app/plant-operator/plant-builder/builder/templates/page.tsx
"use client";

import "../../plant-builder-vite.css";
import "../../App.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import PlantBuilder from "../../PlantBuilder";

export default function PlantBuilderTemplatesPage() {
  return (
    <TooltipProvider>
      <PlantBuilder initialView="templates" />
    </TooltipProvider>
  );
}
