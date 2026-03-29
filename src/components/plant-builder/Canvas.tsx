// src/components/plant-builder/Canvas.tsx
'use client';

// Helper: Pretty-print JSON to console
const logJson = (label: string, data?: any) => {
  console.log(label);
  if (data) console.log(JSON.stringify(data, null, 2));
};

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Crosshair, Hand, Plus, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
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
import type { DigitalTwinValidationError } from "@/services/plant-builder/digitalTwins";
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
  validationErrorsByComponent?: Record<string, DigitalTwinValidationError[]>;
  invalidConnectionIds?: Set<string>;
  invalidConnectionMessages?: Map<string, string>;
  focusRequest?: { id: string; ts: number } | null;
  highlightedComponentId?: string | null;
  topRightAddon?: React.ReactNode;
};

const CANVAS_BASE_WIDTH = 2400;
const CANVAS_BASE_HEIGHT = 1800;
const CANVAS_PADDING = 200;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;
const GATE_EDGE_GUTTER = 120;
const SYSTEM_FRAME_PADDING = 48;
const SYSTEM_FRAME_LABEL = "Plant System Boundary";
const INPUT_GATES_LABEL = "Output Gates";
const OUTPUT_GATES_LABEL = "Input Gates";
const DEFAULT_FLOW_COLOR = "#4F8FF7";
const DEFAULT_CARRIER_FLOW_COLOR = "#10B981";
const CARRIER_FLOW_PALETTE = [
  "#0EA5E9",
  "#14B8A6",
  "#F97316",
  "#A855F7",
  "#22C55E",
  "#F43F5E",
  "#F59E0B",
  "#64748B",
];
type PortSide = "left" | "right" | "top" | "bottom";

const getComponentBounds = (type: PlacedComponentType["type"]) => {
  switch (type) {
    case "equipment":
      return { width: 224, height: 144, offsetX: 0, offsetY: 0 };
    case "carrier":
      return { width: 144, height: 144, offsetX: 0, offsetY: 0 };
    case "gate":
      return { width: 192, height: 288, offsetX: 0, offsetY: 0 };
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

const toInstanceId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseQuantity = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeUnit = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const formatQuantity = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? `${rounded.toFixed(0)}` : `${rounded}`;
};

const getCarrierTypeKey = (comp?: PlacedComponentType | null) => {
  if (!comp) return "";
  const raw =
    typeof comp.data?.product === "string"
      ? comp.data.product
      : comp.name;
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
};


const getGateDirection = (
  component: PlacedComponentType,
  connections: ConnectionType[]
) => {
  const raw =
    (component as any)?.data?.gateType ??
    (component as any)?.data?.inputOrOutput ??
    (component as any)?.data?.input_or_output ??
    (component as any)?.data?.gate_type ??
    (component as any)?.data?.gateData?.inputOrOutput;
  if (typeof raw === "string") {
    const value = raw.toLowerCase();
    if (value === "input" || value === "output") return value;
  }

  const hasOutgoing = connections.some((conn) => conn.from === component.id);
  const hasIncoming = connections.some((conn) => conn.to === component.id);
  if (hasOutgoing && !hasIncoming) return "input";
  if (hasIncoming && !hasOutgoing) return "output";
  return null;
};

const calculateGateZones = (
  components: PlacedComponentType[],
  orientation: "horizontal" | "vertical" = "horizontal"
) => {
  if (!components.length) return null;
  const referenceComponents = components.filter((comp) => comp.type !== "gate");
  const source = referenceComponents.length ? referenceComponents : components;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  source.forEach((comp) => {
    const x = toNumber(comp.position?.x);
    const y = toNumber(comp.position?.y);
    const bounds = getComponentBounds(comp.type);
    const left = x + bounds.offsetX;
    const right = left + bounds.width;
    const top = y + bounds.offsetY;
    const bottom = top + bounds.height;
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  });

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  ) {
    return null;
  }

  const gateBounds = getComponentBounds("gate");
  if (orientation === "vertical") {
    return {
      inputTop: minY - GATE_EDGE_GUTTER - gateBounds.height,
      outputTop: maxY + GATE_EDGE_GUTTER,
    };
  }

  return {
    inputLeft: minX - GATE_EDGE_GUTTER - gateBounds.width,
    outputLeft: maxX + GATE_EDGE_GUTTER,
  };
};

const calculateSystemBounds = (components: PlacedComponentType[]) => {
  if (!components.length) return null;
  const referenceComponents = components.filter((comp) => comp.type !== "gate");
  const source = referenceComponents.length ? referenceComponents : components;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  source.forEach((comp) => {
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

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { minX, minY, maxX, maxY };
};

const rotateComponentsAroundCenter = (
  items: PlacedComponentType[],
  direction: "clockwise" | "counterclockwise"
) => {
  if (!items.length) return items;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  items.forEach((comp) => {
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

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return items;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return items.map((comp) => {
    const bounds = getComponentBounds(comp.type);
    const x = toNumber(comp.position?.x);
    const y = toNumber(comp.position?.y);
    const cx = x + bounds.offsetX + bounds.width / 2;
    const cy = y + bounds.offsetY + bounds.height / 2;
    const dx = cx - centerX;
    const dy = cy - centerY;
    const newCx = direction === "clockwise" ? centerX - dy : centerX + dy;
    const newCy = direction === "clockwise" ? centerY + dx : centerY - dx;
    const newX = newCx - bounds.width / 2 - bounds.offsetX;
    const newY = newCy - bounds.height / 2 - bounds.offsetY;
    return {
      ...comp,
      position: {
        ...comp.position,
        x: newX,
        y: newY,
      },
    };
  });
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
  validationErrorsByComponent,
  invalidConnectionIds,
  invalidConnectionMessages,
  focusRequest,
  highlightedComponentId,
  topRightAddon,
}: CanvasProps) => {
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponentType | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionType | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hasUserZoomed, setHasUserZoomed] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState({ name: "", type: "" as "equipment" | "carrier" | "gate", category: "" });
  const [connectionStyle, setConnectionStyle] = useState<"smooth" | "orthogonal" | "straight">("smooth");
  const [layoutOrientation, setLayoutOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [legendOpen, setLegendOpen] = useState(true);
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
  const lastFocusTsRef = useRef<number>(0);
  useEffect(() => {
    if (!selectedComponent && !showAddComponent) return;
    window.dispatchEvent(new CustomEvent("plant-builder:close-sidebar"));
  }, [selectedComponent, showAddComponent]);
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
  }, [components, hasUserZoomed]);

  useEffect(() => {
    const zones = rawGateZones;
    if (!zones) return;
    const gateBounds = getComponentBounds("gate");

    let changed = false;
    const next = components.map((comp) => {
      if (comp.type !== "gate") return comp;
      const direction = getGateDirection(comp, connections);
      if (!direction) return comp;

      if (layoutOrientation === "vertical") {
        const desiredTop = direction === "input" ? (zones as any).inputTop : (zones as any).outputTop;
        if (typeof desiredTop !== "number") return comp;
        const desiredY = desiredTop - gateBounds.offsetY;
        const currentY = toNumber(comp.position?.y);
        if (Math.abs(desiredY - currentY) < 1) return comp;
        changed = true;
        return {
          ...comp,
          position: {
            ...comp.position,
            y: desiredY,
          },
        };
      }

      const desiredLeft = direction === "input" ? (zones as any).inputLeft : (zones as any).outputLeft;
      if (typeof desiredLeft !== "number") return comp;
      const desiredX = desiredLeft - gateBounds.offsetX;
      const currentX = toNumber(comp.position?.x);
      if (Math.abs(desiredX - currentX) < 1) return comp;
      changed = true;
      return {
        ...comp,
        position: {
          ...comp.position,
          x: desiredX,
        },
      };
    });

    if (changed) {
      setComponents(next);
    }
  }, [components, connections, layoutOrientation, setComponents]);


  useEffect(() => {
    if (!components.length || !connections.length) return;
    const componentById = new Map(components.map((comp) => [comp.id, comp]));
    const carrierIds = components.filter((comp) => comp.type === "carrier").map((comp) => comp.id);
    if (!carrierIds.length) return;

    let changed = false;
    const nextComponents = components.map((comp) => ({ ...comp }));
    const nextById = new Map(nextComponents.map((comp) => [comp.id, comp]));

    carrierIds.forEach((carrierId) => {
      const outgoing = connections.filter((conn) => conn.from === carrierId);
      const targetIds = Array.from(new Set(outgoing.map((conn) => conn.to)));
      const targetComps = targetIds
        .map((id) => componentById.get(id))
        .filter((comp): comp is PlacedComponentType => Boolean(comp))
        .filter((comp) => comp.type === "equipment");

      if (targetComps.length < 2) return;

      const avgX =
        targetComps.reduce((sum, comp) => sum + toNumber(comp.position?.x), 0) /
        targetComps.length;

      targetComps.forEach((comp) => {
        const nextComp = nextById.get(comp.id);
        if (!nextComp) return;
        const currentX = toNumber(nextComp.position?.x);
        if (Math.abs(currentX - avgX) < 2) return;
        nextComp.position = { ...nextComp.position, x: avgX };
        changed = true;
      });
    });

    if (changed) {
      setComponents(nextComponents);
    }
  }, [components, connections, setComponents]);




  const canvasOffset = useMemo(
    () => ({
      x: zoomPadding - Math.min(canvasBounds.minX, 0),
      y: zoomPadding - Math.min(canvasBounds.minY, 0),
    }),
    [canvasBounds.minX, canvasBounds.minY, zoomPadding]
  );

  const componentById = useMemo(
    () => new Map(components.map((comp) => [comp.id, comp])),
    [components]
  );

  const carrierColorMap = useMemo(() => {
    const carrierComponents = components.filter((comp) => comp.type === "carrier");
    const keys = Array.from(
      new Set(
        carrierComponents
          .map((comp) => getCarrierTypeKey(comp))
          .filter((key) => key)
      )
    ).sort();

    const map = new Map<string, string>();
    keys.forEach((key, index) => {
      map.set(key, CARRIER_FLOW_PALETTE[index % CARRIER_FLOW_PALETTE.length]);
    });

    // Temporary overrides for testing
    map.set("air", "#94A3B8");
    map.set("damaged crops", "#B45309");

    return map;
  }, [components]);

  const carrierLegendItems = useMemo(() => {
    const displayMap = new Map<string, string>();
    components
      .filter((comp) => comp.type === "carrier")
      .forEach((comp) => {
        const key = getCarrierTypeKey(comp);
        if (!key || displayMap.has(key)) return;
        const label =
          (typeof comp.data?.product === "string" && comp.data.product) || comp.name || key;
        displayMap.set(key, label);
      });

    return Array.from(carrierColorMap.entries()).map(([key, color]) => ({
      key,
      label: displayMap.get(key) || key,
      color,
    }));
  }, [carrierColorMap, components]);

  const connectionColors = useMemo(() => {
    const map = new Map<string, string>();
    connections.forEach((conn) => {
      let carrierKey = "";
      const fromComp = componentById.get(conn.from);
      const toComp = componentById.get(conn.to);
      if (fromComp?.type === "carrier") {
        carrierKey = getCarrierTypeKey(fromComp);
      } else if (toComp?.type === "carrier") {
        carrierKey = getCarrierTypeKey(toComp);
      }

      if (!carrierKey) {
        const typeKey = typeof conn.type === "string" ? conn.type.trim().toLowerCase() : "";
        if (typeKey && carrierColorMap.has(typeKey)) {
          carrierKey = typeKey;
        }
      }

      if (carrierKey) {
        map.set(conn.id, carrierColorMap.get(carrierKey) || DEFAULT_CARRIER_FLOW_COLOR);
      } else {
        map.set(conn.id, DEFAULT_FLOW_COLOR);
      }
    });
    return map;
  }, [carrierColorMap, componentById, connections]);

  const rawGateZones = useMemo(
    () => calculateGateZones(components, layoutOrientation),
    [components, layoutOrientation]
  );

  const gateZones = useMemo(() => {
    const zones = rawGateZones;
    if (!zones) return null;
    const gateBounds = getComponentBounds("gate");
    if (layoutOrientation === "vertical") {
      return {
        orientation: "vertical" as const,
        inputY: (zones as any).inputTop + gateBounds.height + canvasOffset.y,
        outputY: (zones as any).outputTop + canvasOffset.y,
      };
    }
    return {
      orientation: "horizontal" as const,
      inputX: (zones as any).inputLeft + gateBounds.width + canvasOffset.x,
      outputX: (zones as any).outputLeft + canvasOffset.x,
    };
  }, [canvasOffset.x, canvasOffset.y, components, layoutOrientation]);

  const systemFrame = useMemo(() => {
    const bounds = calculateSystemBounds(components);
    if (!bounds) return null;
    const left = bounds.minX + canvasOffset.x - SYSTEM_FRAME_PADDING;
    const top = bounds.minY + canvasOffset.y - SYSTEM_FRAME_PADDING;
    const width = bounds.maxX - bounds.minX + SYSTEM_FRAME_PADDING * 2;
    const height = bounds.maxY - bounds.minY + SYSTEM_FRAME_PADDING * 2;
    return { left, top, width, height };
  }, [canvasOffset.x, canvasOffset.y, components]);

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

  const handleToggleOrientation = useCallback(() => {
    setLayoutOrientation((prev) => {
      const next = prev === "horizontal" ? "vertical" : "horizontal";
      const direction = next === "vertical" ? "clockwise" : "counterclockwise";
      setHasUserZoomed(true);
      setComponents((current) => {
        const rotated = rotateComponentsAroundCenter(current, direction);
        rotated.forEach((comp) => {
          const instanceId = toInstanceId(comp.instanceId);
          if (instanceId) {
            void updateComponentInstance(instanceId, { position: comp.position });
          }
        });
        return rotated;
      });
      return next;
    });
  }, [setComponents]);


  const persistConnectionsForComponent = useCallback(
    async (
      componentId: string,
      overrideConnections?: ConnectionType[],
      overrideComponents?: PlacedComponentType[]
    ) => {
      const connectionList = overrideConnections ?? connections;
      const componentList = overrideComponents ?? components;
      const component = componentList.find((c) => c.id === componentId);

      const instanceId = toInstanceId(component?.instanceId);
      if (!instanceId) {
        logJson(`[Canvas] Cannot persist connections for ${componentId}; missing instanceId`);
        return;
      }

      const payload = buildConnectionPayloadForComponent(componentId, connectionList, componentList);

      try {
        logJson(`[Canvas] Persisting ${payload.length} connections for ${componentId} (instanceId=${instanceId})`, payload);
        await updateComponentInstance(instanceId, { connections: payload });
        logJson(`[Canvas] ✓ Connections persisted for ${componentId}`);
      } catch (err) {
        logJson(`[Canvas] ✗ Failed to persist connections for ${componentId}:`, err);
        toast.error(`Failed to update connections for ${component?.name ?? "component"}`);
      }
    },
    [components, connections]
  );

  const carrierInstanceRef = useRef(new Map<string, number | undefined>());

  useEffect(() => {
    const nextMap = new Map(carrierInstanceRef.current);
    const carriers = components.filter((comp) => comp.type === "carrier");

    carriers.forEach((carrier) => {
      const prev = carrierInstanceRef.current.get(carrier.id);
      if (!prev && carrier.instanceId) {
        const related = connections.filter(
          (conn) => conn.from === carrier.id || conn.to === carrier.id
        );
        const persistIds = new Set<string>();
        related.forEach((conn) => persistIds.add(conn.from));
        persistIds.add(carrier.id);
        persistIds.forEach((id) => {
          void persistConnectionsForComponent(id, connections, components);
        });
      }
      nextMap.set(carrier.id, carrier.instanceId);
    });

    carrierInstanceRef.current = nextMap;
  }, [components, connections, persistConnectionsForComponent]);

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
    if (!focusRequest?.id || !focusRequest.ts) return;
    if (lastFocusTsRef.current === focusRequest.ts) return;
    lastFocusTsRef.current = focusRequest.ts;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const comp = components.find((c) => c.id === focusRequest.id);
    if (!comp) return;
    const bounds = getComponentBounds(comp.type);
    const x = toNumber(comp.position?.x);
    const y = toNumber(comp.position?.y);
    const left = x + bounds.offsetX + canvasOffset.x;
    const top = y + bounds.offsetY + canvasOffset.y;
    const centerX = left + bounds.width / 2;
    const centerY = top + bounds.height / 2;
    canvas.scrollLeft = Math.max(centerX * zoom - canvas.clientWidth / 2, 0);
    canvas.scrollTop = Math.max(centerY * zoom - canvas.clientHeight / 2, 0);
  }, [canvasOffset.x, canvasOffset.y, components, focusRequest, zoom]);

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
      const mappedData = mapDroppedComponentData(componentData);
      const tempId = `pending-${Date.now()}`;

      const pendingComp: PlacedComponentType = {
        ...componentData,
        id: tempId,
        position: {
          x: point.x,
          y: point.y,
        },
        data: mappedData,
        certifications: componentData.certifications || [],
        isPersisting: true,
      };

      setComponents((prev) => [...prev, pendingComp]);

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
            setComponents((prev) => prev.filter((c) => c.id !== tempId));
            return;
          }

          // Check if definition exists (required, no auto-create)
          if (!def) {
            console.warn("[plant-builder] component definition not found for:", componentData);
            console.warn("[plant-builder] searching for: name=", componentData.name, "type=", componentData.type);
            toast(`Component "${componentData.name}" not available in library. Contact admin to add it.`, { icon: "⚠️" });
            setComponents((prev) => prev.filter((c) => c.id !== tempId));
            return;
          }

          // Create component instance in database with existing definition
          const payload = {
            digital_twin_id: twinId,
            component_definition_id: def.id,
            instance_name: componentData.name,
            position: point,
            field_values: mappedData,
            connections: [],
            metadata: {},
          };

          console.log("[plant-builder] createComponentInstance payload:", JSON.stringify(payload, null, 2));
          const created = await createComponentInstance(payload as any);
          console.log("[plant-builder] createComponentInstance response:", created);

          let shouldDelete = false;
          // Replace the pending component with database ID directly
          setComponents((prev) => {
            const exists = prev.some((c) => c.id === tempId);
            if (!exists) {
              shouldDelete = true;
              return prev;
            }
            const next = prev.map((c) =>
              c.id === tempId
                ? {
                    ...c,
                    id: String(created.id),
                    componentDefinitionId: def.id,
                    instanceId: created.id,
                    isPersisting: false,
                  }
                : c
            );
            console.log("[plant-builder] model after persist:", JSON.stringify({ components: next, connections }, null, 2));
            return next;
          });

          if (shouldDelete) {
            try {
              await deleteComponentInstance(created.id);
            } catch (err) {
              console.warn("[plant-builder] Failed to delete orphaned instance:", created.id, err);
            }
            return;
          }

          setConnections((prev) =>
            prev.map((conn) => ({
              ...conn,
              from: conn.from === tempId ? String(created.id) : conn.from,
              to: conn.to === tempId ? String(created.id) : conn.to,
            }))
          );

          toast.success(`${componentData.name} persisted (id ${created.id})`);
        } catch (err) {
          console.warn("Failed to persist component instance:", err);
          toast.error("Failed to persist component to server.");
          setComponents((prev) => prev.filter((c) => c.id !== tempId));
        }
      })();
    },
    [connections, getCanvasPoint, setComponents, setConnections]
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanMode || e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-plant-component]")) return;
    e.preventDefault();
    setHasUserZoomed(true);
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
    if (!hasUserZoomed) {
      setHasUserZoomed(true);
    }

    // Optimistic UI update
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, position } : c)));

    // Debounced persistence to backend
    const comp = components.find((c) => c.id === id);
    const instanceId = toInstanceId(comp?.instanceId);
    if (instanceId) {
      logJson(`[Canvas] Found instanceId ${instanceId}, setting debounce timeout...`);
      
      // Clear previous timeout if exists
      if ((window as any).positionUpdateTimeout) {
        clearTimeout((window as any).positionUpdateTimeout);
      }

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

  const resolveNonOverlappingPosition = useCallback(
    (id: string, position: { x: number; y: number }, current: PlacedComponentType[]) => {
      const moving = current.find((comp) => comp.id === id);
      if (!moving) return position;
      const movingBounds = getComponentBounds(moving.type);
      const padding = 12;

      const overlaps = (pos: { x: number; y: number }) => {
        const left = pos.x + movingBounds.offsetX - padding;
        const top = pos.y + movingBounds.offsetY - padding;
        const right = left + movingBounds.width + padding * 2;
        const bottom = top + movingBounds.height + padding * 2;

        return current.some((comp) => {
          if (comp.id === id) return false;
          const bounds = getComponentBounds(comp.type);
          const cLeft = toNumber(comp.position?.x) + bounds.offsetX;
          const cTop = toNumber(comp.position?.y) + bounds.offsetY;
          const cRight = cLeft + bounds.width;
          const cBottom = cTop + bounds.height;
          return left < cRight && right > cLeft && top < cBottom && bottom > cTop;
        });
      };

      if (!overlaps(position)) return position;

      const step = 24;
      const maxRadius = 10;
      for (let radius = 1; radius <= maxRadius; radius += 1) {
        const offset = radius * step;
        for (let dx = -offset; dx <= offset; dx += step) {
          for (let dy = -offset; dy <= offset; dy += step) {
            if (Math.abs(dx) !== offset && Math.abs(dy) !== offset) continue;
            const candidate = { x: position.x + dx, y: position.y + dy };
            if (!overlaps(candidate)) return candidate;
          }
        }
      }

      return position;
    },
    []
  );

  const componentsOverlap = (
    a: PlacedComponentType,
    aPos: { x: number; y: number },
    b: PlacedComponentType,
    bPos: { x: number; y: number },
    padding = 8
  ) => {
    const aBounds = getComponentBounds(a.type);
    const bBounds = getComponentBounds(b.type);
    const aLeft = aPos.x + aBounds.offsetX - padding;
    const aTop = aPos.y + aBounds.offsetY - padding;
    const aRight = aLeft + aBounds.width + padding * 2;
    const aBottom = aTop + aBounds.height + padding * 2;
    const bLeft = bPos.x + bBounds.offsetX;
    const bTop = bPos.y + bBounds.offsetY;
    const bRight = bLeft + bBounds.width;
    const bBottom = bTop + bBounds.height;
    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
  };

  const resolveOverlaps = useCallback(
    (current: PlacedComponentType[]) => {
      if (current.length < 2) return null;
      const step = 32;
      const maxAttempts = 60;
      const next = current.map((comp) => ({
        ...comp,
        position: { ...comp.position },
      }));

      const placed: PlacedComponentType[] = [];
      let changed = false;

      next.forEach((comp) => {
        const startPos = {
          x: toNumber(comp.position?.x),
          y: toNumber(comp.position?.y),
        };

        if (comp.type === "gate") {
          comp.position = startPos;
          placed.push(comp);
          return;
        }

        let pos = { ...startPos };
        let attempts = 0;
        const overlapsAny = () =>
          placed.some((other) =>
            componentsOverlap(
              other,
              {
                x: toNumber(other.position?.x),
                y: toNumber(other.position?.y),
              },
              comp,
              pos
            )
          );

        while (overlapsAny() && attempts < maxAttempts) {
          pos.y += step;
          attempts += 1;
          if (attempts % 12 === 0) {
            pos.x += step;
          }
        }

        if (pos.x !== startPos.x || pos.y !== startPos.y) {
          changed = true;
          comp.position = {
            ...comp.position,
            x: pos.x,
            y: pos.y,
          };
        } else {
          comp.position = startPos;
        }

        placed.push(comp);
      });

      return changed ? next : null;
    },
    []
  );

  const handleComponentMoveEnd = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setComponents((prev) => {
        const resolved = resolveNonOverlappingPosition(id, position, prev);
        if (resolved.x === position.x && resolved.y === position.y) return prev;
        return prev.map((comp) =>
          comp.id === id ? { ...comp, position: resolved } : comp
        );
      });
    },
    [resolveNonOverlappingPosition, setComponents]
  );

  useEffect(() => {
    const resolved = resolveOverlaps(components);
    if (!resolved) return;
    setComponents(resolved);
  }, [components, resolveOverlaps, setComponents]);

  const componentDefinitionsRef = useRef<any[] | null>(null);

  const ensureCarrierInstance = useCallback(
    async (carrierComp: PlacedComponentType) => {
      if (carrierComp.instanceId) return;
      const twinId = Number((window as any).currentTwinId);
      if (!twinId || Number.isNaN(twinId)) return;

      try {
        if (!componentDefinitionsRef.current) {
          componentDefinitionsRef.current = await fetchComponentDefinitions();
        }
        const defs = componentDefinitionsRef.current || [];
        const def = defs.find(
          (d: any) =>
            String(d.component_name || d.componentName || "").toLowerCase() ===
              carrierComp.name.toLowerCase() &&
            String(d.component_type || d.componentType || "").toLowerCase() === "carrier"
        );
        if (!def) return;

        const payload = {
          digital_twin_id: twinId,
          component_definition_id: def.id,
          instance_name: carrierComp.name,
          position: carrierComp.position,
          field_values: carrierComp.data || {},
          connections: [],
          metadata: {},
        };

        const created = await createComponentInstance(payload as any);
        setComponents((prev) =>
          prev.map((comp) =>
            comp.id === carrierComp.id
              ? { ...comp, componentDefinitionId: def.id, instanceId: created.id }
              : comp
          )
        );
      } catch (err) {
        console.warn("[Canvas] Failed to create carrier instance:", err);
      }
    },
    [setComponents]
  );

  const carrierInstanceRequestedRef = useRef(new Set<string>());

  useEffect(() => {
    const pending = components.filter((comp) =>
      comp.type === "carrier" &&
      !comp.instanceId &&
      connections.some((conn) => conn.from === comp.id || conn.to === comp.id)
    );

    pending.forEach((carrier) => {
      if (carrierInstanceRequestedRef.current.has(carrier.id)) return;
      carrierInstanceRequestedRef.current.add(carrier.id);
      void ensureCarrierInstance(carrier);
    });
  }, [components, connections, ensureCarrierInstance]);

    useEffect(() => {
    const carrierById = new Map(
      components.filter((comp) => comp.type === "carrier").map((comp) => [comp.id, comp])
    );
    if (carrierById.size < 2) return;

    const matchesCarrierKey = (connType: string | undefined, carrierKey: string) => {
      const normalized = typeof connType === "string" ? connType.trim().toLowerCase() : "";
      if (!normalized) return carrierKey.length > 0;
      return normalized === carrierKey;
    };

    const grouped = new Map<string, string[]>();

    connections.forEach((conn) => {
      if (!carrierById.has(conn.to)) return;
      const carrierKey = getCarrierTypeKey(carrierById.get(conn.to));
      if (!carrierKey) return;
      const key = `${conn.from}::${carrierKey}`;
      const list = grouped.get(key) ?? [];
      list.push(conn.to);
      grouped.set(key, list);
    });

    let nextComponents = [...components];
    let nextConnections = [...connections];
    let changed = false;
    const persistTargets = new Set<string>();
    const duplicateInstanceIds: number[] = [];

    grouped.forEach((carrierIds, key) => {
      const uniqueIds = Array.from(new Set(carrierIds));
      if (uniqueIds.length < 2) return;

      const [fromId, carrierKey] = key.split("::");
      const primaryId = uniqueIds[0];
      const primaryComp = carrierById.get(primaryId);
      if (primaryComp) {
        void ensureCarrierInstance(primaryComp);
      }

      uniqueIds.slice(1).forEach((dupId) => {
        const dupComp = carrierById.get(dupId);
        const dupInstanceId = toInstanceId(dupComp?.instanceId);
        if (dupInstanceId) {
          duplicateInstanceIds.push(dupInstanceId);
        }
        const incomingToDup = nextConnections.filter((conn) => conn.to === dupId);
        const hasOtherIncoming = incomingToDup.some((conn) => conn.from !== fromId);
        if (hasOtherIncoming) return;

        const outgoingFromDup = nextConnections.filter((conn) => conn.from === dupId);
        outgoingFromDup.forEach((conn) => {
          if (!matchesCarrierKey(conn.type as any, carrierKey)) return;
          const exists = nextConnections.some(
            (existing) => existing.from === primaryId && existing.to === conn.to
          );
          if (!exists) {
            nextConnections.push({
              ...conn,
              id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              from: primaryId,
            });
          }
        });

        nextConnections = nextConnections.filter(
          (conn) => conn.from !== dupId && conn.to !== dupId
        );
        nextComponents = nextComponents.filter((comp) => comp.id !== dupId);
        changed = true;
        persistTargets.add(fromId);
        persistTargets.add(primaryId);
      });
    });

    if (!changed) return;
    setComponents(nextComponents);
    setConnections(nextConnections);
    persistTargets.forEach((id) => {
      void persistConnectionsForComponent(id, nextConnections);
    });
    if (duplicateInstanceIds.length) {
      duplicateInstanceIds.forEach((instanceId) => {
        (async () => {
          try {
            await deleteComponentInstance(instanceId);
          } catch (err) {
            console.warn("[Canvas] Failed to delete duplicate carrier instance:", instanceId, err);
          }
        })();
      });
    }
  }, [components, connections, ensureCarrierInstance, setComponents, setConnections]);


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

        let shouldDelete = false;
        setComponents((prev) => {
          const exists = prev.some((c) => c.id === comp.id);
          if (!exists) {
            shouldDelete = true;
            return prev;
          }
          const next = prev.map((c) =>
            c.id === comp.id ? { ...c, componentDefinitionId: def!.id, instanceId: created.id } : c
          );
          console.log("[plant-builder] model after inline add persist:", JSON.stringify({ components: next, connections }, null, 2));
          return next;
        });

        if (shouldDelete) {
          try {
            await deleteComponentInstance(created.id);
          } catch (err) {
            console.warn("[plant-builder] Failed to delete orphaned instance:", created.id, err);
          }
          return;
        }

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
    const instanceId = toInstanceId(comp?.instanceId);
    if (instanceId) {
      logJson(`[Canvas] Found instanceId ${instanceId}, sending delete request...`);
      
      (async () => {
        try {
          const response = await deleteComponentInstance(instanceId);
          logJson(`[Canvas] ✓ Delete SUCCESS for instanceId ${instanceId}:`, response);
          toast.success(`${comp?.name ?? "Component"} deleted from database`);
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

  const getPortPoint = (component: PlacedComponentType, side: PortSide) => {
    const x = toNumber(component.position?.x);
    const y = toNumber(component.position?.y);
    const bounds = getComponentBounds(component.type);
    const left = x + bounds.offsetX + canvasOffset.x;
    const top = y + bounds.offsetY + canvasOffset.y;
    const centerX = left + bounds.width / 2;
    const centerY = top + bounds.height / 2;

    if (side === "right") {
      return { x: left + bounds.width, y: centerY };
    }
    if (side === "left") {
      return { x: left, y: centerY };
    }
    if (side === "top") {
      return { x: centerX, y: top };
    }

    return {
      x: centerX,
      y: top + bounds.height,
    };
  };

  const getConnectionSides = (
    fromComp: PlacedComponentType,
    toComp: PlacedComponentType
  ): { fromSide: PortSide; toSide: PortSide } => {
    const fromX = toNumber(fromComp.position?.x);
    const fromY = toNumber(fromComp.position?.y);
    const toX = toNumber(toComp.position?.x);
    const toY = toNumber(toComp.position?.y);
    const fromBounds = getComponentBounds(fromComp.type);
    const toBounds = getComponentBounds(toComp.type);

    const fromCenterX = fromX + fromBounds.offsetX + fromBounds.width / 2;
    const fromCenterY = fromY + fromBounds.offsetY + fromBounds.height / 2;
    const toCenterX = toX + toBounds.offsetX + toBounds.width / 2;
    const toCenterY = toY + toBounds.offsetY + toBounds.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0
        ? { fromSide: "right", toSide: "left" }
        : { fromSide: "left", toSide: "right" };
    }

    return dy >= 0
      ? { fromSide: "bottom", toSide: "top" }
      : { fromSide: "top", toSide: "bottom" };
  };

  const createCarrierBetween = useCallback(
    (
      fromId: string,
      toId: string,
      carrier: string,
      reason: string,
      quantity?: string,
      unit?: string
    ) => {
      if (!fromId || !toId || !carrier) return;

      const trimmedQuantity = typeof quantity === "string" ? quantity.trim() : "";
      const trimmedUnit = typeof unit === "string" ? unit.trim() : "";
      const connectionData: Record<string, any> = {};
      if (trimmedQuantity !== "") connectionData.quantity = trimmedQuantity;
      if (trimmedUnit !== "") connectionData.unit = trimmedUnit;

      const carrierKey = carrier.toLowerCase();

      setComponents((prevComponents) => {
        const fromComp = prevComponents.find((c) => c.id === fromId);
        const toComp = prevComponents.find((c) => c.id === toId);
        if (!fromComp || !toComp) return prevComponents;

        let nextComponents = [...prevComponents];

        const isCarrierMatch = (comp: PlacedComponentType) => {
          if (comp.type !== "carrier") return false;
          const product = typeof comp.data?.product === "string" ? comp.data.product : comp.name;
          return typeof product === "string" && product.toLowerCase() === carrierKey;
        };

        setConnections((prevConnections) => {
          let nextConnections = [...prevConnections];

          const carrierCandidates = nextComponents.filter(isCarrierMatch);
          const inboundCandidates = carrierCandidates.filter((carrierComp) =>
            nextConnections.some(
              (conn) => conn.from === fromId && conn.to === carrierComp.id
            )
          );

          let primaryCarrier = inboundCandidates[0];

          if (primaryCarrier && inboundCandidates.length > 1) {
            const primaryId = primaryCarrier.id;
            inboundCandidates.slice(1).forEach((dup) => {
              const incomingToDup = nextConnections.filter((conn) => conn.to === dup.id);
              const hasOtherIncoming = incomingToDup.some((conn) => conn.from !== fromId);
              if (hasOtherIncoming) return;

              const outgoingFromDup = nextConnections.filter((conn) => conn.from === dup.id);
              outgoingFromDup.forEach((conn) => {
                const exists = nextConnections.some(
                  (existing) => existing.from === primaryId && existing.to === conn.to
                );
                if (!exists) {
                  nextConnections.push({
                    ...conn,
                    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    from: primaryId,
                  });
                }
              });

              nextConnections = nextConnections.filter(
                (conn) => conn.from !== dup.id && conn.to !== dup.id
              );
              nextComponents = nextComponents.filter((comp) => comp.id !== dup.id);
              const dupInstanceId = toInstanceId(dup.instanceId);
              if (dupInstanceId) {
                void deleteComponentInstance(dupInstanceId);
              }
            });
          }

          if (!primaryCarrier) {
            const carrierId = `carrier-${carrier}-${Date.now()}`;
            primaryCarrier = {
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
            nextComponents = [...nextComponents, primaryCarrier];
          }

          if (!primaryCarrier) return prevConnections;

          const carrierId = primaryCarrier.id;
          const hasInputConn = nextConnections.some(
            (conn) => conn.from === fromId && conn.to === carrierId
          );
          const hasOutputConn = nextConnections.some(
            (conn) => conn.from === carrierId && conn.to === toId
          );

          const now = Date.now();
          let idCounter = 0;
          const nextId = (suffix: string) => `conn-${now}-${suffix}-${idCounter++}`;

          if (!hasInputConn) {
            nextConnections = [
              ...nextConnections,
              {
                id: nextId("in"),
                from: fromId,
                to: carrierId,
                type: carrier,
                reason,
                data: connectionData,
              },
            ];
          }

          if (!hasOutputConn) {
            nextConnections = [
              ...nextConnections,
              {
                id: nextId("out"),
                from: carrierId,
                to: toId,
                type: carrier,
                reason,
                data: connectionData,
              },
            ];
          }

          void ensureCarrierInstance(primaryCarrier);
          void persistConnectionsForComponent(fromId, nextConnections);
          void persistConnectionsForComponent(carrierId, nextConnections);
          return nextConnections;
        });

        return nextComponents;
      });
    },
    [ensureCarrierInstance, persistConnectionsForComponent, setComponents, setConnections]
  );

  const connectionLabels = useMemo(() => {
    const baseById = new Map<string, { quantity: number | null; unit: string }>();
    const getConnValues = (conn: ConnectionType) => {
      const data = conn.data || {};
      const quantity =
        parseQuantity((data as any).quantity) ??
        parseQuantity((data as any).energyAmount) ??
        parseQuantity((data as any).amount) ??
        parseQuantity((data as any).value);
      const unit =
        normalizeUnit((data as any).unit) ||
        normalizeUnit((data as any).units) ||
        normalizeUnit((data as any).energyUnit);
      return { quantity, unit };
    };

    connections.forEach((conn) => {
      baseById.set(conn.id, getConnValues(conn));
    });

    const derivedById = new Map<string, { quantity: number; unit: string }>();

    const carriers = components.filter((comp) => comp.type === "carrier");
    carriers.forEach((carrier) => {
      const incoming = connections.filter((conn) => conn.to === carrier.id);
      const outgoing = connections.filter((conn) => conn.from === carrier.id);
      if (!incoming.length && !outgoing.length) return;

      let totalIn = 0;
      let hasIn = false;
      let unitHint = "";

      incoming.forEach((conn) => {
        const base = baseById.get(conn.id);
        if (!base) return;
        if (Number.isFinite(base.quantity ?? NaN)) {
          totalIn += base.quantity as number;
          hasIn = true;
        }
        if (!unitHint && base.unit) unitHint = base.unit;
      });

      let knownOutTotal = 0;
      const missingOutputs: ConnectionType[] = [];

      outgoing.forEach((conn) => {
        const base = baseById.get(conn.id);
        if (!base) return;
        if (Number.isFinite(base.quantity ?? NaN)) {
          knownOutTotal += base.quantity as number;
        } else {
          missingOutputs.push(conn);
        }
        if (!unitHint && base.unit) unitHint = base.unit;
      });

      if (hasIn && missingOutputs.length > 0) {
        const remainder = Math.max(totalIn - knownOutTotal, 0);
        const per = remainder / missingOutputs.length;
        missingOutputs.forEach((conn) => {
          const base = baseById.get(conn.id);
          const unit = base?.unit || unitHint;
          derivedById.set(conn.id, { quantity: per, unit });
        });
      }

      if (unitHint) {
        outgoing.forEach((conn) => {
          const base = baseById.get(conn.id);
          if (!base) return;
          if (!base.unit && Number.isFinite(base.quantity ?? NaN)) {
            derivedById.set(conn.id, { quantity: base.quantity as number, unit: unitHint });
          }
        });
        incoming.forEach((conn) => {
          const base = baseById.get(conn.id);
          if (!base) return;
          if (!base.unit && Number.isFinite(base.quantity ?? NaN)) {
            derivedById.set(conn.id, { quantity: base.quantity as number, unit: unitHint });
          }
        });
      }
    });

    const labelMap = new Map<string, string>();
    connections.forEach((conn) => {
      const derived = derivedById.get(conn.id);
      const base = baseById.get(conn.id);
      const quantity = derived?.quantity ?? base?.quantity;
      const unit = derived?.unit ?? base?.unit ?? "";
      const hasQuantity = Number.isFinite(quantity ?? NaN);
      const displayQuantity = hasQuantity ? (quantity as number) : 0;
      const displayUnit = unit || (!hasQuantity ? "unit" : "");
      const label = `${formatQuantity(displayQuantity)}${displayUnit ? ` ${displayUnit}` : ""}`;
      labelMap.set(conn.id, label);
    });

    return labelMap;
  }, [connections, components]);


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
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleOrientation}
            className="bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
            title={layoutOrientation === "horizontal" ? "Switch to vertical layout" : "Switch to horizontal layout"}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            {layoutOrientation === "horizontal" ? "Vertical" : "Horizontal"}
          </Button>
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
        {topRightAddon}
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="rounded-md border border-slate-200 bg-white/95 text-xs text-slate-700 shadow-sm">
          <button
            type="button"
            onClick={() => setLegendOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
          >
            Legend
            <span className="text-[10px] font-semibold text-slate-400">
              {legendOpen ? "Hide" : "Show"}
            </span>
          </button>
          {legendOpen && (
            <div className="px-3 pb-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Equipment
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Carrier
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  Gate
                </div>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Carrier Flows
                </div>
                <div className="mt-2 space-y-1">
                  {carrierLegendItems.length ? (
                    carrierLegendItems.map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="max-w-[160px] truncate" title={item.label}>
                          {item.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">No carriers yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


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
            {layoutOrientation === "horizontal" ? (
              <>
                <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-layer-equipment/5" />
                <div
                  className="absolute top-0 bottom-0"
                  style={{ left: "33.3333%", width: "33.3333%" }}
                >
                  <div className="absolute inset-0 bg-layer-carrier/5" />
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-layer-gate/5" />
              </>
            ) : (
              <>
                <div className="absolute left-0 right-0 top-0 h-1/3 bg-layer-equipment/5" />
                <div
                  className="absolute left-0 right-0"
                  style={{ top: "33.3333%", height: "33.3333%" }}
                >
                  <div className="absolute inset-0 bg-layer-carrier/5" />
                </div>
                <div className="absolute left-0 right-0 bottom-0 h-1/3 bg-layer-gate/5" />
              </>
            )}
          </div>

          {gateZones && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {gateZones.orientation === "vertical" ? (
                <>
                  <div
                    className="absolute left-0 right-0"
                    style={{ top: gateZones.inputY }}
                  >
                    <div className="h-px w-full bg-slate-300 shadow-[0_0_8px_rgba(59,130,246,0.45)]" />
                  </div>
                  <div
                    className="absolute left-0 right-0"
                    style={{ top: gateZones.outputY }}
                  >
                    <div className="h-px w-full bg-slate-300 shadow-[0_0_8px_rgba(34,197,94,0.45)]" />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="absolute top-0 bottom-0"
                    style={{ left: gateZones.inputX }}
                  >
                    <div className="h-full w-px bg-slate-300 shadow-[0_0_8px_rgba(59,130,246,0.45)]" />
                  </div>
                  <div
                    className="absolute top-0 bottom-0"
                    style={{ left: gateZones.outputX }}
                  >
                    <div className="h-full w-px bg-slate-300 shadow-[0_0_8px_rgba(34,197,94,0.45)]" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {systemFrame &&
              (() => {
                const left = systemFrame.left;
                const top = systemFrame.top;
                const right = left + systemFrame.width;
                const bottom = top + systemFrame.height;
                const corner = 18;
                const tick = 10;
                const headerHeight = 24;
                const headerY = Math.max(8, top - headerHeight - 8);
                const headerRadius = 12;
                const headerPadding = 10;
                return (
                  <g>
                    <rect
                      x={left}
                      y={top}
                      width={systemFrame.width}
                      height={systemFrame.height}
                      rx={18}
                      ry={18}
                      fill="rgba(148, 163, 184, 0.06)"
                    />
                    <rect
                      x={left}
                      y={top}
                      width={systemFrame.width}
                      height={systemFrame.height}
                      rx={18}
                      ry={18}
                      fill="transparent"
                      stroke="rgba(100, 116, 139, 0.9)"
                      strokeWidth={2}
                      strokeDasharray="10 6"
                      vectorEffect="non-scaling-stroke"
                    />
                    <g
                      stroke="rgba(100, 116, 139, 0.95)"
                      strokeWidth={3}
                      vectorEffect="non-scaling-stroke"
                    >
                      <path d={`M ${left} ${top + corner} L ${left} ${top} L ${left + corner} ${top}`} />
                      <path d={`M ${right - corner} ${top} L ${right} ${top} L ${right} ${top + corner}`} />
                      <path d={`M ${left} ${bottom - corner} L ${left} ${bottom} L ${left + corner} ${bottom}`} />
                      <path d={`M ${right - corner} ${bottom} L ${right} ${bottom} L ${right} ${bottom - corner}`} />
                    </g>
                    <g
                      stroke="rgba(100, 116, 139, 0.7)"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    >
                      <line x1={left + systemFrame.width / 2 - tick} y1={top} x2={left + systemFrame.width / 2 + tick} y2={top} />
                      <line x1={left + systemFrame.width / 2 - tick} y1={bottom} x2={left + systemFrame.width / 2 + tick} y2={bottom} />
                      <line x1={left} y1={top + systemFrame.height / 2 - tick} x2={left} y2={top + systemFrame.height / 2 + tick} />
                      <line x1={right} y1={top + systemFrame.height / 2 - tick} x2={right} y2={top + systemFrame.height / 2 + tick} />
                    </g>
                    <g>
                      <rect
                        x={left}
                        y={headerY}
                        width={systemFrame.width}
                        height={headerHeight}
                        rx={headerRadius}
                        ry={headerRadius}
                        fill="rgba(248, 250, 252, 0.97)"
                        stroke="rgba(100, 116, 139, 0.35)"
                        strokeWidth={1}
                      />
                      <text
                        x={left + headerPadding}
                        y={headerY + 16}
                        fontSize={12}
                        fontWeight={600}
                        fill="hsl(var(--layer-gate) / 0.95)"
                      >
                        {INPUT_GATES_LABEL}
                      </text>
                      <text
                        x={left + systemFrame.width / 2}
                        y={headerY + 16}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        fill="rgb(51, 65, 85)"
                      >
                        {SYSTEM_FRAME_LABEL}
                      </text>
                      <text
                        x={left + systemFrame.width - headerPadding}
                        y={headerY + 16}
                        textAnchor="end"
                        fontSize={12}
                        fontWeight={600}
                        fill="hsl(var(--layer-gate) / 0.95)"
                      >
                        {OUTPUT_GATES_LABEL}
                      </text>
                    </g>
                  </g>
                );
              })()}
            {connections.map((conn) => {
              const fromComp = components.find((c) => c.id === conn.from);
              const toComp = components.find((c) => c.id === conn.to);
              if (!fromComp || !toComp) return null;

              const { fromSide, toSide } = getConnectionSides(fromComp, toComp);
              const from = getPortPoint(fromComp, fromSide);
              const to = getPortPoint(toComp, toSide);

              return (
                <ConnectionArrow
                  key={conn.id}
                  id={String(conn.id)}
                  from={from}
                  to={to}
                  fromSide={fromSide}
                  toSide={toSide}
                  style={connectionStyle}
                  isInvalid={invalidConnectionIds?.has(String(conn.id)) ?? false}
                  label={connectionLabels.get(conn.id)}
                  errorMessage={invalidConnectionMessages?.get(String(conn.id))}
                  showFlow
                  color={connectionColors.get(conn.id)}
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
                let gateDirection: "input" | "output" | null = null;
                if (comp.type === "gate") {
                  gateDirection = getGateDirection(comp, connections);
                  if (!gateDirection && rawGateZones) {
                    if (layoutOrientation === "vertical") {
                      const inputTop = (rawGateZones as any).inputTop;
                      const outputTop = (rawGateZones as any).outputTop;
                      if (typeof inputTop === "number" && typeof outputTop === "number") {
                        gateDirection = Math.abs(y - inputTop) <= Math.abs(y - outputTop) ? "input" : "output";
                      }
                    } else {
                      const inputLeft = (rawGateZones as any).inputLeft;
                      const outputLeft = (rawGateZones as any).outputLeft;
                      if (typeof inputLeft === "number" && typeof outputLeft === "number") {
                        gateDirection = Math.abs(x - inputLeft) <= Math.abs(x - outputLeft) ? "input" : "output";
                      }
                    }
                  }
                }
                const carrierKey = comp.type === "carrier" ? getCarrierTypeKey(comp) : "";
                const carrierAccent = carrierKey ? carrierColorMap.get(carrierKey) : undefined;
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
                    onMoveEnd={handleComponentMoveEnd}
                    onConnectStart={handleConnectStart}
                    onConnectEnd={handleConnectEnd}
                    isConnectingActive={Boolean(connectingFrom)}
                    isConnecting={connectingFrom === comp.id}
                    onDelete={handleDeleteComponent}
                    validationErrors={validationErrorsByComponent?.[String(comp.id)] ?? []}
                    isHighlighted={highlightedComponentId === comp.id}
                    gateDirection={gateDirection}
                    accentColor={carrierAccent}
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
          onAddConnection={(from, to, carrier, reason, quantity, unit) => {
            // streams UI always passes carrier name in the "type" argument
            createCarrierBetween(from, to, carrier, reason, quantity, unit);
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
