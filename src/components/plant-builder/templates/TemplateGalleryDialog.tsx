"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  LayoutTemplate,
  Minus,
  Plus,
  RotateCcw,
  Search,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIMARY_PATHWAYS,
  TEMPLATE_CATEGORIES,
  type Option,
} from "@/constants/plant-builder";
import {
  contentClass,
  dialogHeaderClass,
  outlineBtnClass,
} from "@/components/plant-builder/form-styles";
import {
  EMPTY_TEMPLATE_FILTERS,
  filterTemplates,
  hasActiveFilters,
  templateStats,
  type TemplateFilters,
  type TemplateScope,
} from "@/lib/plant-builder/templates";
import { useTemplateLibrary } from "@/hooks/useTemplateLibrary";
import type { TemplateDto } from "@/services/plant-builder/templates";
import TemplateBadges from "./TemplateBadges";
import TemplateCard, { DIAGRAM_BACKDROP } from "./TemplateCard";
import TemplateDiagram from "./TemplateDiagram";

// Radix Select cannot hold an empty-string value, so "no filter" is a sentinel.
const ANY = "__any__";

const ZOOM_STEPS = [1, 1.5, 2, 3];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: TemplateDto) => void;
  /** Primary action on each template, e.g. "Use Template" or "Apply to Plant". */
  actionLabel?: string;
  subtitle?: string;
};

export default function TemplateGalleryDialog({
  open,
  onOpenChange,
  onUse,
  actionLabel = "Use Template",
  subtitle = "Start from a proven plant layout instead of a blank canvas.",
}: Props) {
  const library = useTemplateLibrary(open);
  const [filters, setFilters] = useState<TemplateFilters>(EMPTY_TEMPLATE_FILTERS);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TemplateDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Every open starts on the grid.
  useEffect(() => {
    if (open) setPreviewId(null);
  }, [open]);

  const visible = useMemo(
    () => filterTemplates(library.templates, filters, library.mineIds),
    [library.templates, library.mineIds, filters]
  );
  const previewed = library.templates.find((t) => t.id === previewId) ?? null;

  const patchFilters = (patch: Partial<TemplateFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handleTogglePublished = async (template: TemplateDto) => {
    const next = !template.is_public;
    try {
      await library.setPublished(template, next);
      toast.success(next ? `"${template.name}" is now in the library.` : `"${template.name}" is now private.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the template.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await library.remove(pendingDelete);
      if (previewId === pendingDelete.id) setPreviewId(null);
      toast.success(`Deleted "${pendingDelete.name}".`);
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the template.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[88vh] max-w-6xl flex-col gap-0 overflow-hidden bg-white p-0">
          <DialogHeader className={dialogHeaderClass}>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <LayoutTemplate className="h-5 w-5" aria-hidden />
              Browse Templates
            </DialogTitle>
            <DialogDescription className="text-sm text-teal-50/90">
              {subtitle}
            </DialogDescription>
          </DialogHeader>

          {previewed ? (
            <TemplatePreview
              template={previewed}
              isMine={library.mineIds.has(previewed.id)}
              actionLabel={actionLabel}
              onBack={() => setPreviewId(null)}
              onUse={() => onUse(previewed)}
            />
          ) : (
            <>
              <Toolbar
                filters={filters}
                onChange={patchFilters}
                resultCount={visible.length}
                ready={library.status === "ready"}
              />
              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-6 py-5">
                {library.status === "loading" || library.status === "idle" ? (
                  <GridSkeleton />
                ) : library.status === "error" ? (
                  <EmptyState
                    title="Couldn't load templates"
                    body={library.error ?? "Something went wrong."}
                    action={
                      <Button variant="outline" onClick={library.reload} className={outlineBtnClass}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Try again
                      </Button>
                    }
                  />
                ) : visible.length === 0 ? (
                  <EmptyGrid
                    filters={filters}
                    libraryEmpty={library.templates.length === 0}
                    onClear={() => setFilters({ ...EMPTY_TEMPLATE_FILTERS, scope: filters.scope })}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isMine={library.mineIds.has(template.id)}
                        actionLabel={actionLabel}
                        onPreview={() => setPreviewId(template.id)}
                        onUse={() => onUse(template)}
                        onTogglePublished={() => handleTogglePublished(template)}
                        onDelete={() => setPendingDelete(template)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(next) => {
          if (!next && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete this template?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              &ldquo;{pendingDelete?.name}&rdquo; will be removed from the library. Plants
              already created from it are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className={outlineBtnClass}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                // Keep the dialog open until the request settles.
                e.preventDefault();
                void handleConfirmDelete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function Toolbar({
  filters,
  onChange,
  resultCount,
  ready,
}: {
  filters: TemplateFilters;
  onChange: (patch: Partial<TemplateFilters>) => void;
  resultCount: number;
  ready: boolean;
}) {
  const scopes: { value: TemplateScope; label: string }[] = [
    { value: "all", label: "All Templates" },
    { value: "mine", label: "My Templates" },
  ];

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="tablist" aria-label="Template scope">
          {scopes.map((scope) => {
            const active = filters.scope === scope.value;
            return (
              <Button
                key={scope.value}
                role="tab"
                aria-selected={active}
                size="sm"
                variant={active ? "default" : "outline"}
                className={active ? "bg-[#0F766E] text-white hover:bg-[#0C5F59]" : outlineBtnClass}
                onClick={() => onChange({ scope: scope.value })}
              >
                {scope.label}
              </Button>
            );
          })}
        </div>
        {ready && (
          <span className="text-xs text-slate-500" aria-live="polite">
            {resultCount} {resultCount === 1 ? "template" : "templates"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_220px_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by name, description or author"
            aria-label="Search templates"
            className="h-10 border-slate-300 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0F766E] focus-visible:ring-2 focus-visible:ring-[#0F766E]/30"
          />
        </div>
        <FilterSelect
          value={filters.category}
          options={TEMPLATE_CATEGORIES}
          anyLabel="All categories"
          ariaLabel="Filter by category"
          onChange={(category) => onChange({ category })}
        />
        <FilterSelect
          value={filters.pathway}
          options={PRIMARY_PATHWAYS}
          anyLabel="All pathways"
          ariaLabel="Filter by pathway"
          onChange={(pathway) => onChange({ pathway })}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  anyLabel,
  ariaLabel,
  onChange,
}: {
  value: string | null;
  options: Option[];
  anyLabel: string;
  ariaLabel: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <Select value={value ?? ANY} onValueChange={(v) => onChange(v === ANY ? null : v)}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-10 border-slate-300 bg-white text-sm text-slate-900 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/30"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={contentClass}>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Preview ─────────────────────────────────────────────────────────────────

function TemplatePreview({
  template,
  isMine,
  actionLabel,
  onBack,
  onUse,
}: {
  template: TemplateDto;
  isMine: boolean;
  actionLabel: string;
  onBack: () => void;
  onUse: () => void;
}) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_STEPS[zoomIndex];
  const stats = templateStats(template);
  const author = isMine ? "you" : template.creator?.name || template.creator?.email || "unknown";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> All templates
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-slate-200 bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-xs tabular-nums text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onUse} className="bg-[#0F766E] text-white hover:bg-[#0C5F59]">
            {actionLabel}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_300px]">
        <div className={`min-h-[260px] overflow-auto ${DIAGRAM_BACKDROP}`}>
          <div style={{ width: `${zoom * 100}%` }} className="p-6">
            <TemplateDiagram
              topology={template.template_json}
              title={`${template.name} process flow`}
              className="block h-auto w-full"
            />
          </div>
        </div>

        <aside className="space-y-4 overflow-y-auto border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">By {author}</p>
          </div>
          <TemplateBadges template={template} showVisibility={isMine} />
          {template.description && (
            <p className="text-sm leading-relaxed text-slate-600">{template.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-2">
            {[
              ["Equipment", stats.equipment],
              ["Carriers", stats.carriers],
              ["Gates", stats.gates],
              ["Connections", stats.connections],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            Templates copy the plant layout and its connections. Parameter values start
            empty, so you enter the numbers for your own site.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Skeleton className="h-40 w-full rounded-none bg-slate-100" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3 bg-slate-100" />
            <Skeleton className="h-3 w-1/3 bg-slate-100" />
            <Skeleton className="h-3 w-full bg-slate-100" />
            <Skeleton className="h-8 w-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyGrid({
  filters,
  libraryEmpty,
  onClear,
}: {
  filters: TemplateFilters;
  libraryEmpty: boolean;
  onClear: () => void;
}) {
  if (libraryEmpty) {
    return (
      <EmptyState
        icon={<LayoutTemplate className="h-6 w-6" />}
        title="No templates yet"
        body="Open a plant in the builder and use “Save as Template” to share its layout here."
      />
    );
  }
  if (hasActiveFilters(filters)) {
    return (
      <EmptyState
        icon={<SearchX className="h-6 w-6" />}
        title="No templates match"
        body="Try a different search, category or pathway."
        action={
          <Button variant="outline" onClick={onClear} className={outlineBtnClass}>
            Clear filters
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={<LayoutTemplate className="h-6 w-6" />}
      title="You haven't saved any templates"
      body="Open one of your plants in the builder and use “Save as Template”."
    />
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
