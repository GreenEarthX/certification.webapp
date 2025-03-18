"use client";

import { useState } from "react";
import Image from "next/image";

const SchemeDetailsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const complianceScore = 70; // dynamic score here

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <div>Overview content here</div>;
      case "requirements":
        return <div>Requirements content here</div>;
      case "process":
        return <div>Process content here</div>;
      default:
        return null;
    }
  };

  const activeTabClass = "border-green-600 text-green-600";
  const inactiveTabClass = "border-transparent text-gray-500";

  const getScoreColor = (score : number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <section className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-semibold">CertifHy™ Scheme</div>
        <div className="flex items-center space-x-3">
          <span className="font-medium">Your Compliance Score:</span>
          <div className="flex items-center space-x-2">
            <div className="w-28 h-2 bg-gray-200 rounded-full">
              <div
                className={`${getScoreColor(
                  complianceScore
                )} h-2 rounded-full`}
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
            <span className="font-bold text-gray-900">{complianceScore}%</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-center items-center bg-white rounded-lg p-4 border border-gray-200">
        <Image
          src="/certifhyScheme.png"
          alt="Scheme Logo"
          width={200}
          height={100}
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-between border-b border-gray-200 mb-4">
        <nav>
          <ul className="flex gap-6">
            <li
              className={`cursor-pointer pb-2 border-b-2 ${
                activeTab === "overview" ? activeTabClass : inactiveTabClass
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </li>
            <li
              className={`cursor-pointer pb-2 border-b-2 ${
                activeTab === "requirements" ? activeTabClass : inactiveTabClass
              }`}
              onClick={() => setActiveTab("requirements")}
            >
              Requirements
            </li>
            <li
              className={`cursor-pointer pb-2 border-b-2 ${
                activeTab === "process" ? activeTabClass : inactiveTabClass
              }`}
              onClick={() => setActiveTab("process")}
            >
              Process
            </li>
          </ul>
        </nav>
        <button className="bg-green-600 text-white font-medium py-1 px-3 rounded-full text-sm hover:bg-green-700 transition">
          Start tracking
        </button>
      </div>

      <div className="text-gray-700">{renderContent()}</div>
    </section>
  );
};

export default SchemeDetailsPage;
