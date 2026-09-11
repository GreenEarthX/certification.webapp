import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { refListText, wordColor } from "./format";
import {
  A4_PORTRAIT,
  AMBER,
  INK,
  MUTED,
  TEAL,
  baseTable,
  drawHeader,
  drawMetadata,
  notesBox,
  paginate,
  sectionBand,
  tableBottom,
  type RGB,
} from "./pdf-chrome";
import type { PlantComponentRegistryDto } from "./types";

/**
 * A4 portrait renderer for the Plant Component Registry.
 *
 * Programmatic rather than a rasterised screenshot, so the text stays
 * selectable and searchable and the file stays small. Mirrors the on-screen
 * preview; the page furniture comes from ./pdf-chrome, shared with report 2.
 */

const G = A4_PORTRAIT;

export async function renderPlantComponentRegistryPdf(
  data: PlantComponentRegistryDto
): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
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

  y = drawMetadata(doc, G, m, 36) + 10;

  const section = (index: number, title: string, count: number) => {
    newPageIfNeeded(24);
    y = sectionBand(doc, G, y, index, title, count);
  };

  const emptyRow = (cols: number) => [
    ["No entries", ...Array(cols - 1).fill("")],
  ];

  // ── 1. Equipment ─────────────────────────────────────────────────────────
  section(1, "Equipment", data.equipment.length);
  autoTable(doc, {
    ...table,
    startY: y,
    head: [["ID", "Equipment", "Quantity"]],
    body: data.equipment.length
      ? data.equipment.map((r) => [r.id, r.equipment, String(r.quantity)])
      : emptyRow(3),
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold", textColor: TEAL },
      2: { cellWidth: 26, halign: "center" },
    },
  });
  y = tableBottom(doc) + 10;

  // ── 2. Gate ──────────────────────────────────────────────────────────────
  section(2, "Gate", data.gates.length);
  autoTable(doc, {
    ...table,
    startY: y,
    head: [["ID", "Gate", "Role"]],
    body: data.gates.length
      ? data.gates.map((r) => [r.id, r.gate, r.role])
      : emptyRow(3),
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold", textColor: AMBER },
      2: { cellWidth: 42 },
    },
  });
  y = tableBottom(doc) + 10;

  // ── 3. Carrier ───────────────────────────────────────────────────────────
  // From/To hold "Name (E6), Name (G1)" lists whose ID tokens are colour-coded.
  // autoTable draws cell text itself, so blank the text in willDrawCell (the
  // row height is already computed by then) and redraw it word by word.
  const stashed = new Map<string, string[]>();
  const isRefCol = (i: number) => i === 2 || i === 3;

  section(3, "Carrier", data.carriers.length);
  autoTable(doc, {
    ...table,
    startY: y,
    head: [["ID", "Carrier", "From", "To"]],
    body: data.carriers.length
      ? data.carriers.map((r) => [
          r.id,
          r.carrier,
          refListText(r.from),
          refListText(r.to),
        ])
      : emptyRow(4),
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold", textColor: TEAL },
      1: { cellWidth: 40 },
      2: { cellWidth: 62 },
      3: { cellWidth: 62 },
    },
    willDrawCell: (d) => {
      if (d.section !== "body" || !isRefCol(d.column.index)) return;
      stashed.set(`${d.row.index}:${d.column.index}`, d.cell.text as string[]);
      d.cell.text = [];
    },
    didDrawCell: (d) => {
      if (d.section !== "body" || !isRefCol(d.column.index)) return;
      const lines = stashed.get(`${d.row.index}:${d.column.index}`) ?? [];
      if (!lines.length) return;

      const fontSize = d.cell.styles.fontSize;
      // autoTable lays lines out with the document's own line-height factor
      // (1.15 by default); pt -> mm via the internal scale factor.
      const lineHeight =
        (fontSize * doc.getLineHeightFactor()) / doc.internal.scaleFactor;
      const x0 = d.cell.x + d.cell.padding("left");
      const y0 = d.cell.y + d.cell.padding("top");

      doc.setFontSize(fontSize);
      lines.forEach((line, i) => {
        let x = x0;
        const baseline = y0 + lineHeight * (i + 1) - lineHeight * 0.25;
        for (const word of line.split(" ")) {
          const colour = wordColor(word);
          if (colour) {
            doc.setTextColor(colour);
            doc.setFont("helvetica", "bold");
          } else {
            doc.setTextColor(...INK);
            doc.setFont("helvetica", "normal");
          }
          doc.text(word, x, baseline);
          x += doc.getTextWidth(`${word} `);
        }
      });

      doc.setTextColor(...INK);
      doc.setFont("helvetica", "normal");
    },
  });
  y = tableBottom(doc) + 10;

  // ── Legend ───────────────────────────────────────────────────────────────
  newPageIfNeeded(14);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Component references:", G.marginX, y);
  let legendX = G.marginX + doc.getTextWidth("Component references:") + 4;
  const legend: Array<[string, RGB]> = [
    ["Equipment (E1, E2…)", TEAL],
    ["Gate (G1, G2…)", AMBER],
  ];
  for (const [label, colour] of legend) {
    doc.setFillColor(...colour);
    doc.rect(legendX, y - 1.8, 2, 2, "F");
    doc.setTextColor(...colour);
    doc.setFont("helvetica", "bold");
    doc.text(label, legendX + 3.2, y);
    legendX += doc.getTextWidth(label) + 10;
  }
  doc.setFont("helvetica", "normal");
  y += 10;

  y = notesBox(doc, G, y, data.warnings, newPageIfNeeded);

  paginate(doc, G, m.document_reference);

  const filename = `${m.document_reference}_Plant-Component-Registry.pdf`;
  doc.save(filename);
  return filename;
}
