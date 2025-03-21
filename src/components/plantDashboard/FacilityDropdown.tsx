"use client";

import { ChangeEvent } from "react";
import { usePlants } from "@/hooks/usePlants";
import { Plant } from "@/models/plant";

interface FacilityDropdownProps {
  selectedPlant: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const FacilityDropdown: React.FC<FacilityDropdownProps> = ({ selectedPlant, onChange }) => {
  const { plants, loading } = usePlants();

  return (
    <div className="relative">
      {loading ? (
        <p className="text-sm">Loading plants...</p>
      ) : (
        <div className="relative">
          <select
            value={selectedPlant}
            onChange={onChange}
            className="text-3xl px-4 py-2 pr-10 border-transparent focus:border-transparent focus:ring-0 bg-transparent appearance-none text-[#184162] font-bold"
          >
            {plants.length === 0 ? (
              <option value="">No plants available</option>
            ) : (
              plants.map((plant : Plant) =>
                plant.id ? ( // Ensure plant_id exists before rendering
                  <option key={plant.id} value={plant.id} className="text-gray-700 font-bold">
                    {plant.name}
                  </option>
                ) : null
              )
            )}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg
              className="w-8 h-8 text-[#184162]" // Adjust size here (w-8 h-8 for example)
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDropdown;