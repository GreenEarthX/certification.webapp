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
        <p className="text-gray-500 text-sm">Loading plants...</p>
      ) : (
        <select
          value={selectedPlant}
          onChange={onChange}
          className="border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm focus:ring focus:ring-blue-200 text-gray-700 cursor-pointer"
        >
          {plants.length === 0 ? (
            <option value="">No plants available</option>
          ) : (
            plants.map((plant : Plant) =>
              plant.id ? ( // Ensure plant_id exists before rendering
                <option key={plant.id} value={plant.id} className="text-gray-700">
                  {plant.name}
                </option>
              ) : null
            )
          )}
        </select>
      )}
    </div>
  );
};

export default FacilityDropdown;
