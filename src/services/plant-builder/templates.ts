"use client";

import { apiFetch } from "@/services/api-client";

export type TemplateDto = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  template_json?: {
    components?: Array<{
      id: string | number;
      name?: string;
      type?: string;
      position?: { x: number; y: number };
    }>;
    connections?: Array<{
      id?: string;
      from: string | number;
      to: string | number;
      data?: Record<string, any>;
    }>;
  };
};

const TEMPLATES_PATH = "/templates";

export async function fetchTemplates(): Promise<TemplateDto[]> {
  return apiFetch<TemplateDto[]>(`${TEMPLATES_PATH}/all`);
}

export async function fetchMyTemplates(): Promise<TemplateDto[]> {
  return apiFetch<TemplateDto[]>(TEMPLATES_PATH);
}

export async function instantiateTemplate(
  templateId: number,
  payload: { plantId: number; name: string }
): Promise<any> {
  return apiFetch<any>(`${TEMPLATES_PATH}/${templateId}/instantiate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createTemplateFromDigitalTwin(payload: {
  digitalTwinId: number;
  name: string;
  description?: string;
}): Promise<any> {
  return apiFetch<any>(`${TEMPLATES_PATH}/from-digital-twin`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
