"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { usePlants } from "@/hooks/usePlants";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/common/LoadingState";

const moduleCards = [
  {
    title: "Project Economics",
    rows: [
      { label: "LCOH", value: "EUR 4.20/kg" },
      { label: "CAPEX", value: "EUR 620M" },
      { label: "IRR", value: "11.3%" },
    ],
  },
  {
    title: "Green Fuel Compliance",
    rows: [
      { label: "Readiness", value: "82%" },
      { label: "RED II", value: "Compliant" },
      { label: "GHG", value: "1.2 kgCO2e/kg" },
    ],
  },
  {
    title: "Project Procurement",
    rows: [
      { label: "Equipment", value: "12/14" },
      { label: "Suppliers", value: "8" },
      { label: "Budget", value: "EUR 38.2M" },
    ],
  },
  {
    title: "Green Asset Management",
    rows: [
      { label: "Offtakers", value: "3" },
      { label: "Match", value: "87%" },
      { label: "Volume", value: "4,200 t/yr" },
    ],
  },
  {
    title: "Plausibility Check",
    rows: [
      { label: "Check History", value: "4 checks" },
      { label: "Passed", value: "2" },
      { label: "Failed", value: "1" },
    ],
  },
  {
    title: "Ecosystem Navigator",
    rows: [
      { label: "Public Visibility", value: "Published" },
      { label: "Data Tier", value: "Verified" },
      { label: "Region", value: "-" },
    ],
  },
];

const documents = [
  { name: "Plant Process Flow Diagram (PFD)", type: "Engineering", date: "2026-03-15" },
  { name: "Electrolyzer Datasheet - PEM 10MW Stack", type: "Procurement", date: "2026-03-10" },
  { name: "RED III GHG Calculation Report", type: "Compliance", date: "2026-02-28" },
  { name: "Power Purchase Agreement (PPA) - Wind", type: "Legal", date: "2026-01-22" },
  { name: "Environmental Impact Assessment (EIA)", type: "Permitting", date: "2025-11-30" },
  { name: "Geotechnical Survey Report", type: "Site", date: "2025-10-14" },
];

export default function PlantDashboard() {
  const params = useParams();
  const { plants, loading, error } = usePlants();

  const plant = useMemo(() => {
    const id = params.id ? Number(params.id) : null;
    if (!id) return null;
    return plants.find((item) => item.id === id) ?? null;
  }, [params.id, plants]);

  if (loading) {
    return <InlineLoading label="Loading plant…" className="p-6" />;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/plant-operator/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            <ArrowLeft className="size-3.5" />
            Back to Portfolio
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {plant?.name || "Plant Dashboard"}
            </h1>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{plant?.address || "Location -"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {plant?.type || "Fuel type"}
              </span>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
                Maturity {plant?.riskScore ?? 0}%
              </span>
            </div>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/plant-operator/plant-builder/builder">Open Canvas</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {moduleCards.map((card) => (
          <div
            key={card.title}
            className="group rounded-gex-md border border-slate-200 bg-white p-4 shadow-gex-sm transition-[box-shadow,border-color] duration-150 hover:border-brand-200 hover:shadow-gex-md"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">{card.title}</div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                Open module
                <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-slate-600">
              {card.rows.map((row) => (
                <div key={row.label}>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-gex-md border border-slate-200 bg-white p-6 shadow-gex-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Document Inventory</h2>
            <p className="text-xs text-slate-500">Available files & deliverables by lifecycle event</p>
          </div>
          <Button variant="outline" size="sm">
            <Upload />
            Upload
          </Button>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <div className="font-medium text-slate-900">{doc.name}</div>
                <div className="text-xs text-slate-500">{doc.type}</div>
              </div>
              <div className="text-xs tabular-nums text-slate-500">{doc.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
