// src/components/plant-builder/ComponentLibrary.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ⬇️ import API helper
import type { EquipmentPortsDto } from "@/services/plant-builder/componentDefinitions";
import {
  fetchComponentLibraryFromApi,
  fetchComponentPorts,
} from "@/services/plant-builder/componentDefinitions";

// === TYPES (same as before) ===
export type ComponentType = "equipment" | "carrier" | "gate";

export type TechnicalData = {
  input?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  output?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  efficiency?: number;
  capacity?: { value: number; unit: "MWh/h" | "Ton/h" };
};

export type Metadata = {
  manufacturer?: string;
  commercialOperatingDate?: string;
};

export type CarrierData = {
  product?: string;
  fuelType?: string;
  fuelClass?: string;
  certificationStatus?: string;
  temperature?: number;
  pressure?: number;
};

export type GateData = {
  inputOrOutput: "input" | "output";
  product?: string;
  input?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  output?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  efficiency?: number;
  sourceType?: string;
  sourceOrigin?: string;
  sourceCertification?: string;
  endUse?: string;
  sinkType?: string;
};

export type ComponentData = {
  id: string;
  definitionId?: number;
  type: ComponentType;
  name: string;
  category: string;
  icon: string;
  technicalData?: TechnicalData;
  metadata?: Metadata;
  carrierData?: CarrierData;
  gateData?: GateData;
};

type ComponentLibraryJSON = {
  equipment: ComponentData[];
  carrier: ComponentData[];
  gate: ComponentData[];
};

let cachedLibrary: ComponentLibraryJSON | null = null;
let cachedError: string | null = null;
let inflight: Promise<ComponentLibraryJSON> | null = null;

// === TAILWIND COLORS ===
const layerStyles = {
  equipment: {
    dot: "bg-blue-500",
    border: "border-blue-300",
    hover: "hover:border-blue-500 hover:bg-blue-50",
  },
  carrier: {
    dot: "bg-green-500",
    border: "border-green-300",
    hover: "hover:border-green-500 hover:bg-green-50",
  },
  gate: {
    dot: "bg-purple-500",
    border: "border-purple-300",
    hover: "hover:border-purple-500 hover:bg-purple-50",
  },
};

const ComponentLibrary = () => {
  const [searchTerms, setSearchTerms] = useState({
    equipment: "",
    carrier: "",
    gate: "",
  });
  const [activeTab, setActiveTab] = useState<ComponentType>("equipment");
  const [portSummaryByDefinitionId, setPortSummaryByDefinitionId] = useState<
    Record<number, { inRequired: number; inOptional: number; outRequired: number; outOptional: number }>
  >({});
  const [portDetailsByDefinitionId, setPortDetailsByDefinitionId] = useState<
    Record<number, EquipmentPortsDto>
  >({});
  const [activePortDetail, setActivePortDetail] = useState<number | null>(null);

  const [library, setLibrary] = useState<ComponentLibraryJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensurePortDetail = async (definitionId: number) => {
    if (portDetailsByDefinitionId[definitionId]) return;
    try {
      const payload = await fetchComponentPorts(definitionId);
      const summary = payload.ports.reduce(
        (acc, port) => {
          if (port.direction === "IN") {
            if (port.requirement === "REQUIRED") acc.inRequired += 1;
            else acc.inOptional += 1;
          } else {
            if (port.requirement === "REQUIRED") acc.outRequired += 1;
            else acc.outOptional += 1;
          }
          return acc;
        },
        { inRequired: 0, inOptional: 0, outRequired: 0, outOptional: 0 }
      );
      setPortSummaryByDefinitionId((prev) => ({ ...prev, [definitionId]: summary }));
      setPortDetailsByDefinitionId((prev) => ({ ...prev, [definitionId]: payload }));
    } catch (err) {
      console.error("Failed to load ports:", err);
    }
  };

  // 🔐 Load components from backend (needs Bearer token)
  useEffect(() => {
    let isMounted = true;

    async function loadLibrary() {
      try {
        if (cachedLibrary) {
          const hasMissingDefinition = cachedLibrary.equipment?.some(
            (comp) => typeof comp.definitionId !== "number"
          );
          if (!hasMissingDefinition) {
            setLibrary(cachedLibrary);
            setError(cachedError);
            setLoading(false);
            return;
          }
          cachedLibrary = null;
          cachedError = null;
        }
        setLoading(true);
        if (!inflight) {
          inflight = fetchComponentLibraryFromApi();
        }
        const data = await inflight;
        if (!isMounted) return;
        cachedLibrary = data;
        cachedError = null;
        setLibrary(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load component library:", err);
        if (!isMounted) return;
        const msg = err?.message || "Failed to load component library from server.";
        cachedError = msg;
        setError(msg);
      } finally {
        inflight = null;
        if (isMounted) setLoading(false);
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!library?.equipment?.length) return;
    let isMounted = true;

    const loadSummaries = async () => {
      const pending = library.equipment
        .map((comp) => comp.definitionId)
        .filter((id): id is number => typeof id === "number")
        .filter((id) => !(id in portSummaryByDefinitionId));

      if (!pending.length) return;

      try {
        const results = await Promise.all(
          pending.map(async (id) => {
            const payload = await fetchComponentPorts(id);
            const summary = payload.ports.reduce(
              (acc, port) => {
                if (port.direction === "IN") {
                  if (port.requirement === "REQUIRED") acc.inRequired += 1;
                  else acc.inOptional += 1;
                } else {
                  if (port.requirement === "REQUIRED") acc.outRequired += 1;
                  else acc.outOptional += 1;
                }
                return acc;
              },
              { inRequired: 0, inOptional: 0, outRequired: 0, outOptional: 0 }
            );
            return { id, summary, payload };
          })
        );

        if (!isMounted) return;
        setPortSummaryByDefinitionId((prev) => {
          const next = { ...prev };
          results.forEach((result) => {
            next[result.id] = result.summary;
          });
          return next;
        });
        setPortDetailsByDefinitionId((prev) => {
          const next = { ...prev };
          results.forEach((result) => {
            next[result.id] = result.payload;
          });
          return next;
        });
      } catch (err) {
        console.error("Failed to load equipment port summary:", err);
      }
    };

    loadSummaries();

    return () => {
      isMounted = false;
    };
  }, [library, portSummaryByDefinitionId]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    component: ComponentData
  ) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  const groupByCategory = (components: ComponentData[]) => {
    return components.reduce((acc, comp) => {
      (acc[comp.category] = acc[comp.category] || []).push(comp);
      return acc;
    }, {} as Record<string, ComponentData[]>);
  };

  const sortByName = (a: ComponentData, b: ComponentData) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  const renderLayer = (
    type: ComponentType,
    components: ComponentData[],
    title: string
  ) => {
    const style = layerStyles[type];
    const searchValue = searchTerms[type];
    const normalizedSearch = searchValue.trim().toLowerCase();
    const filteredComponents = normalizedSearch
      ? components.filter((component) => {
          const name = component.name.toLowerCase();
          const category = component.category.toLowerCase();
          return name.includes(normalizedSearch) || category.includes(normalizedSearch);
        })
      : components;
    const grouped = groupByCategory(filteredComponents);
    const sortedCategories = Object.entries(grouped).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return (
      <div className="space-y-3">
        <Input
          value={searchValue}
          onChange={(e) =>
            setSearchTerms((prev) => ({ ...prev, [type]: e.target.value }))
          }
          placeholder={`Search ${title.toLowerCase()}`}
          className="h-8 text-xs"
        />
        {sortedCategories.map(([category, items]) => {
          const normalized = category.trim().toLowerCase();
          const hideCategory =
            (type === "equipment" && (normalized === "equipment" || normalized === "equipments")) ||
            (type === "carrier" && (normalized === "carrier" || normalized === "carriers")) ||
            (type === "gate" && (normalized === "gate" || normalized === "gates"));
          const sortedItems = [...items].sort(sortByName);
          return (
            <div key={category} className="space-y-2">
              {!hideCategory && (
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </div>
              )}
              <div className="space-y-1.5">
                {sortedItems.map((component) => {
                  const summary =
                    typeof component.definitionId === "number"
                      ? portSummaryByDefinitionId[component.definitionId]
                      : undefined;
                  const detail =
                    typeof component.definitionId === "number"
                      ? portDetailsByDefinitionId[component.definitionId]
                      : undefined;
                  const isActive = activePortDetail === component.definitionId;
                  const renderPortList = (direction: "IN" | "OUT") => {
                    if (!detail) {
                      return (
                        <div className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-500">
                          Ports are still loading.
                        </div>
                      );
                    }
                    const ports = detail.ports.filter((p) => p.direction === direction);
                    if (!ports.length) {
                      return (
                        <div className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-500">
                          No {direction === "IN" ? "inputs" : "outputs"} defined.
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-700 space-y-2">
                        {ports.map((port) => {
                          const carriers = port.carriers || [];
                          return (
                            <div key={`${component.id}-${direction}-${port.id}`} className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate" title={port.port_label}>
                                  {port.port_label || `Port ${port.port_id || port.id}`}
                                </span>
                                <span className={`text-[10px] font-semibold ${port.requirement === "REQUIRED" ? "text-rose-600" : "text-slate-500"}`}>
                                  {port.requirement === "REQUIRED" ? "Required" : "Optional"}
                                </span>
                              </div>
                              <select
                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-700"
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  {carriers.length ? "Allowed carriers" : "All carriers allowed"}
                                </option>
                                {carriers.map((carrier) => (
                                  <option key={`${port.id}-${carrier.id}`} value={carrier.name}>
                                    {carrier.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    );
                  };
                  return (
                  <Card
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className={`p-2 cursor-move border ${style.border} ${style.hover} transition-all text-sm rounded-md shadow-sm`}
                  >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="font-medium whitespace-normal break-words leading-snug"
                          title={component.name}
                        >
                          {component.name}
                        </div>
                      {type === "equipment" && typeof component.definitionId === "number" && (
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          title="View ports"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (typeof component.definitionId !== "number") return;
                            const definitionId = component.definitionId;
                            await ensurePortDetail(definitionId);
                            setActivePortDetail((prev): number | null =>
                              prev === definitionId ? null : definitionId
                            );
                          }}
                        >
                          <Plug className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {type === "equipment" && typeof component.definitionId === "number" && (
                      <div className="mt-2 space-y-2">
                        {isActive && renderPortList("IN")}
                        {isActive && renderPortList("OUT")}
                      </div>
                    )}
                  </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // === UI states ===
  if (loading) {
    return (
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-bold text-base">Component Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Loading components…
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="p-3 space-y-4 animate-pulse">
            {["Equipment", "Carriers", "Gates"].map((label, idx) => (
              <div key={`${label}-${idx}`} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </div>
                <div className="h-8 bg-slate-100 rounded" />
                <div className="space-y-2">
                  <div className="h-10 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-bold text-base">Component Library</h2>
          <p className="text-xs text-destructive mt-0.5">
            {error || "Unable to load component library."}
          </p>
        </div>
      </div>
    );
  }

  const { equipment, carrier, gate } = library;

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-bold text-base">Component Library</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag to canvas
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ComponentType)}
        className="flex-1 flex flex-col"
      >
        <div className="px-3 pt-3">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger
              value="equipment"
              className="gap-1.5 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 border border-blue-700 shrink-0" />
              Equipment
            </TabsTrigger>
            <TabsTrigger
              value="carrier"
              className="gap-1.5 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-green-600 border border-green-700 shrink-0" />
              Carrier
            </TabsTrigger>
            <TabsTrigger
              value="gate"
              className="gap-1.5 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 data-[state=active]:shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600 border border-purple-700 shrink-0" />
              Gate
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3">
            <TabsContent value="equipment" className="m-0">
              {renderLayer("equipment", equipment, "Equipment")}
            </TabsContent>
            <TabsContent value="carrier" className="m-0">
              {renderLayer("carrier", carrier, "Carriers")}
            </TabsContent>
            <TabsContent value="gate" className="m-0">
              {renderLayer("gate", gate, "Gates")}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ComponentLibrary;
