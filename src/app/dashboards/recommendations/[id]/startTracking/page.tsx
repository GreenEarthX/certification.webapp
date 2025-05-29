"use client";

import React, { useState } from "react";
import GanttClientWrapper from "../gantt-tracking/client-wrapper";
import TrackingPage from "../tracking/tracking";

const GanttAndTrackingPage = () => {
  const [activeTab, setActiveTab] = useState<"todo" | "gantt">("todo");

  return (
    <main className="p-6">
      {/* Tab-style Switcher */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-gray-200 mb-4">
          <nav>
            <ul className="flex gap-6">
              {["todo", "gantt"].map((tab) => (
                <li
                  key={tab}
                  className={`cursor-pointer pb-2 border-b-2 ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600 font-semibold"
                      : "border-transparent text-gray-600"
                  }`}
                  onClick={() => setActiveTab(tab as "todo" | "gantt")}
                >
                  {tab === "todo" ? "To Do List" : "Gantt Chart"}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Render Content */}
        {activeTab === "todo" ? <TrackingPage /> : <GanttClientWrapper />}
      </div>
    </main>
  );
};

export default GanttAndTrackingPage;
