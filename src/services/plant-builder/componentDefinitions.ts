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
  // Only present on single-definition fetches. The list endpoint returns the
  // schema-derived `category` instead of the schema itself.
  field_schema?: any;
  category?: string;
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
  if (def.category) return def.category;
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

// The plant builder asks for "all definitions" from half a dozen places on a
// single page load, and only ever reads id / name / type / category from the
// result. Serve that from the lightweight basic-details endpoint (no
// field_schema — that alone was ~3 MB per call) and hand every caller the same
// in-flight or completed request. Mutations clear the cache.
const DEFINITIONS_CACHE_TTL_MS = 5 * 60 * 1000;
let definitionsCache: { promise: Promise<ComponentDefinitionDto[]>; at: number } | null = null;

export function invalidateComponentDefinitionsCache(): void {
  definitionsCache = null;
}

export async function fetchComponentDefinitions(): Promise<ComponentDefinitionDto[]> {
  const now = Date.now();
  if (definitionsCache && now - definitionsCache.at < DEFINITIONS_CACHE_TTL_MS) {
    return definitionsCache.promise;
  }
  const promise = apiFetch<ComponentDefinitionDto[]>(`${COMPONENT_DEFINITIONS_PATH}/basic-details`).catch(
    (err) => {
      // Do not pin a failure for the whole TTL.
      if (definitionsCache?.promise === promise) definitionsCache = null;
      throw err;
    }
  );
  definitionsCache = { promise, at: now };
  return promise;
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
  invalidateComponentDefinitionsCache();
  return apiFetch<ComponentDefinitionDto>(COMPONENT_DEFINITIONS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
