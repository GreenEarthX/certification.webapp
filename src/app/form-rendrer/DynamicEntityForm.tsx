// DynamicEntityForm.tsx
"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CertificationMultiSelectWithUpload,
  type CertificationSelection,
} from "@/components/ui/CertificationMultiSelectWithUpload";
import { MultiSelectEnum } from "@/components/ui/MultiSelectEnum";

import type {
  EntityDefinition,
  FieldDefinition,
  UiType,
} from "./exampleEntityDefinition";

// ---------- styling helpers (white UI) ----------
const INPUT_CLASS =
  "bg-white text-black border border-gray-300 rounded px-3 py-2";
const SELECT_TRIGGER_CLASS =
  "bg-white text-black border border-gray-300 rounded px-3 py-2";
const FORM_WRAPPER_CLASS =
  "mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border bg-white p-6 text-black";

// Helper: generate a safe key from field name
const toKey = (fieldName: string) =>
  fieldName.toLowerCase().replace(/\s+/g, "_");

// ---- Reusable small field components ----

interface BaseFieldProps {
  label: string;
  required?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  required,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <Label className="font-medium">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <Input
      className={INPUT_CLASS}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
    />
  </div>
);

interface NumberFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  min?: number;
  max?: number;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  required,
  value,
  onChange,
  unit,
  min,
  max,
}) => (
  <div className="flex flex-col gap-1">
    <Label className="font-medium flex items-center gap-1">
      <span>{label}</span>
      {unit && <span className="text-xs text-gray-500">({unit})</span>}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <Input
      type="number"
      className={INPUT_CLASS}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      min={min}
      max={max}
      step="any"  
    />
  </div>
);

interface DateFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  required,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <Label className="font-medium">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <Input
      type="date"
      className={INPUT_CLASS}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  options?: string[];
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  value,
  options,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <Label className="font-medium">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="bg-white text-black border border-gray-300">
        {options?.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface MultiSelectFieldProps extends BaseFieldProps {
  values: string[];
  options?: string[];
  onChange: (values: string[]) => void;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  required,
  values,
  options,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <Label className="font-medium">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </Label>
    <MultiSelectEnum
      options={(options ?? []).map((v) => ({ value: v }))}
      value={values}
      onChange={onChange}
      placeholder={`Select ${label}`}
    />
  </div>
);

interface MultiSelectFileFieldProps extends BaseFieldProps {
  value: CertificationSelection[];
  options?: string[];
  onChange: (value: CertificationSelection[]) => void;
}

const MultiSelectFileField: React.FC<MultiSelectFileFieldProps> = ({
  label,
  required, // kept for consistency
  value,
  options,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded border bg-white p-3">
      <CertificationMultiSelectWithUpload
        label={label}
        options={(options ?? []).map((c) => ({ value: c }))}
        value={value}
        onChange={onChange}
        placeholder={`Select ${label}`}
      />
    </div>
  );
};

// ---- Main form renderer ----

type FormValues = Record<string, any>;

interface DynamicEntityFormProps {
  definition: EntityDefinition;
}

const DynamicEntityForm: React.FC<DynamicEntityFormProps> = ({ definition }) => {
  const [values, setValues] = useState<FormValues>({});

  const handleFieldChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form values:", values);
    alert("Check console for submitted values (including certification uploads).");
  };

  const renderField = (field: FieldDefinition) => {
    const key = toKey(field.field_name);
    const value = values[key];
    const type: UiType = field.field_type;

    switch (type) {
      case "text":
        return (
          <TextField
            key={key}
            label={field.field_name}
            required={field.required}
            value={value ?? ""}
            onChange={(v) => handleFieldChange(key, v)}
          />
        );
      case "number":
        return (
          <NumberField
            key={key}
            label={field.field_name}
            required={field.required}
            value={value ?? ""}
            onChange={(v) => handleFieldChange(key, v)}
            unit={field.unit}
            min={field.min}
            max={field.max}
          />
        );
      case "date":
        return (
          <DateField
            key={key}
            label={field.field_name}
            required={field.required}
            value={value ?? ""}
            onChange={(v) => handleFieldChange(key, v)}
          />
        );
      case "select":
        return (
          <SelectField
            key={key}
            label={field.field_name}
            required={field.required}
            value={value ?? ""}
            options={field.allowed_values}
            onChange={(v) => handleFieldChange(key, v)}
          />
        );
      case "multiselect":
        return (
          <MultiSelectField
            key={key}
            label={field.field_name}
            required={field.required}
            values={value ?? []}
            options={field.allowed_values}
            onChange={(vals) => handleFieldChange(key, vals)}
          />
        );
      case "multiselect_file":
        return (
          <MultiSelectFileField
            key={key}
            label={field.field_name}
            required={field.required}
            value={(value ?? []) as CertificationSelection[]}
            options={field.allowed_values}
            onChange={(v) => handleFieldChange(key, v)}
          />
        );
      default:
        return (
          <TextField
            key={key}
            label={field.field_name}
            required={field.required}
            value={value ?? ""}
            onChange={(v) => handleFieldChange(key, v)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={FORM_WRAPPER_CLASS}>
      <h1 className="mb-2 text-2xl font-semibold">
        {definition.entity_name} – Dynamic Form
      </h1>

      <div className="flex flex-col gap-4">
        {definition.fields.map((field) => renderField(field))}
      </div>

      <button
        type="submit"
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default DynamicEntityForm;
