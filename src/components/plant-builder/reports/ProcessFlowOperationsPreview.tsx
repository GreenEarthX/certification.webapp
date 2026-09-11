"use client";

import {
  buildStreamEconomicsDiagram,
  buildSystemBoundaryDiagram,
} from "@/lib/reports/boundary-diagram";
import {
  DASH,
  IMPACT_STYLE,
  flowUnitText,
  flowValueText,
  priceText,
} from "@/lib/reports/format";
import type { ProcessFlowOperationsDto } from "@/lib/reports/types";
import DiagramSvg from "./DiagramSvg";
import {
  CenteredSectionTitle,
  EmptyRow,
  NotesBox,
  ReportFrame,
  TD,
  TH,
} from "./reportChrome";

/**
 * On-screen twin of lib/reports/process-flow-operations.pdf.ts. Both draw the
 * illustrations from lib/reports/boundary-diagram.ts and format every figure
 * through lib/reports/format.ts, so the screen and the page cannot drift.
 */

const DIRECTION_BADGE: Record<string, string> = {
  upstream: "bg-emerald-50 text-emerald-700",
  downstream: "bg-amber-50 text-amber-800",
  [DASH]: "bg-slate-100 text-slate-600",
};

const ARROW: Record<string, string> = {
  upstream: "▲",
  downstream: "▼",
  [DASH]: "",
};


export default function ProcessFlowOperationsPreview({
  data,
}: {
  data: ProcessFlowOperationsDto;
}) {
  const boundary = buildSystemBoundaryDiagram(data.streams, data.metadata);
  const economics = buildStreamEconomicsDiagram(data.streams);

  return (
    <ReportFrame title={data.title} metadata={data.metadata}>
      {/* Illustration A — its centred heading is drawn inside the diagram, so
          there is deliberately no section band above it. */}
      <section>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <DiagramSvg
            diagram={boundary}
            label="System boundary: every stream entering and leaving the plant"
          />
        </div>
      </section>

      {/* Illustration B */}
      <section>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <DiagramSvg
            diagram={economics}
            label="Stream economics: priced inputs and outputs"
          />
        </div>
      </section>

      {/* The data behind both illustrations */}
      <section>
        <CenteredSectionTitle
          title="Boundary Streams"
          caption={`${data.streams.length} ${
            data.streams.length === 1 ? "stream" : "streams"
          } crossing the system boundary`}
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-12">ID</TH>
                <TH className="w-28">Direction</TH>
                <TH>Gate</TH>
                <TH>Carrier</TH>
                <TH className="w-28 text-right">Stream Value</TH>
                <TH className="w-24">Stream Unit</TH>
                <TH className="w-24">Impact</TH>
                <TH className="w-28 text-right">Price</TH>
              </tr>
            </thead>
            <tbody>
              {data.streams.length === 0 && (
                <EmptyRow
                  span={8}
                  label="No streams cross the system boundary"
                />
              )}
              {data.streams.map((row) => {
                const impact = IMPACT_STYLE[row.economic_impact];
                return (
                  <tr key={row.id} className="even:bg-slate-50">
                    <TD className="font-mono font-semibold text-[#0F766E]">
                      {row.id}
                    </TD>
                    <TD>
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          DIRECTION_BADGE[row.direction]
                        }`}
                      >
                        {ARROW[row.direction]} {row.direction}
                      </span>
                    </TD>
                    <TD className="whitespace-nowrap">
                      {row.gate}{" "}
                      <span className="font-mono text-[11px] font-semibold text-[#F59E0B]">
                        ({row.gate_id})
                      </span>
                    </TD>
                    <TD>{row.carrier}</TD>
                    {/* The quantity on the connector itself — gate to carrier
                        for a supply, carrier to gate for an offtake — with its
                        unit exactly as stored beside it. */}
                    <TD className="text-right font-mono tabular-nums">
                      {flowValueText(row)}
                    </TD>
                    <TD className="whitespace-nowrap">{flowUnitText(row)}</TD>
                    <TD>
                      <span
                        className="inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          color: impact.color,
                          backgroundColor: `${impact.color}14`,
                        }}
                      >
                        {row.economic_impact}
                      </span>
                    </TD>
                    <TD className="whitespace-nowrap text-right font-mono tabular-nums">
                      {priceText(row)}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          The stream value is the quantity carried on the connector itself —
          gate to carrier for a supply, carrier to gate for an offtake — with
          its unit exactly as stored; nothing is converted. A dash means no
          figure was declared; <strong>NA</strong> means no economic value was.
          Gate IDs match the Plant Component Registry for this variation.
        </p>
      </section>

      <NotesBox warnings={data.warnings} />
    </ReportFrame>
  );
}
