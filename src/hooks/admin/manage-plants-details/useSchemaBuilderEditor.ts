import { useEffect, useState } from "react";
import { SectionSchema } from "@/services/plants/fetchPlantAPI";


// Define a field structure
export interface Field {
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
}

// Define a section structure (each section has fields and optional subsections)
export interface Section {
  title: string;
  key: string;
  fields: Field[];
  subsections?: any[];
}

// Hook to manage schema building logic
export function useSchemaBuilderEditor(
  initialValue: SectionSchema,
  onChange: (val: SectionSchema) => void
) {
  
  // Main schema state
  const [schema, setSchema] = useState<SectionSchema>(initialValue);

  // State to track form data
  const [formData, setFormData] = useState({});

  // States for adding new sections
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionKey, setNewSectionKey] = useState("");

  // Load schema on mount or when input changes
  useEffect(() => {
    if (!initialValue || !initialValue.sectionKey || !Array.isArray(initialValue.sections)) {
      // If input is invalid, use a default schema
      const defaultSchema: SectionSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "Untitled",
        sectionKey: "generalInfo",
        sections: [],
      };
      setSchema(defaultSchema);
      onChange(defaultSchema);
    } else {
      // Otherwise, use the provided schema
      setSchema(initialValue);
    }
  }, [initialValue, onChange]);


  // Update fields in a specific section
  const updateSectionFields = (sectionKey: string, newFields: Field[]) => {
    const updatedSections = schema.sections.map((sec) =>
      sec.key === sectionKey ? { ...sec, fields: newFields } : sec
    );
    const updatedSchema = { ...schema, sections: updatedSections };
    setSchema(updatedSchema);
    onChange(updatedSchema);
  };

  // Add a new field to a section
  const handleAddField = (sectionKey: string, field: Field) => {
    const section = schema.sections.find((sec) => sec.key === sectionKey);
    if (!section) return;

    const newFields = [...section.fields, field];
    updateSectionFields(sectionKey, newFields);
  };

  // Remove a field from a section
  const handleRemoveField = (sectionKey: string, fieldIndex: number) => {
    const section = schema.sections.find((sec) => sec.key === sectionKey);
    if (!section) return;

    const newFields = section.fields.filter((_:any, idx:any) => idx !== fieldIndex);
    updateSectionFields(sectionKey, newFields);
  };

  // Add a new section to the schema
  const handleAddSection = () => {
    if (!newSectionTitle || !newSectionKey) {
      alert("Please enter both title and key");
      return;
    }

    const newSection: Section = {
      title: newSectionTitle,
      key: newSectionKey,
      fields: [],
    };

    const updatedSchema = {
      ...schema,
      sections: [...schema.sections, newSection],
    };

    setSchema(updatedSchema);
    onChange(updatedSchema);
    setNewSectionTitle("");
    setNewSectionKey("");
  };

  // Remove a section
  const handleRemoveSection = (sectionKey: string) => {
    const updatedSections = schema.sections.filter(sec => sec.key !== sectionKey);
    const updatedSchema = { ...schema, sections: updatedSections };
    setSchema(updatedSchema);
    onChange(updatedSchema); // sync back with parent
  };


  // Get all field paths (used for condition logic)
  const getAllFieldPaths = (): string[] => {
    const paths: string[] = [];

    for (const section of schema.sections) {
      for (const field of section.fields) {
        paths.push(`${schema.sectionKey}.${section.key}.${field.key}`);
      }

      // If there are subsections, add their fields too
      if (section.subsections) {
        for (const sub of section.subsections) {
          for (const field of sub.fields || []) {
            paths.push(`${schema.sectionKey}.${section.key}.${sub.key}.${field.key}`);
          }
        }
      }
    }

    return paths;
  };


  const handleUpdateField = (sectionKey: string, index: number, updatedField: Field) => {
    const updatedSchema = {
      ...schema,
      sections: schema.sections.map(section =>
        section.key === sectionKey
          ? {
              ...section,
              fields: section.fields.map((f:any, i:any) => (i === index ? updatedField : f)),
            }
          : section
      ),
    };

    setSchema(updatedSchema);
    onChange(updatedSchema);
  };


  const handleMoveField = (sectionKey: string, fromIndex: number, direction: "up" | "down") => {
    const section = schema.sections.find(s => s.key === sectionKey);
    if (!section) return;

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= section.fields.length) return;

    const updatedFields = [...section.fields];
    const temp = updatedFields[fromIndex];
    updatedFields[fromIndex] = updatedFields[toIndex];
    updatedFields[toIndex] = temp;

    const updatedSections = schema.sections.map(sec =>
      sec.key === sectionKey ? { ...sec, fields: updatedFields } : sec
    );

    const updatedSchema = { ...schema, sections: updatedSections };
    setSchema(updatedSchema);
    onChange(updatedSchema);
  };


  return {
    schema,
    setSchema,
    formData,
    setFormData,
    newSectionTitle,
    setNewSectionTitle,
    newSectionKey,
    setNewSectionKey,
    handleAddField,
    handleRemoveField,
    handleAddSection,
    handleRemoveSection,
    handleUpdateField,
    handleMoveField,
    getAllFieldPaths,
  };
}
