import React from "react";
import { StatCardProps } from "@/models/stat";

const iconBgClasses: { [key: string]: string } = {
  green: "bg-brand-50 text-brand-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  lightblue: "bg-brand-50 text-brand-700",
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColor }) => {
  return (
    <div className="w-full rounded-gex-md border border-slate-200 bg-white p-5 shadow-gex-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-gex-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-full [&_svg]:size-5 ${
            iconBgClasses[iconColor] || "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
