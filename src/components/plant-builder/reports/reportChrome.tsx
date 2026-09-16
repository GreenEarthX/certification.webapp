"use client";

import type { ReactNode } from "react";
import { formatReportTimestamp } from "@/lib/reports/format";
import type { ReportMetadata } from "@/lib/reports/types";

/**
 * The document furniture every report preview shares: header band, metadata
 * grid, section headings, table cells, notes box, footer.
 *
 * Extracted from PlantComponentRegistryPreview when Process Flow Operations
 * landed — both previews are on-screen twins of the same PDF chrome, so the
 * two must not drift.
 *
 * All colours are explicit: this app's Tailwind theme defines almost no tokens,
 * so bg-card / text-muted-foreground / bg-primary generate no CSS.
 */

export const MetaItem = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </dt>
    <dd
      className={`text-sm font-semibold text-slate-900 ${mono ? "font-mono text-[13px]" : ""}`}
    >
      {value || "—"}
    </dd>
  </div>
);

/** Numbered heading with a teal left accent — the Plant Component Registry style. */
export const SectionTitle = ({
  index,
  title,
  count,
}: {
  index: number;
  title: string;
  count: number;
}) => (
  <div className="mb-3 flex items-center justify-between border-l-[3px] border-[#0F766E] bg-slate-100 px-3 py-2">
    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E] font-mono text-[10px] font-bold text-white">
        {index}
      </span>
      {title}
    </h3>
    <span className="text-xs text-slate-500">
      {count} {count === 1 ? "entry" : "entries"}
    </span>
  </div>
);

/**
 * Centred, tracked, uppercase heading — the style the boundary illustrations
 * are specified in, so their own titles are not stacked under a second banner.
 */
export const CenteredSectionTitle = ({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) => (
  <div className="mb-4 text-center">
    <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#205A53]">
      {title}
    </h3>
    {caption && <p className="mt-1 text-[11px] text-slate-500">{caption}</p>}
  </div>
);

export const TH = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <th
    className={`border border-[#0F766E] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white ${className}`}
  >
    {children}
  </th>
);

export const TD = ({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  /** Hover text — used where the preview can say more than the PDF can. */
  title?: string;
}) => (
  <td
    title={title}
    className={`border border-slate-200 px-3 py-2 align-top text-slate-800 ${className}`}
  >
    {children}
  </td>
);

export const EmptyRow = ({
  span,
  label = "No entries",
}: {
  span: number;
  label?: string;
}) => (
  <tr>
    <td
      colSpan={span}
      className="border border-slate-200 px-3 py-4 text-center text-slate-400"
    >
      {label}
    </td>
  </tr>
);

/** The builder's own warnings, verbatim. Nothing is re-explained inline. */
export const NotesBox = ({ warnings }: { warnings: string[] }) => {
  if (!warnings.length) return null;
  return (
    <section className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
      <h4 className="mb-1.5 text-xs font-bold text-amber-800">
        Notes ({warnings.length})
      </h4>
      <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-amber-900">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </section>
  );
};

/**
 * Header band, nine-field metadata grid (there is deliberately no Status) and
 * footer. `children` is the document body.
 */
export const ReportFrame = ({
  title,
  metadata,
  children,
}: {
  title: string;
  metadata: ReportMetadata;
  children: ReactNode;
}) => {
  const m = metadata;
  return (
    <div className="mx-auto w-full max-w-[820px] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-1 text-[13px] text-white/85">
              {m.project_name} · {m.project_variation}
            </p>
          </div>
          {/* The full lockup at 266x167, so the preview and the PDF carry the
              same mark — logoGEX.png is 51px wide and prints blurred.
              eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logoGEX-full.png"
            alt="GreenEarthXchange"
            className="h-11 w-auto shrink-0 rounded bg-white/95 p-1.5"
          />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-x-8 gap-y-4 border-b border-slate-200 bg-slate-50 px-8 py-5">
        <MetaItem label="Document Ref." value={m.document_reference} mono />
        <MetaItem label="Project Ref." value={m.project_reference} mono />
        <MetaItem label="Revision" value={String(m.revision_number)} mono />
        <MetaItem label="Project Name" value={m.project_name} />
        <MetaItem label="Variation" value={m.project_variation} />
        <MetaItem
          label="Date"
          value={formatReportTimestamp(m.generated_at)}
          mono
        />
        <MetaItem label="User Name" value={m.user_name} />
        <MetaItem label="Company" value={m.company_name} />
      </dl>

      <div className="space-y-8 px-8 py-7 text-sm">{children}</div>

      <div className="border-t border-slate-200 px-8 py-3 text-[11px] text-slate-500">
        GreenEarthX &nbsp;|&nbsp;{" "}
        <span className="font-mono">{m.document_reference}</span>
      </div>
    </div>
  );
};
