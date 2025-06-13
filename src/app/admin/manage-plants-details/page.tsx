"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiEye, FiSave, FiX } from "react-icons/fi";

import SchemaEditor from "@/components/admin/manage-plants-details/SchemaEditor";
import { usePlantSchemas } from "@/hooks/admin/manage-plants-details/usePlantSchemas";
import { SectionSchema } from "@/services/plants/fetchPlantAPI";

// Static list of section keys and titles
const schemaSections = [
  { key: "section_general_info", title: "General Info" },
  { key: "section_market_and_offtakers", title: "Market and Offtakers" },
  { key: "section_electricity_water", title: "Electricity and Water" },
  { key: "section_ghg_reduction", title: "GHG Reduction" },
  { key: "section_traceability", title: "Traceability" },
  { key: "section_certifications", title: "Certifications" },
] as const;

export default function AdminPlantSchemasPage() {
  const {
    coverages,
    selectedCoverage,
    setSelectedCoverage,
    schemas,
    setSchemas,
    handleSave,
  } = usePlantSchemas();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Toggle open/close state of section
  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((k) => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  return (
    <div className="p-6">
      {/* ───── Header and Coverage Selector ───── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Plant Form Builder</h1>

        <div className="mt-4 md:mt-0">
          <label htmlFor="coverage" className="sr-only">
            Select Coverage
          </label>
          <select
            id="coverage"
            className="border bg-white border-gray-300 rounded px-4 py-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={selectedCoverage ?? ""}
            onChange={(e) => setSelectedCoverage(Number(e.target.value))}
          >
            <option value="">Select Coverage</option>
            {coverages.map((c) => (
              <option key={c.coverage_id} value={c.coverage_id}>
                {c.coverage_label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ───── Schema Sections Editor ───── */}
      {schemas && (
        <>
          {schemaSections.map(({ key, title }) => {
            const isOpen = openSections.includes(key);

            return (
              <div key={key} className="border rounded mb-4 bg-white shadow-sm">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center bg-white hover:bg-gray-50 rounded-t"
                >
                  <span className="text-md font-semibold text-gray-700">{title}</span>
                  <span className="text-sm text-gray-500">
                    {isOpen ? "▲ Hide" : "▼ Expand"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 py-4 border-t">
                    <SchemaEditor
                      sectionKey={key}
                      title={title}
                      value={schemas[key]}
                      onChange={(val: SectionSchema) =>
                        setSchemas((prev) => (prev ? { ...prev, [key]: val } : prev))
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* ───── Action Buttons ───── */}
          <div className="mt-8 flex justify-end">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-2 rounded hover:bg-blue-50 transition"
              >
                <FiSave className="text-lg" /> Save All
              </button>

              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 border border-gray-400 text-gray-700 px-5 py-2 rounded hover:bg-gray-100 transition"
              >
                <FiEye className="text-lg" /> Preview JSON
              </button>
            </div>
          </div>

          {/* ───── JSON Preview Modal ───── */}
          <Dialog
            open={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            className="fixed inset-0 z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold text-gray-800">
                    JSON Preview (Coverage ID: {selectedCoverage})
                  </Dialog.Title>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(
                    {
                      coverage_id: selectedCoverage,
                      schemas,
                    },
                    null,
                    2
                  )}
                </pre>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}
