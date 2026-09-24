'use client';

// Helper: Pretty-print JSON to console
const logJson = (label: string, data?: any) => {
  console.log(label);
  if (data) console.log(JSON.stringify(data, null, 2));
};

import "./plant-builder-vite.css";  //
import "./App.css";
import { useState, useCallback, useEffect, useMemo, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  X,
  Save,
  Play,
  MessageSquare,
  BookmarkPlus,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
} from "lucide-react";
import PlantInfoForm from "@/components/plant-builder/PlantInfoForm";
import ProductForm from "@/components/plant-builder/ProductForm";
import LoadingPage from "@/components/plant-builder/LoadingPage";
import Canvas from "@/components/plant-builder/Canvas";
import ComponentLibrary from "@/components/plant-builder/ComponentLibrary";
import ValidationPanel from "@/components/plant-builder/ValidationPanel";
import { ComplianceCheck } from "./ComplianceChecks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserDetails,
  PlantInfo,
  ProductInfo,
  ComplianceResult,
  PlacedComponent,
  Connection,
} from "./types";
import {
  createPlant,
  fetchPlantById,
  Plant,
  PlantPayload,
  updatePlant,
} from "@/services/plant-builder/plants";
import {
  createDigitalTwin,
  fetchDigitalTwinJsonForPlant,
  validateDigitalTwinHighLevel,
  validateDigitalTwinPortConnections,
} from "@/services/plant-builder/digitalTwins";
import {
  fetchComponentDefinitions,
  fetchComponentPorts,
  type EquipmentPortsDto,
} from "@/services/plant-builder/componentDefinitions";
import type {
  DigitalTwinValidationError,
  DigitalTwinValidationResult,
} from "@/services/plant-builder/digitalTwins";
import {
  buildFallbackValidationError,
  formatPortErrorMessage,
} from "@/lib/plant-builder/validation";
import {
  fetchEquipmentResults,
  runEquipment,
  type EquipmentRun,
} from "@/services/plant-builder/massBalance";
import {
  equipmentRefsFromComponents,
  type EquipmentRunMap,
} from "@/lib/plant-builder/equations";
import ReportsDialog from "@/components/plant-builder/reports/ReportsDialog";
import { toInstanceId, toOptionalNumber } from "@/lib/plant-builder/ids";
import { updateComponentInstance, deleteComponentInstance, fetchComponentInstances } from "@/services/plant-builder/componentInstances";
import { buildConnectionPayloadForComponent, StoredConnectionPayload } from "@/lib/plant-builder/connection-utils";
import {
  instantiateTemplate,
  type TemplateDto,
} from "@/services/plant-builder/templates";
import TemplateGalleryDialog from "@/components/plant-builder/templates/TemplateGalleryDialog";
import SaveTemplateDialog from "@/components/plant-builder/templates/SaveTemplateDialog";
import ReplaceModelDialog from "@/components/plant-builder/templates/ReplaceModelDialog";
import { brandOutlineBtnClass } from "@/components/plant-builder/form-styles";

/**
 * Plant Builder Component
 * 
 * Multi-step workflow: User Details → Plant Info → Products → Canvas Builder → Compliance Check
 * Manages component persistence to backend and process flow visualization.
 */

// Map the flat PlantInfo (full-page edit form) to the backend payload using the
// column-vs-jsonb split. Intentionally omits `publish_to_ecosystem` and `fuels`
// so an info edit (PATCH) preserves whatever the create wizard set.
const infoToPlantPayload = (info: PlantInfo): PlantPayload => {
  const str = (v: any) => {
    const t = (v ?? "").toString().trim();
    return t ? t : undefined;
  };
  const num = (v: any) => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    name: (info.plantName || "").trim(),
    location: str(info.country),
    status: str((info as any).projectMaturityStage ?? info.status),
    pathway: str((info as any).primaryPathway),
    latitude: num((info as any).coordinates?.latitude),
    longitude: num((info as any).coordinates?.longitude),
    address: {
      street: str((info as any).address),
      region: str((info as any).region),
      city: str((info as any).city),
      postal_code: str((info as any).postalCode),
    },
    // Only present when edited via the embedded Product details section.
    fuels: Array.isArray((info as any).fuels) ? (info as any).fuels : undefined,
    metadata: {
      plant_configuration: str((info as any).plantConfiguration),
      site_environment: str((info as any).siteEnvironment),
      certification_phase: str((info as any).certificationPhase),
      commercial_operation_date: str(
        info.commercialOperationalDate ?? (info as any).expectedCOD,
      ),
      project_lifetime_years: num((info as any).projectLifetimeYears),
      availability_basis: {
        total_calendar_hours_per_year: num((info as any).totalCalendarHours),
        plant_availability_pct: num((info as any).plantAvailability),
        effective_operating_hours_per_year: num((info as any).effectiveOperatingHours),
        effective_operating_days_per_year: num((info as any).effectiveOperatingDays),
      },
    },
  };
};

export const PlantBuilder = () => {
  const router = useRouter();
  const [step, setStep] = useState<
    "info" | "product" | "builder" | "compliance" | "loading"
  >("loading");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo[]>([]);
  const [verifiedProducts, setVerifiedProducts] = useState<string[]>([]);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [originalComponents, setOriginalComponents] = useState<PlacedComponent[]>([]);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(true);
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "" as "equipment" | "carrier" | "gate" | "",
    category: "",
  });
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([
    "rfnbo",
    "advanced",
    "annexIXA",
    "annexIXB",
  ]);
  const [sortBy, setSortBy] = useState<"product" | "scheme" | "confidence" | "fuelClass">("confidence");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<DigitalTwinValidationResult | null>(null);
  const [validationStep, setValidationStep] = useState<"structure" | "ports" | "equations" | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  // Per-equipment equation runs: instanceId → latest {run, results}.
  const [equationRuns, setEquationRuns] = useState<EquipmentRunMap>({});
  const [computingEquipmentIds, setComputingEquipmentIds] = useState<Set<number>>(
    () => new Set()
  );
  const [showReports, setShowReports] = useState(false);
  const [reportsTwinId, setReportsTwinId] = useState<number | null>(null);
  const [carrierDefNames, setCarrierDefNames] = useState<Record<number, string>>({});
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  const [focusRequest, setFocusRequest] = useState<{ id: string; ts: number } | null>(null);
  const [highlightedComponentId, setHighlightedComponentId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const [isEditingPlantInfo, setIsEditingPlantInfo] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [saveTemplateTwinId, setSaveTemplateTwinId] = useState<number | null>(null);
  // Template chosen in the gallery, awaiting "replace canvas" confirmation.
  const [templateToApply, setTemplateToApply] = useState<TemplateDto | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [portsByDefinitionId, setPortsByDefinitionId] = useState<Record<number, EquipmentPortsDto>>({});
  const [exportTimestamp, setExportTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.height = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
    };
  }, []);

  const exportSummaryLines = useMemo(() => {
    const lines: string[] = [];
    const productLabels = productInfo
      .map((product) => product.productName || product.fuelType)
      .filter(Boolean);
    if (productLabels.length) {
      lines.push(`Products: ${Array.from(new Set(productLabels)).join(", ")}`);
    }

    const capacityEntries = productInfo
      .map((product) => {
        const rawCapacity = Number.parseFloat(String(product.productionCapacity ?? ""));
        const capacity = Number.isFinite(rawCapacity) ? rawCapacity : null;
        const unit = product.unit?.trim();
        if (!capacity || !unit) return null;
        return {
          label: product.productName || product.fuelType || "Product",
          capacity,
          unit,
        };
      })
      .filter(Boolean) as { label: string; capacity: number; unit: string }[];

    if (capacityEntries.length) {
      const sameUnit = capacityEntries.every((entry) => entry.unit === capacityEntries[0].unit);
      if (sameUnit) {
        const total = capacityEntries.reduce((sum, entry) => sum + entry.capacity, 0);
        lines.push(`Capacity: ${total.toFixed(2).replace(/\\.00$/, "")} ${capacityEntries[0].unit}`);
      } else {
        const details = capacityEntries
          .map((entry) => `${entry.label} ${entry.capacity} ${entry.unit}`)
          .join(" · ");
        lines.push(`Capacity: ${details}`);
      }
    }

    if (!lines.length) {
      lines.push("Products: N/A");
    }

    return lines;
  }, [productInfo]);

  const exportMetaLines = useMemo(() => {
    const lines = [...exportSummaryLines];
    if (exportTimestamp) {
      const formatted = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(exportTimestamp));
      lines.unshift(`Exported: ${formatted}`);
    }
    return lines;
  }, [exportSummaryLines, exportTimestamp]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) return "Not saved yet";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(lastSavedAt));
  }, [lastSavedAt]);

  const markSavedNow = useCallback((timestamp?: string) => {
    setLastSavedAt(timestamp ?? new Date().toISOString());
  }, []);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, []);

  useEffect(() => {
    const equipmentDefIds = Array.from(
      new Set(
        components
          .filter((c) => c.type === "equipment")
          .map((c) => c.componentDefinitionId)
          .filter((id): id is number => typeof id === "number")
      )
    );

    const missing = equipmentDefIds.filter((id) => !portsByDefinitionId[id]);
    if (!missing.length) return;

    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(missing.map((id) => fetchComponentPorts(id)));
      if (cancelled) return;
      setPortsByDefinitionId((prev) => {
        const next = { ...prev };
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            next[missing[index]] = result.value;
          }
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [components, portsByDefinitionId]);

  const normalizeComponentData = useCallback((component: PlacedComponent) => {
    const data = component.data ?? {};
    const normalized: Record<string, any> = { ...data };

    const rawTechnical = (data as any).technicalData ?? (data as any).technical_data;
    const input = rawTechnical?.input ?? (data as any).input ?? (data as any).inputs;
    const output = rawTechnical?.output ?? (data as any).output ?? (data as any).outputs;
    const efficiency = rawTechnical?.efficiency ?? (data as any).efficiency;
    let capacity = rawTechnical?.capacity ?? (data as any).capacity;
    if (capacity == null) {
      const capacityValue = (data as any).capacity_value ?? (data as any).capacityValue;
      const capacityUnit = (data as any).capacity_unit ?? (data as any).capacityUnit;
      if (capacityValue != null || capacityUnit != null) {
        capacity = { value: capacityValue ?? "", unit: capacityUnit ?? "" };
      }
    }
    if (capacity != null && typeof capacity !== "object") {
      capacity = { value: capacity, unit: "" };
    }
    if (rawTechnical || input || output || efficiency != null || capacity != null) {
      normalized.technicalData = {
        ...(rawTechnical ?? {}),
        ...(input != null ? { input } : {}),
        ...(output != null ? { output } : {}),
        ...(efficiency != null ? { efficiency } : {}),
        ...(capacity != null ? { capacity } : {}),
      };
    }

    if (!normalized.manufacturer && (data as any).metadata?.manufacturer) {
      normalized.manufacturer = (data as any).metadata.manufacturer;
    }
    if (!normalized.manufacturer && (data as any).manufacturer) {
      normalized.manufacturer = (data as any).manufacturer;
    }

    if ((data as any).carrierData && typeof (data as any).carrierData === "object") {
      const carrierData = (data as any).carrierData;
      if (normalized.fuelType == null && carrierData.fuelType != null) {
        normalized.fuelType = carrierData.fuelType;
      }
      if (normalized.temperature == null && carrierData.temperature != null) {
        normalized.temperature = carrierData.temperature;
      }
      if (normalized.pressure == null && carrierData.pressure != null) {
        normalized.pressure = carrierData.pressure;
      }
    }
    if (normalized.fuelType == null && (data as any).fuel_type != null) {
      normalized.fuelType = (data as any).fuel_type;
    }
    if (normalized.temperature == null && (data as any).temperature_c != null) {
      normalized.temperature = (data as any).temperature_c;
    }
    if (normalized.pressure == null && (data as any).pressure_bar != null) {
      normalized.pressure = (data as any).pressure_bar;
    }

    if ((data as any).gateData && typeof (data as any).gateData === "object") {
      const gateData = (data as any).gateData;
      if (normalized.gateType == null && gateData.inputOrOutput != null) {
        normalized.gateType = gateData.inputOrOutput;
      }
      if (normalized.sourceOrigin == null && gateData.sourceOrigin != null) {
        normalized.sourceOrigin = gateData.sourceOrigin;
      }
      if (normalized.endUse == null && gateData.endUse != null) {
        normalized.endUse = gateData.endUse;
      }
    }

    if (normalized.gateType == null && (data as any).inputOrOutput != null) {
      normalized.gateType = (data as any).inputOrOutput;
    }
    if (normalized.gateType == null && (data as any).input_or_output != null) {
      normalized.gateType = (data as any).input_or_output;
    }
    if (normalized.sourceOrigin == null && (data as any).source_origin != null) {
      normalized.sourceOrigin = (data as any).source_origin;
    }
    if (normalized.endUse == null && (data as any).end_use != null) {
      normalized.endUse = (data as any).end_use;
    }

    return normalized;
  }, []);

  const normalizedComponents = useMemo(
    () =>
      components.map((component) => ({
        ...component,
        data: normalizeComponentData(component),
      })),
    [components, normalizeComponentData]
  );

  const uniqueConnections = useMemo(() => {
    const deduped = new Map<string, Connection>();
    connections.forEach((conn) => {
      const key = `${conn.from}|${conn.to}|${conn.type ?? ""}`;
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, conn);
        return;
      }
      const existingHasData = Object.keys(existing.data || {}).length > 0;
      const nextHasData = Object.keys(conn.data || {}).length > 0;
      if (!existingHasData && nextHasData) {
        deduped.set(key, conn);
      }
    });
    return Array.from(deduped.values());
  }, [connections]);

  const validationErrorsByComponent = useMemo(() => {
    if (!validationResult?.errors?.length) return {};
    return validationResult.errors.reduce<Record<string, DigitalTwinValidationError[]>>((acc, err) => {
      const key = String(err.componentId ?? "");
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(err);
      return acc;
    }, {});
  }, [validationResult]);

  const isConnectionError = useCallback((err: DigitalTwinValidationError) => {
    const haystack = `${err.errorCode ?? ""} ${err.errorMessage ?? ""}`.toLowerCase();
    const normalized = haystack.replace(/[_-]+/g, " ");
    const disallow = [
      "missing",
      "required",
      "empty",
      "not provided",
      "undefined",
      "null",
      "not set",
    ];
    if (normalized.includes("[port]") || normalized.includes("port")) {
      return true;
    }
    if (disallow.some((term) => normalized.includes(term))) {
      return false;
    }
    const allowRegex = /\b(connection|from|to|input|output|source|target|port)\b/;
    return allowRegex.test(normalized);
  }, []);

  const connectionErrorMessages = useMemo(() => {
    if (!validationResult?.errors?.length) return new Map<string, string>();

    const connectionPairs = new Map<string, string[]>();
    connections.forEach((conn) => {
      const key = `${conn.from}|${conn.to}`;
      const list = connectionPairs.get(key);
      if (list) {
        list.push(String(conn.id));
      } else {
        connectionPairs.set(key, [String(conn.id)]);
      }
    });

    const errorMap = new Map<string, string[]>();
    const addMessage = (id: string, message: string) => {
      if (!id || !message) return;
      const list = errorMap.get(id);
      if (list) {
        list.push(message);
      } else {
        errorMap.set(id, [message]);
      }
    };

    validationResult.errors.forEach((err) => {
      if (!isConnectionError(err)) return;
      const message = err.errorMessage || "Invalid port connection.";
      if (err.relatedConnectionId) {
        addMessage(String(err.relatedConnectionId), message);
        return;
      }
      if (err.relatedComponentId) {
        const forwardKey = `${err.componentId}|${err.relatedComponentId}`;
        const reverseKey = `${err.relatedComponentId}|${err.componentId}`;
        const forwardIds = connectionPairs.get(forwardKey);
        const reverseIds = connectionPairs.get(reverseKey);
        forwardIds?.forEach((id) => addMessage(id, message));
        reverseIds?.forEach((id) => addMessage(id, message));
        return;
      }
      const componentId = String(err.componentId ?? "");
      if (componentId) {
        connections.forEach((conn) => {
          if (String(conn.from) === componentId || String(conn.to) === componentId) {
            addMessage(String(conn.id), message);
          }
        });
      }
    });

    const normalized = new Map<string, string>();
    errorMap.forEach((messages, id) => {
      const unique = Array.from(new Set(messages.map((msg) => msg.trim()).filter(Boolean)));
      if (unique.length > 0) {
        normalized.set(id, unique.join(" · "));
      }
    });
    return normalized;
  }, [connections, isConnectionError, validationResult]);

  const invalidConnectionIds = useMemo(
    () => new Set<string>(connectionErrorMessages.keys()),
    [connectionErrorMessages]
  );

  const groupedValidationErrors = useMemo(() => {
    if (!validationResult?.errors?.length) return [];
    const byComponent = new Map<
      string,
      { componentId: string; componentName: string; componentType: string; errors: DigitalTwinValidationError[] }
    >();
    validationResult.errors.forEach((err) => {
      const componentId = String(err.componentId ?? "");
      if (!componentId) return;
      const existing = byComponent.get(componentId);
      if (existing) {
        existing.errors.push(err);
        return;
      }
      byComponent.set(componentId, {
        componentId,
        componentName: err.componentName || "Unknown",
        componentType: err.componentType || "component",
        errors: [err],
      });
    });
    return Array.from(byComponent.values());
  }, [validationResult]);

  const hasFocusableValidationErrors = useMemo(
    () => groupedValidationErrors.some((group) => group.componentId !== "unknown"),
    [groupedValidationErrors]
  );

  useEffect(() => {
    if (!validationResult?.errors?.length) return;
    console.groupCollapsed(
      `[Validation] ${validationStep ?? "unknown"} - ${validationResult.errors.length} error(s)`
    );
    validationResult.errors.forEach((err) => {
      console.log({
        componentId: err.componentId,
        componentName: err.componentName,
        componentType: err.componentType,
        errorCode: err.errorCode,
        errorMessage: err.errorMessage,
        relatedComponentId: err.relatedComponentId,
        relatedConnectionId: err.relatedConnectionId,
      });
    });
    console.groupEnd();
  }, [validationResult, validationStep]);

  const hasDuplicateConnections = uniqueConnections.length !== connections.length;

  useEffect(() => {
    if (!hasDuplicateConnections) return;
    setConnections(uniqueConnections);
  }, [hasDuplicateConnections, setConnections, uniqueConnections]);

  const persistConnectionsForComponent = useCallback(
    async (
      componentId: string,
      overrideConnections?: Connection[],
      overrideComponents?: PlacedComponent[]
    ) => {
      const connectionList = overrideConnections ?? connections;
      const componentList = overrideComponents ?? components;
      const component = componentList.find((c) => c.id === componentId);

      const instanceId = toInstanceId(component?.instanceId);
      if (!instanceId) {
        logJson(`[PlantBuilder] Cannot persist connections for ${componentId}; missing instanceId`);
        return;
      }

      const payload = buildConnectionPayloadForComponent(componentId, connectionList, componentList);

      try {
        logJson(
          `[PlantBuilder] Persisting ${payload.length} connections for ${componentId} (instanceId=${instanceId})`,
          payload
        );
        await updateComponentInstance(instanceId, { connections: payload });
        markSavedNow();
      } catch (err) {
        logJson(`[PlantBuilder] ✗ Failed to persist connections for ${componentId}:`, err);
        toast.error(`Failed to update connections for ${component?.name ?? "component"}`);
      }
    },
    [components, connections, markSavedNow]
  );

  // When components are removed via Canvas they're already deleted on the backend,
  // so trim them from originalComponents to avoid duplicate delete calls on save.
  useEffect(() => {
    setOriginalComponents((prev) => {
      if (!prev.length) return prev;
      const next = prev.filter((orig) => components.some((comp) => comp.id === orig.id));
      return next.length === prev.length ? prev : next;
    });
  }, [components]);


  // Clear errors when step changes
  useEffect(() => {
    setError(null);
  }, [step]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const defs = await fetchComponentDefinitions();
        if (!active) return;
        const next: Record<number, string> = {};
        defs.forEach((def: any) => {
          const type = String(def.component_type || def.componentType || "").toLowerCase();
          if (type !== "carrier") return;
          if (typeof def.id === "number") {
            next[def.id] = def.component_name || def.componentName || `Carrier ${def.id}`;
          }
        });
        setCarrierDefNames(next);
      } catch (err) {
        console.warn("[PlantBuilder] Failed to load carrier definitions for validation:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("plantId");
    const editMode = params.get("edit") === "info";
    if (!plantId) {
      setStep("info");
    }
  }, []);

  // Load existing plant from URL (edit mode)
    useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantIdParam = searchParams.get("plantId");
    const editMode = searchParams.get("edit") === "info";

    if (!plantIdParam) return;

    const plantId = Number(plantIdParam);
    if (Number.isNaN(plantId)) return;

    // Set the plant id immediately so saving from the edit popup always works,
    // even if the digital-twin load below errors or finds no records.
    (window as any).currentPlantId = plantId;

    setIsEditingPlantInfo(editMode);
    // The edit form is now a popup over the builder canvas (not a full-screen step).
    setStep("builder");
    if (editMode) setShowInfoModal(true);

    const mapPlantToInfo = (plant: Plant): PlantInfo => {
      const metadata = plant.metadata || {};
      const availabilityBasis = metadata.availability_basis || {};
      const address = plant.address || {};
      const hasCoords = plant.latitude != null || plant.longitude != null;
      return {
        plantName: plant.name || "New Plant",
        projectName: "",
        projectType: plant.pathway || "",
        primaryFuelType: plant.pathway || "",
        primaryPathway: plant.pathway || "",
        plantConfiguration: metadata.plant_configuration || "",
        siteEnvironment: metadata.site_environment || "",
        country: plant.location || "",
        region: address.region || "",
        city: address.city || "",
        address: address.street || "",
        postalCode: address.postal_code || "",
        coordinates: hasCoords
          ? {
              latitude: plant.latitude ?? undefined,
              longitude: plant.longitude ?? undefined,
            }
          : undefined,
        status: plant.status || "",
        projectMaturityStage: plant.status || "",
        certificationPhase: metadata.certification_phase || "",
        commercialOperationalDate: metadata.commercial_operation_date || "",
        expectedCOD: metadata.commercial_operation_date || "",
        projectLifetimeYears: metadata.project_lifetime_years ?? undefined,
        totalCalendarHours: availabilityBasis.total_calendar_hours_per_year ?? undefined,
        plantAvailability: availabilityBasis.plant_availability_pct ?? undefined,
        effectiveOperatingHours: availabilityBasis.effective_operating_hours_per_year ?? undefined,
        effectiveOperatingDays: availabilityBasis.effective_operating_days_per_year ?? undefined,
        fuels: Array.isArray(plant.fuels) ? plant.fuels : [],
        publishToEcosystem: plant.publish_to_ecosystem ?? false,
      } as PlantInfo;
    };

    // Preload plant details so the edit popup prefills regardless of digital-twin state.
    fetchPlantById(plantId)
      .then((plant) => setPlantInfo(mapPlantToInfo(plant)))
      .catch((err) => console.warn("Failed to preload plant details:", err));

    (async () => {
      try {
        const records = await fetchDigitalTwinJsonForPlant(plantId);

        if (!records.length) {
          toast.error("No digital twin record found for this plant.");
          return;
        }

        const twinId = Number(records[0].id);
        if (!Number.isNaN(twinId)) {
          (window as any).currentTwinId = twinId;
        }

        const normalizePosition = (pos: any) => {
          const rawX = typeof pos?.x === "string" ? Number.parseFloat(pos.x) : Number(pos?.x ?? 0);
          const rawY = typeof pos?.y === "string" ? Number.parseFloat(pos.y) : Number(pos?.y ?? 0);
          return {
            x: Number.isFinite(rawX) ? rawX : 0,
            y: Number.isFinite(rawY) ? rawY : 0,
          };
        };

        const categoryFromDefinition = (def: any) => {
          if (def?.category) return def.category;
          const schema = def?.field_schema;
          const fields = Array.isArray(schema?.fields) ? schema.fields : [];
          const fallback = def?.component_type
            ? def.component_type.charAt(0).toUpperCase() + def.component_type.slice(1)
            : "Component";
          return (
            schema?.category ||
            schema?.group ||
            schema?.meta?.category ||
            fields[0]?.category ||
            fields[0]?.group ||
            fallback
          );
        };

        // Prefer component instances (source of truth) to avoid stale/duplicated digital_twin_json
        try {
          if (!Number.isNaN(twinId)) {
            const [instances, defs] = await Promise.all([
              fetchComponentInstances(twinId),
              fetchComponentDefinitions(),
            ]);
            if (instances.length) {
              const defsById = new Map(defs.map((d) => [d.id, d]));

              const mappedComponents: PlacedComponent[] = instances.map((inst: any) => {
                const def = defsById.get(inst.component_definition_id);
                const type = (def?.component_type || "equipment") as PlacedComponent["type"];
                const data =
                  inst.field_values && Object.keys(inst.field_values).length
                    ? inst.field_values
                    : { technicalData: {} };

                return {
                  id: String(inst.id),
                  name: inst.instance_name || def?.component_name || "Component",
                  type,
                  category: def ? categoryFromDefinition(def) : "Component",
                  position: normalizePosition(inst.position),
                  data,
                  certifications: [],
                  componentDefinitionId: def?.id ?? inst.component_definition_id,
                  instanceId: inst.id,
                };
              });

              const mappedConnections: Connection[] = [];
              const seen = new Set<string>();
              instances.forEach((inst: any) => {
                const outgoing = Array.isArray(inst.connections) ? inst.connections : [];
                outgoing.forEach((conn: any, index: number) => {
                  const fromId = String(conn.from ?? inst.id);
                  const toId = conn.to != null ? String(conn.to) : "";
                  if (!toId) return;
                  const type = conn.type || "";
                  const key = `${fromId}->${toId}::${type}::${conn.id ?? index}`;
                  if (seen.has(key)) return;
                  seen.add(key);
                  mappedConnections.push({
                    id: String(conn.id ?? `conn-${fromId}-${toId}-${index}`),
                    from: fromId,
                    to: toId,
                    type,
                    reason: conn.reason,
                    data: conn.data || {},
                  });
                });
              });

              // Set global IDs BEFORE triggering React re-renders so the Canvas
              // useEffect sees currentTwinId when connections.length changes
              (window as any).currentPlantId = plantId;
              (window as any).currentTwinId = twinId;
              console.log("[plant-builder] restored currentPlantId/currentTwinId:", plantId, twinId);

              setComponents(mappedComponents);
              setConnections(mappedConnections);
              setOriginalComponents(mappedComponents);

              try {
                const plant = await fetchPlantById(plantId);
                setPlantInfo(mapPlantToInfo(plant));
              } catch (err) {
                console.warn("Failed to load plant details:", err);
              }

              return;
            }
          }
        } catch (err) {
          console.warn("Failed to load component instances; falling back to digital_twin_json:", err);
        }

        if (!records[0].digital_twin_json) {
          toast.error("No digital twin JSON found for this plant.");
          return;
        }

        const { components: rawComponents = [], connections: rawConnections = [] } =
          records[0].digital_twin_json;

        const mappedComponents: PlacedComponent[] = rawComponents.map((c: any) => {
          // Only trust explicit instance identifiers; do not fall back to component id.
          // This prevents accidental deletes/updates against non-existent backend rows.
          const inferredInstanceId =
            c.instanceId ??
            c.instance_id ??
            c.componentInstanceId ??
            c.component_instance_id;
          const inferredDefinitionId =
            c.componentDefinitionId ??
            c.component_definition_id ??
            c.definitionId ??
            c.definition_id;
          const rawData =
            c.data ??
            c.field_values ??
            c.fieldValues ??
            c.field_values_json ??
            c.fieldValuesJson ??
            {};
          const data =
            rawData && Object.keys(rawData).length ? rawData : { technicalData: {} };

          return {
            id: String(c.id ?? inferredInstanceId ?? `comp-${Date.now()}`),
            name: c.name,
            type: c.type,
            category: c.category,
            position: normalizePosition(c.position),
            // keep whatever data comes, but ensure at least empty object
            data,
            certifications: [],
            componentDefinitionId: toOptionalNumber(inferredDefinitionId),
            instanceId: toOptionalNumber(inferredInstanceId),
          };
        });

        const mappedConnections: Connection[] = rawConnections.map((conn: any) => ({
          id: String(conn.id),
          from: String(conn.from),
          to: String(conn.to),
          type: conn.type || "",
          reason: conn.reason,
          data: conn.data || {},
        }));

        // Set global IDs BEFORE triggering React re-renders so the Canvas
        // useEffect sees currentTwinId when connections.length changes
        (window as any).currentPlantId = plantId;
        (window as any).currentTwinId = Number(records[0].id);
        console.log("[plant-builder] restored currentPlantId/currentTwinId:", plantId, Number(records[0].id));

        setComponents(mappedComponents);
        setConnections(mappedConnections);
        setOriginalComponents(mappedComponents); // Track originals for delete detection

        try {
          const plant = await fetchPlantById(plantId);
          setPlantInfo(mapPlantToInfo(plant));
        } catch (err) {
          console.warn("Failed to load plant details:", err);
        }

      } catch (err: any) {
        console.error("Failed to load digital twin JSON:", err);
        setError("Failed to load digital twin model from database.");
        toast.error("Failed to load digital twin model from database.");
      }
    })();
  }, [setComponents, setConnections]);



  const handleUserSubmit = (details: UserDetails) => {
    try {
      setUserDetails(details);
      setStep("info");
      toast.success("User details saved! Now specify your plant information.");
    } catch (err) {
      setError("Failed to save user details. Please try again.");
      toast.error("Error saving user details.");
    }
  };

  // Create plant and digital twin; set global IDs for component persistence
  const handleInfoSubmit = async (info: PlantInfo) => {
  try {

    const payload = infoToPlantPayload(info);

    const plant = await createPlant(payload);
    toast.success("Plant created successfully!");

    setPlantInfo(info);
    (window as any).currentPlantId = plant.id;

    // Create digital twin for component persistence
    const twin = await createDigitalTwin({
      plant_id: plant.id,
      name: `${info.plantName} Digital Twin`,
      version: "1",
      is_active: true,
    });

    toast.success("Digital Twin initialized!");
    (window as any).currentTwinId = twin.id;

    setStep("product");

  } catch (err: any) {
    console.error(err);
    toast.error("Failed to create plant or digital twin.");
  }
};

  const handleProductSubmit = (products: ProductInfo[]) => {
    try {
      setProductInfo(products.map((p) => ({ ...p, verified: false })));
      setStep("loading");
      setTimeout(() => {
        setStep("builder");
        toast.success("Products saved! Now build your plant model.");
      }, 2000);
    } catch (err) {
      setError("Failed to save products. Please try again.");
      toast.error("Error saving products.");
    }
  };

  const handleInfoUpdate = async (info: PlantInfo) => {
    try {
      const plantId = Number((window as any).currentPlantId);
      if (!plantId) {
        toast.error("Missing plant id.");
        return;
      }
      await updatePlant(plantId, infoToPlantPayload(info));
      setPlantInfo(info);
      setIsEditingPlantInfo(false);
      setShowInfoModal(false);
      setStep("builder");
      toast.success("Plant info updated.");
    } catch (err: any) {
      console.error("Failed to update plant info:", err);
      toast.error(err?.message || "Failed to update plant info.");
    }
  };

  const handleFocusComponent = useCallback((componentId?: string) => {
    if (!componentId) return;
    setFocusRequest({ id: componentId, ts: Date.now() });
    setHighlightedComponentId(componentId);
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedComponentId(null);
    }, 1600);
  }, []);

  const handleRunComplianceCheck = async () => {
    if (components.length === 0) {
      setError("Please define components before running validation.");
      toast.error("Please define components.");
      return;
    }

    const twinId = Number((window as any).currentTwinId);
    if (!twinId || Number.isNaN(twinId)) {
      toast.error("No digital twin found. Please save or reload the plant model first.");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setShowValidationPanel(false);
    setValidationStep("structure");
    try {
      const highLevelResult = await validateDigitalTwinHighLevel(twinId);
      if (!highLevelResult.valid) {
        const fallbackErrors =
          highLevelResult.errors?.length ? highLevelResult.errors : [buildFallbackValidationError("structure")];
        setValidationResult({
          ...highLevelResult,
          errors: fallbackErrors,
        });
        setShowValidationPanel(true);
        setValidationStep("structure");
        toast.error(
          `Structure validation failed with ${highLevelResult.errors.length} issue${
            highLevelResult.errors.length === 1 ? "" : "s"
          }.`
        );
        return;
      }

      setValidationResult(highLevelResult);
      setShowValidationPanel(true);
      setValidationStep("structure");
      toast.success("Structure check passed. Run port check to continue.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to validate process flow.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunPortCheck = async () => {
    const twinId = Number((window as any).currentTwinId);
    if (!twinId || Number.isNaN(twinId)) {
      toast.error("No digital twin found. Please save or reload the plant model first.");
      return;
    }
    if (!validationResult?.valid || validationStep !== "structure") {
      toast.info("Run the structure check first.");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setShowValidationPanel(false);
    setValidationStep("ports");
    try {
      const portResult = await validateDigitalTwinPortConnections(twinId);
      const resolveCarrierName = (id: number) => carrierDefNames[id];
      const taggedPortErrors = (portResult.errors ?? []).map((err) => ({
        ...err,
        errorCode: err.errorCode || "PORT_CONNECTION",
        errorMessage: formatPortErrorMessage(
          {
            ...err,
            errorCode: err.errorCode || "PORT_CONNECTION",
            errorMessage: err.errorMessage
              ? `[Port] ${err.errorMessage}`
              : "[Port] Invalid port connection.",
          },
          resolveCarrierName
        ),
      }));

      const finalResult: DigitalTwinValidationResult = {
        valid: Boolean(portResult.valid),
        digitalTwinId: portResult.digitalTwinId ?? twinId,
        checkedAt: portResult.checkedAt ?? new Date().toISOString(),
        errors: taggedPortErrors.length ? taggedPortErrors : [buildFallbackValidationError("ports")],
      };

      setValidationResult(finalResult);
      setShowValidationPanel(true);

      if (finalResult.valid) {
        toast.success("Port connections validated successfully.");
        if (productInfo.length === 0) {
          toast.info("Add products to continue with compliance checks.");
          return;
        }
        setStep("compliance");
      } else {
        toast.error(
          `Port validation failed with ${finalResult.errors.length} issue${
            finalResult.errors.length === 1 ? "" : "s"
          }.`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to validate port connections.");
    } finally {
      setIsValidating(false);
    }
  };

  // Equipment references for the equation engine (client-side coverage source).
  const equipmentRefs = useMemo(
    () => equipmentRefsFromComponents(components),
    [components]
  );

  // Whether the equation engine can run (both process-flow checks passed).
  const equationsReady =
    validationStep === "equations" ||
    (validationStep === "ports" && Boolean(validationResult?.valid));

  const resolveTwinId = useCallback((): number | null => {
    const twinId = Number((window as any).currentTwinId);
    return twinId && !Number.isNaN(twinId) ? twinId : null;
  }, []);

  // The twin id lives on a window global, so it cannot drive a `disabled`
  // prop — mutating it does not re-render. Resolve it at click time instead.
  const handleOpenReports = useCallback(() => {
    const twinId = resolveTwinId();
    if (!twinId) {
      toast.error("Save the plant model before generating a report.");
      return;
    }
    setReportsTwinId(twinId);
    setShowReports(true);
  }, [resolveTwinId]);

  // Step 3a: run the equations of ONE equipment (per-card Run button).
  // Resolves parameters from the current persisted state — upstream equipment
  // outputs are read as saved, so users can iterate equipment by equipment.
  const handleRunEquipment = useCallback(
    async (instanceId: number) => {
      const twinId = resolveTwinId();
      if (!twinId) {
        toast.error("No digital twin found. Please save or reload the plant model first.");
        return;
      }
      if (!equationsReady) {
        toast.info("Run the structure and port checks first.");
        return;
      }

      setComputingEquipmentIds((prev) => new Set(prev).add(instanceId));
      try {
        const er = await runEquipment(twinId, instanceId);
        setEquationRuns((prev) => ({ ...prev, [instanceId]: er }));
        setValidationStep("equations");

        const name =
          equipmentRefs.find((e) => e.instanceId === instanceId)?.name ??
          `Equipment #${instanceId}`;
        const failed = er.results.filter((r) => r.status === "failed").length;
        const skipped = er.results.filter((r) => r.status === "skipped").length;
        const ok = er.results.filter((r) => r.status === "success").length;
        if (failed > 0) {
          toast.warning(`${name}: ${ok} computed · ${failed} failed.`);
        } else if (skipped > 0) {
          toast.info(`${name}: ${ok} computed · ${skipped} skipped (missing inputs).`);
        } else {
          toast.success(`${name}: ${ok} equation${ok === 1 ? "" : "s"} computed.`);
        }
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : "Failed to run the equipment equations."
        );
      } finally {
        setComputingEquipmentIds((prev) => {
          const next = new Set(prev);
          next.delete(instanceId);
          return next;
        });
      }
    },
    [equationsReady, equipmentRefs, resolveTwinId]
  );

  // Hydrate persisted results once the equations step unlocks, so the panel
  // shows the last saved run per equipment across page reloads.
  const hydratedTwinRef = useRef<number | null>(null);
  useEffect(() => {
    const twinId = resolveTwinId();
    if (!twinId || !equationsReady || hydratedTwinRef.current === twinId) return;
    if (equipmentRefs.length === 0) return;
    hydratedTwinRef.current = twinId;
    void (async () => {
      const entries = await Promise.all(
        equipmentRefs.map(async (ref) => {
          try {
            return [ref.instanceId, await fetchEquipmentResults(twinId, ref.instanceId)] as const;
          } catch {
            return [ref.instanceId, { run: null, results: [] } as EquipmentRun] as const;
          }
        })
      );
      setEquationRuns((prev) => {
        // Do not clobber fresher in-session results.
        const next: EquipmentRunMap = {};
        for (const [id, er] of entries) if (er.run) next[id] = er;
        return { ...next, ...prev };
      });
    })();
  }, [equationsReady, equipmentRefs, resolveTwinId]);

  // Invalidate computed runs whenever the model changes, so the panel prompts
  // a re-run instead of showing stale numbers.
  useEffect(() => {
    setEquationRuns((prev) => (Object.keys(prev).length ? {} : prev));
    hydratedTwinRef.current = null;
  }, [components, connections]);

  // Save plant model: update positions and delete removed components
  const handleSave = async () => {
    try {
      const pending = components.filter((c) => c.isPersisting);
      if (pending.length) {
        toast.error("Please wait until all components finish saving before saving the model.");
        return;
      }

      const missingInstances = components.filter((c) => !toInstanceId(c.instanceId));
      if (missingInstances.length) {
        toast.error("Some components are not persisted yet. Please wait and try again.");
        return;
      }


      // LOG: Current state before Save
      logJson(`[PlantBuilder] ========== SAVE START ==========`);
      logJson(`[PlantBuilder] Current Components:`, components);
      logJson(`[PlantBuilder] Original Components:`, originalComponents);

      const connectionPayloadMap = components.reduce<Record<string, StoredConnectionPayload[]>>(
        (acc, component) => {
          acc[component.id] = buildConnectionPayloadForComponent(component.id, connections, components);
          return acc;
        },
        {}
      );

      // 1. Update positions for all current components with instanceId
      const componentsToUpdate = components.filter((c) => toInstanceId(c.instanceId));
      logJson(`[PlantBuilder] Components to Update (positions):`, componentsToUpdate);

      const updatePromises = componentsToUpdate.map((c) => {
        const updatePayload = {
          position: c.position,
          connections: connectionPayloadMap[c.id] ?? [],
        };
        logJson(`[PlantBuilder] Updating instanceId ${c.instanceId} with:`, updatePayload);
        
        const instanceId = toInstanceId(c.instanceId) as number;
        return updateComponentInstance(instanceId, updatePayload)
          .then((result: any) => {
            logJson(`[PlantBuilder] ✓ Position update SUCCESS for ${c.id}:`, result);
          })
          .catch((err: any) => {
            logJson(`[PlantBuilder] ✗ Position update FAILED for ${c.id}:`, err);
          });
      });

      // 2. Delete components that were removed (in original but not in current)
      const deletedComponents = originalComponents.filter(
        (orig) => !components.find((curr) => curr.id === orig.id)
      );
      
      logJson(`[PlantBuilder] Deleted Components (in original but not in current):`, deletedComponents);

      const componentsToDelete = deletedComponents.filter((c) => toInstanceId(c.instanceId));
      logJson(`[PlantBuilder] Components to Delete (with instanceId):`, componentsToDelete);

      const deletePromises = componentsToDelete.map((c) => {
        logJson(`[PlantBuilder] Deleting instanceId ${c.instanceId}...`);
        
        const instanceId = toInstanceId(c.instanceId) as number;
        return deleteComponentInstance(instanceId)
          .then((result: any) => {
            logJson(`[PlantBuilder] ✓ Delete SUCCESS for ${c.id} (instanceId: ${c.instanceId}):`, result);
            // Update original tracking
            setOriginalComponents((prev) => prev.filter((orig) => orig.id !== c.id));
          })
          .catch((err: any) => {
            logJson(`[PlantBuilder] ✗ Delete FAILED for ${c.id} (instanceId: ${c.instanceId}):`, err);
          });
      });

      // Wait for all updates and deletes
      const allResults = await Promise.all([...updatePromises, ...deletePromises]);
      logJson(`[PlantBuilder] All promises resolved:`, allResults);

      toast.success("Plant model saved successfully!");
      markSavedNow();
      logJson(`[PlantBuilder] ========== SAVE END (SUCCESS) ==========`);
    } catch (err) {
      logJson(`[PlantBuilder] ========== SAVE END (ERROR) ==========`);
      logJson(`[PlantBuilder] Save error:`, err);
      setError("Failed to save plant model. Please try again.");
      toast.error("Error saving plant model.");
    }
  };

  // Add component from inline dialog (persists to DB asynchronously)
  const handleAddNewComponent = () => {
    if (!newComponent.name || !newComponent.type || !newComponent.category) {
      setError("Please fill all component fields.");
      toast.error("Please fill all component fields.");
      return;
    }
    try {
      const component: PlacedComponent = {
        id: `comp-${Date.now()}`,
        name: newComponent.name,
        type: newComponent.type,
        category: newComponent.category,
        position: { x: 100, y: 100 },
        data: { technicalData: {} }, // REQUIRED
        certifications: [],
      };

      // Optimistic UI update
      setComponents((prev) => [...prev, component]);
      setNewComponent({ name: "", type: "" as any, category: "" });
      setShowAddComponent(false);
      toast.success("Component added successfully!");

      // Persist to backend asynchronously
      (async () => {
        try {
          const { fetchComponentDefinitions, createComponentDefinition } = await import(
            "@/services/plant-builder/componentDefinitions"
          );
          const { createComponentInstance } = await import(
            "@/services/plant-builder/componentInstances"
          );

          const defs = await fetchComponentDefinitions();
          const def = defs.find((d) => d.component_name === component.name && d.component_type === component.type);

          // Use existing definition only; no auto-create
          if (!def) {
            console.warn("[PlantBuilder] Component definition not found:", component.name);
            return;
          }

          const twinId = (window as any).currentTwinId as number | undefined;
          if (!twinId) return;

          const instancePayload = {
            digital_twin_id: twinId,
            component_definition_id: def.id,
            instance_name: component.name,
            position: component.position,
            field_values: component.data || {},
            connections: [],
            metadata: {},
          };

          const created = await createComponentInstance(instancePayload as any);

          setComponents((prev) =>
            prev.map((c) => (c.id === component.id ? { ...c, componentDefinitionId: def!.id, instanceId: created.id } : c))
          );
        } catch (err) {
          console.warn("Failed to persist component from PlantBuilder modal:", err);
        }
      })();
    } catch (err) {
      setError("Failed to add component. Please try again.");
      toast.error("Error adding component.");
    }
  };

  const handleAssistantSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const inquiry = formData.get("inquiry") as string;
      console.log("User Inquiry:", inquiry);
      toast.success("Your inquiry has been submitted! Our team will reach out soon.");
      setShowAssistantModal(false);
    } catch (err) {
      setError("Failed to submit inquiry. Please try again.");
      toast.error("Error submitting inquiry.");
    }
  };

  // ── Templates ────────────────────────────────────────────────────────────
  // Same click-time twin resolution as handleOpenReports (window global).
  const handleOpenSaveTemplate = useCallback(() => {
    const twinId = resolveTwinId();
    if (!twinId) {
      toast.error("Save the plant model before saving it as a template.");
      return;
    }
    setSaveTemplateTwinId(twinId);
    setShowSaveTemplate(true);
  }, [resolveTwinId]);

  const handleUseTemplate = (template: TemplateDto) => {
    setShowTemplateGallery(false);
    // Applying replaces the model, so an existing one needs confirmation.
    if (components.length > 0) {
      setTemplateToApply(template);
    } else {
      void applyTemplate(template);
    }
  };

  const applyTemplate = async (template: TemplateDto) => {
    const plantId = Number((window as any).currentPlantId);
    if (!plantId || Number.isNaN(plantId)) {
      toast.error("Create or load a plant before applying a template.");
      return;
    }
    const plantName = plantInfo?.plantName?.trim();
    setIsApplyingTemplate(true);
    try {
      await instantiateTemplate(template.id, {
        plantId,
        name: plantName ? `${plantName} Digital Twin` : template.name,
      });
      toast.success(`Applied "${template.name}".`);
      // Reload so every panel (canvas, validation, reports) reads the new model.
      window.location.href = `/plant-operator/plant-builder/builder?plantId=${plantId}`;
    } catch (err: any) {
      console.error("Failed to apply template:", err);
      toast.error(err?.message || "Failed to apply the template.");
      setIsApplyingTemplate(false);
      setTemplateToApply(null);
    }
  };

  const onConnect = useCallback(
    (params: any) => {
      try {
        const source = components.find((c) => c.id === params.source);
        const target = components.find((c) => c.id === params.target);
        const isEndpoint = (c?: PlacedComponent) =>
          c?.type === "equipment" || c?.type === "gate";
        const isCarrier = (c?: PlacedComponent) => c?.type === "carrier";
        const getCarrierKey = (c?: PlacedComponent | null) => {
          if (!c) return "";
          const raw =
            typeof c.data?.product === "string"
              ? c.data.product
              : c.name;
          return typeof raw === "string" ? raw.trim().toLowerCase() : "";
        };

        if (source && target && isEndpoint(source) && isCarrier(target)) {
          const carrierKey = getCarrierKey(target);
          if (carrierKey) {
            const existingCarrier = components.find(
              (c) =>
                c.type === "carrier" &&
                c.id !== target.id &&
                getCarrierKey(c) === carrierKey &&
                connections.some(
                  (conn) => conn.from === source.id && conn.to === c.id
                )
            );

            if (existingCarrier) {
              const incomingToTarget = connections.filter(
                (conn) => conn.to === target.id
              );
              const hasOtherIncoming = incomingToTarget.some(
                (conn) => conn.from !== source.id
              );
              if (hasOtherIncoming) {
                toast.error(
                  "This carrier already has a different source. Use the existing carrier output instead."
                );
                return;
              }

              const outgoingFromTarget = connections.filter(
                (conn) => conn.from === target.id
              );

              setComponents((prev) => prev.filter((c) => c.id !== target.id));
              setConnections((prev) => {
                let next = prev.filter(
                  (conn) => conn.from !== target.id && conn.to !== target.id
                );

                const hasInputConn = next.some(
                  (conn) => conn.from === source.id && conn.to === existingCarrier.id
                );
                if (!hasInputConn) {
                  next = [
                    ...next,
                    {
                      id: `conn-${Date.now()}-merge`,
                      from: source.id,
                      to: existingCarrier.id,
                      type: carrierKey,
                    },
                  ];
                }

                outgoingFromTarget.forEach((conn) => {
                  const exists = next.some(
                    (existing) =>
                      existing.from === existingCarrier.id && existing.to === conn.to
                  );
                  if (!exists) {
                    next.push({
                      ...conn,
                      id: `conn-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 6)}`,
                      from: existingCarrier.id,
                    });
                  }
                });

                void persistConnectionsForComponent(source.id, next);
                void persistConnectionsForComponent(existingCarrier.id, next);
                return next;
              });

              const instanceId = toInstanceId(target.instanceId);
              if (instanceId) {
                void deleteComponentInstance(instanceId);
              }

              toast.info(
                `Carrier "${target.name}" already exists for this output. Merged into existing carrier.`
              );
              return;
            }
          }
        }

        const exists = uniqueConnections.some(
          (conn) => conn.from === params.source && conn.to === params.target
        );
        if (exists) {
          toast.info("Connection already exists.");
          return;
        }

        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          from: params.source,
          to: params.target,
          type: "",
        };
        setConnections((prev) => {
          const next = [...prev, newConn];
          void persistConnectionsForComponent(params.source, next);
          return next;
        });
        toast.success("Connection added successfully!");
      } catch (err) {
        setError("Failed to add connection. Please try again.");
        toast.error("Error adding connection.");
      }
    },
    [components, connections, persistConnectionsForComponent, setConnections, uniqueConnections]
  );

  const toggleComponentLibrary = () => {
    setShowComponentLibrary((prev) => !prev);
  };

  return (
    <div className="h-[calc(100dvh-80px)] max-h-[calc(100dvh-80px)] flex flex-col bg-gray-50 min-h-0 overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white text-gray-900 flex items-center justify-between px-4 py-2 shadow-sm h-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const plantId = params.get("plantId");

              if (plantId) {
                // If user is editing an existing plant, return to select-plant list
                router.push("/plant-operator/plant-builder");
              } else {
                // Default behavior for new plant creation
                router.push("/");
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-1.5">
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                {plantInfo ? plantInfo.plantName : "New Plant"}
              </h1>
              {plantInfo && (
                <p className="text-xs sm:text-sm opacity-80">{plantInfo.projectName}</p>
              )}
            </div>
            {step === "builder" && (
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-[#0F766E] hover:bg-[#0F766E]/10"
                      onClick={() => setShowInfoModal(true)}
                      disabled={!plantInfo}
                      aria-label="Edit plant details"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Edit plant details</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {step === "builder" && (
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      size="sm"
                      className="ml-1 h-8 text-xs border-[#0F766E] hover:bg-[#0F766E]/10"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="bg-white">
                    Last saved · <span className="font-semibold">{lastSavedLabel}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {step === "builder" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRunComplianceCheck}
                disabled={isValidating || components.length === 0}
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {isValidating ? "Checking..." : "Check Process Flow"}
              </Button>
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* A disabled button swallows pointer events, so the
                        tooltip trigger has to wrap it. */}
                    <span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={components.length === 0}
                        onClick={handleOpenReports}
                        className="h-8 text-xs border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Reports
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" className="bg-white">
                    {components.length === 0
                      ? "Add components to the canvas first"
                      : "Generate a plant document"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTemplateGallery(true)}
                disabled={isApplyingTemplate}
                className={`h-8 text-xs ${brandOutlineBtnClass}`}
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                {isApplyingTemplate ? "Applying…" : "Templates"}
              </Button>
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* A disabled button swallows pointer events, so the
                        tooltip trigger has to wrap it. */}
                    <span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={components.length === 0}
                        onClick={handleOpenSaveTemplate}
                        className={`h-8 text-xs ${brandOutlineBtnClass}`}
                      >
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Save as Template
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" className="bg-white">
                    {components.length === 0
                      ? "Add components to the canvas first"
                      : "Save this layout as a reusable template"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </header>

      <div
        className={`flex-1 min-h-0 relative ${
          step === "info" || step === "product" || step === "builder" ? "p-0" : "p-4"
        } overflow-hidden`}
      >
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mx-4 mt-4 rounded-md text-sm">{error}</div>
        )}

        {step === "info" ? (
          <div className="min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-full flex items-start p-0 overflow-hidden">
            <PlantInfoForm
              onSubmit={isEditingPlantInfo ? handleInfoUpdate : handleInfoSubmit}
              initialData={plantInfo || undefined}
              submitLabel={isEditingPlantInfo ? "Save Plant Info" : undefined}
            />
          </div>
        ) : step === "product" ? (
          <div className="min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-full flex items-start p-0 overflow-hidden">
            <ProductForm onSubmit={handleProductSubmit} />
          </div>
        ) : step === "builder" ? (
          <div className="h-full min-h-0 relative overflow-hidden">
            <div className={`absolute top-0 right-0 bottom-0 min-h-0 transition-all duration-300 ease-in-out ${
                showComponentLibrary ? "sm:left-[384px] left-0" : "left-0"
              }`}>
                <Canvas
                  components={components}
                  setComponents={setComponents}
                  connections={connections}
                  setConnections={setConnections}
                  onConnect={onConnect}  // PASSED
                  onAutoSave={markSavedNow}
                  exportId="main"
                  exportTitle={plantInfo?.plantName || plantInfo?.projectName || "Plant Model"}
                  exportMeta={exportMetaLines}
                  portsByDefinitionId={portsByDefinitionId}
                  validationErrorsByComponent={validationErrorsByComponent}
                  invalidConnectionIds={invalidConnectionIds}
                  invalidConnectionMessages={connectionErrorMessages}
                  focusRequest={focusRequest}
                  highlightedComponentId={highlightedComponentId}
                  topRightAddon={
                    validationResult && !showValidationPanel ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowValidationPanel(true)}
                        className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                      >
                        Validation
                        <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {validationResult.errors.length}
                        </span>
                      </Button>
                    ) : null
                  }
                />
              </div>
            {/* Sidebar Container (overlay; does not shift canvas) */}
            <div
              className={`absolute top-0 left-0 h-full flex transition-all duration-300 ease-in-out ${
                showComponentLibrary ? "w-full sm:w-96" : "w-10"
              } bg-white border-r border-gray-200 shadow-sm overflow-hidden z-20`}
            >
              {showComponentLibrary && (
                <div className="flex-1 overflow-y-auto">
                  <ComponentLibrary />
                </div>
              )}
              <div
                className="w-10 bg-gray-100 hover:bg-[#0F766E]/10 cursor-pointer flex items-center justify-center transition-colors duration-200"
                onClick={toggleComponentLibrary}
                title={showComponentLibrary ? "Hide Library" : "Show Library"}
              >
                {showComponentLibrary ? (
                  <ChevronLeft className="h-5 w-5 text-[#0F766E]" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-[#0F766E]" />
                )}
              </div>
            </div>

            {validationResult && showValidationPanel && (
              <ValidationPanel
                validationResult={validationResult}
                validationStep={validationStep}
                groupedValidationErrors={groupedValidationErrors}
                hasFocusableValidationErrors={hasFocusableValidationErrors}
                isValidating={isValidating}
                onClose={() => setShowValidationPanel(false)}
                onFocusComponent={handleFocusComponent}
                onRunStructureCheck={handleRunComplianceCheck}
                onRunPortCheck={handleRunPortCheck}
                equationRuns={equationRuns}
                equipment={equipmentRefs}
                computingEquipmentIds={computingEquipmentIds}
                onRunEquipment={handleRunEquipment}
              />
            )}
            <ReportsDialog
              open={showReports}
              onOpenChange={setShowReports}
              digitalTwinId={reportsTwinId}
            />
          </div>
        ) : step === "compliance" ? (
          <div className="h-full overflow-y-auto">
            <ComplianceCheck
              productInfo={productInfo}
              setProductInfo={setProductInfo}
              components={components}
              plantInfo={plantInfo}
              verifiedProducts={verifiedProducts}
              setVerifiedProducts={setVerifiedProducts}
              selectedCertifications={selectedCertifications}
              setSelectedCertifications={setSelectedCertifications}
              complianceResults={complianceResults}
              setComplianceResults={setComplianceResults}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              error={error}
              setError={setError}
              onBack={() => setStep("builder")}
              userDetails={userDetails}
              connections={connections}
            />
          </div>
        ) : (
          <LoadingPage />
        )}
      </div>

      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-xl max-h-[90vh]">
          <DialogTitle className="sr-only">Edit plant details</DialogTitle>
          <PlantInfoForm
            embedded
            initialData={plantInfo || undefined}
            submitLabel="Save Plant Info"
            onSubmit={handleInfoUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddComponent} onOpenChange={setShowAddComponent}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="componentType" className="text-sm">Component Type *</Label>
              <Select
                value={newComponent.type}
                onValueChange={(value) =>
                  setNewComponent({ ...newComponent, type: value as "equipment" | "carrier" | "gate" })
                }
              >
                <SelectTrigger id="componentType" className="border-[#0F766E]/30 focus:ring-[#0F766E] text-sm">
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment (Physical Infrastructure)</SelectItem>
                  <SelectItem value="carrier">Carrier (Energy & Material Flow)</SelectItem>
                  <SelectItem value="gate">Gate (Input/Output Points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="componentName" className="text-sm">Name *</Label>
              <Input
                id="componentName"
                value={newComponent.name}
                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                placeholder="Enter component name (e.g., Electrolyzer)"
                maxLength={100}
                className="border-[#0F766E]/30 focus:ring-[#0F766E] text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="componentCategory" className="text-sm">Category *</Label>
              <Input
                id="componentCategory"
                value={newComponent.category}
                onChange={(e) => setNewComponent({ ...newComponent, category: e.target.value })}
                placeholder="Enter category (e.g., Power-to-X)"
                maxLength={100}
                className="border-[#0F766E]/30 focus:ring-[#0F766E] text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddComponent(false)}
              className="border-[#0F766E]/30 hover:bg-[#0F766E]/10 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewComponent}
              disabled={!newComponent.name || !newComponent.type || !newComponent.category}
              className="bg-[#0F766E] hover:bg-[#0C5F59] text-white text-sm"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssistantModal} onOpenChange={setShowAssistantModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Need Help?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Our product is continuously being refined to meet your needs. If you can’t find a
              specific component, feature, or need assistance building your plant model, let us know!
            </p>
            <div className="space-y-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={() => toast.info("Assistant feature coming soon!")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with Assistant
              </Button>
              <form onSubmit={handleAssistantSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inquiry" className="text-sm">Your Inquiry</Label>
                  <Input
                    id="inquiry"
                    name="inquiry"
                    placeholder="Describe your issue or request"
                    required
                    className="border-[#0F766E]/30 focus:ring-[#0F766E] text-sm"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TemplateGalleryDialog
        open={showTemplateGallery}
        onOpenChange={setShowTemplateGallery}
        onUse={handleUseTemplate}
        actionLabel="Apply to Plant"
        subtitle="Apply a template to this plant. Its layout replaces the current canvas."
      />

      <ReplaceModelDialog
        template={templateToApply}
        plantName={plantInfo?.plantName || "This plant"}
        componentCount={components.length}
        connectionCount={connections.length}
        applying={isApplyingTemplate}
        onConfirm={() => templateToApply && applyTemplate(templateToApply)}
        onCancel={() => setTemplateToApply(null)}
      />

      <SaveTemplateDialog
        open={showSaveTemplate}
        onOpenChange={setShowSaveTemplate}
        digitalTwinId={saveTemplateTwinId}
        defaultName={plantInfo?.plantName ?? ""}
        defaultPathway={(plantInfo as any)?.primaryPathway ?? ""}
      />
    </div>
  );
};

export default PlantBuilder;
