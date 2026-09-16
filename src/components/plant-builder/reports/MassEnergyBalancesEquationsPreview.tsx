"use client";

import {
  equipmentHeading,
  operandValueText,
} from "@/lib/reports/mass-energy-balances.format";
import type {
  EquationCard,
  MassEnergyBalancesEquationsDto,
} from "@/lib/reports/types";
import { NotesBox, ReportFrame, SectionTitle } from "./reportChrome";

/**
 * On-screen twin of lib/reports/mass-energy-balances-equations.pdf.ts.
 *
 * Each category present in the plant is a numbered chapter; each equipment
 * instance a subsection; each equation a card with its labelled form, its
 * symbolic form, the computed output and the inputs used — every computed
 * input pointing back at the equation it came from.
 */

function Card({ card }: { card: EquationCard }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="rounded bg-[#0F766E] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
          {card.id}
        </span>
        <span className="text-[13px] font-semibold text-slate-900">
          {card.labelled_expression}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-[92px_1fr] gap-x-3 gap-y-1 text-[12px]">
        <dt className="text-slate-500">Equation</dt>
        <dd className="font-mono text-slate-800">{card.expression}</dd>
        {card.description && (
          <>
            <dt className="text-slate-500">Description</dt>
            <dd className="text-slate-700">{card.description}</dd>
          </>
        )}
        <dt className="text-slate-500">Output</dt>
        <dd className="text-slate-800">
          {card.output.label} ={" "}
          <span className="font-mono font-semibold text-[#0F766E]">
            {operandValueText(card.output)}
          </span>
        </dd>
        <dt className="text-slate-500">Inputs</dt>
        <dd className="text-slate-800">
          {card.inputs.length === 0 ? (
            <span className="text-slate-400">none</span>
          ) : (
            <ul className="space-y-0.5">
              {card.inputs.map((op) => (
                <li key={op.symbol}>
                  {op.label} ={" "}
                  <span className="font-mono">{operandValueText(op)}</span>
                  {op.computed_in && (
                    <span className="ml-1 text-[11px] text-[#F59E0B]">
                      (computed in {op.computed_in})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </dl>
    </article>
  );
}

export default function MassEnergyBalancesEquationsPreview({
  data,
}: {
  data: MassEnergyBalancesEquationsDto;
}) {
  return (
    <ReportFrame title={data.title} metadata={data.metadata}>
      {data.categories.length === 0 && (
        <p className="text-center text-[13px] text-slate-400">
          No equation has a complete result in the latest calculation run.
        </p>
      )}

      {data.categories.map((cat) => {
        const count = cat.equipment.reduce((n, e) => n + e.equations.length, 0);
        return (
          <section key={cat.id}>
            <SectionTitle index={cat.chapter} title={cat.category} count={count} />
            <div className="space-y-5">
              {cat.equipment.map((eq) => (
                <div key={`${cat.id}-${eq.instance_id}`}>
                  <h4 className="mb-2 text-[13px] font-bold text-slate-900">
                    <span className="font-mono text-[#F59E0B]">{eq.equipment_id}</span>
                    {" "}
                    {equipmentHeading(eq).replace(`${eq.equipment_id} - `, "")}
                  </h4>
                  <div className="space-y-2">
                    {eq.equations.map((card) => (
                      <Card key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-[11px] leading-relaxed text-slate-500">
        Values are those of the latest stored calculation run for each
        equipment. Equations that were skipped for missing inputs, failed, or
        resolved through fallback values are not listed; the notes say which.
        Every input that is itself a calculated value names the equation it was
        computed in.
      </p>

      <NotesBox warnings={data.warnings} />
    </ReportFrame>
  );
}
