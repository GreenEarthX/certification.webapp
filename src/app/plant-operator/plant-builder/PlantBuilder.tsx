'use client';

// Helper: Pretty-print JSON to console
const logJson = (label: string, data?: any) => {
  console.log(label);
  if (data) console.log(JSON.stringify(data, null, 2));
};

import "./plant-builder-vite.css";  //
import "./App.css";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  X,
  Save,
  Play,
  Plus,
  MessageSquare,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import PlantInfoForm from "@/components/plant-builder/PlantInfoForm";
import ProductForm from "@/components/plant-builder/ProductForm";
import LoadingPage from "@/components/plant-builder/LoadingPage";
import Canvas from "@/components/plant-builder/Canvas";
import ComponentLibrary from "@/components/plant-builder/ComponentLibrary";
import { ComplianceCheck } from "./ComplianceCheck";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { createPlant, fetchPlantById, Plant } from "@/services/plant-builder/plants";
import {
  createDigitalTwin,
  fetchDigitalTwinJsonForPlant,
  validateDigitalTwinHighLevel,
} from "@/services/plant-builder/digitalTwins";
import type {
  DigitalTwinValidationError,
  DigitalTwinValidationResult,
} from "@/services/plant-builder/digitalTwins";
import { updateComponentInstance, deleteComponentInstance } from "@/services/plant-builder/componentInstances";
import { buildConnectionPayloadForComponent, StoredConnectionPayload } from "@/lib/plant-builder/connection-utils";

// Coerce optional id fields from persisted JSON (string/number) into usable numbers.
const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatValidationContext = (err: DigitalTwinValidationError) => {
  if (err.relatedComponentId) {
    return `From component ID: ${err.componentId} · To component ID: ${err.relatedComponentId}`;
  }
  return `Component ID: ${err.componentId}`;
};

/**
 * Plant Builder Component
 * 
 * Multi-step workflow: User Details → Plant Info → Products → Canvas Builder → Compliance Check
 * Manages component persistence to backend and process flow visualization.
 */
export const PlantBuilder = () => {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "product" | "builder" | "compliance" | "loading">("info");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo[]>([]);
  const [verifiedProducts, setVerifiedProducts] = useState<string[]>([]);
  const [showDataModel, setShowDataModel] = useState(false);
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
  const [plantModelJson, setPlantModelJson] = useState<string>("");
  const [validationResult, setValidationResult] = useState<DigitalTwinValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  const [focusRequest, setFocusRequest] = useState<{ id: string; ts: number } | null>(null);
  const [highlightedComponentId, setHighlightedComponentId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

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

  const invalidConnectionIds = useMemo(() => {
    if (!validationResult?.errors?.length) return new Set<string>();

    const connectionIds = new Set(connections.map((conn) => String(conn.id)));
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

    const isConnectionError = (err: DigitalTwinValidationError) => {
      const haystack = `${err.errorCode} ${err.errorMessage}`.toLowerCase();
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
      if (disallow.some((term) => normalized.includes(term))) {
        return false;
      }
      const allowRegex = /\b(connection|from|to|input|output|source|target|port)\b/;
      return allowRegex.test(normalized);
    };

    const next = new Set<string>();
    validationResult.errors.forEach((err) => {
      if (!isConnectionError(err)) return;
      if (err.relatedConnectionId) {
        const id = String(err.relatedConnectionId);
        if (connectionIds.has(id)) {
          next.add(id);
        }
        return;
      }
      if (err.relatedComponentId) {
        const forwardKey = `${err.componentId}|${err.relatedComponentId}`;
        const reverseKey = `${err.relatedComponentId}|${err.componentId}`;
        const forwardIds = connectionPairs.get(forwardKey);
        const reverseIds = connectionPairs.get(reverseKey);
        forwardIds?.forEach((id) => next.add(id));
        reverseIds?.forEach((id) => next.add(id));
      }
    });

    return next;
  }, [connections, validationResult]);

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

      if (!component?.instanceId) {
        logJson(`[PlantBuilder] Cannot persist connections for ${componentId}; missing instanceId`);
        return;
      }

      const payload = buildConnectionPayloadForComponent(componentId, connectionList, componentList);

      try {
        logJson(
          `[PlantBuilder] Persisting ${payload.length} connections for ${componentId} (instanceId=${component.instanceId})`,
          payload
        );
        await updateComponentInstance(component.instanceId, { connections: payload });
      } catch (err) {
        logJson(`[PlantBuilder] ✗ Failed to persist connections for ${componentId}:`, err);
        toast.error(`Failed to update connections for ${component.name}`);
      }
    },
    [components, connections]
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

  // Load existing plant from URL (edit mode)
    useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantIdParam = searchParams.get("plantId");

    if (!plantIdParam) return;

    const plantId = Number(plantIdParam);
    if (Number.isNaN(plantId)) return;

    setStep("builder");

    const mapPlantToInfo = (plant: Plant): PlantInfo => {
      const metadata = plant.metadata || {};
      return {
        plantName: plant.name || "New Plant",
        projectName: metadata.projectName || "",
        projectType: metadata.projectType || "",
        primaryFuelType: metadata.primaryFuelType || "",
        country: plant.location || metadata.country || "",
        status: plant.status || "",
        commercialOperationalDate: metadata.commercialOperationalDate || "",
        investment: metadata.investment,
      };
    };

    (async () => {
      try {
        toast.info("Loading digital twin from database…");

        const records = await fetchDigitalTwinJsonForPlant(plantId);

        if (!records.length || !records[0].digital_twin_json) {
          toast.error("No digital twin JSON found for this plant.");
          return;
        }

        const { components: rawComponents = [], connections: rawConnections = [] } =
          records[0].digital_twin_json;

        const normalizePosition = (pos: any) => {
          const rawX = typeof pos?.x === "string" ? Number.parseFloat(pos.x) : Number(pos?.x ?? 0);
          const rawY = typeof pos?.y === "string" ? Number.parseFloat(pos.y) : Number(pos?.y ?? 0);
          return {
            x: Number.isFinite(rawX) ? rawX : 0,
            y: Number.isFinite(rawY) ? rawY : 0,
          };
        };

        const mappedComponents: PlacedComponent[] = rawComponents.map((c: any) => {
          const inferredInstanceId =
            c.instanceId ??
            c.instance_id ??
            c.componentInstanceId ??
            c.component_instance_id ??
            c.componentId ??
            c.component_id ??
            c.id;
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
            componentDefinitionId: parseOptionalNumber(inferredDefinitionId),
            instanceId: parseOptionalNumber(inferredInstanceId),
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

        setComponents(mappedComponents);
        setConnections(mappedConnections);
        setOriginalComponents(mappedComponents); // Track originals for delete detection

        try {
          const plant = await fetchPlantById(plantId);
          setPlantInfo(mapPlantToInfo(plant));
        } catch (err) {
          console.warn("Failed to load plant details:", err);
        }
        
        // Set global IDs for Canvas persistence
        try {
          (window as any).currentPlantId = plantId;
          (window as any).currentTwinId = Number(records[0].id);
          console.log("[plant-builder] restored currentPlantId/currentTwinId:", (window as any).currentPlantId, (window as any).currentTwinId);
        } catch (e) {
          // ignore
        }

        toast.success("Digital twin loaded from database.");
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
    toast.loading("Creating plant...");

    const payload = {
      name: info.plantName,
      location: info.country,
      status: info.status,
      metadata: {
        projectName: info.projectName,
        projectType: info.projectType,
        primaryFuelType: info.primaryFuelType,
        commercialOperationalDate: info.commercialOperationalDate,
        investment: info.investment,
      },
    };

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
    try {
      const result = await validateDigitalTwinHighLevel(twinId);
      setValidationResult(result);
      setShowValidationPanel(true);

      if (result.valid) {
        toast.success("Process flow validated successfully.");
        if (productInfo.length === 0) {
          toast.info("Add products to continue with compliance checks.");
          return;
        }
        setStep("compliance");
        toast.info("Starting compliance check process.");
      } else {
        toast.error(
          `Validation failed with ${result.errors.length} issue${
            result.errors.length === 1 ? "" : "s"
          }.`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to validate process flow.");
    } finally {
      setIsValidating(false);
    }
  };

  // Save plant model: update positions and delete removed components
  const handleSave = async () => {
    try {
      toast.loading("Saving plant model...");

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
      const componentsToUpdate = components.filter((c) => c.instanceId && typeof c.instanceId === 'number');
      logJson(`[PlantBuilder] Components to Update (positions):`, componentsToUpdate);

      const updatePromises = componentsToUpdate.map((c) => {
        const updatePayload = {
          position: c.position,
          connections: connectionPayloadMap[c.id] ?? [],
        };
        logJson(`[PlantBuilder] Updating instanceId ${c.instanceId} with:`, updatePayload);
        
        return updateComponentInstance(c.instanceId as number, updatePayload)
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

      const componentsToDelete = deletedComponents.filter((c) => c.instanceId && typeof c.instanceId === 'number');
      logJson(`[PlantBuilder] Components to Delete (with instanceId):`, componentsToDelete);

      const deletePromises = componentsToDelete.map((c) => {
        logJson(`[PlantBuilder] Deleting instanceId ${c.instanceId}...`);
        
        return deleteComponentInstance(c.instanceId as number)
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

  const buildDataModel = useCallback(() => {
    return {
      userDetails: userDetails || {},
      plantInfo: plantInfo || {},
      products: productInfo,
      components: normalizedComponents.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        category: c.category,
        position: c.position,
        data: c.data || {},
        certifications: c.certifications || [],
      })),
      connections: uniqueConnections.map((c) => ({
        id: c.id,
        from: c.from,
        to: c.to,
        type: c.type,
        reason: c.reason || "N/A",
        data: c.data || {},
      })),
      regulatoryMetadata: {
        projectType: plantInfo?.projectType || "N/A",
        primaryFuelType: plantInfo?.primaryFuelType || "N/A",
        country: plantInfo?.country || "N/A",
        status: plantInfo?.status || "N/A",
        commercialOperationalDate: plantInfo?.commercialOperationalDate || "N/A",
      },
    };
  }, [normalizedComponents, plantInfo, productInfo, uniqueConnections, userDetails]);

  const escapeHtml = (value: unknown) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const buildExcelTable = (title: string, headers: string[], rows: Array<Array<string | number>>) => {
    const headerRow = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const bodyRows = rows
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
      .join("");
    return `
      <h3>${escapeHtml(title)}</h3>
      <table border="1">
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows || "<tr><td colspan=\"" + headers.length + "\">N/A</td></tr>"}</tbody>
      </table>
      <br />
    `;
  };

  const formatStreamList = (items?: Array<{ name: string; quantity: number; unit: string }>) => {
    if (!items?.length) return "N/A";
    return items.map((item) => `${item.name} (${item.quantity} ${item.unit})`).join(", ");
  };

  const formatCapacity = (capacity?: { value: number; unit: string } | number | string | null) => {
    if (capacity == null) return "N/A";
    if (typeof capacity === "object") {
      return `${(capacity as { value: number; unit: string }).value} ${(capacity as { value: number; unit: string }).unit}`.trim();
    }
    return String(capacity);
  };

  const handleExportCanvasImage = async () => {
    try {
      const canvasNode = document.querySelector(
        '[data-plant-builder-canvas="main"]'
      ) as HTMLElement | null;
      if (!canvasNode) {
        toast.error("Canvas not found.");
        return;
      }
      const canvas = await html2canvas(canvasNode, {
        backgroundColor: "#f7f9fc",
        scale: 2,
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "plant-canvas.png";
      link.click();
      toast.success("Canvas image exported successfully!");
    } catch (err) {
      console.error("Failed to export canvas image:", err);
      toast.error("Failed to export canvas image.");
    }
  };

  const handleExportExcel = () => {
    try {
      const equipmentRows = normalizedComponents
        .filter((c) => c.type === "equipment")
        .map((c) => [
          c.name,
          c.category,
          formatStreamList(c.data?.technicalData?.input),
          formatStreamList(c.data?.technicalData?.output),
          c.data?.technicalData?.efficiency != null ? `${c.data.technicalData.efficiency}%` : "N/A",
          formatCapacity(c.data?.technicalData?.capacity),
          c.data?.manufacturer || "N/A",
          c.certifications?.length ? c.certifications.join(", ") : "None",
        ]);

      const carrierRows = normalizedComponents
        .filter((c) => c.type === "carrier")
        .map((c) => [
          c.name,
          c.category,
          c.data?.fuelType || "N/A",
          c.data?.temperature != null ? `${c.data.temperature}C` : "N/A",
          c.data?.pressure != null ? `${c.data.pressure} bar` : "N/A",
          c.certifications?.length ? c.certifications.join(", ") : "None",
        ]);

      const gateRows = normalizedComponents
        .filter((c) => c.type === "gate")
        .map((c) => [
          c.name,
          c.category,
          c.data?.gateType || "N/A",
          c.data?.sourceOrigin || "N/A",
          c.data?.endUse || "N/A",
          c.certifications?.length ? c.certifications.join(", ") : "None",
        ]);

      const connectionRows = uniqueConnections.map((c) => [
        getComponentName(c.from),
        getComponentName(c.to),
        c.type || "Untitled",
        c.reason || "N/A",
        Object.keys(c.data || {}).length > 0
          ? Object.entries(c.data || {}).map(([key, value]) => `${key}: ${value}`).join(", ")
          : "N/A",
      ]);

      const plantRows = plantInfo
        ? Object.entries(plantInfo).map(([key, value]) => [
            key,
            typeof value === "string"
              ? value || "N/A"
              : Array.isArray(value)
              ? value.map((item: any) => JSON.stringify(item)).join(", ")
              : typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value ?? "N/A"),
          ])
        : [["N/A", "N/A"]];

      const productRows = productInfo.length
        ? productInfo.map((p) => [
            p.productName,
            p.fuelType,
            p.productionCapacity,
            p.unit,
            p.feedstock || "N/A",
            p.offtakeLocations?.[0]?.country || "N/A",
            p.downstreamOperations || p.downstreamOperationsArray?.join(", ") || "N/A",
            p.verified ? "Yes" : "No",
          ])
        : [["N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "No"]];

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
          </head>
          <body>
            ${buildExcelTable(
              "Equipment Components",
              ["Name", "Category", "Inputs", "Outputs", "Efficiency", "Capacity", "Manufacturer", "Certifications"],
              equipmentRows
            )}
            ${buildExcelTable(
              "Carrier Components",
              ["Name", "Category", "Fuel Type", "Temperature", "Pressure", "Certifications"],
              carrierRows
            )}
            ${buildExcelTable(
              "Gate Components",
              ["Name", "Category", "Input/Output", "Source Origin", "End Use", "Certifications"],
              gateRows
            )}
            ${buildExcelTable(
              "Connections",
              ["From", "To", "Type", "Reason", "Details"],
              connectionRows
            )}
            ${buildExcelTable("Plant Information", ["Field", "Value"], plantRows)}
            ${buildExcelTable(
              "Products",
              [
                "Product Name",
                "Fuel Type",
                "Production Capacity",
                "Unit",
                "Feedstock",
                "Offtake Location",
                "Downstream Operations",
                "Verified",
              ],
              productRows
            )}
          </body>
        </html>
      `;

      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "plant-data.xls";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Excel export ready!");
    } catch (err) {
      console.error("Failed to export Excel:", err);
      toast.error("Failed to export Excel data.");
    }
  };

  // Prepare and export complete plant data model
  const handleSaveDataModel = () => {
    try {
      setShowDataModel(true);
      const dataModel = buildDataModel();
      setPlantModelJson(JSON.stringify(dataModel, null, 2));
      console.log("Data Model:", dataModel);
    } catch (err) {
      setError("Failed to save data model. Please try again.");
      toast.error("Error saving data model.");
    }
  };

  const getComponentName = (id: string) => {
    return normalizedComponents.find((c) => c.id === id)?.name || "Unknown";
  };

  const onConnect = useCallback(
    (params: any) => {
      try {
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
    [persistConnectionsForComponent, setConnections, uniqueConnections]
  );

  // Update plant model JSON for export
  const handleCanvasModelChange = (model: {
  components: PlacedComponent[];
  connections: Connection[];
}) => {
  const normalized = {
    components: model.components.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      category: c.category,
      position: c.position,
      data: c.data || {},
    })),
    connections: model.connections.map((conn) => ({
      id: conn.id,
      from: conn.from,
      to: conn.to,
      data: conn.data || {},
    })),
  };

  setPlantModelJson(JSON.stringify(normalized, null, 2));
};

  const toggleComponentLibrary = () => {
    setShowComponentLibrary((prev) => !prev);
  };

  const renderComponentTable = (type: "equipment" | "carrier" | "gate", title: string) => {
    const filteredComponents = normalizedComponents.filter((c) => c.type === type);
    return (
      <div className="w-full">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#4F8FF7]/10">
                <TableHead className="font-semibold text-gray-700 text-sm">Name</TableHead>
                <TableHead className="font-semibold text-gray-700 text-sm">Category</TableHead>
                {type === "equipment" && (
                  <>
                    <TableHead className="font-semibold text-gray-700 text-sm">Inputs</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Outputs</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Efficiency</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Capacity</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Manufacturer</TableHead>
                  </>
                )}
                {type === "carrier" && (
                  <>
                    <TableHead className="font-semibold text-gray-700 text-sm">Fuel Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Temperature</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Pressure</TableHead>
                  </>
                )}
                {type === "gate" && (
                  <>
                    <TableHead className="font-semibold text-gray-700 text-sm">Input/Output</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">Source Origin</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm">End Use</TableHead>
                  </>
                )}
                <TableHead className="font-semibold text-gray-700 text-sm">Certifications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={type === "equipment" ? 7 : type === "carrier" ? 6 : 5}
                    className="text-center text-gray-500 text-sm"
                  >
                    No {type} components
                  </TableCell>
                </TableRow>
              ) : (
                filteredComponents.map((c) => (
                  <TableRow key={c.id} className="hover:bg-[#4F8FF7]/5">
                    <TableCell className="text-gray-900 text-sm">{c.name}</TableCell>
                    <TableCell className="text-gray-900 text-sm">{c.category}</TableCell>
                    {type === "equipment" && (
                      <>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.technicalData?.input?.length
                            ? c.data.technicalData.input
                                .map((inp:any) => `${inp.name} (${inp.quantity} ${inp.unit})`)
                                .join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.technicalData?.output?.length
                            ? c.data.technicalData.output
                                .map((out:any) => `${out.name} (${out.quantity} ${out.unit})`)
                                .join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.technicalData?.efficiency ? `${c.data.technicalData.efficiency}%` : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.technicalData?.capacity
                            ? `${c.data.technicalData.capacity.value} ${c.data.technicalData.capacity.unit}`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">{c.data?.manufacturer || "N/A"}</TableCell>
                      </>
                    )}
                    {type === "carrier" && (
                      <>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.fuelType || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.temperature != null ? `${c.data.temperature}°C` : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.pressure != null ? `${c.data.pressure} bar` : "N/A"}
                        </TableCell>
                      </>
                    )}
                    {type === "gate" && (
                      <>
                        <TableCell className="text-gray-900 text-sm">{c.data?.gateType || "N/A"}</TableCell>
                        <TableCell className="text-gray-900 text-sm">{c.data?.sourceOrigin || "N/A"}</TableCell>
                        <TableCell className="text-gray-900 text-sm">{c.data?.endUse || "N/A"}</TableCell>
                      </>
                    )}
                    <TableCell className="text-gray-900 text-sm">
                      {c.certifications?.length ? c.certifications.join(", ") : "None"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderConnectionsTable = () => (
    <div className="w-full">
      <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">Connections</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4F8FF7]/10">
              <TableHead className="font-semibold text-gray-700 text-sm">From</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm">To</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm">Type</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm">Reason</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueConnections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 text-sm">
                  No connections
                </TableCell>
              </TableRow>
            ) : (
              uniqueConnections.map((c) => (
                <TableRow key={c.id} className="hover:bg-[#4F8FF7]/5">
                  <TableCell className="text-gray-900 text-sm">{getComponentName(c.from)}</TableCell>
                  <TableCell className="text-gray-900 text-sm">{getComponentName(c.to)}</TableCell>
                  <TableCell className="text-gray-900 text-sm">{c.type || "Untitled"}</TableCell>
                  <TableCell className="text-gray-900 text-sm">{c.reason || "N/A"}</TableCell>
                  <TableCell className="text-gray-900 text-sm">
                    {Object.keys(c.data || {}).length > 0
                      ? Object.entries(c.data || {})
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderPlantInfoTable = () => (
    <div className="w-full">
      <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">Plant Information</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4F8FF7]/10">
              <TableHead className="font-semibold text-gray-700 text-sm">Field</TableHead>
              <TableHead className="font-semibold text-gray-700 text-sm">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plantInfo ? (
              Object.entries(plantInfo).map(([key, value]) => (
                <TableRow key={key} className="hover:bg-[#4F8FF7]/5">
                  <TableCell className="text-gray-900 text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </TableCell>
                  <TableCell className="text-gray-900 text-sm">
                    {key === "investment" && typeof value === "object" && value !== null
                      ? `${(value as { amount: number; unit: string }).amount} ${(value as { amount: number; unit: string }).unit}`
                      : Array.isArray(value)
                      ? value.map((item: any) => JSON.stringify(item)).join(", ")
                      : typeof value === "string"
                      ? value || "N/A"
                      : JSON.stringify(value) || "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500 text-sm">
                  No plant information
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const formatCheckedAt = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 min-h-0">
      <header className="border-b border-gray-200 bg-white text-gray-900 flex items-center justify-between px-4 py-3 shadow-sm">
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

          <div>
            <h1 className="text-base sm:text-lg font-semibold">
              {plantInfo ? plantInfo.plantName : "New Plant"}
            </h1>
            {plantInfo && (
              <p className="text-xs sm:text-sm opacity-80">{plantInfo.projectName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(step === "builder" || step === "compliance") && (
            <Button
              className="text-sm bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowAssistantModal(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Assistant / Reach Out
            </Button>
          )}
        </div>
      </header>

      <div
        className={`flex-1 min-h-0 p-4 relative ${
          step === "info" || step === "product" ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mx-4 mt-4 rounded-md text-sm">{error}</div>
        )}

        {step === "info" ? (
          <div className="min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] flex items-start justify-center p-4 overflow-y-auto">
            <PlantInfoForm onSubmit={handleInfoSubmit} />
          </div>
        ) : step === "product" ? (
          <div className="min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] flex items-start justify-center p-4 overflow-y-auto">
            <ProductForm onSubmit={handleProductSubmit} />
          </div>
        ) : step === "builder" ? (
          <div className="h-full min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 min-h-0">
              <Canvas
                components={components}
                setComponents={setComponents}
                connections={connections}
                setConnections={setConnections}
                onConnect={onConnect}  // PASSED
                onModelChange={handleCanvasModelChange}
                exportId="main"
                validationErrorsByComponent={validationErrorsByComponent}
                invalidConnectionIds={invalidConnectionIds}
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
                className="w-10 bg-gray-100 hover:bg-[#4F8FF7]/10 cursor-pointer flex items-center justify-center transition-colors duration-200"
                onClick={toggleComponentLibrary}
                title={showComponentLibrary ? "Hide Library" : "Show Library"}
              >
                {showComponentLibrary ? (
                  <ChevronLeft className="h-5 w-5 text-[#4F8FF7]" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-[#4F8FF7]" />
                )}
              </div>
            </div>

            {validationResult && showValidationPanel && (
              <aside className="absolute top-0 right-0 h-full w-full max-w-[360px] z-30 bg-white/95 backdrop-blur border-l border-gray-200 shadow-xl flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        validationResult.valid
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {validationResult.valid ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {validationResult.valid ? "Validation Passed" : "Validation Failed"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Digital Twin #{validationResult.digitalTwinId}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {formatCheckedAt(validationResult.checkedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowValidationPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-4 pt-3 pb-2 flex items-center justify-between text-xs text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      validationResult.valid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {validationResult.errors.length} error
                    {validationResult.errors.length === 1 ? "" : "s"}
                  </span>
                  {!validationResult.valid && (
                    <span className="text-[11px] text-gray-400">Click any item to focus</span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {validationResult.valid ? (
                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
                      No structural issues detected. You can proceed to compliance checks.
                    </div>
                  ) : (
                    groupedValidationErrors.map((group) => (
                      <div
                        key={group.componentId}
                        className="rounded-lg border border-amber-200 bg-white p-3"
                      >
                        <button
                          type="button"
                          onClick={() => handleFocusComponent(group.componentId)}
                          className="w-full flex items-center justify-between gap-2 text-left"
                        >
                          <div>
                            <div className="text-sm font-semibold text-amber-900">
                              {group.componentName}
                            </div>
                            <div className="text-xs text-amber-700 capitalize">
                              {group.componentType} · ID {group.componentId}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold bg-amber-200 text-amber-900 rounded-full px-2 py-0.5">
                            {group.errors.length}
                          </span>
                        </button>
                        <div className="mt-2 space-y-2">
                          {group.errors.map((err, idx) => (
                            <button
                              key={`${group.componentId}-${err.errorCode}-${idx}`}
                              type="button"
                              onClick={() => handleFocusComponent(group.componentId)}
                              className="w-full text-left text-xs text-amber-900 bg-white border border-amber-100 rounded-md px-2 py-1 hover:bg-gray-50"
                            >
                              <div className="font-semibold">{err.errorCode}</div>
                              <div className="text-amber-800">{err.errorMessage}</div>
                              <div className="text-[10px] text-amber-700">
                                {formatValidationContext(err)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            )}
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

      {step === "builder" && (
        <div className="fixed bottom-4 right-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            className="text-sm border-[#4F8FF7] hover:bg-[#4F8FF7]/10"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={handleRunComplianceCheck}
            disabled={isValidating || components.length === 0}
            className="text-sm bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            {isValidating ? "Checking..." : "Check Process Flow"}
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
            onClick={handleSaveDataModel}
          >
            Save Plant Model
          </Button>
        </div>
      )}

      <Dialog open={showDataModel} onOpenChange={setShowDataModel}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Plant Data Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">Incentivization Message</h3>
              <p className="text-sm text-gray-600 mb-4">
                To ensure the most accurate digital twin of your plant, please build the process flow
                diagram with precise connections and component details. Accurate representations
                enhance compliance checks and optimize plant performance analysis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">Process Flow Diagram</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                <div className="h-[300px] flex overflow-hidden">
                  <Canvas
                    components={components}
                    setComponents={setComponents}
                    connections={connections}
                    setConnections={setConnections}
                    onConnect={onConnect}  // PASSED
                    onModelChange={handleCanvasModelChange}
                    exportId="preview"
                  />
                </div>
              </div>
            </div>
            {renderComponentTable("equipment", "Equipment Components (Physical Infrastructure)")}
            {renderComponentTable("carrier", "Carrier Components (Energy & Material Flow)")}
            {renderComponentTable("gate", "Gate Components (Input/Output Points)")}
            {renderConnectionsTable()}
            {renderPlantInfoTable()}
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">Products</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#4F8FF7]/10">
                      <TableHead className="font-semibold text-gray-700 text-sm">Product Name</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Fuel Type</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Production Capacity</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Unit</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Feedstock</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Offtake Location</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Downstream Operations</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-sm">Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productInfo.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 text-sm">
                          No products
                        </TableCell>
                      </TableRow>
                    ) : (
                      productInfo.map((p, index) => (
                        <TableRow key={index} className="hover:bg-[#4F8FF7]/5">
                          <TableCell className="text-gray-900 text-sm">{p.productName}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{p.fuelType}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{p.productionCapacity}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{p.unit}</TableCell>
                          <TableCell className="text-gray-900 text-sm">{p.feedstock || "N/A"}</TableCell>
                          <TableCell className="text-gray-900 text-sm">
                            {p.offtakeLocations?.[0]?.country || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900 text-sm">
                            {p.downstreamOperations || p.downstreamOperationsArray?.join(", ") || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900 text-sm">{p.verified ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  onClick={handleExportCanvasImage}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Canvas Image
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  onClick={handleExportExcel}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel Data
                </Button>
              </div>
            </div>
          </div>
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
                <SelectTrigger id="componentType" className="border-[#4F8FF7]/30 focus:ring-[#4F8FF7] text-sm">
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
                className="border-[#4F8FF7]/30 focus:ring-[#4F8FF7] text-sm"
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
                className="border-[#4F8FF7]/30 focus:ring-[#4F8FF7] text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddComponent(false)}
              className="border-[#4F8FF7]/30 hover:bg-[#4F8FF7]/10 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewComponent}
              disabled={!newComponent.name || !newComponent.type || !newComponent.category}
              className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white text-sm"
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
                    className="border-[#4F8FF7]/30 focus:ring-[#4F8FF7] text-sm"
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
    </div>
  );
};

export default PlantBuilder;
