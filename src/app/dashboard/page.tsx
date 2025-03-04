"use client";

import React from "react";

// Components
import DashboardStats from "@/components/ui/DashboardStats";
import PlantsList from "@/components/ui/PlantsList";
import Chart from "@/components/ui/Chart";
import Alerts from "@/components/ui/Alerts";
import MiniCalendar from "@/components/calendar/MiniCalendar";

// Data
import plantsData from "@/data/plantsData.json";
import chartData from "@/data/chartData.json";
import statsData from "@/data/statsData.json";
import alertsData from "@/data/alertsData.json";
import certificationsData from "@/data/certificationsData.json"; 

// Utility function for date formatting
const getCurrentDateInfo = () => ({
  shortMonth: new Date().toLocaleString("default", { month: "short" }).toUpperCase(),
  fullDate: new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
});

export default function Dashboard() {
  const { shortMonth, fullDate } = getCurrentDateInfo();
  console.log(shortMonth); 

  return (
    <div className="grid grid-cols-12 gap-6 mt-6">
      
      {/*  Main Content */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Dashboard Statistics */}
            <DashboardStats stats={statsData} />

            {/* Plants Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Plants</h2>
              <PlantsList plants={plantsData} />
            </section>

            {/* Risk Profile Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Risk Profile</h2>
              <Chart data={chartData} />
            </section>
      </div>

      {/* Right Sidebar */}
      <aside className="col-span-12 lg:col-span-4 space-y-6">
        
            {/* Calendar Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">{fullDate}</span>
              </div>
              <MiniCalendar certifications={certificationsData} /> 
            </section>

            {/* Alerts Section */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <Alerts alerts={alertsData} />
            </section>

      </aside>

    </div>
  );
}
