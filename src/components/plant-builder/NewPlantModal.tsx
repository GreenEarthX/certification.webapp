"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
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

// Static-theme styling (no dark/light variants; explicit colors).
const inputClass = "h-11 bg-white border-gray-300 text-slate-900";
const triggerClass = "h-11 bg-white border-gray-300 text-slate-900";
const contentClass = "bg-white border-gray-300 text-slate-900";

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
};

export default function NewPlantModal({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<PlantFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        <DialogHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-white">
            New Plant
          </DialogTitle>
          <Stepper step={step} />
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {step === 1 ? (
            <Section1
              form={form}
              errors={errors}
              set={set}
            />
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
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white min-w-[140px]"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white min-w-[140px]"
            >
              {submitting ? "Creating…" : "Create Plant"}
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
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                done || active
                  ? "border-white bg-white text-blue-600"
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

function SubCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
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
        className="w-full border-dashed border-slate-300 text-slate-600"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add fuel
      </Button>
    </div>
  );
}
