'use client';

// Helper: Pretty-print JSON to console
const logJson = (label: string, data?: any) => {
  console.log(label);
  if (data) console.log(JSON.stringify(data, null, 2));
  };

import "./plant-builder-vite.css";  //
import "./App.css";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  MessageSquare,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { createPlant } from "@/services/plant-builder/plants";
import { createDigitalTwin, fetchDigitalTwinJsonForPlant } from "@/services/plant-builder/digitalTwins";
import { updateComponentInstance, deleteComponentInstance } from "@/services/plant-builder/componentInstances";
import { buildConnectionPayloadForComponent, StoredConnectionPayload } from "@/lib/plant-builder/connection-utils";

// Coerce optional id fields from persisted JSON (string/number) into usable numbers.
const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

  // Load existing plant from URL (edit mode)
    useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantIdParam = searchParams.get("plantId");

    if (!plantIdParam) return;

    const plantId = Number(plantIdParam);
    if (Number.isNaN(plantId)) return;

    setStep("builder");

    (async () => {
      try {
        toast.info("Loading digital twin from database…");

        const records = await fetchDigitalTwinJsonForPlant(plantId);

        if (!records.length) {
          toast.error("No digital twin found for this plant.");
          return;
        }

        const record = records[0];

        // Set global IDs for Canvas persistence even if there's no JSON yet
        try {
          (window as any).currentPlantId = plantId;
          (window as any).currentTwinId = Number(record.id);
          console.log("[plant-builder] restored currentPlantId/currentTwinId:", (window as any).currentPlantId, (window as any).currentTwinId);
        } catch (e) {
          // ignore
        }

        if (!record.digital_twin_json) {
          setComponents([]);
          setConnections([]);
          setOriginalComponents([]);
          toast.info("No saved digital twin model yet. Start building!");
          return;
        }

        const { components: rawComponents = [], connections: rawConnections = [] } =
          record.digital_twin_json;

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

          return {
            id: String(c.id ?? inferredInstanceId ?? `comp-${Date.now()}`),
            name: c.name,
            type: c.type,
            category: c.category,
            position: c.position,
            // keep whatever data comes, but ensure at least empty object
            data: c.data || { technicalData: {} },
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

  const handleRunComplianceCheck = () => {
    if (productInfo.length === 0 || components.length === 0) {
      setError("Please define products and components before running compliance check.");
      toast.error("Please define products and components.");
      return;
    }
    setStep("compliance");
    toast.info("Starting compliance check process.");
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

  const handleExport = (data: any, filename: string) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${filename} exported successfully!`);
    } catch (err) {
      setError(`Failed to export ${filename}. Please try again.`);
      toast.error(`Error exporting ${filename}.`);
    }
  };

  // Prepare and export complete plant data model
  const handleSaveDataModel = () => {
    try {
      setShowDataModel(true);
      // Aggregate all plant data for export
      const dataModel = {
        userDetails: userDetails || {},
        plantInfo: plantInfo || {},
        products: productInfo,
        components: components.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.name,
          category: c.category,
          position: c.position,
          data: c.data || {},
          certifications: c.certifications || [],
        })),
        connections: connections.map((c) => ({
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
      console.log("Data Model:", dataModel);
      handleExport(dataModel, "plant-data.json");
    } catch (err) {
      setError("Failed to save data model. Please try again.");
      toast.error("Error saving data model.");
    }
  };

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || "Unknown";
  };

  const onConnect = useCallback(
    (params: any) => {
      try {
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
    [persistConnectionsForComponent, setConnections]
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
    const filteredComponents = components.filter((c) => c.type === type);
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
                                .map((inp) => `${inp.name} (${inp.quantity} ${inp.unit})`)
                                .join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-900 text-sm">
                          {c.data?.technicalData?.output?.length
                            ? c.data.technicalData.output
                                .map((out) => `${out.name} (${out.quantity} ${out.unit})`)
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
            {connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 text-sm">
                  No connections
                </TableCell>
              </TableRow>
            ) : (
              connections.map((c) => (
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
                router.push("/plant-builder");
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
        className={`flex-1 p-4 relative ${
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
          <div className="h-full flex relative">
            {/* Sidebar Container */}
            <div
              className={`flex transition-all duration-300 ease-in-out ${
                showComponentLibrary ? "w-full sm:w-96" : "w-10"
              } bg-white border-r border-gray-200 shadow-sm overflow-hidden`}
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
            <div className="flex-1 overflow-y-auto">
              <Canvas
                components={components}
                setComponents={setComponents}
                connections={connections}
                setConnections={setConnections}
                onConnect={onConnect}  // PASSED
                onModelChange={handleCanvasModelChange}
              />
            </div>
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
            disabled={productInfo.length === 0 || components.length === 0}
            className="text-sm bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Check Process Flow
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
                <Button
                  variant="outline"
                  onClick={() => setShowAddComponent(true)}
                  className="absolute top-2 right-2 bg-white border-[#4F8FF7]/30 hover:bg-[#4F8FF7]/10 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>
                <div className="h-[300px] overflow-y-auto">
                 <Canvas
                  components={components}
                  setComponents={setComponents}
                  connections={connections}
                  setConnections={setConnections}
                  onConnect={onConnect}  // PASSED
                  onModelChange={handleCanvasModelChange}
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
              <Button
                className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white text-sm"
                onClick={() => {
                  const params = new URLSearchParams({
                    data: JSON.stringify({
                      userDetails: userDetails || {},
                      plantInfo: plantInfo || {},
                      productInfo,
                      components,
                      connections,
                    }),
                  });
                  router.push(`/details?${params.toString()}`);
                }}
              >
                View Detailed Data
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                onClick={handleSaveDataModel}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Plant Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddComponent} onOpenChange={setShowAddComponent}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Component</DialogTitle>
          </DialogHeader>
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
