import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatReportTimestamp, refListText, wordColor } from "./format";
import type { PlantComponentRegistryDto } from "./types";

/**
 * A4 portrait renderer for the Plant Component Registry.
 *
 * Programmatic rather than a rasterised screenshot, so the text stays
 * selectable and searchable and the file stays small. Mirrors the on-screen
 * preview; both read their formatting from ./format.
 */

const PAGE_W = 210;
const MARGIN_X = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2; // 182
const HEADER_H = 30;
const FOOTER_Y = 285;

type RGB = [number, number, number];

const TEAL: RGB = [15, 118, 110]; // #0F766E
const TEAL_LIGHT: RGB = [20, 184, 166]; // #14B8A6
const AMBER: RGB = [245, 158, 11]; // #F59E0B
const INK: RGB = [30, 41, 59];
const MUTED: RGB = [100, 116, 139];
const HAIRLINE: RGB = [226, 232, 240];
const ZEBRA: RGB = [248, 250, 252];

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Loads a PNG as a data URL for addImage. Resolves null on any failure. */
async function loadImage(src: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  }
}

export async function renderPlantComponentRegistryPdf(
  data: PlantComponentRegistryDto
): Promise<string> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const m = data.metadata;

  const lastAutoTableY = () =>
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 0;

  let y = 0;
  const newPageIfNeeded = (needed: number) => {
    if (y + needed > FOOTER_Y - 6) {
      doc.addPage();
      y = 18;
    }
  };

  // ── Header band ──────────────────────────────────────────────────────────
  // jsPDF has no gradient primitive; approximate with lerped vertical strips.
  // Each is drawn 0.2mm wider than its slot so no hairline seams show through.
  const STRIPS = 64;
  const stripW = PAGE_W / STRIPS;
  for (let i = 0; i < STRIPS; i++) {
    const t = i / (STRIPS - 1);
    doc.setFillColor(
      Math.round(TEAL[0] + (TEAL_LIGHT[0] - TEAL[0]) * t),
      Math.round(TEAL[1] + (TEAL_LIGHT[1] - TEAL[1]) * t),
      Math.round(TEAL[2] + (TEAL_LIGHT[2] - TEAL[2]) * t)
    );
    doc.rect(i * stripW, 0, stripW + 0.2, HEADER_H, "F");
  }

  const logo = await loadImage("/logoGEX.png");
  const LOGO_W = 24;
  if (logo) {
    const h = LOGO_W * (logo.height / logo.width);
    doc.addImage(
      logo.dataUrl,
      "PNG",
      PAGE_W - MARGIN_X - LOGO_W,
      (HEADER_H - h) / 2,
      LOGO_W,
      h
    );
  } else {
    // Never fail the document over a missing asset.
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const wordmark = "GreenEarthX";
    doc.text(wordmark, PAGE_W - MARGIN_X - doc.getTextWidth(wordmark), 17);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.title, MARGIN_X, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`${m.project_name}  ·  ${m.project_variation}`, MARGIN_X, 22.5);

  // ── Metadata block ───────────────────────────────────────────────────────
  // An autoTable rather than hand-drawn cells: a long organisation name has to
  // wrap rather than overflow into its neighbour.
  const metaTop = 36;
  autoTable(doc, {
    startY: metaTop,
    margin: { left: MARGIN_X, right: MARGIN_X },
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 34.6 },
      2: { cellWidth: 26 },
      3: { cellWidth: 34.7 },
      4: { cellWidth: 26 },
      5: { cellWidth: 34.7 },
    },
    // Nine fields — there is deliberately no Status row.
    body: [
      [
        "Document Ref.",
        m.document_reference,
        "Project Ref.",
        m.project_reference,
        "Revision",
        String(m.revision_number),
      ],
      [
        "Project Name",
        m.project_name,
        "Variation",
        m.project_variation,
        "Date",
        formatReportTimestamp(m.generated_at),
      ],
      ["User Name", m.user_name, "Company", m.company_name, "", ""],
    ],
    didParseCell: (d) => {
      const isLabel = d.column.index % 2 === 0;
      d.cell.styles.textColor = isLabel ? MUTED : INK;
      d.cell.styles.fontStyle = isLabel ? "normal" : "bold";
      d.cell.styles.fontSize = isLabel ? 7.5 : 8.5;
    },
  });

  const metaBottom = lastAutoTableY();
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(
    MARGIN_X,
    metaTop - 2,
    CONTENT_W,
    metaBottom - metaTop + 4,
    2,
    2,
    "S"
  );
  y = metaBottom + 10;

  // ── Section helper ───────────────────────────────────────────────────────
  const section = (index: number, title: string, count: number) => {
    newPageIfNeeded(24);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(MARGIN_X, y, CONTENT_W, 9, "F");
    doc.setFillColor(...TEAL);
    doc.rect(MARGIN_X, y, 1.5, 9, "F"); // left accent
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index}.  ${title}`, MARGIN_X + 5, y + 6.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const label = `${count} ${count === 1 ? "entry" : "entries"}`;
    doc.text(label, PAGE_W - MARGIN_X - doc.getTextWidth(label) - 2, y + 6.2);
    y += 12;
  };

  const baseTable = {
    margin: { left: MARGIN_X, right: MARGIN_X },
    theme: "grid" as const,
    styles: {
      fontSize: 8.5,
      cellPadding: 1.8,
      textColor: INK,
      overflow: "linebreak" as const,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: [255, 255, 255] as RGB,
      fontStyle: "bold" as const,
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: ZEBRA },
    tableLineColor: HAIRLINE,
    tableLineWidth: 0.1,
  };

  const emptyRow = (cols: number) => [
    ["No entries", ...Array(cols - 1).fill("")],
  ];

  // ── 1. Equipment ─────────────────────────────────────────────────────────
  section(1, "Equipment", data.equipment.length);
  autoTable(doc, {
    ...baseTable,
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
  y = lastAutoTableY() + 10;

  // ── 2. Gate ──────────────────────────────────────────────────────────────
  section(2, "Gate", data.gates.length);
  autoTable(doc, {
    ...baseTable,
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
  y = lastAutoTableY() + 10;

  // ── 3. Carrier ───────────────────────────────────────────────────────────
  // From/To hold "Name (E6), Name (G1)" lists whose ID tokens are colour-coded.
  // autoTable draws cell text itself, so blank the text in willDrawCell (the
  // row height is already computed by then) and redraw it word by word.
  const stashed = new Map<string, string[]>();
  const isRefCol = (i: number) => i === 2 || i === 3;

  section(3, "Carrier", data.carriers.length);
  autoTable(doc, {
    ...baseTable,
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
  y = lastAutoTableY() + 10;

  // ── Legend ───────────────────────────────────────────────────────────────
  newPageIfNeeded(14);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Component references:", MARGIN_X, y);
  let legendX = MARGIN_X + doc.getTextWidth("Component references:") + 4;
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

  // ── Notes ────────────────────────────────────────────────────────────────
  if (data.warnings.length) {
    const bullets = data.warnings.flatMap(
      (w) => doc.splitTextToSize(`•  ${w}`, CONTENT_W - 10) as string[]
    );
    const boxH = 10 + bullets.length * 4;
    newPageIfNeeded(boxH + 4);

    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(252, 211, 77); // amber-300
    doc.roundedRect(MARGIN_X, y, CONTENT_W, boxH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text("Notes", MARGIN_X + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 53, 15); // amber-900
    bullets.forEach((line, i) => doc.text(line, MARGIN_X + 5, y + 11 + i * 4));
    y += boxH + 6;
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  // Last, so getNumberOfPages() is final and "Page n / N" is correct.
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, FOOTER_Y, PAGE_W - MARGIN_X, FOOTER_Y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`GreenEarthX  |  ${m.document_reference}`, MARGIN_X, FOOTER_Y + 5);

    const right = `Page ${p} / ${total}`;
    doc.text(
      right,
      PAGE_W - MARGIN_X - doc.getTextWidth(right),
      FOOTER_Y + 5
    );
  }

  const filename = `${m.document_reference}_Plant-Component-Registry.pdf`;
  doc.save(filename);
  return filename;
}
