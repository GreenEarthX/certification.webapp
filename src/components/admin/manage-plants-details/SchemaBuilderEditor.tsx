"use client";

import React, { useState } from "react";
import { FiArrowUp, FiArrowDown, FiEdit2, FiTrash2, FiPlus, FiSave, FiX } from "react-icons/fi";


// Field structure used in the form
interface Field {
  key: string;
  label: string;
  type: string;
  options?: string[];
  withInputKey?: string;
  withInputLabel?: string;
  validation?: {
    maxTotal?: number;
    errorMessage?: string;
  };
  condition?: {
    field?: string;
    value?: string | string[] | boolean;
  };
}

// Props expected by the SchemaBuilderEditor component
interface Props {
  sectionKey: string;
  sectionTitle: string;
  fields: Field[];
  allFieldPaths: string[]; // To Dropdown values for condition.field
  onAddField: (field: Field) => void;
  onRemoveField: (index: number) => void;
  onUpdateField?: (index: number, field: Field) => void;
  onMoveField?: (index: number, direction: "up" | "down") => void;
}

// Available field types for the dropdown
const FIELD_TYPES = [
  "text",
  "number",
  "select",
  "multiSelect",
  "radio",
  "radioGroup",
  "radioWithInput",
  "date",
  "textarea",
  "locationPortion",
  "disabledSelect"
];

// Helper function to parse condition value (string → boolean | array | string)
function parseConditionValue(input: string): string | boolean | string[] {
  const trimmed = input.trim().toLowerCase();

  // Handle boolean true/false
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Handle comma-separated string array
  if (input.includes(",")) {
    return input.split(",").map(v => v.trim());
  }

  return input;
}


const SchemaBuilderEditor: React.FC<Props> = ({
  sectionKey,
  sectionTitle,
  fields,
  allFieldPaths,
  onAddField,
  onRemoveField,
  onUpdateField,
  onMoveField
}) => {
  // Local state for the new field being added
  const [newField, setNewField] = useState<Field>({ key: "", label: "", type: "text" });

  // Local state for handling options input (for select, etc.)
  const [optionInput, setOptionInput] = useState("");

  // Local state for tracking which field is being edited (if any)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);


  // Update newField state when any field input changes
  const handleChange = (field: Partial<Field>) => {
    setNewField(prev => ({ ...prev, ...field }));
  };

  // Parse and set options when the user finishes editing the options input
  const handleOptionsAdd = () => {
    if (!optionInput.trim()) return;
    const options = optionInput.split(",").map(opt => opt.trim());
    setNewField(prev => ({ ...prev, options }));
  };

  // Validate and add the new field to the parent section
 const handleSaveField = () => {
  if (!newField.key || !newField.label || !newField.type) return;

  if (editingIndex !== null) {
    onUpdateField?.(editingIndex, newField);
    setEditingIndex(null);
  } else {
    const isDuplicate = fields.some(f => f.key === newField.key);
    if (isDuplicate) {
      alert("A field with this key already exists.");
      return;
    }
    onAddField(newField);
  }


  setNewField({ key: "", label: "", type: "text" });
  setOptionInput("");
};


   return (
    <div className="border rounded p-4 mb-6 bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-blue-700">{sectionTitle}</h3>

      {/* Basic field inputs: key, label, type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Key"
          value={newField.key}
          onChange={e => handleChange({ key: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Label"
          value={newField.label}
          onChange={e => handleChange({ label: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={newField.type}
          onChange={e => handleChange({ type: e.target.value })}
        >
          {FIELD_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* If the selected type requires options, show this input */}
      {["select", "multiSelect", "radioGroup"].includes(newField.type) && (
        <div className="mb-4">
          <input
            className="border p-2 w-full rounded"
            placeholder="Options (comma-separated)"
            value={optionInput}
            onChange={e => setOptionInput(e.target.value)}
            onBlur={handleOptionsAdd}
          />
        </div>
      )}

      {newField.type === "radioWithInput" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="withInputKey"
            value={newField.withInputKey || ""}
            onChange={e => handleChange({ withInputKey: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="withInputLabel"
            value={newField.withInputLabel || ""}
            onChange={e => handleChange({ withInputLabel: e.target.value })}
          />
        </div>
      )}

      {newField.type === "locationPortion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Max total %"
            type="number"
            onChange={e =>
              handleChange({
                validation: {
                  ...newField.validation,
                  maxTotal: parseInt(e.target.value)
                }
              })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Error message"
            onChange={e =>
              handleChange({
                validation: {
                  ...newField.validation,
                  errorMessage: e.target.value
                }
              })
            }
          />
        </div>
      )}

      {/* Optional: Add condition logic to the field */}
      <div className="mb-4 border p-3 rounded bg-gray-50">
        <label className="block font-semibold mb-2">Condition (optional)</label>
        <select
          className="border p-2 rounded w-full mb-2"
          value={newField.condition?.field || ""}
          onChange={e =>
            handleChange({
              condition: {
                ...newField.condition,
                field: e.target.value
              }
            })
          }
        >
          <option value="">-- Select a field for condition --</option>
          {allFieldPaths.map(path => (
            <option key={path} value={path}>{path}</option>
          ))}
        </select>
        <input
          className="border p-2 w-full rounded"
          placeholder="Condition Value (e.g. hydrogen, true, false)"
          value={
            Array.isArray(newField.condition?.value)
              ? newField.condition.value.join(", ")
              : newField.condition?.value !== undefined
                ? String(newField.condition.value)
                : ""
          }
          onChange={e =>
            handleChange({
              condition: {
                ...newField.condition,
                value: parseConditionValue(e.target.value)
              }
            })
          }
        />
      </div>

      {/* Button group: Save/Add + Cancel (if editing) */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <button
            onClick={handleSaveField}
            className="flex items-center gap-2 border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 transition"
          >
            {editingIndex !== null ? (
              <>
                <FiSave /> Save Changes
              </>
            ) : (
              <>
                <FiPlus /> Add Field
              </>
            )}
          </button>

          {editingIndex !== null && (
            <button
              onClick={() => {
                setNewField({ key: "", label: "", type: "text" });
                setOptionInput("");
                setEditingIndex(null);
              }}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              <FiX /> Cancel Edit
            </button>
          )}
        </div>

        {/* Show the list of added fields with remove/edit buttons */}
        {fields.length > 0 && (
          <ul className="space-y-3">
            {fields.map((f, idx) => (
              <li
                key={idx}
                className="border rounded-md p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
              >
                <div className="mb-2 md:mb-0">
                  <div className="font-medium text-gray-800">{f.label}</div>
                  <div className="text-xs text-gray-500">({f.type})</div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => onMoveField?.(idx, "up")}
                    disabled={idx === 0}
                    className={`flex items-center gap-1 border px-3 py-2 text-sm rounded ${
                      idx === 0
                        ? "text-gray-300 border-gray-300 cursor-not-allowed"
                        : "text-gray-600 border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <FiArrowUp /> Up
                  </button>

                  <button
                    onClick={() => onMoveField?.(idx, "down")}
                    disabled={idx === fields.length - 1}
                    className={`flex items-center gap-1 border px-3 py-2 text-sm rounded ${
                      idx === fields.length - 1
                        ? "text-gray-300 border-gray-300 cursor-not-allowed"
                        : "text-gray-600 border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <FiArrowDown /> Down
                  </button>

                  <button
                    onClick={() => {
                      setNewField(fields[idx]);
                      setOptionInput(fields[idx].options?.join(", ") || "");
                      setEditingIndex(idx);
                    }}
                    className="flex items-center gap-1 border border-blue-500 text-blue-500 px-3 py-2 text-sm rounded hover:bg-blue-50"
                  >
                    <FiEdit2 /> Edit
                  </button>

                  <button
                    onClick={() => onRemoveField(idx)}
                    className="flex items-center gap-1 border border-red-500 text-red-500 px-3 py-2 text-sm rounded hover:bg-red-50"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

        )}

    </div>
  );
};

export default SchemaBuilderEditor;
