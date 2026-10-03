"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIMARY_PATHWAYS, TEMPLATE_CATEGORIES } from "@/constants/plant-builder";
import {
  contentClass,
  dialogHeaderClass,
  inputClass,
  outlineBtnClass,
  primaryBtnClass,
  textareaClass,
  triggerClass,
} from "@/components/plant-builder/form-styles";
import { createTemplateFromDigitalTwin } from "@/services/plant-builder/templates";

type FormState = {
  name: string;
  description: string;
  category: string;
  pathway: string;
  isPublic: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The twin to snapshot; null when the plant has not been saved yet. */
  digitalTwinId: number | null;
  /** Prefills, taken from the current plant. */
  defaultName?: string;
  defaultPathway?: string;
};

export default function SaveTemplateDialog({
  open,
  onOpenChange,
  digitalTwinId,
  defaultName = "",
  defaultPathway = "",
}: Props) {
  const [form, setForm] = useState<FormState>(() => initialForm(defaultName, defaultPathway));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  // Fresh form, prefilled from the plant, every time the dialog opens.
  useEffect(() => {
    if (open) {
      setForm(initialForm(defaultName, defaultPathway));
      setErrors({});
    }
  }, [open, defaultName, defaultPathway]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Template name is required";
    if (!form.category) next.category = "Choose the kind of plant this template models";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!digitalTwinId) {
      toast.error("Save the plant model before creating a template from it.");
      return;
    }
    setSaving(true);
    try {
      await createTemplateFromDigitalTwin({
        digitalTwinId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        pathway: form.pathway || undefined,
        is_public: form.isPublic,
      });
      toast.success(
        form.isPublic
          ? `"${form.name.trim()}" was published to the template library.`
          : `"${form.name.trim()}" was saved to your templates.`
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="flex max-h-[88vh] max-w-lg flex-col gap-0 overflow-hidden bg-white p-0">
        <DialogHeader className={dialogHeaderClass}>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <BookmarkPlus className="h-5 w-5" aria-hidden />
            Save as Template
          </DialogTitle>
          <DialogDescription className="text-sm text-teal-50/90">
            Reuse this plant&rsquo;s layout and connections. Parameter values are not
            included.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <Field id="template-name" label="Template name" required error={errors.name}>
            <Input
              id="template-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Biogas AD with upgrading"
              maxLength={255}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="template-category" label="Plant type" required error={errors.category}>
              <Select value={form.category || undefined} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="template-category" className={triggerClass}>
                  <SelectValue placeholder="Select plant type" />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {TEMPLATE_CATEGORIES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="template-pathway" label="Pathway">
              <Select value={form.pathway || undefined} onValueChange={(v) => set("pathway", v)}>
                <SelectTrigger id="template-pathway" className={triggerClass}>
                  <SelectValue placeholder="Select pathway" />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {PRIMARY_PATHWAYS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id="template-description" label="Description">
            <Textarea
              id="template-description"
              className={`min-h-[90px] ${textareaClass}`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What does this layout cover, and when should someone use it?"
            />
          </Field>

          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <Switch
              id="template-public"
              checked={form.isPublic}
              onCheckedChange={(v) => set("isPublic", v)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="template-public" className="text-sm font-medium text-slate-900">
                Publish to library
              </Label>
              <p className="mt-1 text-xs text-slate-500">
                Everyone on the platform can find and use it. Leave off to keep it in
                &ldquo;My Templates&rdquo; only — you can publish it later.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className={outlineBtnClass}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className={primaryBtnClass}>
            {saving ? "Saving…" : "Save Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function initialForm(name: string, pathway: string): FormState {
  return { name, description: "", category: "", pathway, isPublic: false };
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
