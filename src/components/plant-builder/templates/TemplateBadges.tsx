import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRIMARY_PATHWAYS, TEMPLATE_CATEGORIES } from "@/constants/plant-builder";
import { optionLabel } from "@/lib/plant-builder/templates";
import type { TemplateDto } from "@/services/plant-builder/templates";

// Explicit colours: Badge's default variants rely on shadcn tokens that are
// undefined in this app.
const badgeBase = "rounded-full px-2 py-0.5 text-[11px] font-medium";

type Props = {
  template: Pick<TemplateDto, "category" | "pathway" | "is_public">;
  /** Show the private marker (only meaningful to the template's owner). */
  showVisibility?: boolean;
};

export default function TemplateBadges({ template, showVisibility = false }: Props) {
  const category = optionLabel(TEMPLATE_CATEGORIES, template.category);
  const pathway = optionLabel(PRIMARY_PATHWAYS, template.pathway);

  if (!category && !pathway && !(showVisibility && !template.is_public)) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {category && (
        <Badge
          variant="outline"
          className={`${badgeBase} border-[#0F766E]/20 bg-[#0F766E]/10 text-[#0F766E]`}
        >
          {category}
        </Badge>
      )}
      {pathway && (
        <Badge
          variant="outline"
          className={`${badgeBase} border-slate-200 bg-slate-50 text-slate-600`}
        >
          {pathway}
        </Badge>
      )}
      {showVisibility && !template.is_public && (
        <Badge
          variant="outline"
          className={`${badgeBase} gap-1 border-amber-200 bg-amber-50 text-amber-700`}
        >
          <Lock className="h-3 w-3" aria-hidden />
          Private
        </Badge>
      )}
    </div>
  );
}
