"use client";

import React, { useState } from "react";
import { Plant } from "@/models/plant";
import Link from "next/link";
import { CheckCircle2, Factory, Trash2 } from "lucide-react";
import { useDeletePlant } from "@/hooks/useDeletePlant";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  if (loading) return <TableSkeleton rows={4} columns={5} />;
  if (error) return <p className="py-4 text-sm text-red-600">{error}</p>;

  const getRiskScoreColor = (score: number): string => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskScoreText = (score: number): string => `${score}%`;

  const closeDialog = () => setPlantToDelete(null);

  if (plants.length === 0) {
    return (
      <EmptyState
        icon={Factory}
        title="No plants yet"
        description="Add your first plant to start tracking its maturity and certifications."
        action={
          <Button asChild size="sm">
            <Link href="/plant-operator/plants/add">Add Plant</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Type</th>
            <th className="pb-3 pr-4">Address</th>
            <th className="pb-3 pr-4">Maturity score</th>
            <th className="pb-3 pr-4">Actions</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {plants.map((plant) => (
            <tr
              key={plant.id || `${plant.name}-${plant.type}`}
              className="border-b border-slate-100 last:border-0 transition-colors duration-150 hover:bg-slate-50"
            >
              <td className="py-3.5 pr-4 font-medium">
                <Link
                  href={`/plant-operator/dashboard/${plant.id}/plant-dashboard`}
                  className="text-brand-700 hover:text-brand-800 hover:underline underline-offset-4"
                >
                  {plant.name}
                </Link>
              </td>
              <td className="py-3.5 pr-4">{plant.type}</td>
              <td className="py-3.5 pr-4">{plant.address}</td>
              <td className="py-3.5 pr-4">
                <div className="flex items-center">
                  <div className="mr-3 h-2 w-32 rounded-full bg-slate-200">
                    <div
                      className={`${getRiskScoreColor(plant.riskScore)} h-2 rounded-full`}
                      style={{ width: `${plant.riskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{getRiskScoreText(plant.riskScore)}</span>
                </div>
              </td>
              <td className="py-3.5 pr-4">
                <Link
                  href={`/plant-operator/manage-plants-indian?selected=${plant.id}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline underline-offset-4"
                >
                  Manage Plant Details
                </Link>
              </td>
              <td className="py-3.5 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    setPlantToDelete(plant);
                    setDeleteSuccess(false); // reset success state
                  }}
                >
                  <Trash2 />
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete confirm / success */}
      <AlertDialog open={plantToDelete !== null} onOpenChange={(open) => !open && closeDialog()}>
        <AlertDialogContent className="max-w-sm">
          {!deleteSuccess ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete plant?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong className="text-slate-900">{plantToDelete?.name}</strong>? This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800"
                  disabled={!!plantToDelete && deletingId === plantToDelete.id}
                  onClick={async (e) => {
                    e.preventDefault(); // keep the dialog open until the request settles
                    if (!plantToDelete) return;
                    const result = await deletePlant(plantToDelete.id);
                    if (result.success) {
                      setDeleteSuccess(true);
                      onDelete?.(plantToDelete.id);
                    } else {
                      alert(`Error: ${result.message}`);
                      closeDialog();
                    }
                  }}
                >
                  {plantToDelete && deletingId === plantToDelete.id ? "Deleting..." : "Confirm Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader className="items-center text-center sm:text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <CheckCircle2 className="size-6" />
                </span>
                <AlertDialogTitle>Plant deleted</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong className="text-slate-900">{plantToDelete?.name}</strong> was removed from your portfolio.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogCancel onClick={closeDialog}>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlantsList;
