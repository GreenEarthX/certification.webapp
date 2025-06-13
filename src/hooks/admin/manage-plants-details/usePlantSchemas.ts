import { useEffect, useState } from "react";
import { fetchCoverages } from "@/services/coverage/fetchCoverageAPI";
import {
  fetchSchemasByCoverage,
  saveSchemas,
  PlantSchemas,
  SectionSchema,
} from "@/services/plants/fetchPlantAPI";

// Custom hook to manage plant schemas and coverage selection.
export function usePlantSchemas() {
  // List of all available coverages (fetched from API)
  const [coverages, setCoverages] = useState<any[]>([]);

  // Currently selected coverage ID
  const [selectedCoverage, setSelectedCoverage] = useState<number | null>(null);

  // Schema object related to the selected coverage
  const [schemas, setSchemas] = useState<PlantSchemas | null>(null);

  // Fetch all coverages on initial mount
  useEffect(() => {
    fetchCoverages().then(setCoverages).catch(console.error);
  }, []);

  // Fetch schemas when a coverage is selected
  useEffect(() => {
    if (selectedCoverage) {
      fetchSchemasByCoverage(selectedCoverage)
        .then(data => setSchemas(data || createEmptySchemas(selectedCoverage)))
        .catch(console.error);
    }
  }, [selectedCoverage]);

  // Create an empty section schema
  const createEmptySchema = (key: string, title: string): SectionSchema => ({
    $schema: "http://json-schema.org/draft-07/schema#",
    title,
    sectionKey: key,
    sections: [],
  });

  // Create a full empty schema structure for all sections
  const createEmptySchemas = (coverage_id: number): PlantSchemas => ({
    coverage_id,
    section_general_info: createEmptySchema("generalInfo", "General Info"),
    section_market_and_offtakers: createEmptySchema("marketAndOfftakers", "Market and Offtakers"),
    section_electricity_water: createEmptySchema("electricityWater", "Electricity and Water"),
    section_ghg_reduction: createEmptySchema("ghgReduction", "GHG Reduction"),
    section_traceability: createEmptySchema("traceability", "Traceability"),
    section_certifications: createEmptySchema("certifications", "Certifications"),
  });

  // Save the current schema to the server
  const handleSave = async () => {
    if (!selectedCoverage || !schemas) return;
    try {
      await saveSchemas(schemas);
      alert("✅ Saved!");
    } catch (err) {
      alert("❌ Failed to save");
    }
  };

  return {
    coverages,
    selectedCoverage,
    setSelectedCoverage,
    schemas,
    setSchemas,
    handleSave,
  };
}
