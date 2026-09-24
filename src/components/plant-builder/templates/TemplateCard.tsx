"use client";

import { Eye, Globe, Lock, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { outlineBtnClass } from "@/components/plant-builder/form-styles";
import { templateStats } from "@/lib/plant-builder/templates";
import type { TemplateDto } from "@/services/plant-builder/templates";
import TemplateBadges from "./TemplateBadges";
import TemplateDiagram from "./TemplateDiagram";

// Dot grid behind diagrams, echoing the builder canvas.
export const DIAGRAM_BACKDROP =
  "bg-slate-50 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:14px_14px]";

const menuItemClass = "cursor-pointer gap-2 focus:bg-slate-100 focus:text-slate-900";

type Props = {
  template: TemplateDto;
  isMine: boolean;
  actionLabel: string;
  onPreview: () => void;
  onUse: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
};

export default function TemplateCard({
  template,
  isMine,
  actionLabel,
  onPreview,
  onUse,
  onTogglePublished,
  onDelete,
}: Props) {
  const stats = templateStats(template);
  const author = isMine
    ? "By you"
    : `By ${template.creator?.name || template.creator?.email || "unknown"}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#0F766E]/40 hover:shadow-md">
      <button
        type="button"
        onClick={onPreview}
        className={`relative h-40 w-full border-b border-slate-200 ${DIAGRAM_BACKDROP} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F766E]/40`}
        aria-label={`Preview ${template.name}`}
      >
        <TemplateDiagram
          topology={template.template_json}
          showLabels={false}
          title={`${template.name} process flow`}
          className="h-full w-full p-4"
        />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Preview
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900" title={template.name}>
              {template.name}
            </h3>
            <p className="truncate text-xs text-slate-500">{author}</p>
          </div>
          {isMine && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={`Manage ${template.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* Above the gallery Dialog (z-[1301]); the primitive defaults to z-50. */}
              <DropdownMenuContent align="end" className="z-[1400] w-52 border-slate-200 bg-white">
                <DropdownMenuItem className={menuItemClass} onSelect={onTogglePublished}>
                  {template.is_public ? (
                    <>
                      <Lock className="h-4 w-4" aria-hidden /> Make private
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" aria-hidden /> Publish to library
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  className={`${menuItemClass} text-red-600 focus:bg-red-50 focus:text-red-700`}
                  onSelect={onDelete}
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {template.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
            {template.description}
          </p>
        )}

        <TemplateBadges template={template} showVisibility={isMine} />

        <p className="text-xs text-slate-500">
          {stats.equipment} equipment · {stats.carriers} carriers ·{" "}
          {stats.connections} connections
        </p>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
            className={`flex-1 ${outlineBtnClass}`}
          >
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onUse}
            className="flex-1 bg-[#0F766E] text-white hover:bg-[#0C5F59]"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
