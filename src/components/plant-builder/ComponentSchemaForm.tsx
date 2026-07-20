'use client';

import { useEffect, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CertificationMultiSelectWithUpload,
  type CertificationSelection,
} from "@/components/ui/CertificationMultiSelectWithUpload";
import { MultiSelectEnum } from "@/components/ui/MultiSelectEnum";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import clsx from "clsx";
import { Info, Loader2 } from "lucide-react";
import {
  fetchUnitFamilyOptions,
  convertUnitByFamily,
  type UnitFamilyRow,
} from "@/services/plant-builder/unitFamilies";

export type ComponentFieldDefinition = {
  field_name: string;
  field_type:
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "multiselect_file"
    | "textarea"
    | "date"
    | string;
  description?: string;
  validation_rules?: string;
  allowed_values?: string[];
  unit?: string;
  unit_family?: string;
  min_value?: string;
  max_value?: string;
  sample_value?: string;
  requires_lookup?: boolean;
  notes?: string;
  output_module?: string[];
};

type ComponentSchemaFormProps = {
  fields: ComponentFieldDefinition[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  disabled?: boolean;
};

const fieldWrapper =
  "rounded-lg border border-slate-200 bg-white p-4 space-y-2 shadow-sm transition-colors hover:border-[#0F766E]/40 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E]/20";

const labelClass = "text-sm font-medium text-slate-900 flex items-center gap-2";

const helperTextClass = "text-xs text-slate-500 leading-snug";

const selectTriggerClass =
  "bg-white text-slate-900 border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/25 data-[state=open]:border-[#0F766E]";

const inputClass =
  "bg-white text-slate-900 border border-slate-300 focus-visible:border-[#0F766E] focus-visible:ring-2 focus-visible:ring-[#0F766E]/25";

const unsupportedClass =
  "rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900";

const clampNumberInput = (value: string, min?: string, max?: string) => {
  if (value === "") return value;
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return value;
  const minVal = min != null ? Number.parseFloat(min) : Number.NaN;
  const maxVal = max != null ? Number.parseFloat(max) : Number.NaN;
  let next = numeric;
  if (Number.isFinite(minVal)) next = Math.max(next, minVal);
  if (Number.isFinite(maxVal)) next = Math.min(next, maxVal);
  return String(next);
};

const formatUnit = (unit?: string, notes?: string) => {
  if (!unit && !notes) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      {unit ? `(${unit})` : null}
      {notes ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
              aria-label="Field notes"
            >
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-xs bg-white text-gray-900 border border-gray-200 shadow-lg">
            <div className="text-xs leading-relaxed">{notes}</div>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  );
};

function normalizeKey(fieldName: string) {
  return fieldName.trim();
}

const ComponentSchemaForm = ({
  fields,
  values,
  onChange,
  disabled = false,
}: ComponentSchemaFormProps) => {
  const [unitOptions, setUnitOptions] = useState<Map<string, UnitFamilyRow[]>>(new Map());
  const [convertingFields, setConvertingFields] = useState<Set<string>>(new Set());

  // Fetch unit family options for all fields that have unit_family
  useEffect(() => {
    if (!fields || fields.length === 0) return;

    const families = [...new Set(
      fields
        .map((f) => f.unit_family)
        .filter((uf): uf is string => !!uf)
    )];

    if (families.length === 0) return;

    let cancelled = false;

    Promise.all(
      families.map(async (familyName) => {
        try {
          const rows = await fetchUnitFamilyOptions(familyName);
          return [familyName, rows] as const;
        } catch (err) {
          console.error(`Failed to fetch unit family "${familyName}":`, err);
          return [familyName, [] as UnitFamilyRow[]] as const;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const map = new Map<string, UnitFamilyRow[]>();
      for (const [name, rows] of results) {
        map.set(name, rows);
      }
      setUnitOptions(map);
    });

    return () => { cancelled = true; };
  }, [fields]);

  const getCanonicalUnit = useCallback(
    (familyName: string): string => {
      const rows = unitOptions.get(familyName);
      return rows?.[0]?.canonical_unit ?? "";
    },
    [unitOptions]
  );

  const getCurrentUnit = useCallback(
    (fieldName: string, familyName: string): string => {
      return values?.[fieldName + "_unit"] ?? getCanonicalUnit(familyName);
    },
    [values, getCanonicalUnit]
  );

  const handleUnitChange = useCallback(
    async (fieldName: string, familyName: string, newUnit: string) => {
      const oldUnit = getCurrentUnit(fieldName, familyName);
      if (oldUnit === newUnit) return;

      const currentValue = values?.[fieldName];
      const numericValue = currentValue != null && currentValue !== ""
        ? Number.parseFloat(String(currentValue))
        : null;

      if (numericValue == null || !Number.isFinite(numericValue)) {
        // No value to convert — just update the unit
        onChange(fieldName + "_unit", newUnit);
        return;
      }

      setConvertingFields((prev) => new Set(prev).add(fieldName));

      try {
        const result = await convertUnitByFamily(familyName, {
          from_unit: oldUnit,
          to_unit: newUnit,
          value: numericValue,
        });
        onChange(fieldName, String(result.converted_value));
        onChange(fieldName + "_unit", newUnit);
      } catch (err) {
        console.error(`Unit conversion failed for "${fieldName}":`, err);
        // On error, still update the unit but keep the old value
        onChange(fieldName + "_unit", newUnit);
      } finally {
        setConvertingFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldName);
          return next;
        });
      }
    },
    [values, getCurrentUnit, onChange]
  );

  if (!fields || fields.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        This component definition does not provide structured fields yet.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-4">
      {fields.map((field) => {
        const name = normalizeKey(field.field_name);
        const value = values?.[name];
        const placeholder = field.sample_value || `Enter ${field.field_name}`;
        const baseProps = {
          disabled,
          id: name,
          name,
        };

        const renderHelper = () => {
          if (!field.description && !field.validation_rules) return null;
          return (
            <p className={helperTextClass}>
              {field.description ?? ""}
              {field.description && field.validation_rules ? " · " : ""}
              {field.validation_rules ?? ""}
            </p>
          );
        };

        const renderField = () => {
          switch (field.field_type) {
            case "text":
              return (
                <Input
                  {...baseProps}
                  value={value ?? ""}
                  onChange={(e) => onChange(name, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              );

            case "textarea":
              return (
                <Textarea
                  {...baseProps}
                  value={value ?? ""}
                  onChange={(e) => onChange(name, e.target.value)}
                  placeholder={placeholder}
                  className={clsx(inputClass, "min-h-[100px]")}
                />
              );

            case "number": {
              const hasUnitFamily = !!field.unit_family;
              const familyRows = hasUnitFamily ? unitOptions.get(field.unit_family!) : undefined;
              const isConverting = convertingFields.has(name);

              const numberInput = (
                <Input
                  {...baseProps}
                  type="number"
                  value={
                    value === null || typeof value === "undefined"
                      ? ""
                      : value
                  }
                  onChange={(e) => onChange(name, e.target.value)}
                  onBlur={(e) => {
                    const nextValue = clampNumberInput(
                      e.target.value,
                      field.min_value,
                      field.max_value
                    );
                    if (nextValue !== e.target.value) {
                      onChange(name, nextValue);
                    }
                  }}
                  placeholder={placeholder}
                  className={clsx(inputClass, hasUnitFamily && "flex-1")}
                  min={field.min_value ?? undefined}
                  max={field.max_value ?? undefined}
                  step="any"
                  disabled={disabled || isConverting}
                />
              );

              if (!hasUnitFamily || !familyRows || familyRows.length === 0) {
                return numberInput;
              }

              const currentUnit = getCurrentUnit(name, field.unit_family!);
              const allowedUnits = familyRows.filter((r) => !r.requires_context);

              return (
                <div className="flex items-center gap-2">
                  {numberInput}
                  {isConverting && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  <Select
                    value={currentUnit}
                    onValueChange={(newUnit) =>
                      handleUnitChange(name, field.unit_family!, newUnit)
                    }
                    disabled={disabled || isConverting}
                  >
                    <SelectTrigger className={clsx(selectTriggerClass, "w-36")}>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border border-gray-200">
                      {allowedUnits.map((row) => (
                        <SelectItem key={row.allowed_unit} value={row.allowed_unit}>
                          {row.allowed_unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            case "date":
              return (
                <Input
                  {...baseProps}
                  type="date"
                  value={value ?? ""}
                  onChange={(e) => onChange(name, e.target.value)}
                  className={inputClass}
                />
              );

            case "select":
              return (
                <Select
                  value={(value as string) ?? undefined}
                  onValueChange={(next) => onChange(name, next)}
                  disabled={disabled}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder={`Select ${field.field_name}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-200">
                    {(field.allowed_values ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );

            case "multiselect":
              return (
                <MultiSelectEnum
                  options={(field.allowed_values ?? []).map((val) => ({
                    value: val,
                    label: val,
                  }))}
                  value={Array.isArray(value) ? value : []}
                  onChange={(next) => onChange(name, next)}
                  disabled={disabled}
                  placeholder={`Select ${field.field_name}`}
                />
              );

            case "multiselect_file":
              return (
                <CertificationMultiSelectWithUpload
                  options={(field.allowed_values ?? []).map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    Array.isArray(value)
                      ? (value as CertificationSelection[])
                      : []
                  }
                  onChange={(next) => onChange(name, next)}
                  placeholder={`Select ${field.field_name}`}
                />
              );

            default:
              return (
                <div className={unsupportedClass}>
                  Unsupported field type "{field.field_type}". Value will be
                  stored as plain text.
                  <Input
                    {...baseProps}
                    value={value ?? ""}
                    onChange={(e) => onChange(name, e.target.value)}
                    placeholder={placeholder}
                    className={clsx(inputClass, "mt-2")}
                  />
                </div>
              );
          }
        };

        return (
          <div key={name} className={fieldWrapper}>
            <Label htmlFor={name} className={labelClass}>
              <span>{field.field_name}</span>
              {formatUnit(field.unit_family ? undefined : field.unit, field.notes)}
              {field.requires_lookup && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                  Lookup required
                </span>
              )}
            </Label>
            {renderField()}
            {renderHelper()}
          </div>
        );
      })}
      </div>
    </TooltipProvider>
  );
};

export default ComponentSchemaForm;
