"use client";

import {
  KIND_LABEL,
  summaryUnitText,
  summaryValueText,
} from "@/lib/reports/mass-energy-balances.format";
import type { MassEnergyBalancesDto } from "@/lib/reports/types";
import {
  CenteredSectionTitle,
  EmptyRow,
  NotesBox,
  ReportFrame,
  TD,
  TH,
} from "./reportChrome";

/**
 * On-screen twin of lib/reports/mass-energy-balances.pdf.ts: the stream
 * summary table of the main report. The two annexes detail the same streams
 * under the same S-numbers.
 */

const KIND_BADGE: Record<string, string> = {
  material: "bg-slate-100 text-slate-700",
  electricity: "bg-amber-50 text-amber-800",
  heat: "bg-rose-50 text-rose-700",
};

export default function MassEnergyBalancesPreview({
  data,
}: {
  data: MassEnergyBalancesDto;
}) {
  const n = data.streams.length;
  return (
    <ReportFrame title={data.title} metadata={data.metadata}>
      <section>
        <CenteredSectionTitle
          title="Stream Summary"
          caption={`${n} ${n === 1 ? "stream" : "streams"} in the process flow`}
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-12">Stream ID</TH>
                <TH>Carrier</TH>
                <TH className="w-20">Carrier ID</TH>
                <TH>From</TH>
                <TH className="w-16">From ID</TH>
                <TH>To</TH>
                <TH className="w-16">To ID</TH>
                <TH className="w-24 text-right">Stream Value</TH>
                <TH className="w-20">Unit</TH>
              </tr>
            </thead>
            <tbody>
              {n === 0 && <EmptyRow span={9} label="No streams" />}
              {data.streams.map((row) => (
                <tr key={row.id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#0F766E]">
                    {row.id}
                  </TD>
                  <TD>
                    {row.carrier}
                    {row.kind !== "material" && (
                      <span
                        className={`ml-2 inline-block whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          KIND_BADGE[row.kind]
                        }`}
                      >
                        {KIND_LABEL[row.kind]}
                      </span>
                    )}
                  </TD>
                  <TD className="font-mono text-[12px]">{row.carrier_id}</TD>
                  <TD>{row.from}</TD>
                  <TD className="font-mono text-[12px] font-semibold text-[#F59E0B]">
                    {row.from_id}
                  </TD>
                  <TD>{row.to}</TD>
                  <TD className="font-mono text-[12px] font-semibold text-[#F59E0B]">
                    {row.to_id}
                  </TD>
                  <TD className="text-right font-mono tabular-nums">
                    {summaryValueText(row)}
                  </TD>
                  <TD className="whitespace-nowrap">{summaryUnitText(row)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          From and To only ever reference equipment or gates, by the component
          ID shown in the plant builder; two units of the same type share an ID
          and are told apart by name. Carrier IDs match the Plant Component
          Registry. The stream value is the quantity on the connector, with its
          unit exactly as stored; a dash means none was declared.
        </p>
      </section>

      <NotesBox warnings={data.warnings} />
    </ReportFrame>
  );
}
