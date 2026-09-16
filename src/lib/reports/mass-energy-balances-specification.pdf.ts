import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  A4_LANDSCAPE,
  AMBER,
  INK,
  MUTED,
  TEAL,
  baseTable,
  centredHeading,
  drawHeader,
  drawMetadata,
  notesBox,
  paginate,
  sectionBand,
  tableBottom,
  type RGB,
} from "./pdf-chrome";
import {
  SPEC_COLUMNS_PER_TABLE,
  chunk,
  kwText,
  kwhText,
  specCellText,
  specSections,
} from "./mass-energy-balances.format";
import type {
  MassEnergyBalancesSpecificationDto,
  SpecificationBlock,
} from "./types";

/**
 * A4 landscape renderer for the Specification annex.
 *
 * Same row definitions as the on-screen preview (mass-energy-balances.format):
 * attributes are rows, streams are columns, SPEC_COLUMNS_PER_TABLE streams per
 * table. The unit sits once in the attribute column; a min | norm | max cell
 * prints as "min  |  norm  |  max" with a dash for a missing segment.
 */

const G = A4_LANDSCAPE;

const DESCRIPTION_BG: RGB = [245, 244, 240]; // hsl(45,15%,95%)
const SECTION_BG: RGB = [233, 235, 237]; // hsl(200,10%,92%)
const ATTR_W = 62;

function drawBlock(
  doc: jsPDF,
  block: SpecificationBlock,
  index: number,
  yStart: number,
  newPageIfNeeded: (needed: number) => number
): number {
  let y = yStart;
  newPageIfNeeded(40);
  y = sectionBand(doc, G, y, index, `Block: ${block.block}`, block.streams.length);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const desc = doc.splitTextToSize(block.description, G.contentW) as string[];
  desc.forEach((line, i) => doc.text(line, G.marginX, y + i * 3.6));
  y += desc.length * 3.6 + 3;

  const sections = specSections(block);
  const groups = chunk(block.streams, SPEC_COLUMNS_PER_TABLE);
  const streamW = (G.contentW - ATTR_W) / SPEC_COLUMNS_PER_TABLE;

  for (const streams of groups) {
    // Section separator rows carry a marker so the styling hook can find them.
    type Row = { cells: string[]; kind: "section" | "description" | "total" | "row" };
    const rows: Row[] = [];
    for (const section of sections) {
      if (section.index !== null) {
        rows.push({
          cells: [`SECTION ${section.index}: ${section.title.toUpperCase()}`],
          kind: "section",
        });
      }
      for (const r of section.rows) {
        const label = r.unit ? `${r.label}  ${r.unit}` : r.label;
        rows.push({
          cells: [label, ...streams.map((s) => specCellText(r.cell(s)))],
          kind:
            section.index === null
              ? "description"
              : r.key === "total"
                ? "total"
                : "row",
        });
      }
    }

    newPageIfNeeded(30);
    autoTable(doc, {
      ...baseTable(G),
      startY: y,
      styles: { ...baseTable(G).styles, fontSize: 7, cellPadding: 1.2 },
      head: [["Attribute", ...streams.map((s) => s.id)]],
      body: rows.map((r) =>
        r.kind === "section"
          ? [{ content: r.cells[0], colSpan: streams.length + 1 }]
          : r.cells
      ),
      columnStyles: {
        0: { cellWidth: ATTR_W, halign: "left" },
        ...Object.fromEntries(
          streams.map((_, i) => [i + 1, { cellWidth: streamW, halign: "center" }])
        ),
      },
      headStyles: { ...baseTable(G).headStyles, fontSize: 7.5, halign: "center" },
      didParseCell: (d) => {
        if (d.section === "head" && d.column.index === 0) {
          d.cell.styles.halign = "left";
        }
        if (d.section !== "body") return;
        const row = rows[d.row.index];
        if (!row) return;
        if (row.kind === "section") {
          d.cell.styles.fillColor = SECTION_BG;
          d.cell.styles.textColor = TEAL;
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.halign = "left";
        } else if (row.kind === "description") {
          d.cell.styles.fillColor = DESCRIPTION_BG;
        } else if (row.kind === "total") {
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.font = "courier";
          if (d.column.index > 0) d.cell.styles.halign = "right";
        } else {
          d.cell.styles.fillColor = [255, 255, 255];
        }
      },
    });
    y = tableBottom(doc) + 6;
  }
  return y;
}

export async function renderMassEnergyBalancesSpecificationPdf(
  data: MassEnergyBalancesSpecificationDto
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

  await drawHeader(doc, G, data.title, "Annex: Specification");
  y = drawMetadata(doc, G, m, 36) + 8;

  y = centredHeading(doc, G, y + 2, "Mass Balance", "Per-stream specification, grouped by process block");
  if (data.blocks.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("No material streams.", G.marginX, y);
    y += 8;
  }
  data.blocks.forEach((block, i) => {
    y = drawBlock(doc, block, i + 1, y, newPageIfNeeded);
  });

  // ── Energy balance ───────────────────────────────────────────────────────
  newPageIfNeeded(50);
  y = centredHeading(
    doc,
    G,
    y + 4,
    "Energy Balance",
    `Electricity and heat duties; annual figures on ${data.time_basis.hours_per_year} operating hours per year${
      data.time_basis.is_default ? " (continuous operation assumed)" : ""
    }`
  );

  const energyIndex = data.blocks.length + 1;
  const { electricity, heat } = data.energy;

  y = sectionBand(doc, G, y, energyIndex, "Electricity Consumption", electricity.length);
  autoTable(doc, {
    ...table,
    startY: y,
    head: [["Stream ID", "Equipment", "Equipment ID", "Electricity Consumption (kW)", "Annual Consumption (kWh/yr)"]],
    body: electricity.length
      ? electricity.map((r) => [
          r.stream_id,
          r.equipment,
          r.equipment_id,
          kwText(r.consumption_kw),
          kwhText(r.annual_kwh),
        ])
      : [["No electricity streams", "", "", "", ""]],
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold", textColor: TEAL },
      1: { cellWidth: 120 },
      2: { cellWidth: 30, fontStyle: "bold", textColor: AMBER },
      3: { cellWidth: 48, halign: "right" },
      4: { cellWidth: 49, halign: "right" },
    },
  });
  y = tableBottom(doc) + 8;

  newPageIfNeeded(30);
  y = sectionBand(doc, G, y, energyIndex + 1, "Heat Duty", heat.length);
  autoTable(doc, {
    ...table,
    startY: y,
    head: [["Stream ID", "From", "From ID", "To", "To ID", "Heat Duty (kW)", "Annual Heat Duty (kWh/yr)"]],
    body: heat.length
      ? heat.map((r) => [
          r.stream_id,
          r.from,
          r.from_id,
          r.to,
          r.to_id,
          kwText(r.heat_duty_kw),
          kwhText(r.annual_kwh),
        ])
      : [["No heat streams", "", "", "", "", "", ""]],
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold", textColor: TEAL },
      1: { cellWidth: 62 },
      2: { cellWidth: 20, fontStyle: "bold", textColor: AMBER },
      3: { cellWidth: 62 },
      4: { cellWidth: 20, fontStyle: "bold", textColor: AMBER },
      5: { cellWidth: 36, halign: "right" },
      6: { cellWidth: 47, halign: "right" },
    },
  });
  y = tableBottom(doc) + 6;

  const note =
    "Energy streams carry no mass and have no material attributes, so they are excluded from the mass balance tables. " +
    "Duties are the design (norm) rating on the connector; annual figures multiply it by the plant's operating hours. " +
    "In the specification tables an empty cell means no value was declared for that stream.";
  const lines = doc.splitTextToSize(note, G.contentW) as string[];
  newPageIfNeeded(lines.length * 3.6 + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  lines.forEach((line, i) => doc.text(line, G.marginX, y + i * 3.6));
  y += lines.length * 3.6 + 6;
  doc.setTextColor(...INK);

  y = notesBox(doc, G, y, data.warnings, newPageIfNeeded);
  paginate(doc, G, m.document_reference);

  const filename = `${m.document_reference}_Mass-Energy-Balances_Specification.pdf`;
  doc.save(filename);
  return filename;
}
