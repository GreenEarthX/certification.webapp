import jsPDF from "jspdf";
import {
  A4_PORTRAIT,
  AMBER,
  HAIRLINE,
  INK,
  MUTED,
  TEAL,
  drawHeader,
  drawMetadata,
  notesBox,
  paginate,
  sectionBand,
} from "./pdf-chrome";
import {
  equipmentHeading,
  operandText,
  operandValueText,
} from "./mass-energy-balances.format";
import type { EquationCard, MassEnergyBalancesEquationsDto } from "./types";

/**
 * A4 portrait renderer for the Equations annex: chapter per category,
 * subsection per equipment instance, one card per equation. Cards are
 * hand-drawn (not autoTable) so a card never splits across a page.
 */

const G = A4_PORTRAIT;
const CARD_PAD = 3;
const LINE = 3.6;

interface CardLayout {
  lines: { text: string; style: "title" | "mono" | "body" | "muted"; indent: number }[];
  height: number;
}

function layoutCard(doc: jsPDF, card: EquationCard): CardLayout {
  const w = G.contentW - CARD_PAD * 2;
  const lines: CardLayout["lines"] = [];
  const push = (
    text: string,
    style: CardLayout["lines"][number]["style"],
    indent = 0,
    fontSize = 8
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont(style === "mono" ? "courier" : "helvetica", style === "title" ? "bold" : "normal");
    for (const l of doc.splitTextToSize(text, w - indent) as string[]) {
      lines.push({ text: l, style, indent });
    }
  };

  push(`${card.id}:  ${card.labelled_expression}`, "title", 0, 9);
  push(`Equation:  ${card.expression}`, "mono", 2);
  if (card.description) push(`Description:  ${card.description}`, "muted", 2);
  push(`Output:  ${card.output.label} = ${operandValueText(card.output)}`, "body", 2);
  if (card.inputs.length) {
    push(`Inputs:  ${card.inputs.map(operandText).join(" ;  ")}`, "body", 2);
  }

  return { lines, height: lines.length * LINE + CARD_PAD * 2 + 1 };
}

function drawCard(doc: jsPDF, layout: CardLayout, top: number): number {
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(G.marginX, top, G.contentW, layout.height, 1.5, 1.5, "S");
  doc.setFillColor(...TEAL);
  doc.rect(G.marginX, top, 1.2, layout.height, "F");

  let y = top + CARD_PAD + 2.6;
  for (const l of layout.lines) {
    switch (l.style) {
      case "title":
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        break;
      case "mono":
        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...INK);
        break;
      case "muted":
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        break;
      default:
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...INK);
    }
    doc.text(l.text, G.marginX + CARD_PAD + l.indent, y);
    y += LINE;
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  return top + layout.height + 3;
}

export async function renderMassEnergyBalancesEquationsPdf(
  data: MassEnergyBalancesEquationsDto
): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const m = data.metadata;

  let y = 0;
  const newPageIfNeeded = (needed: number) => {
    if (y + needed > G.footerY - 6) {
      doc.addPage();
      y = 18;
    }
    return y;
  };

  await drawHeader(doc, G, data.title, "Annex: Equations");
  y = drawMetadata(doc, G, m, 36) + 8;

  if (data.categories.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(
      "No equation has a complete result in the latest calculation run.",
      G.marginX,
      y
    );
    y += 8;
  }

  for (const cat of data.categories) {
    const count = cat.equipment.reduce((n, e) => n + e.equations.length, 0);
    newPageIfNeeded(30);
    y = sectionBand(doc, G, y, cat.chapter, cat.category, count);

    for (const eq of cat.equipment) {
      newPageIfNeeded(24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...AMBER);
      doc.text(eq.equipment_id, G.marginX, y + 4);
      doc.setTextColor(...INK);
      const rest = equipmentHeading(eq).replace(`${eq.equipment_id} - `, "");
      doc.text(rest, G.marginX + doc.getTextWidth(`${eq.equipment_id}  `), y + 4);
      y += 8;

      for (const card of eq.equations) {
        const layout = layoutCard(doc, card);
        newPageIfNeeded(layout.height + 3);
        y = drawCard(doc, layout, y);
      }
      y += 3;
    }
  }

  const note =
    "Values are those of the latest stored calculation run for each equipment. Equations that were skipped for missing " +
    "inputs, failed, or resolved through fallback values are not listed; the notes say which. Every input that is itself a " +
    "calculated value names the equation it was computed in.";
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

  const filename = `${m.document_reference}_Mass-Energy-Balances_Equations.pdf`;
  doc.save(filename);
  return filename;
}
