"use client";

import { Fragment } from "react";
import { REF_COLORS, formatReportTimestamp } from "@/lib/reports/format";
import type {
  ComponentRef,
  PlantComponentRegistryDto,
} from "@/lib/reports/types";

/**
 * On-screen twin of the generated PDF. Deliberately mirrors
 * lib/reports/plant-component-registry.pdf.ts section for section, and shares
 * its formatting helpers so the two cannot drift.
 *
 * All colours are explicit: this app's Tailwind theme defines almost no
 * tokens, so bg-card / text-muted-foreground / bg-primary generate no CSS.
 */

const RefList = ({ refs }: { refs: ComponentRef[] }) => {
  if (!refs.length) return <span className="text-slate-400">—</span>;
  return (
    <>
      {refs.map((r, i) => (
        <Fragment key={`${r.kind}-${r.ref}-${i}`}>
          {i > 0 && <span className="text-slate-400">, </span>}
          <span className="whitespace-nowrap">
            {r.label}{" "}
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color: REF_COLORS[r.kind] }}
            >
              ({r.ref})
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
};

const MetaItem = ({
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

const SectionTitle = ({
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

const TH = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th
    className={`border border-[#0F766E] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-white ${className}`}
  >
    {children}
  </th>
);

const TD = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td
    className={`border border-slate-200 px-3 py-2 align-top text-slate-800 ${className}`}
  >
    {children}
  </td>
);

const EmptyRow = ({ span }: { span: number }) => (
  <tr>
    <td
      colSpan={span}
      className="border border-slate-200 px-3 py-4 text-center text-slate-400"
    >
      No entries
    </td>
  </tr>
);

export default function PlantComponentRegistryPreview({
  data,
}: {
  data: PlantComponentRegistryDto;
}) {
  const m = data.metadata;

  return (
    <div className="mx-auto w-full max-w-[820px] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {data.title}
            </h2>
            <p className="mt-1 text-[13px] text-white/85">
              {m.project_name} · {m.project_variation}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logoGEX.png"
            alt="GreenEarthX"
            className="h-9 w-auto shrink-0 rounded bg-white/95 p-1"
          />
        </div>
      </div>

      {/* Metadata — nine fields, no Status */}
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

      <div className="space-y-8 px-8 py-7 text-sm">
        {/* 1. Equipment */}
        <section>
          <SectionTitle index={1} title="Equipment" count={data.equipment.length} />
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-16">ID</TH>
                <TH>Equipment</TH>
                <TH className="w-28 text-center">Quantity</TH>
              </tr>
            </thead>
            <tbody>
              {data.equipment.length === 0 && <EmptyRow span={3} />}
              {data.equipment.map((row) => (
                <tr key={row.id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#0F766E]">
                    {row.id}
                  </TD>
                  <TD>{row.equipment}</TD>
                  <TD className="text-center font-mono tabular-nums">
                    {row.quantity}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            The ID identifies the equipment <strong>type</strong>, not an
            individual unit — a quantity of 2 means two units of the same type.
          </p>
        </section>

        {/* 2. Gate */}
        <section>
          <SectionTitle index={2} title="Gate" count={data.gates.length} />
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-16">ID</TH>
                <TH>Gate</TH>
                <TH className="w-44">Role</TH>
              </tr>
            </thead>
            <tbody>
              {data.gates.length === 0 && <EmptyRow span={3} />}
              {data.gates.map((row) => (
                <tr key={row.id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#F59E0B]">
                    {row.id}
                  </TD>
                  <TD>{row.gate}</TD>
                  <TD>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        row.role === "Upstream"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.role === "Downstream"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.role}
                    </span>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 3. Carrier */}
        <section>
          <SectionTitle index={3} title="Carrier" count={data.carriers.length} />
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-16">ID</TH>
                <TH className="w-44">Carrier</TH>
                <TH>From</TH>
                <TH>To</TH>
              </tr>
            </thead>
            <tbody>
              {data.carriers.length === 0 && <EmptyRow span={4} />}
              {data.carriers.map((row) => (
                <tr key={row.id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#0F766E]">
                    {row.id}
                  </TD>
                  <TD>{row.carrier}</TD>
                  <TD className="text-[13px]">
                    <RefList refs={row.from} />
                  </TD>
                  <TD className="text-[13px]">
                    <RefList refs={row.to} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-wrap items-center gap-6 rounded-md border border-teal-100 bg-teal-50/60 px-4 py-2.5 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: REF_COLORS.equipment }}
              />
              Equipment
              <span
                className="font-mono font-semibold"
                style={{ color: REF_COLORS.equipment }}
              >
                (E1, E2…)
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: REF_COLORS.gate }}
              />
              Gate
              <span
                className="font-mono font-semibold"
                style={{ color: REF_COLORS.gate }}
              >
                (G1, G2…)
              </span>
            </span>
          </div>
        </section>

        {/* Notes */}
        {data.warnings.length > 0 && (
          <section className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
            <h4 className="mb-1.5 text-xs font-bold text-amber-800">
              Notes ({data.warnings.length})
            </h4>
            <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-amber-900">
              {data.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="border-t border-slate-200 px-8 py-3 text-[11px] text-slate-500">
        GreenEarthX &nbsp;|&nbsp;{" "}
        <span className="font-mono">{m.document_reference}</span>
      </div>
    </div>
  );
}
