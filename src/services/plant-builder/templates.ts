"use client";

import { apiFetch } from "@/services/api-client";

// template_json as stored by the backend (see template-topology.ts there).
// v2 templates carry component_id + port_id; v1 templates (pre-2026-09) carry
// `category` instead of component_id and may repeat each connection twice.
export type TemplateNode = {
  id: string | number;
  name?: string;
  type?: string | null;
  component_id?: string | null;
  category?: string;
  position?: { x: number; y: number };
};

export type TemplateEdge = {
  id?: string;
  from: string | number;
  to: string | number;
  type?: string;
  port_id?: string;
};

export type TemplateTopology = {
  version?: number;
  components?: TemplateNode[];
  connections?: TemplateEdge[];
};

export type TemplateCreator = {
  id: number | string;
  email: string;
  name: string | null;
};

export type TemplateDto = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  pathway: string | null;
  is_public: boolean;
  created_by: number | string;
  creator?: TemplateCreator | null;
  source_digital_twin_id?: number | null;
  created_at: string;
  updated_at: string;
  /** Present on the library list and on a single template; absent on "mine". */
  template_json?: TemplateTopology;
};

export type CreateTemplatePayload = {
  digitalTwinId: number;
  name: string;
  description?: string;
  category: string;
  pathway?: string;
  is_public?: boolean;
};

export type TemplateMetaPatch = Partial<
  Pick<TemplateDto, "name" | "description" | "category" | "pathway" | "is_public">
>;

const TEMPLATES_PATH = "/templates";

/**
 * The template library: every template the caller may see (public + own).
 *
 * Called WITHOUT list-query params on purpose — that is what makes the backend
 * return a bare array that includes template_json (needed for the diagrams).
 * Any query param switches it to a paginated envelope without template_json.
 */
export async function fetchTemplates(): Promise<TemplateDto[]> {
  return apiFetch<TemplateDto[]>(`${TEMPLATES_PATH}/all`);
}

/** The caller's own templates (summary rows, no template_json). */
export async function fetchMyTemplates(): Promise<TemplateDto[]> {
  return apiFetch<TemplateDto[]>(TEMPLATES_PATH);
}

/**
 * Replaces the plant's model with the template's topology (creating the
 * plant's digital twin if it has none). Parameter values start empty.
 */
export async function instantiateTemplate(
  templateId: number,
  payload: { plantId: number; name: string }
): Promise<unknown> {
  return apiFetch<unknown>(`${TEMPLATES_PATH}/${templateId}/instantiate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createTemplateFromDigitalTwin(
  payload: CreateTemplatePayload
): Promise<TemplateDto> {
  return apiFetch<TemplateDto>(`${TEMPLATES_PATH}/from-digital-twin`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTemplateMeta(
  templateId: number,
  patch: TemplateMetaPatch
): Promise<TemplateDto> {
  return apiFetch<TemplateDto>(`${TEMPLATES_PATH}/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteTemplate(templateId: number): Promise<void> {
  await apiFetch<void>(`${TEMPLATES_PATH}/${templateId}`, { method: "DELETE" });
}
