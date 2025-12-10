"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelectEnum, MultiSelectOption } from "./MultiSelectEnum";
import { useRef } from "react";

export type CertificationFile = {
  name: string;
  url: string;
};

export type CertificationSelection = {
  value: string;        // enum value
  label: string;        // display label
  files: CertificationFile[];
};

type Props = {
  label?: string;
  options: MultiSelectOption[];
  value: CertificationSelection[];
  onChange: (next: CertificationSelection[]) => void;
  placeholder?: string;
};

export function CertificationMultiSelectWithUpload({
  label,
  options,
  value,
  onChange,
  placeholder = "Select certification sources",
}: Props) {
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedValues = value.map((v) => v.value);

  const handleOptionsChange = (nextValues: string[]) => {
    const next: CertificationSelection[] = nextValues.map((val) => {
      const existing = value.find((v) => v.value === val);
      if (existing) return existing;
      const option = options.find((o) => o.value === val);
      return {
        value: val,
        label: option?.label ?? val,
        files: [],
      };
    });
    onChange(next);
  };

  const handleFilesChange = (optionValue: string, filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const extraFiles: CertificationFile[] = Array.from(filesList).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const next = value.map((item) =>
      item.value === optionValue
        ? { ...item, files: [...item.files, ...extraFiles] }
        : item
    );

    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <MultiSelectEnum
        options={options}
        value={selectedValues}
        onChange={handleOptionsChange}
        placeholder={placeholder}
      />

      {value.length > 0 && (
        <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
          {value.map((item) => (
            <div key={item.value} className="space-y-1">
              <p className="text-sm font-medium text-black">
                {item.label}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Hidden input, triggered by button */}
                <input
                  ref={(el) => {
                    fileInputs.current[item.value] = el;
                  }}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    handleFilesChange(item.value, e.target.files)
                  }
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    fileInputs.current[item.value]?.click()
                  }
                  className="border-gray-300 bg-white text-black"
                >
                  Upload document(s)
                </Button>

                {item.files.map((f) => (
                  <a
                    key={f.url}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    {f.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
