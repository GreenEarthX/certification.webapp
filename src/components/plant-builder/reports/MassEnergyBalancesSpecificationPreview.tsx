"use client";

import {
  SPEC_COLUMNS_PER_TABLE,
  chunk,
  kwText,
  kwhText,
  specSections,
  type SpecCell,
  type SpecSection,
} from "@/lib/reports/mass-energy-balances.format";
import type {
  MassEnergyBalancesSpecificationDto,
  SpecificationBlock,
  StreamSpecification,
} from "@/lib/reports/types";
import {
  CenteredSectionTitle,
  EmptyRow,
  NotesBox,
  ReportFrame,
  SectionTitle,
  TD,
  TH,
} from "./reportChrome";

/**
 * On-screen twin of lib/reports/mass-energy-balances-specification.pdf.ts.
 *
 * The Specification is transposed — attributes are rows, streams are columns —
 * per the report specification's HTML rules: the unit appears once in the
 * attribute column, min | norm | max cells are three equal segments with a
 * visibly empty slot for a missing value, and the 20 composition rows are
 * always shown. Blocks are split into tables of SPEC_COLUMNS_PER_TABLE streams
 * so the page never scrolls sideways.
 */

const CELL = "border border-slate-200 px-2 py-1.5 align-top text-[12px]";

const Segment = ({ v }: { v: string }) => (
  <span
    className={`flex-1 truncate px-1 text-center font-mono tabular-nums ${
      v ? "text-slate-800" : "text-transparent"
    }`}
  >
    {v || "·"}
  </span>
);

function Cell({ cell }: { cell: SpecCell }) {
  switch (cell.kind) {
    case "text":
      return (
        <td className={`${CELL} text-center ${cell.mono ? "font-mono tabular-nums" : ""}`}>
          {cell.text}
        </td>
      );
    case "triplet":
      return (
        <td className={`${CELL} p-0`}>
          <div className="flex divide-x divide-dashed divide-slate-300 py-1.5">
            <Segment v={cell.min} />
            <Segment v={cell.norm} />
            <Segment v={cell.max} />
          </div>
        </td>
      );
    case "composition":
      return (
        <td className={`${CELL} text-center`}>
          {cell.label && (
            <div className="truncate text-[10px] text-slate-500" title={cell.label}>
              {cell.label}
            </div>
          )}
          <div className="font-mono tabular-nums">{cell.value}</div>
        </td>
      );
  }
}

function SpecTable({
  sections,
  streams,
}: {
  sections: SpecSection[];
  streams: StreamSpecification[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-[220px]" />
          {streams.map((s) => (
            <col key={s.id} />
          ))}
        </colgroup>
        <thead className="bg-[#0F766E]">
          <tr>
            <TH>Attribute</TH>
            {streams.map((s) => (
              <TH key={s.id} className="text-center font-mono">
                {s.id}
              </TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <SectionRows key={section.title} section={section} streams={streams} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRows({
  section,
  streams,
}: {
  section: SpecSection;
  streams: StreamSpecification[];
}) {
  const isDescription = section.index === null;
  return (
    <>
      {!isDescription && (
        <tr>
          <td
            colSpan={streams.length + 1}
            className="border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F766E]"
            style={{ backgroundColor: "hsl(200,10%,92%)" }}
          >
            Section {section.index}: {section.title}
          </td>
        </tr>
      )}
      {section.rows.map((row) => {
        const isTotal = row.key === "total";
        return (
          <tr
            key={row.key}
            style={
              isDescription ? { backgroundColor: "hsl(45,15%,95%)" } : undefined
            }
            className={isTotal ? "font-mono font-bold" : ""}
          >
            <td className={`${CELL} text-left text-slate-800`}>
              {row.label}
              {row.unit && (
                <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                  {row.unit}
                </span>
              )}
            </td>
            {streams.map((s) => (
              <Cell key={s.id} cell={row.cell(s)} />
            ))}
          </tr>
        );
      })}
    </>
  );
}

function BlockSection({
  block,
  index,
}: {
  block: SpecificationBlock;
  index: number;
}) {
  const sections = specSections(block);
  const groups = chunk(block.streams, SPEC_COLUMNS_PER_TABLE);
  return (
    <section>
      <SectionTitle
        index={index}
        title={`Block: ${block.block}`}
        count={block.streams.length}
      />
      <p className="mb-3 text-[11px] text-slate-500">{block.description}</p>
      {groups.length === 0 && (
        <p className="text-[12px] text-slate-400">No material streams.</p>
      )}
      <div className="space-y-5">
        {groups.map((streams, i) => (
          <div key={i}>
            {groups.length > 1 && (
              <p className="mb-1 font-mono text-[11px] text-slate-500">
                Streams {streams[0].id} to {streams[streams.length - 1].id}
              </p>
            )}
            <SpecTable sections={sections} streams={streams} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MassEnergyBalancesSpecificationPreview({
  data,
}: {
  data: MassEnergyBalancesSpecificationDto;
}) {
  const { electricity, heat } = data.energy;
  const energyIndex = data.blocks.length + 1;
  return (
    <ReportFrame title={data.title} metadata={data.metadata}>
      <section>
        <CenteredSectionTitle
          title="Mass Balance"
          caption="Per-stream specification, grouped by process block"
        />
      </section>

      {data.blocks.map((block, i) => (
        <BlockSection key={block.block} block={block} index={i + 1} />
      ))}

      <section>
        <CenteredSectionTitle
          title="Energy Balance"
          caption={`Electricity and heat duties; annual figures on ${data.time_basis.hours_per_year} operating hours per year${
            data.time_basis.is_default ? " (continuous operation assumed)" : ""
          }`}
        />

        <SectionTitle
          index={energyIndex}
          title="Electricity Consumption"
          count={electricity.length}
        />
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-20">Stream ID</TH>
                <TH>Equipment</TH>
                <TH className="w-24">Equipment ID</TH>
                <TH className="w-36 text-right">Electricity Consumption kW</TH>
                <TH className="w-40 text-right">Annual Consumption kWh/yr</TH>
              </tr>
            </thead>
            <tbody>
              {electricity.length === 0 && (
                <EmptyRow span={5} label="No electricity streams" />
              )}
              {electricity.map((r) => (
                <tr key={r.stream_id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#0F766E]">{r.stream_id}</TD>
                  <TD>{r.equipment}</TD>
                  <TD className="font-mono text-[12px] font-semibold text-[#F59E0B]">{r.equipment_id}</TD>
                  <TD className="text-right font-mono tabular-nums">{kwText(r.consumption_kw)}</TD>
                  <TD className="text-right font-mono tabular-nums">{kwhText(r.annual_kwh)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionTitle index={energyIndex + 1} title="Heat Duty" count={heat.length} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="bg-[#0F766E]">
              <tr>
                <TH className="w-20">Stream ID</TH>
                <TH>From</TH>
                <TH className="w-20">From ID</TH>
                <TH>To</TH>
                <TH className="w-20">To ID</TH>
                <TH className="w-28 text-right">Heat Duty kW</TH>
                <TH className="w-36 text-right">Annual Heat Duty kWh/yr</TH>
              </tr>
            </thead>
            <tbody>
              {heat.length === 0 && <EmptyRow span={7} label="No heat streams" />}
              {heat.map((r) => (
                <tr key={r.stream_id} className="even:bg-slate-50">
                  <TD className="font-mono font-semibold text-[#0F766E]">{r.stream_id}</TD>
                  <TD>{r.from}</TD>
                  <TD className="font-mono text-[12px] font-semibold text-[#F59E0B]">{r.from_id}</TD>
                  <TD>{r.to}</TD>
                  <TD className="font-mono text-[12px] font-semibold text-[#F59E0B]">{r.to_id}</TD>
                  <TD className="text-right font-mono tabular-nums">{kwText(r.heat_duty_kw)}</TD>
                  <TD className="text-right font-mono tabular-nums">{kwhText(r.annual_kwh)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Energy streams carry no mass and have no material attributes, so they
          are excluded from the mass balance tables above. Duties are the
          design (norm) rating on the connector; annual figures multiply it by
          the plant&apos;s operating hours.
        </p>
      </section>

      <NotesBox warnings={data.warnings} />
    </ReportFrame>
  );
}
