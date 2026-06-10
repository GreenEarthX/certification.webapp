// src/services/plant-builder/componentDefinitions.ts
"use client";

import type {
  ComponentData,
  ComponentType,
} from "@/components/plant-builder/ComponentLibrary";
import { apiFetch } from "@/services/api-client";

export type ComponentDefinitionDto = {
  id: number;
  component_id: string;
  component_name: string;
  component_type: ComponentType;
  field_schema?: any;
  created_at?: string;
  updated_at?: string;
};

export type PortDirection = 'IN' | 'OUT';
export type PortRequirement = 'REQUIRED' | 'OPTIONAL';

export type PortCarrierDto = {
  id: number;
  name: string;
  component_id?: string;
};

export type PortDto = {
  id: number;
  port_id?: string;
  port_label: string;
  direction: PortDirection;
  requirement: PortRequirement;
  carriers: PortCarrierDto[];
};

export type EquipmentPortsDto = PortDto[];

export type ComponentLibraryJSON = {
  equipment: ComponentData[];
  carrier: ComponentData[];
  gate: ComponentData[];
};

const COMPONENT_DEFINITIONS_PATH = "/component-definitions";
const TYPE_TO_ICON: Record<ComponentType, ComponentData["icon"]> = {
  equipment: "Building2",
  carrier: "Zap",
  gate: "ArrowRightLeft",
};

// Provide a readable fallback category when schema lacks one
const defaultCategoryFor = (componentType: ComponentType) =>
  componentType.charAt(0).toUpperCase() + componentType.slice(1);

// Pull category metadata from the schema with multiple fallbacks
const deriveCategoryFromSchema = (def: ComponentDefinitionDto) => {
  const schema = def.field_schema;
  if (!schema) return defaultCategoryFor(def.component_type);

  const fields = Array.isArray(schema.fields) ? schema.fields : [];
  return (
    schema.category ||
    schema.group ||
    schema.meta?.category ||
    fields[0]?.category ||
    fields[0]?.group ||
    defaultCategoryFor(def.component_type)
  );
};

// Convert backend DTO into the component-library-friendly structure
const mapToComponentData = (def: ComponentDefinitionDto): ComponentData => ({
  id: def.component_id,
  definitionId: def.id,
  type: def.component_type,
  name: def.component_name,
  category: deriveCategoryFromSchema(def),
  icon: TYPE_TO_ICON[def.component_type] ?? "ArrowRightLeft",
});

export async function fetchComponentDefinitions(): Promise<ComponentDefinitionDto[]> {
  return apiFetch<ComponentDefinitionDto[]>(COMPONENT_DEFINITIONS_PATH);
}

// Retrieve a single component definition for editing/detail views
export async function fetchComponentDefinitionById(id: number): Promise<ComponentDefinitionDto> {
  return apiFetch<ComponentDefinitionDto>(`${COMPONENT_DEFINITIONS_PATH}/${id}`);
}

export async function fetchComponentPorts(definitionId: number): Promise<EquipmentPortsDto> {
  return apiFetch<EquipmentPortsDto>(`${COMPONENT_DEFINITIONS_PATH}/${definitionId}/ports`);
}

export async function fetchComponentLibraryFromApi(): Promise<ComponentLibraryJSON> {
  const defs = await fetchComponentDefinitions();

  return defs.reduce<ComponentLibraryJSON>(
    (library, def) => {
      const bucket = library[def.component_type];
      if (bucket) {
        bucket.push(mapToComponentData(def));
      }
      return library;
    },
    { equipment: [], carrier: [], gate: [] }
  );
}

export async function createComponentDefinition(
  payload: Partial<ComponentDefinitionDto>
): Promise<ComponentDefinitionDto> {
  return apiFetch<ComponentDefinitionDto>(COMPONENT_DEFINITIONS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
