import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AMBER, TEAL } from "./pdf-chrome";
import {
  A4_LANDSCAPE,
  baseTable,
  centredHeading,
  drawHeader,
  drawMetadata,
  notesBox,
  paginate,
  tableBottom,
} from "./pdf-chrome";
import {
  KIND_LABEL,
  summaryUnitText,
  summaryValueText,
} from "./mass-energy-balances.format";
import type { MassEnergyBalancesDto } from "./types";

/**
 * A4 landscape renderer for the Mass & Energy Balances main report: the
 * stream summary table, nine columns, one row per stream.
 */

const G = A4_LANDSCAPE;

export async function renderMassEnergyBalancesPdf(
  data: MassEnergyBalancesDto
): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const m = data.metadata;

  let y = 0;
  const newPageIfNeeded = (needed: number) => {
    if (y + needed > G.footerY - 6) {
      doc.addPage();
      y = 18;
    }
    return y;
  };

  await drawHeader(doc, G, data.title, `${m.project_name}  ·  ${m.project_variation}`);
  y = drawMetadata(doc, G, m, 36) + 8;

  const n = data.streams.length;
  y = centredHeading(
    doc,
    G,
    y + 2,
    "Stream Summary",
    `${n} ${n === 1 ? "stream" : "streams"} in the process flow`
  );

  const ID_COLS = new Set([2, 4, 6]);
  autoTable(doc, {
    ...baseTable(G),
    startY: y,
    head: [
      [
        "Stream ID",
        "Carrier",
        "Carrier ID",
        "From",
        "From ID",
        "To",
        "To ID",
        "Stream Value",
        "Unit",
      ],
    ],
    body: n
      ? data.streams.map((r) => [
          r.id,
          r.kind === "material" ? r.carrier : `${r.carrier}  [${KIND_LABEL[r.kind]}]`,
          r.carrier_id,
          r.from,
          r.from_id,
          r.to,
          r.to_id,
          summaryValueText(r),
          summaryUnitText(r),
        ])
      : [["No streams", ...Array(8).fill("")]],
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold", textColor: TEAL },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 56 },
      4: { cellWidth: 18 },
      5: { cellWidth: 56 },
      6: { cellWidth: 18 },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 13 },
    },
    didParseCell: (d) => {
      if (d.section === "body" && ID_COLS.has(d.column.index)) {
        d.cell.styles.textColor = AMBER;
        d.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = tableBottom(doc) + 6;

  const note =
    "From and To only ever reference equipment or gates, by the component ID shown in the plant builder; two units of the " +
    "same type share an ID and are told apart by name. Carrier IDs match the Plant Component Registry. The stream value is " +
    "the quantity on the connector, with its unit exactly as stored; a dash means none was declared.";
  const lines = doc.splitTextToSize(note, G.contentW) as string[];
  newPageIfNeeded(lines.length * 3.6 + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  lines.forEach((line, i) => doc.text(line, G.marginX, y + i * 3.6));
  y += lines.length * 3.6 + 6;

  y = notesBox(doc, G, y, data.warnings, newPageIfNeeded);
  paginate(doc, G, m.document_reference);

  const filename = `${m.document_reference}_Mass-Energy-Balances.pdf`;
  doc.save(filename);
  return filename;
}
