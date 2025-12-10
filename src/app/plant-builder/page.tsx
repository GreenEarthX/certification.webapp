// src/app/plant-builder/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Factory, MapPin, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  fetchPlantsForCurrentUser,
  Plant,
} from "@/services/plant-builder/plants";

export default function ChoosePlantPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        setLoading(true);
        const result = await fetchPlantsForCurrentUser();
        if (!isMounted) return;
        setPlants(result);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load plants:", err);
        if (!isMounted) return;

        const msg = err?.message?.includes("geomap-auth-token")
          ? "You need to be logged in before using the Plant Builder."
          : err?.message || "Failed to load plants.";

        setError(msg);
        toast.error(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlants();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPlant = (plant: Plant) => {
    // Later this can preload the plant
    router.push(`/plant-builder/builder?plantId=${plant.id}`);
  };

  const handleAddNewPlant = () => {
    // New flow: go to builder wizard with empty data
    router.push("/plant-builder/builder");
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/plant-operator/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Choose a Plant
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Select an existing plant to open in the Plant Builder, or create a new one.
            </p>
          </div>
        </div>
        <Button
          className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-sm"
          onClick={handleAddNewPlant}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Plant
        </Button>
      </header>


      {/* Content */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading your plants…</span>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto mt-8">
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Failed to load plants
                  </p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={handleRetry}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : plants.length === 0 ? (
          <div className="max-w-xl mx-auto mt-8">
            <Card className="p-6 flex flex-col items-center text-center">
              <Factory className="h-10 w-10 text-gray-400 mb-3" />
              <h2 className="text-base font-semibold text-gray-900">
                No plants found
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                You don’t have any plants yet. Create a new plant to start building
                a digital twin and process flow.
              </p>
              <Button
                className="mt-4 bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-sm"
                onClick={handleAddNewPlant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Plant
              </Button>
            </Card>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => (
              <Card
                key={plant.id}
                className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenPlant(plant)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Factory className="h-6 w-6 text-[#4F8FF7]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {plant.name || "Unnamed Plant"}
                    </h2>
                    {plant.location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{plant.location}</span>
                      </div>
                    )}
                    {plant.status && (
                      <p className="mt-1 text-xs text-gray-500">
                        Status:{" "}
                        <span className="font-medium">{plant.status}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlant(plant);
                    }}
                  >
                    Open in Plant Builder
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
