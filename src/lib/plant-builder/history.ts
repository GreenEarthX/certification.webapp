import type { Connection, PlacedComponent } from "@/app/plant-operator/plant-builder/types";

export type HistorySnapshot = {
  components: PlacedComponent[];
  connections: Connection[];
};

// Deep clone helper for history snapshots (safe for plain data objects).
export const cloneSnapshot = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const createSnapshot = (
  components: PlacedComponent[],
  connections: Connection[]
): HistorySnapshot => cloneSnapshot({ components, connections });
