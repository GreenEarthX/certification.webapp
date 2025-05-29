"use client";

import React from "react";
import Link from "next/link";

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
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ color: "#17598d" }} className="text-xl font-semibold">All Plants</h2>
            <Link href="/dashboards/plants/add">
              <button className="bg-blue-600 text-white px-5 py-1 rounded-lg hover:bg-blue-700">
                Add Plant
              </button>
            </Link>
          </div>
          <PlantsList plants={plants} loading={plantsLoading} error={plantsError} />
        </section>
      </div>

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 style={{ color: "#17598d" }} className="text-xl font-semibold">Maturity Profile</h2>
          <br/>
          <Chart data={chartData} />
        </section>

        <section className="col-span-12 lg:col-span-4 bg-white rounded-lg p-6 shadow-sm">
          <Alerts alerts={alerts} loading={alertsLoading} error={alertsError} />
        </section>
      </div>
    </div>
  );
}