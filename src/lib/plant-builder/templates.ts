// Pure helpers for the template library: filtering, stats and diagram layout.
// No React and no I/O, so they are trivially testable.

import type { Option } from "@/constants/plant-builder";
import type {
  TemplateDto,
  TemplateEdge,
  TemplateNode,
  TemplateTopology,
} from "@/services/plant-builder/templates";

// ─── Labels ──────────────────────────────────────────────────────────────────

export function optionLabel(
  options: Option[],
  value: string | null | undefined
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

// ─── Edges ───────────────────────────────────────────────────────────────────

// v1 templates repeat every edge once per endpoint; key edges the same way the
// backend and the equation engine do.
function uniqueEdges(edges: TemplateEdge[] = []): TemplateEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = `${edge.from}->${edge.to}:${edge.port_id ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export type TemplateStats = {
  components: number;
  equipment: number;
  carriers: number;
  gates: number;
  connections: number;
};

export function templateStats(template: TemplateDto): TemplateStats {
  const components = template.template_json?.components ?? [];
  const count = (type: string) =>
    components.filter((c) => c.type === type).length;
  return {
    components: components.length,
    equipment: count("equipment"),
    carriers: count("carrier"),
    gates: count("gate"),
    connections: uniqueEdges(template.template_json?.connections).length,
  };
}

// ─── Filtering ───────────────────────────────────────────────────────────────

export type TemplateScope = "all" | "mine";

export type TemplateFilters = {
  scope: TemplateScope;
  category: string | null;
  pathway: string | null;
  search: string;
};

export const EMPTY_TEMPLATE_FILTERS: TemplateFilters = {
  scope: "all",
  category: null,
  pathway: null,
  search: "",
};

export function hasActiveFilters(filters: TemplateFilters): boolean {
  return (
    filters.category !== null ||
    filters.pathway !== null ||
    filters.search.trim() !== ""
  );
}

export function filterTemplates(
  templates: TemplateDto[],
  filters: TemplateFilters,
  mineIds: ReadonlySet<number>
): TemplateDto[] {
  const term = filters.search.trim().toLowerCase();
  return templates.filter((t) => {
    if (filters.scope === "mine" && !mineIds.has(t.id)) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.pathway && t.pathway !== filters.pathway) return false;
    if (!term) return true;
    return [t.name, t.description, t.creator?.email, t.creator?.name]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(term));
  });
}

// ─── Diagram layout ──────────────────────────────────────────────────────────

export type DiagramNodeKind = "equipment" | "carrier" | "gate" | "other";

export type DiagramNode = {
  id: string;
  name: string;
  kind: DiagramNodeKind;
  /** Top-left corner, in canvas units. */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DiagramEdge = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type DiagramLayout = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewBox: { x: number; y: number; width: number; height: number };
};

// Canvas footprints of each node kind, so a diagram reads like the builder.
const NODE_SIZE: Record<DiagramNodeKind, { width: number; height: number }> = {
  equipment: { width: 224, height: 144 },
  carrier: { width: 144, height: 144 },
  gate: { width: 192, height: 288 },
  other: { width: 192, height: 128 },
};

const GRID_CELL = { width: 320, height: 340 };
const VIEW_PADDING = 64;

function nodeKind(type: string | null | undefined): DiagramNodeKind {
  return type === "equipment" || type === "carrier" || type === "gate"
    ? type
    : "other";
}

function hasPosition(node: TemplateNode): boolean {
  return (
    !!node.position &&
    Number.isFinite(node.position.x) &&
    Number.isFinite(node.position.y)
  );
}

type Point = { x: number; y: number };

function center(node: DiagramNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

// Where the segment from `node`'s centre towards `toward` leaves the node's
// outline — so edges end at the border and their arrowheads stay visible.
function boundaryPoint(node: DiagramNode, toward: Point): Point {
  const c = center(node);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;

  if (node.kind === "carrier") {
    const r = node.width / 2;
    const len = Math.hypot(dx, dy);
    return { x: c.x + (dx / len) * r, y: c.y + (dy / len) * r };
  }

  const scale = Math.min(
    dx === 0 ? Infinity : node.width / 2 / Math.abs(dx),
    dy === 0 ? Infinity : node.height / 2 / Math.abs(dy)
  );
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

/**
 * Lays a template out in canvas units. Uses the saved positions when every
 * component has one; otherwise falls back to a square grid. Returns null when
 * there is nothing to draw.
 */
export function layoutTemplateDiagram(
  topology: TemplateTopology | undefined
): DiagramLayout | null {
  const components = topology?.components ?? [];
  if (components.length === 0) return null;

  const usePositions = components.every(hasPosition);
  const columns = Math.ceil(Math.sqrt(components.length));

  const nodes: DiagramNode[] = components.map((component, index) => {
    const kind = nodeKind(component.type);
    const size = NODE_SIZE[kind];
    const origin = usePositions
      ? component.position!
      : {
          x: (index % columns) * GRID_CELL.width,
          y: Math.floor(index / columns) * GRID_CELL.height,
        };
    return {
      id: String(component.id),
      name: component.name?.trim() || "Unnamed",
      kind,
      x: origin.x,
      y: origin.y,
      ...size,
    };
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: DiagramEdge[] = [];
  uniqueEdges(topology?.connections).forEach((edge, index) => {
    const from = byId.get(String(edge.from));
    const to = byId.get(String(edge.to));
    if (!from || !to || from === to) return;
    const start = boundaryPoint(from, center(to));
    const end = boundaryPoint(to, center(from));
    edges.push({
      id: edge.id ?? `edge-${index}`,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    });
  });

  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));

  return {
    nodes,
    edges,
    viewBox: {
      x: minX - VIEW_PADDING,
      y: minY - VIEW_PADDING,
      width: maxX - minX + VIEW_PADDING * 2,
      height: maxY - minY + VIEW_PADDING * 2,
    },
  };
}
