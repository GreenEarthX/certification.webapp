import type { ComponentRef, RefKind } from "./types";

/**
 * Shared by the on-screen preview and the jsPDF renderer so the two cannot
 * drift on formatting.
 */

/** "2026-09-01 14:32" — 24-hour, viewer's local timezone. */
export function formatReportTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}`
  );
}

/** Explicit hex — the Tailwind theme in this app defines almost no tokens. */
export const REF_COLORS: Record<RefKind, string> = {
  equipment: "#0F766E",
  gate: "#F59E0B",
  carrier: "#475569",
  unknown: "#94A3B8",
};

export const BRAND = {
  primary: "#0F766E",
  primaryHover: "#0C5F59",
  primaryLight: "#14B8A6",
  ink: "#1E293B",
  muted: "#64748B",
  hairline: "#E2E8F0",
  zebra: "#F8FAFC",
} as const;

export const refText = (r: ComponentRef) => `${r.label} (${r.ref})`;

export const refListText = (refs: ComponentRef[]) =>
  refs.length ? refs.map(refText).join(", ") : "—";

/**
 * Colour for a single whitespace-delimited word, or null to leave it as body
 * text. Matching per word (rather than by index into the ref array) is what
 * keeps the PDF colouring correct after autoTable wraps a long From/To cell.
 */
const REF_TOKEN = /^\((E|G|C)\d+\)[,;]?$/;

export function wordColor(word: string): string | null {
  const m = REF_TOKEN.exec(word);
  if (!m) return null;
  if (m[1] === "E") return REF_COLORS.equipment;
  if (m[1] === "G") return REF_COLORS.gate;
  return REF_COLORS.carrier;
}

/** Two frames, so a React state change actually paints before blocking work. */
export const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
