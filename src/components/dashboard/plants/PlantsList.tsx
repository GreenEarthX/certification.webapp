"use client";

import React, { useState } from "react";
import { Plant } from "@/models/plant";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { useDeletePlant } from "@/hooks/useDeletePlant";

interface PlantsListProps {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  onDelete?: (plantId: number) => void;
}

const PlantsList: React.FC<PlantsListProps> = ({ plants, loading, error, onDelete }) => {
  const { deletePlant, deletingId } = useDeletePlant();
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (loading) return <p>Loading plants...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const getRiskScoreColor = (score: number): string => {
    if (score >= 70) return "bg-green-500";
    if (score <= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskScoreText = (score: number): string => `${score}%`;

  return (
    <div className="overflow-x-auto">
      <br />
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm uppercase">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Address</th>
            <th className="pb-3 font-medium">Maturity SCORE</th>
            <th className="pb-3 font-medium">Actions</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {plants.map((plant) => (
            <tr key={plant.id || `${plant.name}-${plant.type}`} className="border-t border-gray-100">
              <td className="py-4 font-medium">
                <Link href={`/dashboards/dashboard/${plant.id}/plantDashboard`}>
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{plant.name}</span>
                </Link>
              </td>
              <td className="py-4">{plant.type}</td>
              <td className="py-4">{plant.address}</td>
              <td className="py-4">
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`${getRiskScoreColor(plant.riskScore)} h-2 rounded-full`}
                      style={{ width: `${plant.riskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{getRiskScoreText(plant.riskScore)}</span>
                </div>
              </td>
              <td className="py-4">
              <Link href={`/dashboards/manage-plants?selected=${plant.id}`}>

                  <span className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    Manage Plant Details
                  </span>
                </Link>
              </td>
              <td className="py-4">
                <div
                  onClick={() => {
                    setPlantToDelete(plant);
                    setDeleteSuccess(false); // reset success state
                  }}
                  className="flex items-center text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <span className="mr-2">Delete</span>
                  <FaTrash />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal delete/confirm */}
      {plantToDelete && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          {!deleteSuccess ? (
            <>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <strong>{plantToDelete.name}</strong>?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setPlantToDelete(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const result = await deletePlant(plantToDelete.id);
                    if (result.success) {
                      setDeleteSuccess(true);
                      onDelete?.(plantToDelete.id);
                    } else {
                      alert(`Error: ${result.message}`);
                      setPlantToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {deletingId === plantToDelete.id ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-6 text-red-600">
                  ❗ Plant deleted successfully!
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={() => setPlantToDelete(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    </div>
  );
};

export default PlantsList;
