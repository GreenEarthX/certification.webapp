// src/services/plant-builder/componentDefinitions.ts
"use client";

import { apiFetch } from "../api-client";
import type { ComponentType, ComponentData } from "@/components/plant-builder/ComponentLibrary";

export type ComponentDefinitionDto = {
  id: number;
  component_id: string;
  component_name: string;
  component_type: ComponentType;
  field_schema?: any;
  created_at?: string;
  updated_at?: string;
};

export type ComponentLibraryJSON = {
  equipment: ComponentData[];
  carrier: ComponentData[];
  gate: ComponentData[];
};

export async function fetchComponentDefinitions(): Promise<ComponentDefinitionDto[]> {
  return apiFetch<ComponentDefinitionDto[]>("/component-definitions");
}

export async function fetchComponentDefinitionById(id: number): Promise<ComponentDefinitionDto> {
  return apiFetch<ComponentDefinitionDto>(`/component-definitions/${id}`);
}

export async function fetchComponentLibraryFromApi(): Promise<ComponentLibraryJSON> {
  const defs = await fetchComponentDefinitions();

  const mapToComponentData = (def: ComponentDefinitionDto): ComponentData => {
    // try multiple places for a category: explicit category/group, meta, or first field group
    const categoryFromSchema =
      def.field_schema?.category ||
      def.field_schema?.group ||
      def.field_schema?.meta?.category ||
      (Array.isArray(def.field_schema?.fields) && (def.field_schema.fields[0]?.category || def.field_schema.fields[0]?.group)) ||
      // fallback to a human-friendly type name
      (def.component_type ? def.component_type.charAt(0).toUpperCase() + def.component_type.slice(1) : "General");

    const icon =
      def.component_type === "equipment"
        ? "Building2"
        : def.component_type === "carrier"
        ? "Zap"
        : "ArrowRightLeft";

    return {
      id: def.component_id,
      type: def.component_type,
      name: def.component_name,
      category: categoryFromSchema,
      icon,
    };
  };

  const equipment = defs
    .filter((d) => d.component_type === "equipment")
    .map(mapToComponentData);

  const carrier = defs
    .filter((d) => d.component_type === "carrier")
    .map(mapToComponentData);

  const gate = defs
    .filter((d) => d.component_type === "gate")
    .map(mapToComponentData);

  return { equipment, carrier, gate };
}

export async function createComponentDefinition(
  payload: Partial<ComponentDefinitionDto>
): Promise<ComponentDefinitionDto> {
  return apiFetch<ComponentDefinitionDto>("/component-definitions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
