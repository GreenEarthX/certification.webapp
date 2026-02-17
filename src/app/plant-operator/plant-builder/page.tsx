// src/app/plant-builder/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Factory,
  MapPin,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  LayoutTemplate,
  Archive,
  Pencil,
  Users,
  Search,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  fetchPlantsForCurrentUser,
  Plant,
  updatePlant,
} from "@/services/plant-builder/plants";

export default function ChoosePlantPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "shared">("mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    status: "",
    projectName: "",
    projectType: "",
    primaryFuelType: "",
    commercialOperationalDate: "",
    investmentAmount: "",
    investmentUnit: "",
  });
  const [isSaving, setIsSaving] = useState(false);

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
    router.push(`/plant-operator/plant-builder/builder?plantId=${plant.id}`);
  };

  const handleAddNewPlant = () => {
    // New flow: go to builder wizard with empty data
    router.push("/plant-operator/plant-builder/builder");
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleOpenTemplates = () => setShowTemplates(true);

  const handleStartEdit = (plant: Plant) => {
    const metadata = plant.metadata || {};
    const investment = (metadata as any).investment || {};
    setEditingPlant(plant);
    setEditForm({
      name: plant.name || "",
      location: plant.location || "",
      status: plant.status || "",
      projectName: (metadata as any).projectName || "",
      projectType: (metadata as any).projectType || "",
      primaryFuelType: (metadata as any).primaryFuelType || "",
      commercialOperationalDate: (metadata as any).commercialOperationalDate || "",
      investmentAmount:
        investment.amount != null ? String(investment.amount) : "",
      investmentUnit: investment.unit || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPlant) return;
    if (!editForm.name.trim()) {
      toast.error("Plant name is required.");
      return;
    }
    try {
      setIsSaving(true);
      const amountValue = Number.parseFloat(editForm.investmentAmount);
      const investment =
        Number.isFinite(amountValue) || editForm.investmentUnit.trim()
          ? {
              amount: Number.isFinite(amountValue) ? amountValue : editForm.investmentAmount,
              unit: editForm.investmentUnit.trim(),
            }
          : undefined;

      const metadata = {
        projectName: editForm.projectName.trim(),
        projectType: editForm.projectType.trim(),
        primaryFuelType: editForm.primaryFuelType.trim(),
        commercialOperationalDate: editForm.commercialOperationalDate.trim(),
        ...(investment ? { investment } : {}),
      };

      const updated = await updatePlant(editingPlant.id, {
        name: editForm.name.trim(),
        location: editForm.location?.trim() || undefined,
        status: editForm.status?.trim() || undefined,
        metadata,
      });
      setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success("Plant updated.");
      setEditingPlant(null);
    } catch (err: any) {
      console.error("Failed to update plant:", err);
      toast.error(err?.message || "Failed to update plant.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchivePlant = (plant: Plant) => {
    toast.info(`Archive "${plant.name}" is not available yet.`);
  };

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = searchQuery
      ? `${plant.name ?? ""} ${plant.location ?? ""} ${plant.status ?? ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : (plant.status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
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
                  Plant Builder
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Manage your plants, shared models, and templates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenTemplates}
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-sm"
                onClick={handleAddNewPlant}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Plant
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "mine" ? "default" : "outline"}
                size="sm"
                className={activeTab === "mine" ? "bg-[#4F8FF7] text-white" : ""}
                onClick={() => setActiveTab("mine")}
              >
                My Plants ({plants.length})
              </Button>
              <Button
                variant={activeTab === "shared" ? "default" : "outline"}
                size="sm"
                className={activeTab === "shared" ? "bg-[#4F8FF7] text-white" : ""}
                onClick={() => setActiveTab("shared")}
              >
                Shared Plants
              </Button>
            </div>
            {activeTab === "mine" && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full sm:w-64 rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-[#4F8FF7] focus:outline-none"
                    placeholder="Search plants"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#4F8FF7] focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="feasibility">Feasibility</option>
                  <option value="operational">Operational</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            )}
          </div>
        </div>
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
        ) : activeTab === "shared" ? (
          <div className="max-w-xl mx-auto mt-8">
            <Card className="p-6 flex flex-col items-center text-center">
              <Users className="h-10 w-10 text-gray-400 mb-3" />
              <h2 className="text-base font-semibold text-gray-900">
                No shared plants
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Plants shared with you will appear here.
              </p>
            </Card>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="max-w-xl mx-auto mt-8">
            <Card className="p-6 flex flex-col items-center text-center">
              <Factory className="h-10 w-10 text-gray-400 mb-3" />
              <h2 className="text-base font-semibold text-gray-900">
                No plants match your filters
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Try adjusting the search or status filter.
              </p>
              <Button
                className="mt-4 bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-sm"
                onClick={handleAddNewPlant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plant
              </Button>
            </Card>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant) => (
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchivePlant(plant);
                      }}
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(plant);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPlant(plant);
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Plant Templates</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                Close
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              No templates available yet. They will appear here once added.
            </div>
          </Card>
        </div>
      )}

      {editingPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6 bg-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Plant</h2>
              <Button variant="ghost" size="sm" onClick={() => setEditingPlant(null)}>
                Close
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Name</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Location</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.location}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Status</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Project Name</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.projectName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, projectName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Project Type</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.projectType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, projectType: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Primary Fuel Type</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  value={editForm.primaryFuelType}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, primaryFuelType: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Commercial Operational Date</label>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                  placeholder="YYYY-MM-DD"
                  value={editForm.commercialOperationalDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, commercialOperationalDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Investment Amount</label>
                  <input
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    value={editForm.investmentAmount}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, investmentAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Investment Unit</label>
                  <input
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    value={editForm.investmentUnit}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, investmentUnit: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPlant(null)}>
                Cancel
              </Button>
              <Button
                className="bg-[#4F8FF7] hover:bg-[#3b73c4] text-white"
                disabled={isSaving}
                onClick={handleSaveEdit}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
