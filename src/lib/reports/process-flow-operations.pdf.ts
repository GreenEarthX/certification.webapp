import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  buildStreamEconomicsDiagram,
  buildSystemBoundaryDiagram,
  type Diagram,
} from "./boundary-diagram";
import {
  DASH,
  IMPACT_STYLE,
  flowUnitText,
  flowValueText,
  priceText,
} from "./format";
import {
  A4_LANDSCAPE,
  AMBER,
  INK,
  TEAL,
  baseTable,
  centredHeading,
  drawHeader,
  drawMetadata,
  notesBox,
  paginate,
  tableBottom,
  type PageGeom,
} from "./pdf-chrome";
import type { ProcessFlowOperationsDto } from "./types";

/**
 * A4 landscape renderer for Process Flow Operations.
 *
 * Eleven columns and a three-column illustration do not fit report 1's portrait
 * content width. The two illustrations are drawn as vector primitives from
 * ./boundary-diagram — the same list the on-screen SVG consumes — so the page
 * and the preview cannot drift, and the text stays selectable.
 */

const G = A4_LANDSCAPE;

/** Document units (mm) per diagram unit, and pt for a diagram font size. */
const ptOf = (size: number, k: number) => size * k * (72 / 25.4);

const ALIGN = {
  start: "left",
  middle: "center",
  end: "right",
} as const;

/**
 * Draws a diagram into the content column, scaled to fit both the width and
 * whatever vertical space is left. Returns the y below it.
 */
function drawDiagram(doc: jsPDF, g: PageGeom, d: Diagram, top: number): number {
  const available = g.footerY - 6 - top;
  const k = Math.min(g.contentW / d.width, available / d.height);
  const x0 = g.marginX + (g.contentW - d.width * k) / 2;
  const X = (x: number) => x0 + x * k;
  const Y = (y: number) => top + y * k;

  for (const p of d.items) {
    switch (p.kind) {
      case "rect": {
        if (p.fill) doc.setFillColor(p.fill);
        if (p.stroke) {
          doc.setDrawColor(p.stroke);
          doc.setLineWidth(Math.max(0.1, p.strokeWidth * k));
        }
        const style = p.fill && p.stroke ? "FD" : p.fill ? "F" : "S";
        if (p.r) {
          doc.roundedRect(
            X(p.x),
            Y(p.y),
            p.w * k,
            p.h * k,
            p.r * k,
            p.r * k,
            style
          );
        } else {
          doc.rect(X(p.x), Y(p.y), p.w * k, p.h * k, style);
        }
        break;
      }
      case "line": {
        doc.setDrawColor(p.stroke);
        doc.setLineWidth(Math.max(0.1, p.strokeWidth * k));
        doc.line(X(p.x1), Y(p.y1), X(p.x2), Y(p.y2));
        break;
      }
      case "arrowhead": {
        doc.setFillColor(p.fill);
        doc.triangle(
          X(p.x),
          Y(p.y),
          X(p.x - p.size),
          Y(p.y - p.size * 0.62),
          X(p.x - p.size),
          Y(p.y + p.size * 0.62),
          "F"
        );
        break;
      }
      case "text": {
        doc.setTextColor(p.color);
        doc.setFont("helvetica", p.bold ? "bold" : "normal");
        doc.setFontSize(ptOf(p.size, k));
        doc.text(p.text, X(p.x), Y(p.y), {
          align: ALIGN[p.anchor],
          // charSpace is expressed in document units, so scale it like geometry.
          charSpace: p.tracking ? p.tracking * k : 0,
        });
        break;
      }
    }
  }

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setLineWidth(0.2);
  return top + d.height * k;
}

export async function renderProcessFlowOperationsPdf(
  data: ProcessFlowOperationsDto
): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const m = data.metadata;
  const table = baseTable(G);

  let y = 0;
  const newPageIfNeeded = (needed: number) => {
    if (y + needed > G.footerY - 6) {
      doc.addPage();
      y = 18;
    }
    return y;
  };

  await drawHeader(
    doc,
    G,
    data.title,
    `${m.project_name}  ·  ${m.project_variation}`
  );

  y = drawMetadata(doc, G, m, 36) + 8;

  // ── Illustration A ───────────────────────────────────────────────────────
  // Each illustration carries its own centred heading as a drawn primitive, so
  // there is deliberately no section band above it.
  const boundary = buildSystemBoundaryDiagram(data.streams, m);
  newPageIfNeeded(60);
  y = drawDiagram(doc, G, boundary, y + 4) + 8;

  // ── Illustration B ───────────────────────────────────────────────────────
  const economics = buildStreamEconomicsDiagram(data.streams);
  const bHeight = (economics.height * G.contentW) / economics.width;
  // Give B a page of its own rather than squeezing it into a sliver.
  if (y + bHeight + 12 > G.footerY - 6) {
    doc.addPage();
    y = 18;
  }
  y = drawDiagram(doc, G, economics, y + 4) + 10;

  // ── Boundary streams table ───────────────────────────────────────────────
  newPageIfNeeded(50);
  y = centredHeading(
    doc,
    G,
    y + 4,
    "Boundary Streams",
    `${data.streams.length} ${
      data.streams.length === 1 ? "stream" : "streams"
    } crossing the system boundary`
  );

  const GATE_COL = 2;
  const IMPACT_COL = 6;
  const stashed = new Map<number, string[]>();

  autoTable(doc, {
    ...table,
    startY: y,
    head: [
      [
        "ID",
        "Direction",
        "Gate",
        "Carrier",
        "Stream Value",
        "Stream Unit",
        "Impact",
        "Price",
      ],
    ],
    body: data.streams.length
      ? data.streams.map((r) => [
          r.id,
          r.direction,
          `${r.gate} (${r.gate_id})`,
          r.carrier,
          flowValueText(r),
          flowUnitText(r),
          r.economic_impact,
          priceText(r),
        ])
      : [["No streams cross the system boundary", ...Array(7).fill("")]],
    columnStyles: {
      0: { cellWidth: 12, fontStyle: "bold", textColor: TEAL },
      1: { cellWidth: 26 },
      2: { cellWidth: 58 },
      3: { cellWidth: 50 },
      4: { cellWidth: 32, halign: "right" },
      5: { cellWidth: 28 },
      6: { cellWidth: 24, fontStyle: "bold" },
      7: { cellWidth: 39, halign: "right" },
    },
    didParseCell: (d) => {
      if (d.section !== "body" || d.column.index !== IMPACT_COL) return;
      const impact = data.streams[d.row.index]?.economic_impact ?? DASH;
      d.cell.styles.textColor = IMPACT_STYLE[impact].color;
    },
    // The gate cell carries a "(G1)" reference token, coloured like the Plant
    // Component Registry so the two documents cross-reference. autoTable draws
    // cell text itself, so blank it once the row height is known and redraw.
    willDrawCell: (d) => {
      if (d.section !== "body" || d.column.index !== GATE_COL) return;
      stashed.set(d.row.index, d.cell.text as string[]);
      d.cell.text = [];
    },
    didDrawCell: (d) => {
      if (d.section !== "body" || d.column.index !== GATE_COL) return;
      const lines = stashed.get(d.row.index) ?? [];
      if (!lines.length) return;

      const fontSize = d.cell.styles.fontSize;
      const lineHeight =
        (fontSize * doc.getLineHeightFactor()) / doc.internal.scaleFactor;
      const x0 = d.cell.x + d.cell.padding("left");
      const y0 = d.cell.y + d.cell.padding("top");

      doc.setFontSize(fontSize);
      lines.forEach((line, i) => {
        let x = x0;
        const baseline = y0 + lineHeight * (i + 1) - lineHeight * 0.25;
        for (const word of line.split(" ")) {
          const isRef = /^\(G\d+\)$/.test(word);
          doc.setTextColor(...(isRef ? AMBER : INK));
          doc.setFont("helvetica", isRef ? "bold" : "normal");
          doc.text(word, x, baseline);
          x += doc.getTextWidth(`${word} `);
        }
      });

      doc.setTextColor(...INK);
      doc.setFont("helvetica", "normal");
    },
  });
  y = tableBottom(doc) + 6;

  // ── Reading note ─────────────────────────────────────────────────────────
  const note =
    "The stream value is the quantity carried on the connector itself — gate to carrier for a supply, carrier to gate for " +
    "an offtake — with its unit exactly as stored; nothing is converted. A dash means no figure was declared; " +
    "NA means no economic value was. Gate IDs match the Plant Component Registry for this variation.";
  const noteLines = doc.splitTextToSize(note, G.contentW) as string[];
  newPageIfNeeded(noteLines.length * 3.6 + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  noteLines.forEach((line, i) => doc.text(line, G.marginX, y + i * 3.6));
  y += noteLines.length * 3.6 + 6;

  y = notesBox(doc, G, y, data.warnings, newPageIfNeeded);

  paginate(doc, G, m.document_reference);

  const filename = `${m.document_reference}_Process-Flow-Operations.pdf`;
  doc.save(filename);
  return filename;
}
