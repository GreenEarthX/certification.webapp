"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// components
import DashboardStats from "@/components/plant-operator/dashboard/stats/DashboardStats";
import PlantsList from "@/components/plant-operator/dashboard/plants/PlantsList";
import Chart from "@/components/plant-operator/dashboard/chart/Chart";
import Alerts from "@/components/plant-operator/dashboard/alerts/Alerts";
import chartData from "@/data/chartData.json";

// hooks
import { usePlants } from "@/hooks/usePlants";
import { useAlerts } from "@/hooks/useAlerts";
import { useStats } from "@/hooks/useStats";

export default function Dashboard() {
  const { plants, loading: plantsLoading, error: plantsError } = usePlants();
  const { alerts, loading: alertsLoading, error: alertsError } = useAlerts();
  const { stats, loading: statsLoading, error: statsError } = useStats();

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <div className="col-span-12 space-y-6">
        <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

        <section className="rounded-gex-md border border-slate-200 bg-white p-6 shadow-gex-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">All Plants</h2>
            <Button asChild size="sm">
              <Link href="/plant-operator/plants/add">
                <Plus />
                Add Plant
              </Link>
            </Button>
          </div>
          <PlantsList plants={plants} loading={plantsLoading} error={plantsError} />
        </section>
      </div>

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <section className="col-span-12 rounded-gex-md border border-slate-200 bg-white p-6 shadow-gex-sm lg:col-span-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Maturity Profile</h2>
          <Chart data={chartData} />
        </section>

        <section className="col-span-12 rounded-gex-md border border-slate-200 bg-white p-6 shadow-gex-sm lg:col-span-4">
          <Alerts alerts={alerts} loading={alertsLoading} error={alertsError} />
        </section>
      </div>
    </div>
  );
}