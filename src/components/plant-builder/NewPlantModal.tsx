"use client";

import { useEffect, useState } from "react";
import { Check, LayoutTemplate, Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIMARY_PATHWAYS,
  PLANT_CONFIGURATIONS,
  SITE_ENVIRONMENTS,
  MATURITY_STAGES,
  CERTIFICATION_PHASES,
  FUEL_TYPES,
  CAPACITY_UNITS,
  COUNTRIES,
  type Option,
} from "@/constants/plant-builder";
import {
  buildPlantPayload,
  type PlantFormValues,
  type PlantFuelRow,
  type PlantPayload,
} from "@/services/plant-builder/plants";
import type { TemplateDto } from "@/services/plant-builder/templates";
import { templateStats } from "@/lib/plant-builder/templates";
import TemplateBadges from "@/components/plant-builder/templates/TemplateBadges";
import TemplateDiagram from "@/components/plant-builder/templates/TemplateDiagram";

import {
  brandOutlineBtnClass,
  contentClass,
  dialogHeaderClass,
  inputClass,
  outlineBtnClass,
  primaryBtnClass,
  triggerClass,
} from "@/components/plant-builder/form-styles";

const EMPTY_FUEL: PlantFuelRow = {
  fuel_type: "",
  capacity: "",
  capacity_unit: "",
};

const EMPTY_FORM: PlantFormValues = {
  plantName: "",
  pathway: "",
  plantConfiguration: "",
  siteEnvironment: "",
  country: "",
  region: "",
  city: "",
  postalCode: "",
  street: "",
  latitude: "",
  longitude: "",
  publishToEcosystem: false,
  maturityStage: "",
  certificationPhase: "",
  commercialOperationDate: "",
  projectLifetimeYears: "",
  fuels: [{ ...EMPTY_FUEL }],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onSubmit: (payload: PlantPayload) => void;
  /** Template the new plant will start from; null for a blank plant. */
  template?: TemplateDto | null;
  /** Opens the template gallery. Omit to hide the "Start from" section. */
  onBrowseTemplates?: () => void;
  onClearTemplate?: () => void;
};

export default function NewPlantModal({
  open,
  onOpenChange,
  submitting,
  onSubmit,
  template = null,
  onBrowseTemplates,
  onClearTemplate,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<PlantFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // A template suggests its pathway, but never overrides one already chosen.
  const templatePathway = template?.pathway ?? null;
  useEffect(() => {
    if (!templatePathway) return;
    setForm((prev) => (prev.pathway ? prev : { ...prev, pathway: templatePathway }));
  }, [templatePathway]);

  const set =
    <K extends keyof PlantFormValues>(field: K) =>
    (value: PlantFormValues[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const setFuel = (index: number, field: keyof PlantFuelRow, value: string) => {
    setForm((prev) => {
      const fuels = prev.fuels.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
      return { ...prev, fuels };
    });
    setErrors((prev) => ({ ...prev, [`fuel_${index}`]: "" }));
  };

  const addFuel = () =>
    setForm((prev) => ({ ...prev, fuels: [...prev.fuels, { ...EMPTY_FUEL }] }));

  const removeFuel = (index: number) =>
    setForm((prev) => ({
      ...prev,
      fuels: prev.fuels.filter((_, i) => i !== index),
    }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setStep(1);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!form.plantName.trim()) next.plantName = "Plant name is required";
    if (!form.country) next.country = "Country is required";
    if (!form.maturityStage)
      next.maturityStage = "Project maturity stage is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    form.fuels.forEach((row, i) => {
      const hasData = row.capacity.trim() || row.capacity_unit;
      if (hasData && !row.fuel_type) {
        next[`fuel_${i}`] = "Select a fuel type for this row";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleCreate = () => {
    if (!validateStep2()) return;
    onSubmit(buildPlantPayload(form));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-hidden flex flex-col bg-white p-0">
        <DialogHeader className={dialogHeaderClass}>
          <DialogTitle className="text-xl font-bold text-white">
            New Plant
          </DialogTitle>
          <p className="text-sm text-teal-50/90">
            {template
              ? `Starting from the "${template.name}" template. Set up the plant profile, then add the products it makes.`
              : "Set up the plant profile, then add the products it makes."}
          </p>
          <Stepper step={step} />
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {step === 1 ? (
            <div className="space-y-6">
              {onBrowseTemplates && (
                <StartFromCard
                  template={template}
                  onBrowse={onBrowseTemplates}
                  onClear={onClearTemplate}
                />
              )}
              <Section1 form={form} errors={errors} set={set} />
            </div>
          ) : (
            <Section2
              form={form}
              errors={errors}
              setFuel={setFuel}
              addFuel={addFuel}
              removeFuel={removeFuel}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          {step === 2 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={submitting}
              className={outlineBtnClass}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className={outlineBtnClass}
            >
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button type="button" onClick={handleNext} className={primaryBtnClass}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className={primaryBtnClass}
            >
              {submitting
                ? "Creating…"
                : template
                  ? "Create from Template"
                  : "Create Plant"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const labels = ["Plant Profile", "Product"];
  return (
    <div className="mt-3 flex items-center gap-3">
      {labels.map((label, i) => {
        const index = (i + 1) as 1 | 2;
        const done = step > index;
        const active = step === index;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                done || active
                  ? "border-white bg-white text-[#0F766E]"
                  : "border-white/50 text-white/70"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : index}
            </div>
            <span
              className={`text-sm font-medium ${
                active || done ? "text-white" : "text-white/70"
              }`}
            >
              {label}
            </span>
            {i === 0 && <div className="ml-1 h-px flex-1 bg-white/40" />}
          </div>
        );
      })}
    </div>
  );
}

function StartFromCard({
  template,
  onBrowse,
  onClear,
}: {
  template: TemplateDto | null;
  onBrowse: () => void;
  onClear?: () => void;
}) {
  if (!template) {
    return (
      <SubCard title="Start From">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Blank plant. Or start from a template to get a ready-made layout.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onBrowse}
            className={`shrink-0 ${brandOutlineBtnClass}`}
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Browse templates
          </Button>
        </div>
      </SubCard>
    );
  }

  const stats = templateStats(template);
  return (
    <SubCard title="Start From">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white sm:w-40">
          <TemplateDiagram
            topology={template.template_json}
            showLabels={false}
            title={`${template.name} process flow`}
            className="h-full w-full p-2"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="truncate text-sm font-semibold text-slate-900">{template.name}</div>
          <TemplateBadges template={template} />
          <p className="text-xs text-slate-500">
            {stats.components} components · {stats.connections} connections, applied when
            the plant is created. Parameter values start empty.
          </p>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBrowse}
            className={outlineBtnClass}
          >
            Change
          </Button>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </SubCard>
  );
}

function SubCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        <span className="h-3.5 w-1 rounded-full bg-[#0F766E]" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function EnumSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={triggerClass}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClass}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Section1({
  form,
  errors,
  set,
}: {
  form: PlantFormValues;
  errors: Record<string, string>;
  set: <K extends keyof PlantFormValues>(
    field: K,
  ) => (value: PlantFormValues[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <SubCard title="Plant Configuration">
        <Field label="Plant Name" required error={errors.plantName}>
          <Input
            className={inputClass}
            value={form.plantName}
            onChange={(e) => set("plantName")(e.target.value)}
            placeholder="Plant name"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Primary Pathway">
            <EnumSelect
              value={form.pathway}
              options={PRIMARY_PATHWAYS}
              placeholder="Select pathway"
              onChange={set("pathway")}
            />
          </Field>
          <Field label="Plant Configuration">
            <EnumSelect
              value={form.plantConfiguration}
              options={PLANT_CONFIGURATIONS}
              placeholder="Select configuration"
              onChange={set("plantConfiguration")}
            />
          </Field>
          <Field label="Site Environment">
            <EnumSelect
              value={form.siteEnvironment}
              options={SITE_ENVIRONMENTS}
              placeholder="Select environment"
              onChange={set("siteEnvironment")}
            />
          </Field>
        </div>
      </SubCard>

      <SubCard title="Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Country" required error={errors.country}>
            <Select
              value={form.country || undefined}
              onValueChange={set("country")}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className={`${contentClass} max-h-72`}>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Region or State">
            <Input
              className={inputClass}
              value={form.region}
              onChange={(e) => set("region")(e.target.value)}
              placeholder="Region or state"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="City">
            <Input
              className={inputClass}
              value={form.city}
              onChange={(e) => set("city")(e.target.value)}
              placeholder="City"
            />
          </Field>
          <Field label="Postal Code">
            <Input
              className={inputClass}
              value={form.postalCode}
              onChange={(e) => set("postalCode")(e.target.value)}
              placeholder="Postal code"
            />
          </Field>
        </div>
        <Field label="Address">
          <Input
            className={inputClass}
            value={form.street}
            onChange={(e) => set("street")(e.target.value)}
            placeholder="Street address"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Latitude (optional)">
            <Input
              className={inputClass}
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => set("latitude")(e.target.value)}
              placeholder="Latitude"
            />
          </Field>
          <Field label="Longitude (optional)">
            <Input
              className={inputClass}
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => set("longitude")(e.target.value)}
              placeholder="Longitude"
            />
          </Field>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <Switch
            checked={form.publishToEcosystem}
            onCheckedChange={(v) => set("publishToEcosystem")(v)}
            className="mt-0.5"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              Publish to Ecosystem Map
            </div>
            <p className="mt-1 text-xs text-slate-500">
              When enabled, this plant is added to the Ecosystem Map (or
              enriches a matching verified project) using non-sensitive fields
              only: name, location, capacity, pathway and status.
            </p>
          </div>
        </div>
      </SubCard>

      <SubCard title="Project Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Project Maturity Stage"
            required
            error={errors.maturityStage}
          >
            <EnumSelect
              value={form.maturityStage}
              options={MATURITY_STAGES}
              placeholder="Select stage"
              onChange={set("maturityStage")}
            />
          </Field>
          <Field label="Certification Phase">
            <EnumSelect
              value={form.certificationPhase}
              options={CERTIFICATION_PHASES}
              placeholder="Select phase"
              onChange={set("certificationPhase")}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Commercial Operation Date (COD)">
            <Input
              className={inputClass}
              type="date"
              value={form.commercialOperationDate}
              onChange={(e) => set("commercialOperationDate")(e.target.value)}
            />
          </Field>
          <Field label="Project Lifetime (years)">
            <Input
              className={inputClass}
              type="number"
              min="0"
              value={form.projectLifetimeYears}
              onChange={(e) => set("projectLifetimeYears")(e.target.value)}
              placeholder="e.g., 25"
            />
          </Field>
        </div>
      </SubCard>
    </div>
  );
}

function Section2({
  form,
  errors,
  setFuel,
  addFuel,
  removeFuel,
}: {
  form: PlantFormValues;
  errors: Record<string, string>;
  setFuel: (index: number, field: keyof PlantFuelRow, value: string) => void;
  addFuel: () => void;
  removeFuel: (index: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Add the fuels this plant produces. You can add as many as you need, or
        none for now and complete them later.
      </p>

      {form.fuels.map((row, i) => (
        <div
          key={i}
          className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Fuel {i + 1}
            </div>
            {form.fuels.length > 1 && (
              <button
                type="button"
                onClick={() => removeFuel(i)}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>

          <Field label="Fuel Type" required error={errors[`fuel_${i}`]}>
            <EnumSelect
              value={row.fuel_type}
              options={FUEL_TYPES}
              placeholder="Select fuel type"
              onChange={(v) => setFuel(i, "fuel_type", v)}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Production Capacity">
              <Input
                className={inputClass}
                type="number"
                min="0"
                step="any"
                value={row.capacity}
                onChange={(e) => setFuel(i, "capacity", e.target.value)}
                placeholder="e.g., 1000"
              />
            </Field>
            <Field label="Capacity Unit">
              <EnumSelect
                value={row.capacity_unit}
                options={CAPACITY_UNITS}
                placeholder="Select unit"
                onChange={(v) => setFuel(i, "capacity_unit", v)}
              />
            </Field>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addFuel}
        className="w-full border-dashed border-slate-300 bg-white text-slate-600 hover:border-[#0F766E] hover:bg-[#0F766E]/5 hover:text-[#0F766E]"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add fuel
      </Button>
    </div>
  );
}
