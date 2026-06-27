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
  Archive,
  Pencil,
  Users,
  Search,
  MoreVertical,
  Trash2,
  Fuel,
  Route,
  ShieldCheck,
  CalendarClock,
  Clock,
} from "lucide-react";
import {
  PRIMARY_PATHWAYS,
  MATURITY_STAGES,
  CERTIFICATION_PHASES,
  FUEL_TYPES,
  type Option,
} from "@/constants/plant-builder";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  fetchPlantsForCurrentUser,
  fetchArchivedPlantsForCurrentUser,
  archivePlant,
  unarchivePlant,
  deactivatePlant,
  fetchPlantUsers,
  createPlant,
  PlantUser,
  Plant,
  PlantPayload,
  addUserToPlant,
} from "@/services/plant-builder/plants";
import { createDigitalTwin } from "@/services/plant-builder/digitalTwins";
import NewPlantModal from "@/components/plant-builder/NewPlantModal";
import {
  fetchCurrentBackendUser,
  type BackendUser,
} from "@/services/current-user";
import {
  fetchAllBackendUsers,
  type BackendUserSummary,
} from "@/services/plant-builder/users";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Convert a stored enum value to its human label; falls back to the raw value.
const labelFor = (options: Option[], value?: string | null) => {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
};

const CAPACITY_UNIT_SHORT: Record<string, string> = {
  ton_per_year: "t/yr",
  ton_per_day: "t/d",
  kilogram_per_hour: "kg/h",
  normal_cubic_meter_per_hour: "Nm³/h",
};

// Build a short, human chip label for a fuel entry, e.g. "Hydrogen · 1000 t/yr".
const formatFuel = (fuel: { fuel_type: string; capacity?: number; capacity_unit?: string }) => {
  const name = labelFor(FUEL_TYPES, fuel.fuel_type) || "Fuel";
  if (fuel.capacity == null || fuel.capacity === ("" as any)) return name;
  const unit = fuel.capacity_unit ? CAPACITY_UNIT_SHORT[fuel.capacity_unit] ?? fuel.capacity_unit : "";
  return `${name} · ${fuel.capacity}${unit ? ` ${unit}` : ""}`;
};

const codYear = (cod?: string | null) => {
  if (!cod) return "";
  const match = String(cod).match(/\d{4}/);
  return match ? match[0] : String(cod);
};

export default function ChoosePlantPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [archivedPlants, setArchivedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "shared" | "archived">("mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlant, setSharePlant] = useState<Plant | null>(null);
  const [shareEmailInput, setShareEmailInput] = useState("");
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [shareEmailError, setShareEmailError] = useState<string | null>(null);
  const [isSharingPlant, setIsSharingPlant] = useState(false);
  const [backendUsers, setBackendUsers] = useState<BackendUserSummary[]>([]);
  const [backendUsersLoading, setBackendUsersLoading] = useState(false);
  const [backendUsersLoaded, setBackendUsersLoaded] = useState(false);
  const [plantUsersById, setPlantUsersById] = useState<Record<number, PlantUser[]>>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null);
  const [showNewPlantModal, setShowNewPlantModal] = useState(false);
  const [creatingPlant, setCreatingPlant] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        setLoading(true);
        const [result, archived, currentUser] = await Promise.all([
          fetchPlantsForCurrentUser(),
          fetchArchivedPlantsForCurrentUser(),
          fetchCurrentBackendUser().catch(() => null),
        ]);
        if (!isMounted) return;
        setPlants(result);
        setArchivedPlants(archived);
        setCurrentUserId(currentUser?.id ?? null);
        setCurrentUser(currentUser ?? null);
        const userEntries = await Promise.all(
          result.map(async (plant) => {
            try {
              const users = await fetchPlantUsers(plant.id);
              return [plant.id, users] as const;
            } catch (err) {
              console.error(`Failed to load users for plant ${plant.id}:`, err);
              return [plant.id, [] as PlantUser[]] as const;
            }
          })
        );
        const usersMap: Record<number, PlantUser[]> = {};
        userEntries.forEach(([plantId, users]) => {
          usersMap[plantId] = users;
        });
        setPlantUsersById(usersMap);
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
    setShowNewPlantModal(true);
  };

  const handleCreatePlant = async (payload: PlantPayload) => {
    setCreatingPlant(true);
    try {
      const plant = await createPlant(payload);
      try {
        await createDigitalTwin({
          plant_id: plant.id,
          name: `${plant.name} Digital Twin`,
          version: "1",
          is_active: true,
        });
      } catch (twinErr) {
        console.error("Failed to create digital twin:", twinErr);
      }
      toast.success(`Created "${plant.name}".`);
      setShowNewPlantModal(false);
      router.push(`/plant-operator/plant-builder/builder?plantId=${plant.id}`);
    } catch (err: any) {
      console.error("Failed to create plant:", err);
      toast.error(err?.message || "Failed to create plant.");
    } finally {
      setCreatingPlant(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleOpenShare = (plant: Plant) => {
    setSharePlant(plant);
    setShareEmailInput("");
    setShareEmails([]);
    setShareEmailError(null);
    setShowShareModal(true);

    if (!backendUsersLoaded && !backendUsersLoading) {
      setBackendUsersLoading(true);
      fetchAllBackendUsers()
        .then((users) => {
          setBackendUsers(users);
          setBackendUsersLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load users:", err);
          toast.error("Failed to load users list.");
        })
        .finally(() => {
          setBackendUsersLoading(false);
        });
    }
  };

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleAddShareEmail = () => {
    const value = shareEmailInput.trim().toLowerCase();
    if (!value) return;
    if (!isValidEmail(value)) {
      setShareEmailError("Enter a valid email address.");
      toast.error("Enter a valid email address.");
      return;
    }
    if (sharePlant) {
      const existingUsers = plantUsersById[sharePlant.id] || [];
      const alreadyShared = existingUsers.some(
        (user) => user.email?.toLowerCase() === value
      );
      if (alreadyShared) {
        const existingName =
          existingUsers.find((user) => user.email?.toLowerCase() === value)
            ?.name || value;
        const msg = `${existingName} already has access to this plant.`;
        setShareEmailError(msg);
        toast.info(msg);
        return;
      }
    }
    if (!backendUsersLoaded || backendUsersLoading) {
      setShareEmailError("Loading users list. Please wait a moment.");
      toast.info("Loading users list. Please wait a moment.");
      return;
    }
    const exists = backendUsers.some(
      (user) => user.email?.toLowerCase() === value
    );
    if (!exists) {
      setShareEmailError("User not found. The one sharing to should be part of our system.");
      toast.error("User not found. The one sharing to should be part of our system.");
      return;
    }
    if (shareEmails.includes(value)) {
      setShareEmailError("Email already added.");
      toast.info("Email already added.");
      setShareEmailInput("");
      return;
    }
    setShareEmails((prev) => [...prev, value]);
    setShareEmailInput("");
    setShareEmailError(null);
  };

  const handleRemoveShareEmail = (email: string) => {
    setShareEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleSendShare = async () => {
    if (!sharePlant) return;
    if (shareEmails.length === 0) {
      toast.error("Add at least one email.");
      return;
    }

    setIsSharingPlant(true);
    try {
      const users = backendUsersLoaded ? backendUsers : await fetchAllBackendUsers();
      const userByEmail = new Map(
        users.map((user) => [user.email.toLowerCase(), user])
      );
      const targets = Array.from(new Set(shareEmails.map((e) => e.toLowerCase())));
      const missing: string[] = [];
      const foundUsers = targets
        .map((email) => {
          const user = userByEmail.get(email);
          if (!user) missing.push(email);
          return user || null;
        })
        .filter(Boolean) as BackendUserSummary[];

      if (missing.length > 0) {
        toast.error(
          "Some emails are not in the system. The one sharing to should be part of our system."
        );
        return;
      }

      const existingUsers = plantUsersById[sharePlant.id] || [];
      const existingEmails = new Set(
        existingUsers.map((user) => user.email.toLowerCase())
      );
      const alreadyShared = foundUsers.filter((user) =>
        existingEmails.has(user.email.toLowerCase())
      );
      const shareTargets = foundUsers.filter(
        (user) => !existingEmails.has(user.email.toLowerCase())
      );
      if (alreadyShared.length > 0) {
        const alreadyNames = alreadyShared
          .map((user) => user.name?.trim() || user.email)
          .filter(Boolean)
          .join(", ");
        toast.info(
          alreadyShared.length === 1
            ? `${alreadyNames} already has access to this plant.`
            : `${alreadyNames} already have access to this plant.`
        );
      }
      if (shareTargets.length === 0) {
        return;
      }

      const results = await Promise.allSettled(
        shareTargets.map((user) => addUserToPlant(sharePlant.id, user.id))
      );
      const failures = results.filter((r) => r.status === "rejected");

      const totalShared = shareTargets.length - failures.length;
      if (totalShared > 0) {
        toast.success(
          totalShared === 1
            ? "Plant shared. The user will be notified by email."
            : "Plant shared. Users will be notified by email."
        );
        const sharedNames = shareTargets
          .map((user) => user.name?.trim() || user.email)
          .filter(Boolean)
          .join(", ");
        if (sharedNames) {
          toast.info(
            totalShared === 1
              ? `You shared ${sharePlant.name}. Email notification will be sent to ${sharedNames}.`
              : `You shared ${sharePlant.name}. Email notifications will be sent to: ${sharedNames}.`
          );
        }
      }
      if (failures.length > 0) {
        toast.error("Some shares failed. Please try again.");
      }

      const updatedUsers = await fetchPlantUsers(sharePlant.id);
      setPlantUsersById((prev) => ({ ...prev, [sharePlant.id]: updatedUsers }));
      const sharerName = currentUser?.name ?? undefined;
      const sharerEmail = currentUser?.email ?? undefined;
      const emailResults = await Promise.allSettled(
        shareTargets.map((user) =>
          fetch("/api/plant-share-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toEmail: user.email,
              toName: user.name ?? undefined,
              sharedByName: sharerName,
              sharedByEmail: sharerEmail,
              plantName: sharePlant.name,
              plantId: sharePlant.id,
            }),
          })
        )
      );
      const emailFailures = emailResults.filter((result) => {
        if (result.status !== "fulfilled") return true;
        return !result.value.ok;
      });
      if (emailFailures.length > 0) {
        console.warn("Some share emails failed to send.");
        toast.info("Plant shared, but some email notifications failed.");
      }
      setShowShareModal(false);
    } catch (err) {
      console.error("Failed to share plant:", err);
      toast.error(err instanceof Error ? err.message : "Failed to share plant.");
    } finally {
      setIsSharingPlant(false);
    }
  };


  const handleArchivePlant = async (plant: Plant) => {
    try {
      await archivePlant(plant.id);
      const archivedAt = new Date().toISOString();
      setPlants((prev) => prev.filter((item) => item.id !== plant.id));
      setArchivedPlants((prev) => [
        { ...plant, archived_at: archivedAt },
        ...prev,
      ]);
      toast.success(`Archived "${plant.name}".`);
    } catch (err: any) {
      console.error("Failed to archive plant:", err);
      toast.error(err?.message || "Failed to archive plant.");
    }
  };

  const handleUnarchivePlant = async (plant: Plant) => {
    try {
      await unarchivePlant(plant.id);
      setArchivedPlants((prev) => prev.filter((item) => item.id !== plant.id));
      setPlants((prev) => [{ ...plant, archived_at: null }, ...prev]);
      toast.success(`Unarchived "${plant.name}".`);
    } catch (err: any) {
      console.error("Failed to unarchive plant:", err);
      toast.error(err?.message || "Failed to unarchive plant.");
    }
  };

  const handleDeletePlant = async (plant: Plant) => {
    try {
      await deactivatePlant(plant.id);
      setPlants((prev) => prev.filter((item) => item.id !== plant.id));
      setArchivedPlants((prev) => prev.filter((item) => item.id !== plant.id));
      toast.success(`Deleted "${plant.name}".`);
    } catch (err: any) {
      console.error("Failed to delete plant:", err);
      toast.error(err?.message || "Failed to delete plant.");
    }
  };

  const getUserInitials = (user: PlantUser) => {
    const rawName = user.name?.trim();
    if (rawName) {
      const parts = rawName.split(/\s+/);
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    const email = user.email?.trim() ?? "";
    return email.slice(0, 2).toUpperCase();
  };

  const getSharedUsers = (plantId: number) => {
    const users = plantUsersById[plantId] || [];
    if (!currentUserId) return users;
    return users.filter(
      (user) => String(user.id) !== String(currentUserId)
    );
  };

  const isActive = (plant: Plant) => plant.active !== false;
  const activePlants = plants.filter(
    (plant) => isActive(plant) && !plant.archived_at
  );
  const archivedOnly = archivedPlants.filter(
    (plant) => isActive(plant) && !!plant.archived_at
  );

  const sharedPlantIds = new Set(
    activePlants
      .filter((plant) => getSharedUsers(plant.id).length > 0)
      .map((plant) => plant.id)
  );
  const sharedPlants = activePlants.filter((plant) =>
    sharedPlantIds.has(plant.id)
  );
  const myPlants = activePlants;

  const tabPlants =
    activeTab === "archived"
      ? archivedOnly
      : activeTab === "shared"
        ? sharedPlants
        : myPlants;

  const filteredPlants = tabPlants.filter((plant) => {
    const matchesSearch =
      activeTab === "shared"
        ? true
        : searchQuery
          ? `${plant.name ?? ""} ${plant.location ?? ""} ${plant.status ?? ""}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
    const matchesStatus =
      activeTab !== "mine"
        ? true
        : statusFilter === "all"
          ? true
          : (plant.status || "").toLowerCase() === statusFilter;
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
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F766E] to-[#15936B] shadow-sm">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Plant Builder
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Manage your plants, shared models, and templates.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="bg-[#0F766E] hover:bg-[#0C5F59] text-white text-sm"
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
                className={activeTab === "mine" ? "bg-[#0F766E] text-white" : ""}
                onClick={() => setActiveTab("mine")}
              >
                My Plants ({myPlants.length})
              </Button>
              <Button
                variant={activeTab === "shared" ? "default" : "outline"}
                size="sm"
                className={activeTab === "shared" ? "bg-[#0F766E] text-white" : ""}
                onClick={() => setActiveTab("shared")}
              >
                Shared Plants ({sharedPlants.length})
              </Button>
              <Button
                variant={activeTab === "archived" ? "default" : "outline"}
                size="sm"
                className={activeTab === "archived" ? "bg-[#0F766E] text-white" : ""}
                onClick={() => setActiveTab("archived")}
              >
                Archived ({archivedOnly.length})
              </Button>
            </div>
            {activeTab !== "shared" && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full sm:w-64 rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-[#0F766E] focus:outline-none"
                    placeholder="Search plants"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeTab === "mine" && (
                  <select
                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#0F766E] focus:outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="feasibility">Feasibility</option>
                    <option value="operational">Operational</option>
                    <option value="planned">Planned</option>
                  </select>
                )}
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
        ) : activeTab === "shared" && filteredPlants.length === 0 ? (
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
                {activeTab === "archived"
                  ? "No archived plants"
                  : "No plants match your filters"}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                {activeTab === "archived"
                  ? "Archived plants will appear here."
                  : "Try adjusting the search or status filter."}
              </p>
              {activeTab !== "archived" && (
                <Button
                  className="mt-4 bg-[#0F766E] hover:bg-[#0C5F59] text-white text-sm"
                  onClick={handleAddNewPlant}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plant
                </Button>
              )}
            </Card>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant) => (
              <Card
                key={plant.id}
                className={`p-4 flex flex-col justify-between hover:shadow-md transition-shadow ${
                  activeTab === "archived" ? "" : "cursor-pointer"
                }`}
                onClick={
                  activeTab === "archived"
                    ? undefined
                    : () => handleOpenPlant(plant)
                }
              >
                {(() => {
                  const sharedUsers = getSharedUsers(plant.id);
                  const meta = plant.metadata || {};
                  const pathwayLabel = labelFor(PRIMARY_PATHWAYS, plant.pathway);
                  const statusLabel = labelFor(MATURITY_STAGES, plant.status);
                  const certLabel = labelFor(CERTIFICATION_PHASES, meta.certification_phase);
                  const fuels = Array.isArray(plant.fuels) ? plant.fuels : [];
                  const locationText = [plant.address?.city, plant.location]
                    .filter(Boolean)
                    .join(", ");
                  const lifetime = meta.project_lifetime_years;
                  const cod = codYear(meta.commercial_operation_date);
                  return (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F766E]/10">
                      <Factory className="h-5 w-5 text-[#0F766E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="truncate text-sm font-semibold text-gray-900">
                        {plant.name || "Unnamed Plant"}
                      </h2>
                      {locationText ? (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      ) : (
                        <div className="mt-0.5 text-xs text-gray-400">No location set</div>
                      )}
                    </div>
                    {pathwayLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0F766E]">
                        <Route className="h-3 w-3" />
                        {pathwayLabel.replace(" Pathway", "")}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {statusLabel && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        <Clock className="h-3 w-3" />
                        {statusLabel}
                      </span>
                    )}
                    {certLabel && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-100">
                        <ShieldCheck className="h-3 w-3" />
                        {certLabel}
                      </span>
                    )}
                  </div>

                  {fuels.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {fuels.slice(0, 3).map((fuel, i) => (
                        <span
                          key={`${fuel.fuel_type}-${i}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[#0F766E]/15 bg-[#0F766E]/5 px-2 py-0.5 text-[10px] font-medium text-[#0F766E]"
                        >
                          <Fuel className="h-3 w-3" />
                          {formatFuel(fuel)}
                        </span>
                      ))}
                      {fuels.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{fuels.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {(lifetime != null || cod) && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-gray-500">
                      {lifetime != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Lifetime: <span className="font-medium text-gray-700">{lifetime} yr</span>
                        </span>
                      )}
                      {cod && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          COD: <span className="font-medium text-gray-700">{cod}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {activeTab === "shared" && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Shared with</div>
                      {sharedUsers.length === 0 ? (
                        <div className="text-xs text-gray-400 mt-1">No other users.</div>
                      ) : (
                        <div className="mt-2 flex items-center -space-x-2">
                          {sharedUsers.map((user) => (
                            <Popover key={user.id}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-full border border-[#0F766E]/30 bg-[#0F766E]/10 text-[10px] font-semibold text-[#0F766E] shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {getUserInitials(user)}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.name || user.email}
                                </div>
                                <div className="text-xs text-gray-600">{user.email}</div>
                                {user.company && (
                                  <div className="text-xs text-gray-500 mt-1">{user.company}</div>
                                )}
                              </PopoverContent>
                            </Popover>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                  );
                })()}
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center gap-2">
                    {activeTab === "archived" ? (
                      <Button
                        size="sm"
                        className="bg-[#0F766E] hover:bg-[#0C5F59] text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchivePlant(plant);
                        }}
                      >
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        Unarchive
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#0F766E] hover:bg-[#0C5F59] text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPlant(plant);
                        }}
                      >
                        Open
                      </Button>
                    )}
                    {activeTab === "mine" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShare(plant);
                        }}
                      >
                        <Users className="mr-2 h-3.5 w-3.5" />
                        Share
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        {activeTab !== "archived" ? (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/plant-operator/plant-builder/builder?plantId=${plant.id}&edit=info`);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchivePlant(plant);
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchivePlant(plant);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Unarchive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlant(plant);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewPlantModal
        open={showNewPlantModal}
        onOpenChange={setShowNewPlantModal}
        submitting={creatingPlant}
        onSubmit={handleCreatePlant}
      />

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Share Plant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {sharePlant && (
              <div className="text-sm font-semibold text-gray-900">
                {sharePlant.name}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm">Invite by Email</Label>
              <div className="flex gap-2">
                <Input
                  value={shareEmailInput}
                  onChange={(e) => {
                    setShareEmailInput(e.target.value);
                    if (shareEmailError) setShareEmailError(null);
                  }}
                  placeholder="email@example.com"
                  disabled={isSharingPlant}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddShareEmail();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddShareEmail}
                  disabled={isSharingPlant}
                >
                  Add
                </Button>
              </div>
              {backendUsersLoading && (
                <div className="text-xs text-gray-500">
                  Loading users list…
                </div>
              )}
              {shareEmailError && (
                <div className="text-xs text-red-600">{shareEmailError}</div>
              )}
            </div>
            {shareEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {shareEmails.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                  >
                    {email}
                    <button
                      type="button"
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => handleRemoveShareEmail(email)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Added users will see this plant in their Shared Plants tab.
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowShareModal(false)}
              disabled={isSharingPlant}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#0F766E] hover:bg-[#0C5F59] text-white"
              onClick={handleSendShare}
              disabled={isSharingPlant}
            >
              {isSharingPlant ? "Sharing..." : "Share"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
