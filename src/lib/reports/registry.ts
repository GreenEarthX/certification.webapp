import type { ComponentType } from "react";
import {
  ClipboardList,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import PlantComponentRegistryPreview from "@/components/plant-builder/reports/PlantComponentRegistryPreview";
import ProcessFlowOperationsPreview from "@/components/plant-builder/reports/ProcessFlowOperationsPreview";
import {
  generatePlantComponentRegistry,
  generateProcessFlowOperations,
} from "@/services/plant-builder/reports";
import { renderPlantComponentRegistryPdf } from "./plant-component-registry.pdf";
import { renderProcessFlowOperationsPdf } from "./process-flow-operations.pdf";
import type { ReportBodyBase, ReportTypeId } from "./types";

/**
 * The catalogue behind the Reports modal.
 *
 * Adding a report is one entry here plus three implementations (generate /
 * Preview / toPdf) and a backend builder — the modal itself never changes.
 */

export type ReportStatus = "available" | "coming_soon";

/** Ordered stages; each weight is the bar value once that stage is reached. */
export interface ReportStage {
  key: string;
  label: string;
  weight: number;
}

export interface ReportDefinition<TData extends ReportBodyBase = ReportBodyBase> {
  id: ReportTypeId;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  status: ReportStatus;
  comingSoonNote?: string;

  /** Present exactly when status === "available". */
  generate?: (digitalTwinId: number) => Promise<TData>;
  Preview?: ComponentType<{ data: TData }>;
  /** Builds and saves the PDF; resolves with the filename written. */
  toPdf?: (data: TData) => Promise<string>;
  stages?: readonly ReportStage[];
}

/**
 * Weights are pinned to real events, never to a timer: 10 on request sent,
 * 65 on response received, 85 on layout committed, 100 on paint.
 */
export const REPORT_STAGES: readonly ReportStage[] = [
  { key: "requesting", label: "Querying the plant model…", weight: 10 },
  { key: "received", label: "Deriving component tables…", weight: 65 },
  { key: "rendering", label: "Laying out the document…", weight: 85 },
  { key: "ready", label: "Ready", weight: 100 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const REPORT_REGISTRY: ReportDefinition<any>[] = [
  {
    id: "plant_component_registry",
    title: "Plant Component Registry",
    subtitle: "Equipment · Gates · Carriers",
    description:
      "A type-level inventory of every component in this variation, with the carrier streams that link them.",
    icon: ClipboardList,
    accent: "#0F766E",
    status: "available",
    generate: generatePlantComponentRegistry,
    Preview: PlantComponentRegistryPreview,
    toPdf: renderPlantComponentRegistryPdf,
    stages: REPORT_STAGES,
  },
  {
    id: "process_flow_operations",
    title: "Process Flow Operations",
    subtitle: "Upstream · Downstream · Economics",
    description:
      "Every stream crossing the system boundary, at hourly, daily and yearly resolution, with the economics declared on each gate.",
    icon: Waypoints,
    accent: "#206A5D",
    status: "available",
    generate: generateProcessFlowOperations,
    Preview: ProcessFlowOperationsPreview,
    toPdf: renderProcessFlowOperationsPdf,
    stages: REPORT_STAGES,
  },
  {
    id: "compliance_dossier",
    title: "Compliance Dossier",
    subtitle: "Evidence · Certification",
    description:
      "The certification evidence pack assembled from the plant's declared sources.",
    icon: ShieldCheck,
    accent: "#A1CB35",
    status: "coming_soon",
    comingSoonNote: "Available with the certification module.",
  },
];

export const getReportDefinition = (id: ReportTypeId) =>
  REPORT_REGISTRY.find((r) => r.id === id);
