import {
  DASH,
  DIAGRAM,
  IMPACT_STYLE,
  componentText,
  flowText,
  priceText,
} from "./format";
import type { BoundaryStreamRow, ReportMetadata } from "./types";

/**
 * Layout engine for the two system-boundary illustrations.
 *
 * Pure: no DOM, no jsPDF, no colours decided at draw time. It returns absolutely
 * positioned primitives in an abstract coordinate space, which the on-screen SVG
 * and the PDF renderer each map into their own units. Neither owns geometry, so
 * the printed document and the preview cannot drift.
 */

export interface RectPrim {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Corner radius; 0 for a square corner. */
  r: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
}

export interface LinePrim {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}

/** Filled triangle with its tip at (x, y), pointing right. */
export interface ArrowheadPrim {
  kind: "arrowhead";
  x: number;
  y: number;
  size: number;
  fill: string;
}

export interface TextPrim {
  kind: "text";
  /** Anchor point; y is the baseline, as in both SVG and jsPDF. */
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  bold: boolean;
  anchor: "start" | "middle" | "end";
  /** Extra letter spacing, in the same units as `size`. */
  tracking: number;
}

export type Primitive = RectPrim | LinePrim | ArrowheadPrim | TextPrim;

export interface Diagram {
  width: number;
  height: number;
  items: Primitive[];
  /** Streams illustration B leaves out, by reason. Zero for illustration A. */
  omitted: { neutral: number; unpriced: number };
}

// ────────────────────────────── shared geometry ────────────────────────────

const W = 1000;
const TITLE_Y = 28;
const TITLE_SIZE = 17;

/** Illustration A draws one arrow per stream; beyond this it summarises. */
const MAX_ROWS_PER_SIDE = 14;
/** Illustration B draws one card per priced stream; beyond this it summarises. */
const MAX_CARDS_PER_SIDE = 10;

const truncate = (s: string, max: number) =>
  s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;

const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  o: Partial<Omit<RectPrim, "kind" | "x" | "y" | "w" | "h">> = {}
): RectPrim => ({
  kind: "rect",
  x,
  y,
  w,
  h,
  r: o.r ?? 0,
  fill: o.fill ?? null,
  stroke: o.stroke ?? null,
  strokeWidth: o.strokeWidth ?? 1,
});

const text = (
  x: number,
  y: number,
  value: string,
  o: Partial<Omit<TextPrim, "kind" | "x" | "y" | "text">> = {}
): TextPrim => ({
  kind: "text",
  x,
  y,
  text: value,
  color: o.color ?? DIAGRAM.body,
  size: o.size ?? 12,
  bold: o.bold ?? false,
  anchor: o.anchor ?? "start",
  tracking: o.tracking ?? 0,
});

/** A horizontal arrow whose head lands exactly on `x2`. */
const arrow = (
  x1: number,
  x2: number,
  y: number,
  width: number,
  head: number
): Primitive[] => [
  {
    kind: "line",
    x1,
    y1: y,
    x2: x2 - head,
    y2: y,
    stroke: DIAGRAM.arrow,
    strokeWidth: width,
  },
  { kind: "arrowhead", x: x2, y, size: head, fill: DIAGRAM.arrow },
];

const processBox = (
  x: number,
  y: number,
  w: number,
  h: number
): Primitive[] => [
  rect(x, y, w, h, {
    r: 13,
    fill: DIAGRAM.boxFill,
    stroke: DIAGRAM.boxStroke,
    strokeWidth: 2,
  }),
  text(x + w / 2, y + h / 2 + 6, "PROCESS", {
    color: DIAGRAM.boxStroke,
    size: 17,
    bold: true,
    anchor: "middle",
    tracking: 4.5,
  }),
];

const title = (value: string): TextPrim =>
  text(W / 2, TITLE_Y, value, {
    color: DIAGRAM.heading,
    size: TITLE_SIZE,
    bold: true,
    anchor: "middle",
    tracking: 1.6,
  });

const impactOf = (row: BoundaryStreamRow) =>
  IMPACT_STYLE[row.economic_impact] ?? IMPACT_STYLE[DASH];

// ───────────── Illustration A — system boundary operations overview ────────

/** Molecule lines drawn per stream before the rest are summarised. */
const MAX_MOLECULES = 4;
const LINE_H = 16;
const ROW_GAP = 26;
const BOX_LEFT = 425;
const BOX_W = 150;
const BOX_RIGHT = BOX_LEFT + BOX_W;
// Wide enough for the connector quantity to sit on the arrow without touching
// either the stream label or the process box.
const LANE_LEFT_START = 305;
const LANE_RIGHT_END = 695;
const ARROW_W = 3;
const ARROW_HEAD = 11;

interface SideRows {
  rows: BoundaryStreamRow[];
  overflow: number;
}

const splitSide = (rows: BoundaryStreamRow[], max: number): SideRows => ({
  rows: rows.slice(0, max),
  overflow: Math.max(0, rows.length - max),
});

/**
 * The lines one stream label carries: the carrier, then one line per molecule
 * the carrier declares a flow for. Molecules are never summed into a single
 * figure — see StreamComponent — so they are listed.
 */
function labelLines(row: BoundaryStreamRow): string[] {
  const shown = row.components.slice(0, MAX_MOLECULES).map(componentText);
  const hidden = row.components.length - shown.length;
  if (hidden > 0) shown.push(`+${hidden} more`);
  // A stream whose carrier declares no flow still gets a line, so the reader
  // sees the stream exists and that its quantity is missing.
  return shown.length ? shown : [DASH];
}

const rowHeight = (row: BoundaryStreamRow) =>
  18 + labelLines(row).length * LINE_H;

export function buildSystemBoundaryDiagram(
  streams: BoundaryStreamRow[],
  metadata: ReportMetadata
): Diagram {
  const left = splitSide(
    streams.filter((s) => s.direction === "upstream"),
    MAX_ROWS_PER_SIDE
  );
  const right = splitSide(
    streams.filter((s) => s.direction !== "upstream"),
    MAX_ROWS_PER_SIDE
  );

  const sideHeight = (side: SideRows) => {
    const rows = side.rows.reduce((sum, r) => sum + rowHeight(r) + ROW_GAP, 0);
    return rows + (side.overflow ? LINE_H + ROW_GAP : 0);
  };

  const boxTop = 62;
  const tallest = Math.max(sideHeight(left), sideHeight(right), 0);
  const boxH = Math.max(170, tallest + 24);

  const items: Primitive[] = [
    title("SYSTEM BOUNDARIES (MATERIAL, ENERGY & UTILITY STREAMS)"),
    ...processBox(BOX_LEFT, boxTop, BOX_W, boxH),
  ];

  /**
   * Lays one side out, each side centred on the box independently so seven
   * supplies against two offtakes still reads as a balanced picture.
   */
  const layoutSide = (
    side: SideRows,
    anchor: "start" | "end",
    textX: number,
    arrowOf: (y: number) => Primitive[],
    arrowMidX: number,
    overflowLabel: string
  ) => {
    let y = boxTop + boxH / 2 - sideHeight(side) / 2;

    for (const row of side.rows) {
      const lines = labelLines(row);
      const height = rowHeight(row);
      const centre = y + height / 2;
      const { color } = impactOf(row);

      items.push(...arrowOf(centre));
      // The connector's own quantity, sitting on the arrow it belongs to:
      // gate -> carrier on a supply, carrier -> gate on an offtake.
      items.push(
        text(arrowMidX, centre - 8, flowText(row), {
          color: DIAGRAM.body,
          size: 11.5,
          bold: true,
          anchor: "middle",
        })
      );
      // Carrier first, then its molecules, as one block centred on the arrow.
      const top = centre - height / 2 + 15;
      items.push(
        text(textX, top, truncate(row.carrier, 26), {
          color,
          size: 13,
          bold: true,
          anchor,
        })
      );
      lines.forEach((line, i) => {
        items.push(
          text(textX, top + 17 + i * LINE_H, truncate(line, 30), {
            color,
            size: 11.5,
            anchor,
          })
        );
      });

      y += height + ROW_GAP;
    }

    if (side.overflow) {
      items.push(
        text(textX, y + LINE_H / 2, `+${side.overflow} more ${overflowLabel}`, {
          size: 12,
          anchor,
        })
      );
    }
  };

  layoutSide(
    left,
    "end",
    LANE_LEFT_START - 14,
    (y) => arrow(LANE_LEFT_START, BOX_LEFT, y, ARROW_W, ARROW_HEAD),
    (LANE_LEFT_START + BOX_LEFT) / 2,
    "upstream"
  );
  layoutSide(
    right,
    "start",
    LANE_RIGHT_END + 14,
    (y) => arrow(BOX_RIGHT, LANE_RIGHT_END, y, ARROW_W, ARROW_HEAD),
    (BOX_RIGHT + LANE_RIGHT_END) / 2,
    "downstream"
  );

  if (!streams.length) {
    items.push(
      text(W / 2, boxTop + boxH + 40, "No streams cross the system boundary", {
        size: 13,
        anchor: "middle",
      })
    );
  }

  // ── legend pills ─────────────────────────────────────────────────────────
  const legendY = boxTop + boxH + (streams.length ? 46 : 76);
  const pills = (["Cost", "Revenue", "Neutral"] as const).map((impact) => {
    const style = IMPACT_STYLE[impact];
    return { ...style, w: 34 + style.label.length * 8 };
  });
  const gap = 18;
  const totalW = pills.reduce((sum, p) => sum + p.w, 0) + gap * (pills.length - 1);
  let px = (W - totalW) / 2;
  for (const pill of pills) {
    items.push(
      rect(px, legendY - 15, pill.w, 24, {
        r: 12,
        fill: pill.tint,
        stroke: pill.color,
        strokeWidth: 1,
      }),
      text(px + pill.w / 2, legendY + 2, pill.label, {
        color: pill.color,
        size: 11,
        bold: true,
        anchor: "middle",
        tracking: 0.8,
      })
    );
    px += pill.w + gap;
  }

  const footerY = legendY + 40;
  items.push(
    text(
      W / 2,
      footerY,
      `${metadata.project_name} · ${metadata.company_name}`,
      { size: 12, anchor: "middle" }
    )
  );

  return {
    width: W,
    height: footerY + 22,
    items,
    omitted: { neutral: 0, unpriced: 0 },
  };
}

// ─────────────── Illustration B — streams economic impact ──────────────────

const CONTAINER_W = 300;
const CONTAINER_X_LEFT = 40;
const CONTAINER_X_RIGHT = W - 40 - CONTAINER_W;
const HEADER_H = 30;
/** A card holds a carrier name, its molecule lines, then the unit price. */
const cardHeight = (row: BoundaryStreamRow) =>
  30 + labelLines(row).length * LINE_H + 20;
const CARD_GAP = 12;
const CARD_INSET = 14;
const B_BOX_W = 150;
const B_BOX_H = 130;
const B_BOX_X = (W - B_BOX_W) / 2;

/**
 * A stream earns a card only when it carries an economic value: neutral and
 * unresolved impacts are out by definition, and a priced-in-name-only stream
 * (impact declared, no number) would render a card whose third line is "NA".
 * Both exclusions are counted and printed under the illustration rather than
 * letting streams disappear silently.
 */
const isPriced = (row: BoundaryStreamRow) =>
  (row.economic_impact === "Cost" || row.economic_impact === "Revenue") &&
  row.price !== null;

export function buildStreamEconomicsDiagram(
  streams: BoundaryStreamRow[]
): Diagram {
  const priced = streams.filter(isPriced);
  const neutral = streams.filter(
    (s) => s.economic_impact === "Neutral" || s.economic_impact === DASH
  ).length;
  const unpriced = streams.length - priced.length - neutral;

  // Container by direction, colour by impact: grouping by impact instead would
  // file a downstream disposal cost under "raw materials".
  const left = splitSide(
    priced.filter((s) => s.direction === "upstream"),
    MAX_CARDS_PER_SIDE
  );
  const right = splitSide(
    priced.filter((s) => s.direction !== "upstream"),
    MAX_CARDS_PER_SIDE
  );

  const containerH = (side: SideRows) => {
    const cards = side.rows.reduce(
      (sum, r) => sum + cardHeight(r) + CARD_GAP,
      0
    );
    const extra = side.overflow ? 40 + CARD_GAP : 0;
    // An empty container still gets one slot, so the two-arrow geometry holds.
    const body = cards + extra || 60 + CARD_GAP;
    return HEADER_H + CARD_INSET * 2 + body - CARD_GAP;
  };

  const top = 62;
  const leftH = containerH(left);
  const rightH = containerH(right);
  const tallest = Math.max(leftH, rightH, B_BOX_H);

  const items: Primitive[] = [
    title("RAW MATERIALS, UTILITIES, PRODUCTS & STREAM ECONOMICS"),
  ];

  const container = (
    x: number,
    h: number,
    heading: string,
    side: SideRows
  ): void => {
    items.push(
      rect(x, top, CONTAINER_W, h, {
        r: 12,
        fill: DIAGRAM.cardFill,
        stroke: DIAGRAM.containerStroke,
        strokeWidth: 1.5,
      }),
      rect(x, top, CONTAINER_W, HEADER_H, {
        r: 12,
        fill: DIAGRAM.containerHeaderFill,
        stroke: null,
        strokeWidth: 0,
      }),
      // Square off the band's lower corners so it reads as a header, not a pill.
      rect(x, top + HEADER_H - 12, CONTAINER_W, 12, {
        fill: DIAGRAM.containerHeaderFill,
        stroke: null,
        strokeWidth: 0,
      }),
      text(x + CONTAINER_W / 2, top + 20, heading, {
        color: DIAGRAM.heading,
        size: 12,
        bold: true,
        anchor: "middle",
        tracking: 1,
      })
    );

    const cardX = x + CARD_INSET;
    const cardW = CONTAINER_W - CARD_INSET * 2;
    let cardY = top + HEADER_H + CARD_INSET;

    if (!side.rows.length) {
      items.push(
        text(x + CONTAINER_W / 2, cardY + 30, "No priced streams", {
          size: 12,
          anchor: "middle",
        })
      );
      return;
    }

    for (const row of side.rows) {
      const { color, tint } = impactOf(row);
      const lines = labelLines(row);
      const h = cardHeight(row);

      items.push(
        rect(cardX, cardY, cardW, h, {
          r: 8,
          fill: DIAGRAM.cardFill,
          stroke: tint,
          strokeWidth: 1.4,
        }),
        text(cardX + cardW / 2, cardY + 21, truncate(row.carrier, 28), {
          color,
          size: 13,
          bold: true,
          anchor: "middle",
        })
      );
      lines.forEach((line, i) => {
        items.push(
          text(cardX + cardW / 2, cardY + 37 + i * LINE_H, truncate(line, 32), {
            size: 11.5,
            anchor: "middle",
          })
        );
      });
      items.push(
        text(cardX + cardW / 2, cardY + h - 9, priceText(row), {
          color,
          size: 12,
          bold: true,
          anchor: "middle",
        })
      );

      cardY += h + CARD_GAP;
    }

    if (side.overflow) {
      items.push(
        text(x + CONTAINER_W / 2, cardY + 20, `+${side.overflow} more`, {
          size: 12,
          anchor: "middle",
        })
      );
    }
  };

  container(CONTAINER_X_LEFT, leftH, "RAW MATERIALS, UTILITIES & ENERGY", left);
  container(CONTAINER_X_RIGHT, rightH, "PRODUCTS & BY-PRODUCTS", right);

  // One aggregated arrow in, one out — vertically centred on the whole diagram.
  const midY = top + tallest / 2;
  items.push(...processBox(B_BOX_X, midY - B_BOX_H / 2, B_BOX_W, B_BOX_H));
  items.push(
    ...arrow(CONTAINER_X_LEFT + CONTAINER_W + 12, B_BOX_X - 6, midY, 4.5, 14)
  );
  items.push(
    ...arrow(B_BOX_X + B_BOX_W + 6, CONTAINER_X_RIGHT - 12, midY, 4.5, 14)
  );

  let y = top + tallest + 34;
  const notes: string[] = [];
  if (neutral) {
    notes.push(
      `${neutral} neutral stream${neutral === 1 ? "" : "s"} not shown`
    );
  }
  if (unpriced) {
    notes.push(
      `${unpriced} stream${unpriced === 1 ? "" : "s"} with no declared economic value not shown`
    );
  }
  if (notes.length) {
    items.push(text(W / 2, y, notes.join(" · "), { size: 11, anchor: "middle" }));
    y += 22;
  }

  return {
    width: W,
    height: y + 8,
    items,
    omitted: { neutral, unpriced },
  };
}
