// src/services/plant-builder/componentInstances.ts
"use client";

import { apiFetch } from "@/services/api-client";

export type ComponentInstanceDto = {
  id: number;
  digital_twin_id: number;
  component_definition_id: number;
  instance_name: string;
  position?: any;
  field_values?: any;
  connections?: any;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
};

const COMPONENT_INSTANCE_PATH = "/component-instances";

export async function fetchComponentInstances(digitalTwinId?: number): Promise<ComponentInstanceDto[]> {
  const query = digitalTwinId ? `?digitalTwinId=${digitalTwinId}` : "";
  return apiFetch<ComponentInstanceDto[]>(`${COMPONENT_INSTANCE_PATH}${query}`);
}

export async function fetchComponentInstanceById(id: number): Promise<ComponentInstanceDto> {
  return apiFetch<ComponentInstanceDto>(`${COMPONENT_INSTANCE_PATH}/${id}`);
}

export async function createComponentInstance(
  payload: Partial<ComponentInstanceDto>
): Promise<ComponentInstanceDto> {
  return apiFetch<ComponentInstanceDto>(COMPONENT_INSTANCE_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateComponentInstance(
  id: number,
  payload: Partial<ComponentInstanceDto>
): Promise<ComponentInstanceDto> {
  return apiFetch<ComponentInstanceDto>(`${COMPONENT_INSTANCE_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteComponentInstance(id: number): Promise<void> {
  await apiFetch<void>(`${COMPONENT_INSTANCE_PATH}/${id}`, {
    method: "DELETE",
  });
}
