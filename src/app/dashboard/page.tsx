"use client";

import React from "react";

// Components
import DashboardStats from "@/components/ui/DashboardStats";
import PlantsList from "@/components/ui/PlantsList";
import Chart from "@/components/ui/Chart";
import Alerts from "@/components/ui/Alerts";


// Data
import chartData from "@/data/chartData.json";

export default function Dashboard() {

  return (
    <div className="grid grid-cols-12 gap-6 mt-6">
      
      {/* Main Content - Full Width */}
      <div className="col-span-12 space-y-6">
        {/* Dashboard Statistics - Now Using API */}
        <DashboardStats/>

        {/* Plants Section - Now Using API */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Plants</h2>
          <PlantsList/>
        </section>
      </div>

      {/* Chart and Alerts Side by Side */}
      <div className="col-span-12 grid grid-cols-12 gap-6">
        {/* Chart Section */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Risk Profile</h2>
          <Chart data={chartData} />
        </section>

        {/* Alerts Section - Now Using API*/}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-lg p-6 shadow-sm">
          <Alerts/>
        </section>
      </div>

    </div>
  );
}