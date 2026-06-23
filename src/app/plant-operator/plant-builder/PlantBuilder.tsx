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
  Building2,
  Zap,
  ArrowRightLeft,
  X,
  Save,
  Play,
  Plus,
  MessageSquare,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
import { Textarea } from "@/components/ui/textarea";
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
import { toInstanceId, toOptionalNumber } from "@/lib/plant-builder/ids";
import { updateComponentInstance, deleteComponentInstance, fetchComponentInstances } from "@/services/plant-builder/componentInstances";
import { buildConnectionPayloadForComponent, StoredConnectionPayload } from "@/lib/plant-builder/connection-utils";
import {
  createTemplateFromDigitalTwin,
  fetchTemplates,
  instantiateTemplate,
  TemplateDto,
} from "@/services/plant-builder/templates";



const TEMPLATE_NODE_COLORS: Record<string, string> = {
  equipment: "#4F8FF7",
  carrier: "#10B981",
  gate: "#F59E0B",
  default: "#94A3B8",
};

type TemplateComponent = {
  id: string | number;
  name?: string;
  type?: string;
  position?: { x: number; y: number };
};

const PREVIEW_NODE_SIZE_SCALE = 1.2;

const getPreviewShape = (type?: string) => {
  switch (type) {
    case "equipment":
      return {
        width: Math.round(224 * PREVIEW_NODE_SIZE_SCALE),
        height: Math.round(144 * PREVIEW_NODE_SIZE_SCALE),
        rounded: "rounded-lg",
        bg: "bg-blue-50",
        border: "border-blue-500",
        text: "text-blue-700",
        rotate: false,
        icon: Building2,
        rotateIcon: false,
      };
    case "carrier":
      return {
        width: Math.round(144 * PREVIEW_NODE_SIZE_SCALE),
        height: Math.round(144 * PREVIEW_NODE_SIZE_SCALE),
        rounded: "rounded-full",
        bg: "bg-green-50",
        border: "border-green-500",
        text: "text-green-700",
        rotate: false,
        icon: Zap,
        rotateIcon: false,
      };
    case "gate":
      return {
        width: Math.round(192 * PREVIEW_NODE_SIZE_SCALE),
        height: Math.round(288 * PREVIEW_NODE_SIZE_SCALE),
        rounded: "rounded-md",
        bg: "bg-purple-50",
        border: "border-purple-500",
        text: "text-purple-700",
        rotate: false,
        icon: ArrowRightLeft,
        rotateIcon: false,
      };
    default:
      return {
        width: Math.round(192 * PREVIEW_NODE_SIZE_SCALE),
        height: Math.round(128 * PREVIEW_NODE_SIZE_SCALE),
        rounded: "rounded-lg",
        bg: "bg-slate-100",
        border: "border-slate-300",
        text: "text-slate-600",
        rotate: false,
        icon: Building2,
        rotateIcon: false,
      };
  }
};

const buildTemplatePreviewLayout = (
  components: NonNullable<TemplateDto["template_json"]>["components"] = [],
  width: number,
  height: number,
  padding = 12
) => {
  if (!components || components.length === 0) {
    return { nodes: [] as Array<{ id: string; x: number; y: number; type?: string }> };
  }

  const hasPositions = components.every(
    (comp) =>
      comp.position &&
      Number.isFinite(comp.position.x) &&
      Number.isFinite(comp.position.y)
  );

  if (!hasPositions) {
    const cols = Math.ceil(Math.sqrt(components.length)) || 1;
    const rows = Math.ceil(components.length / cols) || 1;
    const cellW = (width - padding * 2) / cols;
    const cellH = (height - padding * 2) / rows;
    const nodes = components.map((comp, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        id: String(comp.id),
        type: comp.type,
        x: padding + col * cellW + cellW / 2,
        y: padding + row * cellH + cellH / 2,
      };
    });
    return { nodes };
  }

  const xs = components.map((comp) => comp.position!.x);
  const ys = components.map((comp) => comp.position!.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = Math.min(
    (width - padding * 2) / rangeX,
    (height - padding * 2) / rangeY
  );

  const nodes = components.map((comp) => ({
    id: String(comp.id),
    type: comp.type,
    x: padding + (comp.position!.x - minX) * scale,
    y: padding + (comp.position!.y - minY) * scale,
  }));

  return { nodes };
};

const getTemplateStats = (template: TemplateDto) => {
  const components = template.template_json?.components || [];
  const connections = template.template_json?.connections || [];
  const byType = components.reduce(
    (acc, comp) => {
      const type = comp.type || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return {
    total: components.length,
    equipment: byType.equipment || 0,
    carrier: byType.carrier || 0,
    gate: byType.gate || 0,
    connections: connections.length,
  };
};

const renderTemplatePreviewCanvas = (template: TemplateDto, baseScale = 1) => {
  const components = template.template_json?.components || [];
  const connections = template.template_json?.connections || [];

  if (!components.length) {
    return (
      <div className="text-xs text-gray-500 text-center py-6">
        Preview not available.
      </div>
    );
  }

  const hasPositions = components.every(
    (comp) =>
      comp.position &&
      Number.isFinite(comp.position.x) &&
      Number.isFinite(comp.position.y)
  );

  const rawNodes = hasPositions
    ? components.map((comp) => ({
        id: String(comp.id),
        x: comp.position!.x,
        y: comp.position!.y,
        type: comp.type,
      }))
    : (() => {
        const cols = Math.ceil(Math.sqrt(components.length)) || 1;
        const rows = Math.ceil(components.length / cols) || 1;
        const cellW = 260;
        const cellH = 200;
        return components.map((comp, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            id: String(comp.id),
            x: col * cellW,
            y: row * cellH,
            type: comp.type,
          };
        });
      })();

  const nodeMap = new Map(rawNodes.map((n) => [n.id, n]));
  const shapes: Array<{
    component: TemplateComponent;
    node: { id: string; x: number; y: number; type?: string };
    shape: ReturnType<typeof getPreviewShape>;
    width: number;
    height: number;
    effectiveWidth: number;
    effectiveHeight: number;
    boundsLeft: number;
    boundsTop: number;
    boundsRight: number;
    boundsBottom: number;
  }> = [];

  for (const component of components) {
    const node = nodeMap.get(String(component.id));
    if (!node) continue;
    const shape = getPreviewShape(component.type);
    const width = shape.width * baseScale;
    const height = shape.height * baseScale;
    const effectiveWidth = (shape.rotate ? shape.height : shape.width) * baseScale;
    const effectiveHeight = (shape.rotate ? shape.width : shape.height) * baseScale;
    const rotateOffsetX = shape.rotate ? ((shape.width - shape.height) / 2) * baseScale : 0;
    const rotateOffsetY = shape.rotate ? ((shape.height - shape.width) / 2) * baseScale : 0;
    const boundsLeft = node.x * baseScale + rotateOffsetX;
    const boundsTop = node.y * baseScale + rotateOffsetY;
    const boundsRight = boundsLeft + effectiveWidth;
    const boundsBottom = boundsTop + effectiveHeight;
    shapes.push({
      component,
      node,
      shape,
      width,
      height,
      effectiveWidth,
      effectiveHeight,
      boundsLeft,
      boundsTop,
      boundsRight,
      boundsBottom,
    });
  }

  if (!shapes.length) {
    return (
      <div className="text-xs text-gray-500 text-center py-6">
        Preview not available.
      </div>
    );
  }

  const minX = Math.min(...shapes.map((item) => item.boundsLeft));
  const minY = Math.min(...shapes.map((item) => item.boundsTop));
  const maxX = Math.max(...shapes.map((item) => item.boundsRight));
  const maxY = Math.max(...shapes.map((item) => item.boundsBottom));

  const padding = 80;
  const width = Math.max(1, maxX - minX) + padding * 2;
  const height = Math.max(1, maxY - minY) + padding * 2;
  const offsetX = padding - minX;
  const offsetY = padding - minY;

  const shapeById = new Map(
    shapes.map((item) => [
      item.node.id,
      {
        centerX: item.node.x * baseScale + item.width / 2,
        centerY: item.node.y * baseScale + item.height / 2,
      },
    ])
  );

  return (
    <div
      className="relative pointer-events-none select-none"
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
      >
        {connections.map((conn, idx) => {
          const from = nodeMap.get(String(conn.from));
          const to = nodeMap.get(String(conn.to));
          if (!from || !to) return null;
          return (
            <line
              key={`preview-${template.id}-c-${idx}`}
              x1={(shapeById.get(from.id)?.centerX ?? from.x * baseScale) + offsetX}
              y1={(shapeById.get(from.id)?.centerY ?? from.y * baseScale) + offsetY}
              x2={(shapeById.get(to.id)?.centerX ?? to.x * baseScale) + offsetX}
              y2={(shapeById.get(to.id)?.centerY ?? to.y * baseScale) + offsetY}
              stroke="#cbd5f5"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {shapes.map(({ component, node, shape, width, height }) => {
        const Icon = shape.icon;
        const isGate = (component.type || "").toLowerCase() === "gate";

        return (
          <div
            key={`preview-${template.id}-node-${component.id}`}
            className={`absolute border-2 shadow-sm overflow-visible ${shape.bg} ${shape.border} ${shape.rounded}`}
            style={{
              width,
              height,
              left: node.x * baseScale + offsetX,
              top: node.y * baseScale + offsetY,
              transform: shape.rotate ? "rotate(90deg)" : undefined,
              transformOrigin: "center",
            }}
          >
            <div
              className={`w-full h-full flex flex-col items-center justify-center gap-0.5 p-2 text-center overflow-visible ${
                shape.rotate ? "rotate-[-90deg]" : ""
              }`}
            >
              <Icon
                className={`mb-1 h-6 w-6 ${shape.text}`}
                style={{ transform: shape.rotateIcon ? "rotate(90deg)" : undefined }}
              />
              <div
                className={
                  isGate
                    ? "text-sm font-semibold text-gray-900 max-w-full leading-normal whitespace-normal"
                    : "text-sm font-semibold text-gray-900 max-w-full leading-normal truncate"
                }
              >
                {component.name || "Unnamed"}
              </div>
              <div
                className={
                  isGate
                    ? "text-xs text-gray-500 max-w-full leading-normal whitespace-normal"
                    : "text-xs text-gray-500 max-w-full leading-normal truncate"
                }
              >
                ID {component.id}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Plant Builder Component
 * 
 * Multi-step workflow: User Details → Plant Info → Products → Canvas Builder → Compliance Check
 * Manages component persistence to backend and process flow visualization.
 */
type PlantBuilderProps = {
  initialView?: "builder" | "templates";
};

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
    metadata: {
      plant_configuration: str((info as any).plantConfiguration),
      site_environment: str((info as any).siteEnvironment),
      certification_phase: str((info as any).certificationPhase),
      commercial_operation_date: str(
        info.commercialOperationalDate ?? (info as any).expectedCOD,
      ),
      project_lifetime_years: num((info as any).projectLifetimeYears),
    },
  };
};

export const PlantBuilder = ({ initialView = "builder" }: PlantBuilderProps) => {
  const router = useRouter();
  const [step, setStep] = useState<
    "info" | "product" | "builder" | "compliance" | "loading"
  >("loading");
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
  const [validationStep, setValidationStep] = useState<"structure" | "ports" | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [carrierDefNames, setCarrierDefNames] = useState<Record<number, string>>({});
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  const [focusRequest, setFocusRequest] = useState<{ id: string; ts: number } | null>(null);
  const [highlightedComponentId, setHighlightedComponentId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isEditingPlantInfo, setIsEditingPlantInfo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [templateDescriptionInput, setTemplateDescriptionInput] = useState("");
  const [showTemplatesModal, setShowTemplatesModal] = useState(
    initialView === "templates"
  );
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [instantiateName, setInstantiateName] = useState("");
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [isSharingPlant, setIsSharingPlant] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDto | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [templatePreviewImages, setTemplatePreviewImages] = useState<Record<number, string>>({});
  const [templatePreviewQueue, setTemplatePreviewQueue] = useState<TemplateDto[]>([]);
  const [templatePreviewTarget, setTemplatePreviewTarget] = useState<TemplateDto | null>(null);
  const [isRenderingTemplatePreview, setIsRenderingTemplatePreview] = useState(false);
  const templatePreviewRef = useRef<HTMLDivElement | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [portsByDefinitionId, setPortsByDefinitionId] = useState<Record<number, EquipmentPortsDto>>({});
  const [showExportModal, setShowExportModal] = useState(false);
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

  const waitForNextFrame = useCallback(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    []
  );

  const prepareExport = useCallback(async () => {
    setExportTimestamp(new Date().toISOString());
    await waitForNextFrame();
  }, [waitForNextFrame]);

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
    if (showDataModel) {
      setShowComponentLibrary(false);
      window.dispatchEvent(new CustomEvent("plant-builder:close-sidebar"));
    }
  }, [showDataModel]);

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

  useEffect(() => {
    const pending = templates.filter(
      (template) =>
        template.template_json?.components?.length &&
        !templatePreviewImages[template.id]
    );
    setTemplatePreviewQueue(pending);
  }, [templates, templatePreviewImages]);

  useEffect(() => {
    if (isRenderingTemplatePreview || templatePreviewQueue.length === 0) return;
    setTemplatePreviewTarget(templatePreviewQueue[0]);
    setTemplatePreviewQueue((prev) => prev.slice(1));
    setIsRenderingTemplatePreview(true);
  }, [templatePreviewQueue, isRenderingTemplatePreview]);

  useEffect(() => {
    if (!templatePreviewTarget) return;
    const node = templatePreviewRef.current;
    if (!node) {
      setIsRenderingTemplatePreview(false);
      setTemplatePreviewTarget(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const exportWidth = node.scrollWidth || node.clientWidth;
      const exportHeight = node.scrollHeight || node.clientHeight;
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 5,
        useCORS: true,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
      });
      if (cancelled) return;
      const url = canvas.toDataURL("image/png");
      setTemplatePreviewImages((prev) => ({
        ...prev,
        [templatePreviewTarget.id]: url,
      }));
    };

    run()
      .catch((err) => {
        console.error("Failed to render template preview:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsRenderingTemplatePreview(false);
          setTemplatePreviewTarget(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [templatePreviewTarget]);

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
    if (initialView === "templates") {
      setStep("builder");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("plantId");
    const editMode = params.get("edit") === "info";
    if (!plantId) {
      setStep("info");
    }
  }, [initialView]);

  // Load existing plant from URL (edit mode)
    useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const plantIdParam = searchParams.get("plantId");
    const editMode = searchParams.get("edit") === "info";

    if (!plantIdParam) return;

    const plantId = Number(plantIdParam);
    if (Number.isNaN(plantId)) return;

    setIsEditingPlantInfo(editMode);
    setStep(editMode ? "info" : "builder");

    const mapPlantToInfo = (plant: Plant): PlantInfo => {
      const metadata = plant.metadata || {};
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
        publishToEcosystem: plant.publish_to_ecosystem ?? false,
      } as PlantInfo;
    };

    (async () => {
      try {
        toast.info("Loading digital twin from database…");

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

              toast.success("Digital twin loaded from database.");
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
        toast.info("Starting compliance check process.");
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

  const deriveGateEquipmentConnections = useCallback(
    (connectionList: Connection[], componentList: { id: string; type?: string }[]) => {
      const componentMap = new Map(componentList.map((c) => [String(c.id), c]));
      const normalizeType = (type?: string) => (type || "").toLowerCase();
      const isEndpoint = (type?: string) => {
        const normalized = normalizeType(type);
        return normalized === "equipment" || normalized === "gate";
      };
      const isCarrier = (type?: string) => normalizeType(type) === "carrier";
      const isGateEquipmentPair = (fromType?: string, toType?: string) => {
        const from = normalizeType(fromType);
        const to = normalizeType(toType);
        return (from === "gate" && to === "equipment") || (from === "equipment" && to === "gate");
      };

      const outgoingByFrom = new Map<string, Connection[]>();
      connectionList.forEach((conn) => {
        const key = String(conn.from);
        if (!outgoingByFrom.has(key)) outgoingByFrom.set(key, []);
        outgoingByFrom.get(key)!.push(conn);
      });

      const directPairs = new Set<string>();
      connectionList.forEach((conn) => {
        const fromType = componentMap.get(String(conn.from))?.type;
        const toType = componentMap.get(String(conn.to))?.type;
        if (isEndpoint(fromType) && isEndpoint(toType)) {
          directPairs.add(`${conn.from}->${conn.to}`);
        }
      });

      const derived = new Map<
        string,
        { from: string; to: string; via: string; sourceIds: string[] }
      >();

      connectionList.forEach((conn) => {
        const fromType = componentMap.get(String(conn.from))?.type;
        const toType = componentMap.get(String(conn.to))?.type;
        if (!isEndpoint(fromType) || !isCarrier(toType)) return;

        const carrierId = String(conn.to);
        const carrierOutgoing = outgoingByFrom.get(carrierId) || [];
        carrierOutgoing.forEach((next) => {
          const nextType = componentMap.get(String(next.to))?.type;
          if (!isEndpoint(nextType)) return;
          if (!isGateEquipmentPair(fromType, nextType)) return;

          const key = `${conn.from}->${next.to}`;
          if (directPairs.has(key) || derived.has(key)) return;

          derived.set(key, {
            from: String(conn.from),
            to: String(next.to),
            via: carrierId,
            sourceIds: [conn.id, next.id],
          });
        });
      });

      return Array.from(derived.values());
    },
    []
  );

  const buildDataModel = useCallback(() => {
    const derivedConnections = deriveGateEquipmentConnections(
      uniqueConnections,
      normalizedComponents
    );

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
      connections: [
        ...uniqueConnections.map((c) => ({
          id: c.id,
          from: c.from,
          to: c.to,
          type: c.type,
          reason: c.reason || "N/A",
          data: c.data || {},
        })),
        ...derivedConnections.map((c) => ({
          id: `derived-${c.from}-${c.to}-${c.via}`,
          from: c.from,
          to: c.to,
          type: "derived",
          reason: `Derived via carrier ${c.via}`,
          data: { derived: true, via: c.via, sources: c.sourceIds },
        })),
      ],
      regulatoryMetadata: {
        projectType: plantInfo?.projectType || "N/A",
        primaryFuelType: plantInfo?.primaryFuelType || "N/A",
        country: plantInfo?.country || "N/A",
        status: plantInfo?.status || "N/A",
        commercialOperationalDate: plantInfo?.commercialOperationalDate || "N/A",
      },
    };
  }, [
    deriveGateEquipmentConnections,
    normalizedComponents,
    plantInfo,
    productInfo,
    uniqueConnections,
    userDetails,
  ]);

  const captureCanvasSnapshot = useCallback(async () => {
    const canvasNode = document.querySelector(
      '[data-plant-builder-canvas="main"]'
    ) as HTMLElement | null;
    if (!canvasNode) {
      toast.error("Canvas not found.");
      return null;
    }

    const parent = canvasNode.parentElement;
    const prevTransform = canvasNode.style.transform;
    const prevOrigin = canvasNode.style.transformOrigin;
    const prevParentOverflow = parent?.style.overflow;
    const prevParentWidth = parent?.style.width;
    const prevParentHeight = parent?.style.height;

    try {
      document.body.classList.add("plant-exporting");
      canvasNode.style.transform = "scale(1)";
      canvasNode.style.transformOrigin = "0 0";

      if (parent) {
        parent.style.overflow = "visible";
        parent.style.width = `${canvasNode.scrollWidth}px`;
        parent.style.height = `${canvasNode.scrollHeight}px`;
      }

      const exportWidth = canvasNode.scrollWidth || canvasNode.clientWidth;
      const exportHeight = canvasNode.scrollHeight || canvasNode.clientHeight;

      const canvas = await html2canvas(canvasNode, {
        backgroundColor: "#ffffff",
        scale: 4,
        useCORS: true,
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
      });

      return canvas.toDataURL("image/png");
    } finally {
      if (parent) {
        parent.style.overflow = prevParentOverflow ?? "";
        parent.style.width = prevParentWidth ?? "";
        parent.style.height = prevParentHeight ?? "";
      }
      canvasNode.style.transform = prevTransform;
      canvasNode.style.transformOrigin = prevOrigin;
      document.body.classList.remove("plant-exporting");
    }
  }, []);

  const handleExportCanvasImage = async () => {
    try {
      await prepareExport();
      const url = await captureCanvasSnapshot();
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.download = `${plantInfo?.plantName || "plant-design"}.png`;
      link.click();
      toast.success("Canvas image exported successfully!");
    } catch (err) {
      console.error("Failed to export canvas image:", err);
      toast.error("Failed to export canvas image.");
    }
  };

  const handleExportPDF = async () => {
    try {
      await prepareExport();

      if (!previewImageUrl && !isGeneratingPreview) {
        setIsGeneratingPreview(true);
        const url = await captureCanvasSnapshot();
        setPreviewImageUrl(url);
        setIsGeneratingPreview(false);
        await waitForNextFrame();
      }

      const exportNode = document.querySelector("#plant-data-export") as HTMLElement | null;
      if (!exportNode) {
        toast.error("Export content not found.");
        return;
      }

      const pages = Array.from(exportNode.querySelectorAll(".pdf-page")) as HTMLElement[];
      if (!pages.length) {
        toast.error("PDF pages not found.");
        return;
      }

      document.body.classList.add("plant-exporting");

      try {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const addCanvasToPdf = (canvas: HTMLCanvasElement, addNewPage: boolean) => {
          const imgData = canvas.toDataURL("image/png");
          const scale = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
          const imgWidth = canvas.width * scale;
          const imgHeight = canvas.height * scale;
          const offsetX = Math.max(0, (pdfWidth - imgWidth) / 2);
          const offsetY = Math.max(0, (pdfHeight - imgHeight) / 2);

          if (addNewPage) {
            pdf.addPage();
          }

          pdf.addImage(imgData, "PNG", offsetX, offsetY, imgWidth, imgHeight);
        };

        for (let i = 0; i < pages.length; i += 1) {
          const page = pages[i];
          const images = Array.from(page.querySelectorAll("img"));
          await Promise.all(
            images.map(
              (img) =>
                new Promise<void>((resolve) => {
                  if (img.complete) {
                    resolve();
                  } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                  }
                })
            )
          );

          const canvas = await html2canvas(page, {
            backgroundColor: "#ffffff",
            scale: 4,
            useCORS: true,
            width: page.scrollWidth || page.clientWidth,
            height: page.scrollHeight || page.clientHeight,
            windowWidth: page.scrollWidth || page.clientWidth,
            windowHeight: page.scrollHeight || page.clientHeight,
          });

          addCanvasToPdf(canvas, i > 0);
        }

        pdf.save(`${plantInfo?.plantName || "plant-design"}.pdf`);
        toast.success("PDF export ready!");
      } finally {
        document.body.classList.remove("plant-exporting");
      }
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Failed to export PDF.");
      setIsGeneratingPreview(false);
    }
  };

  // Prepare and export complete plant data model
  const handleSaveDataModel = async () => {
    try {
      setShowComponentLibrary(false);
      setShowDataModel(true);
      const dataModel = buildDataModel();
      setPlantModelJson(JSON.stringify(dataModel, null, 2));
      console.log("Data Model:", dataModel);
      setIsGeneratingPreview(true);
      setPreviewImageUrl(null);
      const url = await captureCanvasSnapshot();
      setPreviewImageUrl(url);
    } catch (err) {
      setError("Failed to save data model. Please try again.");
      toast.error("Error saving data model.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSendShare = async () => {
    const twinId = Number((window as any).currentTwinId);
    if (!twinId || Number.isNaN(twinId)) {
      toast.error("No digital twin found. Save or reload the plant model first.");
      return;
    }
    if (!templateNameInput.trim()) {
      toast.error("Template name is required.");
      return;
    }

    createTemplateFromDigitalTwin({
      digitalTwinId: twinId,
      name: templateNameInput.trim(),
      description: templateDescriptionInput.trim() || undefined,
    })
      .then(() => {
        toast.success("Template shared successfully.");
        setShowShareModal(false);
        setTemplateNameInput("");
        setTemplateDescriptionInput("");
      })
      .catch((err) => {
        console.error("Failed to share template:", err);
        toast.error(err?.message || "Failed to share template.");
      });
  };

  const handleOpenTemplatesModal = async () => {
    if (step !== "builder") {
      setStep("builder");
    }
    setShowTemplatesModal(true);
    setInstantiateName(
      plantInfo?.plantName ? `${plantInfo.plantName} Digital Twin` : ""
    );
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error("Failed to load templates:", err);
      setTemplatesError(err?.message || "Failed to load templates.");
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (initialView === "templates") {
      handleOpenTemplatesModal();
    }
  }, [initialView]);

  const handleBrowseTemplates = () => {
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("plantId");
    const target = plantId
      ? `/plant-operator/plant-builder/builder/templates?plantId=${plantId}`
      : "/plant-operator/plant-builder/builder/templates";
    router.push(target);
  };

  const handleCloseTemplates = () => {
    if (initialView === "templates") {
      const params = new URLSearchParams(window.location.search);
      const plantId = params.get("plantId");
      const target = plantId
        ? `/plant-operator/plant-builder/builder?plantId=${plantId}`
        : "/plant-operator/plant-builder/builder";
      router.push(target);
      return;
    }
    setShowTemplatesModal(false);
  };

  const handleInstantiateTemplate = async (template: TemplateDto) => {
    const plantId = Number((window as any).currentPlantId);
    if (!plantId || Number.isNaN(plantId)) {
      toast.error("Create or load a plant before applying a template.");
      return;
    }
    const name = (instantiateName || template.name || "Digital Twin").trim();
    if (!name) {
      toast.error("Instance name is required.");
      return;
    }

    try {
      setIsApplyingTemplate(true);
      setShowTemplatesModal(false);
      setStep("loading");
      toast.info("Applying template. Please wait...");
      await instantiateTemplate(template.id, { plantId, name });
      toast.success("Template instantiated.");
      window.location.href = `/plant-operator/plant-builder/builder?plantId=${plantId}`;
    } catch (err: any) {
      console.error("Failed to instantiate template:", err);
      toast.error(err?.message || "Failed to instantiate template.");
      setStep("builder");
      setShowTemplatesModal(true);
    } finally {
      setIsApplyingTemplate(false);
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

  // Update plant model JSON for export
  const handleCanvasModelChange = (model: {
    components: PlacedComponent[];
    connections: Connection[];
  }) => {
    const derivedConnections = deriveGateEquipmentConnections(
      model.connections,
      model.components
    );
    const normalized = {
      components: model.components.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        category: c.category,
        position: c.position,
        data: c.data || {},
      })),
      connections: [
        ...model.connections.map((conn) => ({
          id: conn.id,
          from: conn.from,
          to: conn.to,
          data: conn.data || {},
        })),
        ...derivedConnections.map((c) => ({
          id: `derived-${c.from}-${c.to}-${c.via}`,
          from: c.from,
          to: c.to,
          data: { derived: true, via: c.via, sources: c.sourceIds },
        })),
      ],
    };

    setPlantModelJson(JSON.stringify(normalized, null, 2));
  };

  const toggleComponentLibrary = () => {
    setShowComponentLibrary((prev) => !prev);
  };

  const componentById = useMemo(
    () => new Map(normalizedComponents.map((c) => [String(c.id), c])),
    [normalizedComponents]
  );

  const getComponentLabel = (id: string) => {
    const component = componentById.get(String(id));
    if (!component) return `Unknown (ID ${id})`;
    return `${component.name} (ID ${component.id})`;
  };

  const renderComponentsSummaryTable = () => {
    const grouped = (["equipment", "carrier", "gate"] as const).map((type) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      items: normalizedComponents.filter((c) => c.type === type),
    }));

    const rows: Array<
      | { kind: "group"; label: string }
      | { kind: "empty"; label: string }
      | { kind: "item"; id: string; name: string; typeLabel: string }
    > = [];

    grouped.forEach((group) => {
      rows.push({ kind: "group", label: group.label });
      if (group.items.length === 0) {
        rows.push({ kind: "empty", label: group.label });
      } else {
        group.items.forEach((c) =>
          rows.push({
            kind: "item",
            id: String(c.id),
            name: c.name,
            typeLabel: group.label,
          })
        );
      }
    });

    const chunkRows = <T,>(data: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < data.length; i += size) {
        chunks.push(data.slice(i, i + size));
      }
      return chunks;
    };

    const MAX_COMPONENT_ROWS = 21;
    const pages = chunkRows(rows, MAX_COMPONENT_ROWS);

    return pages.map((pageRows, pageIndex) => (
      <section
        key={`components-page-${pageIndex}`}
        className="pdf-page rounded-lg border border-slate-200 p-6 shadow-sm"
      >
        <div className="pdf-header">
          <div className="text-lg font-semibold text-gray-800">Components</div>
        </div>
        <div className="w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4F8FF7]/10">
                  <TableHead className="font-semibold text-gray-700 text-sm">Component ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Component Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row, idx) => {
                  if (row.kind === "group") {
                    return (
                      <TableRow key={`group-${row.label}-${idx}`} className="bg-slate-50">
                        <TableCell colSpan={3} className="text-gray-700 text-sm font-semibold">
                          {row.label}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  if (row.kind === "empty") {
                    return (
                      <TableRow key={`empty-${row.label}-${idx}`}>
                        <TableCell colSpan={3} className="text-center text-gray-500 text-sm">
                          No {row.label.toLowerCase()} components
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={`item-${row.id}-${idx}`} className="hover:bg-[#4F8FF7]/5">
                      <TableCell className="text-gray-900 text-sm">{row.id}</TableCell>
                      <TableCell className="text-gray-900 text-sm">{row.name}</TableCell>
                      <TableCell className="text-gray-900 text-sm">{row.typeLabel}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    ));
  };

  const renderConnectionsTable = () => {
    const normalizeType = (type?: string) => (type || "").toLowerCase();
    const isEndpoint = (type?: string) => {
      const normalized = normalizeType(type);
      return normalized === "equipment" || normalized === "gate";
    };
    const isCarrier = (type?: string) => normalizeType(type) === "carrier";

    const outgoingByFrom = new Map<string, Connection[]>();
    uniqueConnections.forEach((conn) => {
      const key = String(conn.from);
      if (!outgoingByFrom.has(key)) outgoingByFrom.set(key, []);
      outgoingByFrom.get(key)!.push(conn);
    });

    const derivedPairs = new Map<string, { from: string; to: string }>();

    uniqueConnections.forEach((conn) => {
      const fromType = componentById.get(String(conn.from))?.type;
      const toType = componentById.get(String(conn.to))?.type;

      // Direct equipment/gate connections stay as-is.
      if (isEndpoint(fromType) && isEndpoint(toType)) {
        const key = `${conn.from}->${conn.to}`;
        derivedPairs.set(key, { from: String(conn.from), to: String(conn.to) });
        return;
      }

      // Collapse equipment/gate -> carrier -> equipment/gate
      if (isEndpoint(fromType) && isCarrier(toType)) {
        const carrierId = String(conn.to);
        const carrierOutgoing = outgoingByFrom.get(carrierId) || [];
        carrierOutgoing.forEach((next) => {
          const nextType = componentById.get(String(next.to))?.type;
          if (isEndpoint(nextType)) {
            const key = `${conn.from}->${next.to}`;
            derivedPairs.set(key, { from: String(conn.from), to: String(next.to) });
          }
        });
      }
    });

    const filteredConnections = Array.from(derivedPairs.values());

    const chunkRows = <T,>(data: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < data.length; i += size) {
        chunks.push(data.slice(i, i + size));
      }
      return chunks;
    };

    const MAX_CONNECTION_ROWS = 23;
    const pages = filteredConnections.length
      ? chunkRows(filteredConnections, MAX_CONNECTION_ROWS)
      : [[]];

    return pages.map((pageRows, pageIndex) => (
      <section
        key={`connections-page-${pageIndex}`}
        className="pdf-page rounded-lg border border-slate-200 p-6 shadow-sm"
      >
        <div className="pdf-header">
          <div className="text-lg font-semibold text-gray-800">Connections</div>
        </div>
        <div className="w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#4F8FF7]/10">
                  <TableHead className="font-semibold text-gray-700 text-sm">From</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-sm">To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500 text-sm">
                      No connections
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((c) => (
                    <TableRow key={`${c.from}->${c.to}`} className="hover:bg-[#4F8FF7]/5">
                      <TableCell className="text-gray-900 text-sm">{getComponentLabel(c.from)}</TableCell>
                      <TableCell className="text-gray-900 text-sm">{getComponentLabel(c.to)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    ));
  };

  const renderPlantInfoTable = () => (
    <div className="w-full">
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

          <div>
            <h1 className="text-base sm:text-lg font-semibold">
              {plantInfo ? plantInfo.plantName : "New Plant"}
            </h1>
            {plantInfo && (
              <p className="text-xs sm:text-sm opacity-80">{plantInfo.projectName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {step === "builder" && !showTemplatesModal && (
            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      size="sm"
                      className="h-8 text-xs border-[#4F8FF7] hover:bg-[#4F8FF7]/10"
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
              <Button
                onClick={handleRunComplianceCheck}
                disabled={isValidating || components.length === 0}
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                {isValidating ? "Checking..." : "Check Process Flow"}
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowExportModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Export Design
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveDataModel}
              >
                <Download className="h-4 w-4 mr-2" />
                Save Plant Model
              </Button>
            </div>
          )}
          {(step === "builder" || step === "compliance") && (
            <>
            {/*
              <Button
                variant="outline"
                className="text-sm border-[#4F8FF7] text-[#1d4ed8] hover:bg-[#4F8FF7]/10"
                onClick={handleBrowseTemplates}
              >
                Browse Templates
              </Button> 
              <Button
                className="text-sm bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowShareModal(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            */}
            </>
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
            {showTemplatesModal ? (
              <div className="absolute inset-0 z-30 bg-white flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Browse Templates</div>
                    <div className="text-xs text-gray-500">
                      Select a template to instantiate for this plant.
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleCloseTemplates}>
                    Close
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Digital Twin Name</Label>
                      <Input
                        value={instantiateName}
                        onChange={(e) => setInstantiateName(e.target.value)}
                        placeholder="Name for the instantiated digital twin"
                      />
                    </div>
                    {templatesLoading ? (
                      <div className="text-sm text-gray-500">Loading templates…</div>
                    ) : templatesError ? (
                      <div className="text-sm text-red-600">{templatesError}</div>
                    ) : isApplyingTemplate ? (
                      <div className="text-sm text-gray-500">Applying template…</div>
                    ) : templates.length === 0 ? (
                      <div className="text-sm text-gray-500">No templates available.</div>
                    ) : (
                      <div className="space-y-3">
                        {templates.map((template) => {
                          const stats = getTemplateStats(template);

                          return (
                            <div
                              key={template.id}
                              className="rounded-lg border border-slate-200 p-4 bg-white"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {template.name}
                                  </div>
                                  {template.description && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {template.description}
                                    </div>
                                  )}
                                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>Components: <span className="font-semibold text-gray-900">{stats.total}</span></div>
                                    <div>Connections: <span className="font-semibold text-gray-900">{stats.connections}</span></div>
                                    <div>Equipment: <span className="font-semibold text-gray-900">{stats.equipment}</span></div>
                                    <div>Carriers: <span className="font-semibold text-gray-900">{stats.carrier}</span></div>
                                    <div>Gates: <span className="font-semibold text-gray-900">{stats.gate}</span></div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Button
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => {
                                    setPreviewTemplate(template);
                                    setPreviewZoom(1);
                                    }}
                                  >
                                    Preview
                                  </Button>
                                  <Button
                                    className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-xs"
                                    onClick={() => handleInstantiateTemplate(template)}
                                    disabled={isApplyingTemplate}
                                  >
                                    {isApplyingTemplate ? "Applying..." : "Use Template"}
                                  </Button>
                                </div>
                              </div>
                              <section className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-gray-800">
                                  Process Flow Diagram
                                </div>
                                <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white">
                                  {templatePreviewImages[template.id] ? (
                                    <img
                                      src={templatePreviewImages[template.id]}
                                      alt={`${template.name} preview`}
                                      className="w-full h-auto rounded-md border border-gray-200 bg-white"
                                    />
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      Generating preview…
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span>Preview only. You can export it as image for better visualization.</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = templatePreviewImages[template.id];
                                      if (!url) return;
                                      const link = document.createElement("a");
                                      link.href = url;
                                      link.download = `${template.name || "template"}-preview.png`;
                                      link.click();
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    Export image
                                  </button>
                                </div>
                              </section>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`absolute top-0 right-0 bottom-0 min-h-0 transition-all duration-300 ease-in-out ${
                showComponentLibrary ? "sm:left-[384px] left-0" : "left-0"
              }`}>
                <Canvas
                  components={components}
                  setComponents={setComponents}
                  connections={connections}
                  setConnections={setConnections}
                  onConnect={onConnect}  // PASSED
                  onModelChange={handleCanvasModelChange}
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
            )}
            {/* Sidebar Container (overlay; does not shift canvas) */}
            {!showTemplatesModal && !showDataModel && (
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
            )}

            {!showTemplatesModal && validationResult && showValidationPanel && (
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
              />
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

      <Dialog open={showDataModel} onOpenChange={setShowDataModel}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Plant Data Model</DialogTitle>
          </DialogHeader>
          <div id="plant-data-export" className="space-y-6 p-4 bg-white">
            <section className="pdf-page rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="pdf-header">
                <div className="pdf-title">{plantInfo?.plantName || "Plant Model Report"}</div>
                <div className="pdf-subtitle">
                  Generated {new Date().toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                This report summarizes the plant model layout, components, and connections.
              </div>
            </section>

            <section className="pdf-page rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="pdf-header">
                <div className="text-lg font-semibold text-gray-800">Process Flow Diagram</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {isGeneratingPreview ? (
                  <div className="text-sm text-gray-500">Generating preview…</div>
                ) : previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Plant model preview"
                    className="w-full h-auto rounded-md border border-gray-200 bg-white"
                  />
                ) : (
                  <div className="text-sm text-gray-500">Preview unavailable.</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can export it as image for better visualization.
              </p>
            </section>

            <section className="pdf-page rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="pdf-header">
                <div className="text-lg font-semibold text-gray-800">Plant Information</div>
              </div>
              {renderPlantInfoTable()}
            </section>

            {renderComponentsSummaryTable()}

            {renderConnectionsTable()}
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
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => setShowDataModel(false)}
                >
                  Close
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

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Export Plant Model Diagram as Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Template Name</Label>
              <Input
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description (optional)</Label>
              <Textarea
                value={templateDescriptionInput}
                onChange={(e) => setTemplateDescriptionInput(e.target.value)}
                placeholder="Describe this template"
                className="min-h-[90px]"
              />
            </div>
            <p className="text-xs text-gray-500">
              This will publish the digital twin as a template.
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowShareModal(false)} disabled={isSharingPlant}>
              Cancel
            </Button>
            <Button
              className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white"
              onClick={handleSendShare}
              disabled={isSharingPlant}
            >
              {isSharingPlant ? "Sharing..." : "Share"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-3xl bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Export Plant Design
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm text-slate-600">
            <p>
              High-resolution export with title header, diagram, and stream color legend — each
              in its own area, no overlap.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={async () => {
                  setShowExportModal(false);
                  await handleExportCanvasImage();
                }}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="text-base font-semibold text-slate-900">PNG</div>
                <div className="mt-1 text-xs text-slate-500">4x hi-res</div>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowExportModal(false);
                  await handleExportPDF();
                }}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="text-base font-semibold text-slate-900">PDF</div>
                <div className="mt-1 text-xs text-slate-500">A3 print-ready</div>
              </button>
              <button
                type="button"
                onClick={() => toast("GIF export is coming soon.")}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-slate-400 shadow-sm"
              >
                <div className="text-base font-semibold">GIF</div>
                <div className="mt-1 text-xs">Animated flows</div>
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Included in export
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                <li>System boundary & all gates</li>
                <li>Equipment with specifications</li>
                <li>Carriers with stream types</li>
                <li>Flow values on all connections</li>
                <li>Stream color legend (separate panel)</li>
                <li>Flow animations (GIF only)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="max-w-none w-screen h-screen bg-white rounded-none overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {previewTemplate?.name || "Template Preview"}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate?.template_json?.components?.length ? (
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-600">
                  Zoom: {(previewZoom * 100).toFixed(0)}%
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={previewZoom}
                  onChange={(e) => setPreviewZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-h-0 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="inline-block" style={{ padding: 32 }}>
                  <div
                    className="inline-block"
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {templatePreviewImages[previewTemplate.id] ? (
                      <img
                        src={templatePreviewImages[previewTemplate.id]}
                        alt={`${previewTemplate.name} preview`}
                        className="w-auto h-auto max-w-none rounded-md border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">Generating preview…</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No preview data available.</div>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        ref={templatePreviewRef}
        className="fixed -left-[10000px] top-0 bg-white p-6"
        aria-hidden
      >
        {templatePreviewTarget && (
          <div className="w-full h-full">
            {renderTemplatePreviewCanvas(templatePreviewTarget)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantBuilder;
