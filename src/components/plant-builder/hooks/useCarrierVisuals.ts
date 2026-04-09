import { useMemo } from "react";
import type { Connection as ConnectionType, PlacedComponent as PlacedComponentType } from "@/app/plant-operator/plant-builder/types";

type CarrierLegendItem = { name: string; color: string };

const DEFAULT_CARRIER_FLOW_COLOR = "#10B981";
const COLOR_ELECTRICITY = "#FBBF24";
const COLOR_WATER = "#38BDF8";
const COLOR_HYDROGEN = "#22C55E";
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

const LEGEND_EXCLUSIONS = new Set<string>();

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

export const getCarrierTypeKey = (comp?: PlacedComponentType | null) => {
  if (!comp) return "";
  const raw =
    typeof comp.data?.product === "string"
      ? comp.data.product
      : comp.name;
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
};

export const useCarrierVisuals = (
  components: PlacedComponentType[],
  connections: ConnectionType[],
  extraCarrierNames: string[] = []
) => {
  const carrierColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const carrierComponents = components.filter((comp) => comp.type === "carrier");
    const uniqueKeys = Array.from(
      new Set([
        ...carrierComponents
          .map((comp) => getCarrierTypeKey(comp))
          .filter((key) => Boolean(key)),
        ...extraCarrierNames.map((name) => name.trim().toLowerCase()).filter(Boolean),
      ])
    );
    uniqueKeys.forEach((key, index) => {
      const normalized = key.toLowerCase();
      if (normalized.includes("electric")) {
        map.set(key, COLOR_ELECTRICITY);
        return;
      }
      if (normalized.includes("water")) {
        map.set(key, COLOR_WATER);
        return;
      }
      if (normalized.includes("hydrogen") || normalized === "h2") {
        map.set(key, COLOR_HYDROGEN);
        return;
      }
      map.set(key, CARRIER_FLOW_PALETTE[index % CARRIER_FLOW_PALETTE.length]);
    });

    return map;
  }, [components]);

  const carrierLegendItemsAll: CarrierLegendItem[] = useMemo(() => {
    const uniqueNames = new Map<string, string>();
    components
      .filter((comp) => comp.type === "carrier")
      .forEach((comp) => {
        const key = getCarrierTypeKey(comp);
        if (!key) return;
        const name =
          (typeof comp.data?.product === "string" && comp.data.product) || comp.name || key;
        if (!uniqueNames.has(key)) {
          uniqueNames.set(key, name);
        }
      });

    extraCarrierNames.forEach((raw) => {
      const key = raw.trim().toLowerCase();
      if (!key || uniqueNames.has(key)) return;
      uniqueNames.set(key, raw);
    });

    return Array.from(carrierColorMap.entries()).map(([key, color]) => ({
      name: uniqueNames.get(key) || key,
      color,
    }));
  }, [carrierColorMap, components, extraCarrierNames]);

  const carrierLegendItems: CarrierLegendItem[] = useMemo(
    () =>
      carrierLegendItemsAll.filter((item) => {
        const key = item.name.toLowerCase();
        return !LEGEND_EXCLUSIONS.has(key);
      }),
    [carrierLegendItemsAll]
  );

  const connectionColors = useMemo(() => {
    const componentById = new Map(components.map((comp) => [comp.id, comp]));
    const map = new Map<string, string>();
    connections.forEach((conn) => {
      const fromComp = componentById.get(conn.from);
      const toComp = componentById.get(conn.to);
      let carrierKey = "";
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
      }
    });
    return map;
  }, [carrierColorMap, components, connections]);

  const connectionDashed = useMemo(() => {
    const componentById = new Map(components.map((comp) => [comp.id, comp]));
    const map = new Map<string, boolean>();
    const isElectric = (key: string) => key.includes("electric");

    connections.forEach((conn) => {
      const fromComp = componentById.get(conn.from);
      const toComp = componentById.get(conn.to);
      let carrierKey = "";
      if (fromComp?.type === "carrier") {
        carrierKey = getCarrierTypeKey(fromComp);
      } else if (toComp?.type === "carrier") {
        carrierKey = getCarrierTypeKey(toComp);
      }
      if (!carrierKey) {
        const typeKey = typeof conn.type === "string" ? conn.type.trim().toLowerCase() : "";
        if (typeKey) carrierKey = typeKey;
      }

      if (carrierKey) {
        map.set(conn.id, isElectric(carrierKey));
      }
    });

    return map;
  }, [components, connections]);

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
      }
    });

    const labelMap = new Map<string, string>();
    connections.forEach((conn) => {
      const base = baseById.get(conn.id);
      const derived = derivedById.get(conn.id);
      const display = derived ?? base;
      if (!display) return;
      const displayQuantity = display.quantity;
      if (displayQuantity == null) return;
      const displayUnit = display.unit;
      const label = `${formatQuantity(displayQuantity)}${displayUnit ? ` ${displayUnit}` : ""}`;
      labelMap.set(conn.id, label);
    });

    return labelMap;
  }, [components, connections]);

  return {
    carrierColorMap,
    carrierLegendItems,
    carrierLegendItemsAll,
    connectionColors,
    connectionLabels,
    connectionDashed,
  };
};
