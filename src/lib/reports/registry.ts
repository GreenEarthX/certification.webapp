import type { ComponentType } from "react";
import {
  ClipboardList,
  Scale,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import MassEnergyBalancesEquationsPreview from "@/components/plant-builder/reports/MassEnergyBalancesEquationsPreview";
import MassEnergyBalancesPreview from "@/components/plant-builder/reports/MassEnergyBalancesPreview";
import MassEnergyBalancesSpecificationPreview from "@/components/plant-builder/reports/MassEnergyBalancesSpecificationPreview";
import PlantComponentRegistryPreview from "@/components/plant-builder/reports/PlantComponentRegistryPreview";
import ProcessFlowOperationsPreview from "@/components/plant-builder/reports/ProcessFlowOperationsPreview";
import {
  generateMassEnergyBalances,
  generateMassEnergyBalancesEquations,
  generateMassEnergyBalancesSpecification,
  generatePlantComponentRegistry,
  generateProcessFlowOperations,
} from "@/services/plant-builder/reports";
import { renderMassEnergyBalancesEquationsPdf } from "./mass-energy-balances-equations.pdf";
import { renderMassEnergyBalancesSpecificationPdf } from "./mass-energy-balances-specification.pdf";
import { renderMassEnergyBalancesPdf } from "./mass-energy-balances.pdf";
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

/**
 * A document set: one main report plus its annexes, presented as a single box
 * in the picker with one button per document. Each document is still its own
 * ReportDefinition (own generate / Preview / toPdf and its own document
 * reference); the group only decides how the picker lays them out.
 */
export interface ReportGroup {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: string;
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
  /** ReportGroup.id; absent for a standalone report. */
  group?: string;
  /** The button label inside the group box, e.g. "Annex 1: Specification". */
  groupLabel?: string;

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

export const REPORT_GROUPS: ReportGroup[] = [
  {
    id: "mass_energy_balances",
    title: "Mass & Energy Balances",
    subtitle: "Main report · Specification · Equations",
    description:
      "The technical assessment of the plant: every material and energy stream with its value, the per-stream specification, and the equations behind each computed figure.",
    icon: Scale,
    accent: "#1D4ED8",
  },
];

export const getReportGroup = (id: string) =>
  REPORT_GROUPS.find((g) => g.id === id);

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
    id: "mass_energy_balances",
    title: "Mass & Energy Balances",
    subtitle: "Main Report",
    description:
      "Every stream of the process flow with its carrier, source, destination and value.",
    icon: Scale,
    accent: "#1D4ED8",
    status: "available",
    group: "mass_energy_balances",
    groupLabel: "Main Report",
    generate: generateMassEnergyBalances,
    Preview: MassEnergyBalancesPreview,
    toPdf: renderMassEnergyBalancesPdf,
    stages: REPORT_STAGES,
  },
  {
    id: "mass_energy_balances_specification",
    title: "Mass & Energy Balances: Specification",
    subtitle: "Annex 1",
    description:
      "Per-stream attributes by process block, plus the electricity and heat balance.",
    icon: Scale,
    accent: "#1D4ED8",
    status: "available",
    group: "mass_energy_balances",
    groupLabel: "Annex 1: Specification",
    generate: generateMassEnergyBalancesSpecification,
    Preview: MassEnergyBalancesSpecificationPreview,
    toPdf: renderMassEnergyBalancesSpecificationPdf,
    stages: REPORT_STAGES,
  },
  {
    id: "mass_energy_balances_equations",
    title: "Mass & Energy Balances: Equations",
    subtitle: "Annex 2",
    description:
      "Equation cards per equipment, grouped by engineering category, with the values of the latest calculation run.",
    icon: Scale,
    accent: "#1D4ED8",
    status: "available",
    group: "mass_energy_balances",
    groupLabel: "Annex 2: Equations",
    generate: generateMassEnergyBalancesEquations,
    Preview: MassEnergyBalancesEquationsPreview,
    toPdf: renderMassEnergyBalancesEquationsPdf,
    stages: REPORT_STAGES,
  },
];

export const getReportDefinition = (id: ReportTypeId) =>
  REPORT_REGISTRY.find((r) => r.id === id);
