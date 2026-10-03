"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteTemplate,
  fetchMyTemplates,
  fetchTemplates,
  updateTemplateMeta,
  type TemplateDto,
} from "@/services/plant-builder/templates";

type Status = "idle" | "loading" | "ready" | "error";

export type TemplateLibrary = {
  templates: TemplateDto[];
  /** Ids of the templates the current user owns. */
  mineIds: ReadonlySet<number>;
  status: Status;
  error: string | null;
  reload: () => void;
  setPublished: (template: TemplateDto, isPublic: boolean) => Promise<void>;
  remove: (template: TemplateDto) => Promise<void>;
};

/**
 * Loads the template library each time `enabled` becomes true (i.e. whenever
 * the gallery opens), so a template saved a moment ago is always listed.
 *
 * "Mine" comes from GET /templates rather than from comparing ids with the
 * current user, so the gallery needs no user context wherever it is mounted.
 */
export function useTemplateLibrary(enabled: boolean): TemplateLibrary {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [mineIds, setMineIds] = useState<ReadonlySet<number>>(new Set());
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    setStatus("loading");
    setError(null);
    Promise.all([fetchTemplates(), fetchMyTemplates()])
      .then(([library, mine]) => {
        if (cancelled) return;
        setTemplates(library ?? []);
        setMineIds(new Set((mine ?? []).map((t) => t.id)));
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load templates.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const setPublished = useCallback(
    async (template: TemplateDto, isPublic: boolean) => {
      await updateTemplateMeta(template.id, { is_public: isPublic });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, is_public: isPublic } : t))
      );
    },
    []
  );

  const remove = useCallback(async (template: TemplateDto) => {
    await deleteTemplate(template.id);
    setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    setMineIds((prev) => {
      const next = new Set(prev);
      next.delete(template.id);
      return next;
    });
  }, []);

  return { templates, mineIds, status, error, reload, setPublished, remove };
}
