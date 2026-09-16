"use client";

import { Fragment } from "react";
import { REF_COLORS } from "@/lib/reports/format";
import type {
  ComponentRef,
  PlantComponentRegistryDto,
} from "@/lib/reports/types";
import {
  EmptyRow,
  NotesBox,
  ReportFrame,
  SectionTitle,
  TD,
  TH,
} from "./reportChrome";

/**
 * On-screen twin of the generated PDF. Deliberately mirrors
 * lib/reports/plant-component-registry.pdf.ts section for section, and shares
 * its formatting helpers so the two cannot drift.
 *
 * The header, metadata grid, notes box and footer come from ./reportChrome,
 * which every report preview shares.
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

export default function PlantComponentRegistryPreview({
  data,
}: {
  data: PlantComponentRegistryDto;
}) {
  return (
    <ReportFrame title={data.title} metadata={data.metadata}>
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

      <NotesBox warnings={data.warnings} />
    </ReportFrame>
  );
}
