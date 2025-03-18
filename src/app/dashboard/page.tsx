"use client";

import React from "react";

// components
import DashboardStats from "@/components/dashboard/stats/DashboardStats";
import PlantsList from "@/components/dashboard/plants/PlantsList";
import Chart from "@/components/dashboard/chart/Chart";
import Alerts from "@/components/dashboard/alerts/Alerts";
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
    <div className="grid grid-cols-12 gap-6 mt-6">
      <div className="col-span-12 space-y-6">
        <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Plants</h2>
          <PlantsList plants={plants} loading={plantsLoading} error={plantsError} />
        </section>
      </div>

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Risk Profile</h2>
          <Chart data={chartData} />
        </section>

        <section className="col-span-12 lg:col-span-4 bg-white rounded-lg p-6 shadow-sm">
          <Alerts alerts={alerts} loading={alertsLoading} error={alertsError} />
        </section>
      </div>
    </div>
  );
}