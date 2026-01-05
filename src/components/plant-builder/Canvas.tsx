// src/components/plant-builder/Canvas.tsx
'use client';

// Helper: Pretty-print JSON to console
const logJson = (label: string, data?: any) => {
  console.log(label);
  if (data) console.log(JSON.stringify(data, null, 2));
};

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Crosshair, Hand, Plus, ZoomIn, ZoomOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

import PlantComponent from "./PlantComponent";
import toast from "react-hot-toast";
import ComponentDetailDialog from "./ComponentDetailDialog";
import ConnectionArrow from "./ConnectionArrow";
import ConnectionDetailDialog from "./ConnectionDetailDialog";

import {
  PlacedComponent as PlacedComponentType,
  Connection as ConnectionType,
} from "@/app/plant-operator/plant-builder/types";
import { buildConnectionPayloadForComponent, StoredConnectionPayload } from "@/lib/plant-builder/connection-utils";
import { 
  createComponentInstance, 
  updateComponentInstance,
  deleteComponentInstance 
} from "@/services/plant-builder/componentInstances";
import { fetchComponentDefinitions } from "@/services/plant-builder/componentDefinitions";

type CanvasProps = {
  components: PlacedComponentType[];
  setComponents: React.Dispatch<React.SetStateAction<PlacedComponentType[]>>;
  connections: ConnectionType[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionType[]>>;
  onConnect: (params: { source: string; target: string }) => void;
  onModelChange?: (model: {
    components: PlacedComponentType[];
    connections: ConnectionType[];
  }) => void;
  exportId?: string;
};

const CANVAS_BASE_WIDTH = 2400;
const CANVAS_BASE_HEIGHT = 1800;
const CANVAS_PADDING = 200;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

const getComponentBounds = (type: PlacedComponentType["type"]) => {
  switch (type) {
    case "equipment":
      return { width: 192, height: 128, offsetX: 0, offsetY: 0 };
    case "carrier":
      return { width: 128, height: 128, offsetX: 0, offsetY: 0 };
    case "gate":
      return { width: 96, height: 160, offsetX: 32, offsetY: -32 };
    default:
      return { width: 192, height: 128, offsetX: 0, offsetY: 0 };
  }
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const mapDroppedComponentData = (componentData: any) => {
  if (componentData?.data && Object.keys(componentData.data).length) {
    return componentData.data;
  }

  const next: Record<string, any> = {};

  if (componentData?.technicalData) {
    next.technicalData = componentData.technicalData;
  } else if (componentData?.technical_data) {
    next.technicalData = componentData.technical_data;
  }

  if (componentData?.metadata?.manufacturer) {
    next.manufacturer = componentData.metadata.manufacturer;
  } else if (componentData?.manufacturer) {
    next.manufacturer = componentData.manufacturer;
  }

  if (componentData?.carrierData && typeof componentData.carrierData === "object") {
    Object.assign(next, componentData.carrierData);
  }

  if (componentData?.gateData && typeof componentData.gateData === "object") {
    if (componentData.gateData.inputOrOutput && !next.gateType) {
      next.gateType = componentData.gateData.inputOrOutput;
    }
    if (componentData.gateData.sourceOrigin && !next.sourceOrigin) {
      next.sourceOrigin = componentData.gateData.sourceOrigin;
    }
    if (componentData.gateData.endUse && !next.endUse) {
      next.endUse = componentData.gateData.endUse;
    }
    Object.assign(next, componentData.gateData);
  }

  if (componentData?.type === "equipment" && !next.technicalData) {
    next.technicalData = {};
  }

  return next;
};

const SmoothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 16 C6 4, 18 4, 22 16" strokeLinecap="round" />
  </svg>
);

const OrthogonalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6 H12 V18 H20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StraightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12 H20" strokeLinecap="round" />
  </svg>
);

const Canvas = ({
  components,
  setComponents,
  connections,
  setConnections,
  onConnect,
  onModelChange,
  exportId,
}: CanvasProps) => {
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponentType | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionType | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasUserZoomed, setHasUserZoomed] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState({ name: "", type: "" as "equipment" | "carrier" | "gate", category: "" });
  const [connectionStyle, setConnectionStyle] = useState<"smooth" | "orthogonal" | "straight">("smooth");
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const clampZoom = useCallback((value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value)), []);
  const applyZoom = useCallback(
    (nextZoom: number, anchor?: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const clamped = clampZoom(nextZoom);
      if (!canvas) {
        setZoom(clamped);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const offsetX = anchor?.x ?? rect.width / 2;
      const offsetY = anchor?.y ?? rect.height / 2;
      const prevZoom = zoom;
      const worldX = (canvas.scrollLeft + offsetX) / prevZoom;
      const worldY = (canvas.scrollTop + offsetY) / prevZoom;

      setZoom(clamped);
      requestAnimationFrame(() => {
        canvas.scrollLeft = worldX * clamped - offsetX;
        canvas.scrollTop = worldY * clamped - offsetY;
      });
    },
    [clampZoom, zoom]
  );

  const zoomPadding = useMemo(
    () => CANVAS_PADDING + Math.max(0, (zoom - 1) * 600),
    [zoom]
  );

  const canvasBounds = useMemo(() => {
    if (!components.length) {
      return {
        minX: 0,
        minY: 0,
        maxX: CANVAS_BASE_WIDTH,
        maxY: CANVAS_BASE_HEIGHT,
      };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    components.forEach((comp) => {
      const x = toNumber(comp.position?.x);
      const y = toNumber(comp.position?.y);
      const bounds = getComponentBounds(comp.type);
      const left = x + bounds.offsetX;
      const top = y + bounds.offsetY;
      const right = left + bounds.width;
      const bottom = top + bounds.height;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    return { minX, minY, maxX, maxY };
  }, [components]);

  const canvasOffset = useMemo(
    () => ({
      x: zoomPadding - Math.min(canvasBounds.minX, 0),
      y: zoomPadding - Math.min(canvasBounds.minY, 0),
    }),
    [canvasBounds.minX, canvasBounds.minY, zoomPadding]
  );

  const canvasSize = useMemo(() => {
    if (!components.length) {
      return { width: CANVAS_BASE_WIDTH, height: CANVAS_BASE_HEIGHT };
    }
    return {
      width: Math.max(
        CANVAS_BASE_WIDTH,
        canvasBounds.maxX + canvasOffset.x + zoomPadding
      ),
      height: Math.max(
        CANVAS_BASE_HEIGHT,
        canvasBounds.maxY + canvasOffset.y + zoomPadding
      ),
    };
  }, [canvasBounds.maxX, canvasBounds.maxY, canvasOffset.x, canvasOffset.y, components.length, zoomPadding]);

  const getFitZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return null;
    const fit = Math.min(clientWidth / canvasSize.width, clientHeight / canvasSize.height, 1);
    return clampZoom(fit);
  }, [canvasSize.height, canvasSize.width, clampZoom]);

  const handleFitToView = useCallback(() => {
    const next = getFitZoom();
    if (next === null) return;
    setHasUserZoomed(true);
    applyZoom(next);
  }, [applyZoom, getFitZoom]);

  const persistConnectionsForComponent = useCallback(
    async (
      componentId: string,
      overrideConnections?: ConnectionType[],
      overrideComponents?: PlacedComponentType[]
    ) => {
      const connectionList = overrideConnections ?? connections;
      const componentList = overrideComponents ?? components;
      const component = componentList.find((c) => c.id === componentId);

      if (!component?.instanceId) {
        logJson(`[Canvas] Cannot persist connections for ${componentId}; missing instanceId`);
        return;
      }

      const payload = buildConnectionPayloadForComponent(componentId, connectionList, componentList);

      try {
        logJson(`[Canvas] Persisting ${payload.length} connections for ${componentId} (instanceId=${component.instanceId})`, payload);
        await updateComponentInstance(component.instanceId, { connections: payload });
        logJson(`[Canvas] ✓ Connections persisted for ${componentId}`);
      } catch (err) {
        logJson(`[Canvas] ✗ Failed to persist connections for ${componentId}:`, err);
        toast.error(`Failed to update connections for ${component.name}`);
      }
    },
    [components, connections]
  );

  // Notify parent ANY time components / connections change
  useEffect(() => {
    if (!onModelChange) return;
    onModelChange({ components, connections });
  }, [components, connections, onModelChange]);

  useEffect(() => {
    const next = selectedComponent ? components.find((c) => c.id === selectedComponent.id) : null;
    if (!next) {
      if (selectedComponent) setSelectedComponent(null);
      return;
    }
    if (next !== selectedComponent) {
      setSelectedComponent(next);
    }
  }, [components, selectedComponent]);

  useEffect(() => {
    if (hasUserZoomed) return;
    const next = getFitZoom();
    if (next === null) return;
    if (Math.abs(zoom - next) <= 0.01) return;
    applyZoom(next);
  }, [applyZoom, getFitZoom, hasUserZoomed, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      if (hasUserZoomed) return;
      const next = getFitZoom();
      if (next === null) return;
      if (Math.abs(zoom - next) <= 0.01) return;
      applyZoom(next);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [applyZoom, getFitZoom, hasUserZoomed, zoom]);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left + canvas.scrollLeft) / zoom - canvasOffset.x,
        y: (clientY - rect.top + canvas.scrollTop) / zoom - canvasOffset.y,
      };
    },
    [canvasOffset.x, canvasOffset.y, zoom]
  );

  // Drag & drop from ComponentLibrary
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("component");
      if (!raw) return;

      const componentData = JSON.parse(raw);
      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      const newComp: PlacedComponentType = {
        ...componentData,
        id: `${componentData.id}-${Date.now()}`,
        position: {
          x: point.x,
          y: point.y,
        },
        data: mapDroppedComponentData(componentData),
        certifications: componentData.certifications || [],
      };

      // optimistic add to UI and immediately print full frontend model for debugging
      setComponents((prev) => {
        const next = [...prev, newComp];
        console.log("[plant-builder] model after drop:", JSON.stringify({ components: next, connections }, null, 2));
        return next;
      });

      // attempt to persist: find or create component_definition and persist instance
      (async () => {
        try {
          console.log("[plant-builder] raw dropped data:", componentData);

          // Fetch existing component definitions
          const defs = await fetchComponentDefinitions();
          logJson("[plant-builder] Available component definitions:", defs);
          
          // Match by name AND type (like handleAddNewComponent does)
          const def = defs.find(
            (d) => d.component_name === componentData.name && d.component_type === componentData.type
          );
          logJson("[plant-builder] Matched definition:", def);

          const twinId = (window as any).currentTwinId as number | undefined;
          console.log("[plant-builder] currentTwinId:", twinId);

          if (!twinId) {
            console.warn("[plant-builder] no twin id set; skipping persistence for:", componentData);
            toast("Create a plant / digital twin first to persist components.", { icon: "ℹ️" });
            return;
          }

          // Check if definition exists (required, no auto-create)
          if (!def) {
            console.warn("[plant-builder] component definition not found for:", componentData);
            console.warn("[plant-builder] searching for: name=", componentData.name, "type=", componentData.type);
            toast(`Component "${componentData.name}" not available in library. Contact admin to add it.`, { icon: "⚠️" });
            // Remove the UI component we added optimistically
            setComponents((prev) => prev.filter((c) => c.id !== newComp.id));
            return;
          }

          // Create component instance in database with existing definition
          const payload = {
            digital_twin_id: twinId,
            component_definition_id: def.id,
            instance_name: newComp.name || componentData.name,
            position: newComp.position,
            field_values: newComp.data || {},
            connections: [],
            metadata: {},
          };

          console.log("[plant-builder] createComponentInstance payload:", JSON.stringify(payload, null, 2));
          const created = await createComponentInstance(payload as any);
          console.log("[plant-builder] createComponentInstance response:", created);

          // Update UI component with database IDs
          setComponents((prev) => {
            const next = prev.map((c) => (c.id === newComp.id ? { ...c, componentDefinitionId: def!.id, instanceId: created.id } : c));
            console.log("[plant-builder] model after persist:", JSON.stringify({ components: next, connections }, null, 2));
            return next;
          });

          toast.success(`${newComp.name} persisted (id ${created.id})`);
        } catch (err) {
          console.warn("Failed to persist component instance:", err);
          toast.error("Failed to persist component to server.");
          // Clean up the optimistically added component on error
          setComponents((prev) => prev.filter((c) => c.id !== newComp.id));
        }
      })();
    },
    [getCanvasPoint, setComponents]
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanMode || e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-plant-component]")) return;
    e.preventDefault();
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
    };
    setIsPanning(true);
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!panRef.current?.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    canvas.scrollLeft = panRef.current.scrollLeft - dx;
    canvas.scrollTop = panRef.current.scrollTop - dy;
  }, []);

  const handlePanEnd = useCallback(() => {
    if (!panRef.current?.active) return;
    panRef.current.active = false;
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePanMove);
    window.addEventListener("mouseup", handlePanEnd);
    return () => {
      window.removeEventListener("mousemove", handlePanMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, [handlePanMove, handlePanEnd]);

  const handleConnectStart = (id: string) => setConnectingFrom(id);

  const handleConnectEnd = (id: string) => {
    if (connectingFrom && connectingFrom !== id) {
      onConnect({ source: connectingFrom, target: id });
    }
    setConnectingFrom(null);
  };

  const handleComponentClick = (comp: PlacedComponentType) => {
    if (connectingFrom) {
      handleConnectEnd(comp.id);
    } else {
      setSelectedComponent(comp);
    }
  };

  /**
   * Update component position in state with debounced backend persistence.
   * Uses debounce to avoid excessive API calls during drag operations.
   */
  const handleComponentMove = useCallback((id: string, position: { x: number; y: number }) => {
    logJson(`[Canvas] Component moving: ${id}`, position);

    // Optimistic UI update
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, position } : c)));

    // Debounced persistence to backend
    const comp = components.find((c) => c.id === id);
    if (comp?.instanceId && typeof comp.instanceId === 'number') {
      logJson(`[Canvas] Found instanceId ${comp.instanceId}, setting debounce timeout...`);
      
      // Clear previous timeout if exists
      if ((window as any).positionUpdateTimeout) {
        clearTimeout((window as any).positionUpdateTimeout);
      }

      const instanceId = comp.instanceId;
      // Set new timeout for position update (500ms debounce)
      (window as any).positionUpdateTimeout = setTimeout(async () => {
        try {
          logJson(`[Canvas] Sending position update to backend for instanceId ${instanceId}:`, { position });
          await updateComponentInstance(instanceId, { position });
          logJson(`[Canvas] ✓ Position update SUCCESS for ${id} (instanceId: ${instanceId})`);
        } catch (err) {
          logJson(`[Canvas] ✗ Position update FAILED for ${id}:`, err);
        }
      }, 500);
    } else {
      logJson(`[Canvas] No instanceId found (instanceId=${comp?.instanceId}, type=${typeof comp?.instanceId}), skipping backend update`);
    }
  }, [components]);

  const handleSaveDetails = (
    id: string,
    data: PlacedComponentType["data"],
    certifications: string[],
    componentDefinitionId?: number | null
  ) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next: PlacedComponentType = {
          ...c,
          data,
          certifications,
        };
        if (typeof componentDefinitionId === "number") {
          next.componentDefinitionId = componentDefinitionId;
        }
        return next;
      })
    );
    setSelectedComponent(null);
  };

  const handleSaveConnection = (id: string, type: string, reason: string, data: any) => {
    setConnections((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, type, reason, data } : c));
      const updated = prev.find((c) => c.id === id);
      if (updated) {
        void persistConnectionsForComponent(updated.from, next);
      }
      return next;
    });
    setSelectedConnection(null);
  };

  const handleAddNewComponent = () => {
    if (!newComponent.name || !newComponent.type || !newComponent.category) return;

    const comp: PlacedComponentType = {
      id: `comp-${Date.now()}`,
      name: newComponent.name,
      type: newComponent.type,
      category: newComponent.category,
      position: { x: 100, y: 100 },
      data: { technicalData: {} },
      certifications: [],
    };

    // optimistic UI add and log full model
    setComponents((prev) => {
      const next = [...prev, comp];
      console.log("[plant-builder] model after inline add:", JSON.stringify({ components: next, connections }, null, 2));
      return next;
    });
    setNewComponent({ name: "", type: "" as any, category: "" });
    setShowAddComponent(false);

    // Persist component definition and instance asynchronously
    (async () => {
      try {
        const defs = await fetchComponentDefinitions();
        const def = defs.find((d) => d.component_name === comp.name && d.component_type === comp.type);

        // Check if definition exists (required, no auto-create)
        if (!def) {
          console.warn("[plant-builder] component definition not found for:", comp.name);
          toast(`Component "${comp.name}" not available in library. Contact admin to add it.`, { icon: "⚠️" });
          // Remove the UI component we added optimistically
          setComponents((prev) => prev.filter((c) => c.id !== comp.id));
          return;
        }

        const twinId = (window as any).currentTwinId as number | undefined;
        if (!twinId) {
          toast("Create a plant / digital twin first to persist components.", { icon: "ℹ️" });
          return;
        }

        const instancePayload = {
          digital_twin_id: twinId,
          component_definition_id: def.id,
          instance_name: comp.name,
          position: comp.position,
          field_values: comp.data || {},
          connections: [],
          metadata: {},
        };

        console.log("[plant-builder] createComponentInstance payload (inline add):", JSON.stringify(instancePayload, null, 2));
        const created = await createComponentInstance(instancePayload as any);
        console.log("[plant-builder] createComponentInstance response (inline add):", created);

        setComponents((prev) => {
          const next = prev.map((c) => (c.id === comp.id ? { ...c, componentDefinitionId: def!.id, instanceId: created.id } : c));
          console.log("[plant-builder] model after inline add persist:", JSON.stringify({ components: next, connections }, null, 2));
          return next;
        });

        toast.success(`${comp.name} persisted (instance id ${created.id})`);
      } catch (err) {
        console.warn("Failed to persist manual component:", err);
        toast.error("Failed to persist component to server.");
        // Clean up the optimistically added component on error
        setComponents((prev) => prev.filter((c) => c.id !== comp.id));
      }
    })();
  };

  /**
   * Delete component and all its associated connections.
   * Persists deletion to backend if component has instanceId.
   */
  const handleDeleteComponent = (id: string) => {
    const comp = components.find((c) => c.id === id);
    
    logJson(`[Canvas] Deleting component: ${id}`, comp);
    
    // Optimistic UI update
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) => {
      const affectedSources = new Set(
        prev
          .filter((conn) => conn.to === id && conn.from !== id)
          .map((conn) => conn.from)
      );
      const next = prev.filter((conn) => conn.from !== id && conn.to !== id);
      affectedSources.forEach((sourceId) => {
        void persistConnectionsForComponent(sourceId, next);
      });
      return next;
    });

    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }

    // Persist deletion to backend if component was stored
    if (comp?.instanceId && typeof comp.instanceId === 'number') {
      const instanceId = comp.instanceId;
      logJson(`[Canvas] Found instanceId ${instanceId}, sending delete request...`);
      
      (async () => {
        try {
          const response = await deleteComponentInstance(instanceId);
          logJson(`[Canvas] ✓ Delete SUCCESS for instanceId ${instanceId}:`, response);
          toast.success(`${comp.name} deleted from database`);
        } catch (err) {
          logJson(`[Canvas] ✗ Delete FAILED for instanceId ${instanceId}:`, err);
          toast.error("Failed to delete component from database");
        }
      })();
    } else {
      logJson(`[Canvas] No instanceId found (instanceId=${comp?.instanceId}), skipping backend delete`);
    }
  };

  const handleDeleteConnection = (id: string) => {
    setConnections((prev) => {
      const toRemove = prev.find((c) => c.id === id);
      const next = prev.filter((c) => c.id !== id);
      if (toRemove) {
        void persistConnectionsForComponent(toRemove.from, next);
      }
      return next;
    });

    if (selectedConnection?.id === id) {
      setSelectedConnection(null);
    }
  };

  const getPortPoint = (component: PlacedComponentType, side: "left" | "right") => {
    const x = toNumber(component.position?.x);
    const y = toNumber(component.position?.y);
    const bounds = getComponentBounds(component.type);
    const left = x + bounds.offsetX + canvasOffset.x;
    const top = y + bounds.offsetY + canvasOffset.y;
    return {
      x: left + (side === "right" ? bounds.width : 0),
      y: top + bounds.height / 2,
    };
  };

  const createCarrierBetween = useCallback(
    (fromId: string, toId: string, carrier: string, reason: string) => {
      if (!fromId || !toId || !carrier) return;

      setComponents((prevComponents) => {
        const fromComp = prevComponents.find((c) => c.id === fromId);
        const toComp = prevComponents.find((c) => c.id === toId);

        // safety: both ends must exist
        if (!fromComp || !toComp) return prevComponents;

        // place carrier roughly in the middle
        const carrierId = `carrier-${carrier}-${Date.now()}`;
        const carrierComp: PlacedComponentType = {
          id: carrierId,
          type: "carrier",
          name: carrier.charAt(0).toUpperCase() + carrier.slice(1),
          category: "auto-stream",
          position: {
            x: (fromComp.position.x + toComp.position.x) / 2,
            y: (fromComp.position.y + toComp.position.y) / 2,
          },
          data: { product: carrier },
          certifications: [],
        };

        // add two connections: from → carrier and carrier → to
        setConnections((prevConnections) => {
          const now = Date.now();
          const nextConnections = [
            ...prevConnections,
            {
              id: `conn-${now}-a`,
              from: fromId,
              to: carrierId,
              type: carrier,
              reason,
              data: {},
            },
            {
              id: `conn-${now}-b`,
              from: carrierId,
              to: toId,
              type: carrier,
              reason,
              data: {},
            },
          ];
          void persistConnectionsForComponent(fromId, nextConnections);
          void persistConnectionsForComponent(carrierId, nextConnections);
          return nextConnections;
        });

        return [...prevComponents, carrierComp];
      });
    },
    [setComponents, setConnections]
  );


  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-canvas-bg relative">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/95 p-1 shadow-sm">
          <Button
            variant={isPanMode ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsPanMode((prev) => !prev)}
            title={isPanMode ? "Pan: on" : "Pan: off"}
            className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
          >
            <Hand className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFitToView}
            title="Fit to view"
            className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
              >
                {connectionStyle === "smooth" ? (
                  <SmoothIcon className="mr-2 h-4 w-4" />
                ) : connectionStyle === "orthogonal" ? (
                  <OrthogonalIcon className="mr-2 h-4 w-4" />
                ) : (
                  <StraightIcon className="mr-2 h-4 w-4" />
                )}
                {connectionStyle === "smooth"
                  ? "Smooth"
                  : connectionStyle === "orthogonal"
                    ? "90deg"
                    : "Straight"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white text-slate-900 border-slate-200"
            >
              <DropdownMenuRadioGroup
                value={connectionStyle}
                onValueChange={(value) =>
                  setConnectionStyle(value as "smooth" | "orthogonal" | "straight")
                }
              >
                <DropdownMenuRadioItem value="smooth" className="gap-2">
                  <SmoothIcon className="h-4 w-4" />
                  Smooth
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="orthogonal" className="gap-2">
                  <OrthogonalIcon className="h-4 w-4" />
                  90deg
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="straight" className="gap-2">
                  <StraightIcon className="h-4 w-4" />
                  Straight
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setHasUserZoomed(true);
              applyZoom(zoom + ZOOM_STEP);
            }}
            className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setHasUserZoomed(true);
              applyZoom(zoom - ZOOM_STEP);
            }}
            className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {connectingFrom && (
        <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Click another component to connect
        </div>
      )}

      <div
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handlePanStart}
        className={`flex-1 min-h-0 relative overflow-auto ${isPanMode ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""}`}
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        <div
          className="relative"
          style={{ width: canvasSize.width * zoom, height: canvasSize.height * zoom }}
        >
          <div
            className="relative"
            data-plant-builder-canvas={exportId}
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
          {/* Column shading */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-layer-equipment/5" />
            <div
              className="absolute top-0 bottom-0"
              style={{ left: "33.3333%", width: "33.3333%" }}
            >
              <div className="absolute inset-0 bg-layer-carrier/5" />
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-layer-gate/5" />
          </div>

          {/* Connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {connections.map((conn) => {
              const fromComp = components.find((c) => c.id === conn.from);
              const toComp = components.find((c) => c.id === conn.to);
              if (!fromComp || !toComp) return null;

              const from = getPortPoint(fromComp, "right");
              const to = getPortPoint(toComp, "left");

              return (
                <ConnectionArrow
                  key={conn.id}
                  from={from}
                  to={to}
                  style={connectionStyle}
                  onClick={() => setSelectedConnection(conn)}
                />
              );
            })}
          </svg>

          {/* Components */}
          <div className="relative pointer-events-none" style={{ zIndex: 10 }}>
            <div className="pointer-events-auto">
              {components.map((comp) => {
                const x = toNumber(comp.position?.x);
                const y = toNumber(comp.position?.y);
                const renderComp: PlacedComponentType = {
                  ...comp,
                  position: {
                    x: x + canvasOffset.x,
                    y: y + canvasOffset.y,
                  },
                };
                return (
                  <PlantComponent
                    key={comp.id}
                    component={renderComp}
                    canvasOffset={canvasOffset}
                    canvasRef={canvasRef}
                    zoom={zoom}
                    isPanMode={isPanMode}
                    onClick={() => handleComponentClick(comp)}
                    onMove={handleComponentMove}
                    onConnectStart={handleConnectStart}
                    onConnectEnd={handleConnectEnd}
                    isConnectingActive={Boolean(connectingFrom)}
                    isConnecting={connectingFrom === comp.id}
                    onDelete={handleDeleteComponent}
                  />
                );
              })}
            </div>
          </div>

          {/* Empty state */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4 max-w-2xl px-8">
                <Plus className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-semibold text-foreground">
                  Start Building Your Plant
                </h3>
                <p className="text-muted-foreground">
                  Drag from library or add component
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Component dialog */}
      {selectedComponent && (
        <ComponentDetailDialog
          component={selectedComponent}
          components={components}
          connections={connections}
          open={!!selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onSave={handleSaveDetails}
          onAddConnection={(from, to, carrier, reason) => {
            // streams UI always passes carrier name in the "type" argument
            createCarrierBetween(from, to, carrier, reason);
          }}
        />
      )}

      {/* Connection dialog */}
      {selectedConnection && (
        <ConnectionDetailDialog
          connection={selectedConnection}
          components={components}
          open={!!selectedConnection}
          onClose={() => setSelectedConnection(null)}
          onSave={handleSaveConnection}
          onDelete={handleDeleteConnection}
        />
      )}

      {/* (Optional) inline Add Component dialog – you already have one in PlantBuilder */}
      <Dialog open={showAddComponent} onOpenChange={setShowAddComponent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={newComponent.type}
                onValueChange={(v) =>
                  setNewComponent({ ...newComponent, type: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="carrier">Carrier</SelectItem>
                  <SelectItem value="gate">Gate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newComponent.name}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, name: e.target.value })
                }
                placeholder="e.g. Electrolyzer"
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                value={newComponent.category}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, category: e.target.value })
                }
                placeholder="e.g. Power-to-X"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddComponent(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewComponent}
              disabled={
                !newComponent.name ||
                !newComponent.type ||
                !newComponent.category
              }
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Canvas;
