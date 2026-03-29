'use client';

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
import { Info } from "lucide-react";

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
  min_value?: string;
  max_value?: string;
  sample_value?: string;
  requires_lookup?: boolean;
  notes?: string;
};

type ComponentSchemaFormProps = {
  fields: ComponentFieldDefinition[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  disabled?: boolean;
};

const fieldWrapper =
  "rounded-lg border border-gray-200 bg-white p-4 space-y-2 shadow-sm";

const labelClass = "text-sm font-medium text-gray-900 flex items-center gap-2";

const helperTextClass = "text-xs text-gray-500 leading-snug";

const selectTriggerClass =
  "bg-white text-black border border-gray-300 focus-visible:ring-1 focus-visible:ring-black";

const inputClass =
  "bg-white text-black border border-gray-300 focus-visible:ring-1 focus-visible:ring-black";

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

            case "number":
              return (
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
                  className={inputClass}
                  min={field.min_value ?? undefined}
                  max={field.max_value ?? undefined}
                  step="any"
                />
              );

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
              {formatUnit(field.unit, field.notes)}
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
