'use client';

import "./plant-builder-vite.css";  // ← VITE STYLES + PATCHED
import "./App.css";
import { TooltipProvider } from "@/components/ui/tooltip";  // ← FIXES Tooltip error
import PlantBuilder from "./PlantBuilder";  // ← Your main component

export default function PlantBuilderPage() {
  return (
    <TooltipProvider>
      <PlantBuilder />
    </TooltipProvider>
  );
}