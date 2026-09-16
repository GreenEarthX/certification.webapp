import type jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatReportTimestamp } from "./format";
import type { ReportMetadata } from "./types";

/**
 * Page furniture shared by every report PDF: gradient header band, metadata
 * block, section headings, notes box, footer pagination and the table theme.
 *
 * Extracted from plant-component-registry.pdf.ts when Process Flow Operations
 * landed. Everything is parameterised by page geometry, because report 2 is
 * landscape and report 1 is portrait — nothing else differs.
 */

export type RGB = [number, number, number];

export const TEAL: RGB = [15, 118, 110]; // #0F766E
export const TEAL_LIGHT: RGB = [20, 184, 166]; // #14B8A6
export const AMBER: RGB = [245, 158, 11]; // #F59E0B
export const INK: RGB = [30, 41, 59];
export const MUTED: RGB = [100, 116, 139];
export const HAIRLINE: RGB = [226, 232, 240];
export const ZEBRA: RGB = [248, 250, 252];
/** Illustration heading teal (#205A53) — the diagram spec's own token. */
export const HEADING: RGB = [32, 90, 83];

export interface PageGeom {
  pageW: number;
  pageH: number;
  marginX: number;
  contentW: number;
  headerH: number;
  footerY: number;
}

const geom = (pageW: number, pageH: number): PageGeom => ({
  pageW,
  pageH,
  marginX: 14,
  contentW: pageW - 28,
  headerH: 30,
  footerY: pageH - 12,
});

export const A4_PORTRAIT = geom(210, 297);
export const A4_LANDSCAPE = geom(297, 210);

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Loads a PNG as a data URL for addImage. Resolves null on any failure. */
export async function loadImage(src: string): Promise<LoadedImage | null> {
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

/**
 * Header band with the document title, subtitle and logo.
 *
 * jsPDF has no gradient primitive; approximate with lerped vertical strips.
 * Each is drawn 0.2mm wider than its slot so no hairline seams show through.
 */
export async function drawHeader(
  doc: jsPDF,
  g: PageGeom,
  title: string,
  subtitle: string
): Promise<void> {
  const STRIPS = 64;
  const stripW = g.pageW / STRIPS;
  for (let i = 0; i < STRIPS; i++) {
    const t = i / (STRIPS - 1);
    doc.setFillColor(
      Math.round(TEAL[0] + (TEAL_LIGHT[0] - TEAL[0]) * t),
      Math.round(TEAL[1] + (TEAL_LIGHT[1] - TEAL[1]) * t),
      Math.round(TEAL[2] + (TEAL_LIGHT[2] - TEAL[2]) * t)
    );
    doc.rect(i * stripW, 0, stripW + 0.2, g.headerH, "F");
  }

  // logoGEX-full.png, not logoGEX.png: the latter is 51x63px, which at this
  // size prints at roughly 54 DPI and visibly blurs. The lockup is 266x167,
  // giving ~225 DPI in the slot below. jsPDF cannot embed SVG without an extra
  // renderer, and a raster at print resolution is enough here.
  const logo = await loadImage("/logoGEX-full.png");
  const LOGO_W = 30;
  if (logo) {
    const h = LOGO_W * (logo.height / logo.width);
    const x = g.pageW - g.marginX - LOGO_W;
    const yTop = (g.headerH - h) / 2;
    // The lockup is dark blue, so it needs the same white plate the on-screen
    // preview gives it rather than sitting straight on the teal band.
    const PAD = 1.6;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(
      x - PAD,
      yTop - PAD,
      LOGO_W + PAD * 2,
      h + PAD * 2,
      1.5,
      1.5,
      "F"
    );
    doc.addImage(logo.dataUrl, "PNG", x, yTop, LOGO_W, h);
  } else {
    // Never fail the document over a missing asset.
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const wordmark = "GreenEarthX";
    doc.text(wordmark, g.pageW - g.marginX - doc.getTextWidth(wordmark), 17);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, g.marginX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(subtitle, g.marginX, 22.5);
}

const lastAutoTableY = (doc: jsPDF) =>
  (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 0;

export const tableBottom = lastAutoTableY;

/**
 * Nine metadata fields in a bordered block. An autoTable rather than hand-drawn
 * cells: a long organisation name has to wrap rather than overflow into its
 * neighbour. Returns the y below the block.
 */
export function drawMetadata(
  doc: jsPDF,
  g: PageGeom,
  m: ReportMetadata,
  top: number
): number {
  // Proportions of the original 182mm portrait content width.
  const share = (mm: number) => (mm / 182) * g.contentW;

  autoTable(doc, {
    startY: top,
    margin: { left: g.marginX, right: g.marginX },
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: share(26) },
      1: { cellWidth: share(34.6) },
      2: { cellWidth: share(26) },
      3: { cellWidth: share(34.7) },
      4: { cellWidth: share(26) },
      5: { cellWidth: share(34.7) },
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

  const bottom = lastAutoTableY(doc);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(g.marginX, top - 2, g.contentW, bottom - top + 4, 2, 2, "S");
  return bottom;
}

/** Numbered section band with a teal left accent. Returns the y below it. */
export function sectionBand(
  doc: jsPDF,
  g: PageGeom,
  y: number,
  index: number,
  title: string,
  count: number
): number {
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(g.marginX, y, g.contentW, 9, "F");
  doc.setFillColor(...TEAL);
  doc.rect(g.marginX, y, 1.5, 9, "F"); // left accent
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${index}.  ${title}`, g.marginX + 5, y + 6.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const label = `${count} ${count === 1 ? "entry" : "entries"}`;
  doc.text(label, g.pageW - g.marginX - doc.getTextWidth(label) - 2, y + 6.2);
  return y + 12;
}

/**
 * Centred, tracked, uppercase heading — the style the boundary illustrations
 * are specified in. Returns the y below it.
 */
export function centredHeading(
  doc: jsPDF,
  g: PageGeom,
  y: number,
  title: string,
  caption?: string
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...HEADING);
  doc.text(title.toUpperCase(), g.pageW / 2, y, {
    align: "center",
    charSpace: 0.45,
  });
  let next = y + 5;
  if (caption) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(caption, g.pageW / 2, next, { align: "center" });
    next += 5;
  }
  return next + 2;
}

export const baseTable = (g: PageGeom) => ({
  margin: { left: g.marginX, right: g.marginX },
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
});

/** The builder's warnings, verbatim, in an amber box. Returns the y below it. */
export function notesBox(
  doc: jsPDF,
  g: PageGeom,
  y: number,
  warnings: string[],
  ensureSpace: (needed: number) => number
): number {
  if (!warnings.length) return y;

  const bullets = warnings.flatMap(
    (w) => doc.splitTextToSize(`•  ${w}`, g.contentW - 10) as string[]
  );
  const boxH = 10 + bullets.length * 4;
  const top = ensureSpace(boxH + 4);

  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(252, 211, 77); // amber-300
  doc.roundedRect(g.marginX, top, g.contentW, boxH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("Notes", g.marginX + 5, top + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15); // amber-900
  bullets.forEach((line, i) => doc.text(line, g.marginX + 5, top + 11 + i * 4));
  return top + boxH + 6;
}

/**
 * Footer rule, document reference and "Page n / N" on every page.
 * Call last, so getNumberOfPages() is final.
 */
export function paginate(doc: jsPDF, g: PageGeom, documentReference: string) {
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.2);
    doc.line(g.marginX, g.footerY, g.pageW - g.marginX, g.footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`GreenEarthX  |  ${documentReference}`, g.marginX, g.footerY + 5);

    const right = `Page ${p} / ${total}`;
    doc.text(
      right,
      g.pageW - g.marginX - doc.getTextWidth(right),
      g.footerY + 5
    );
  }
}
