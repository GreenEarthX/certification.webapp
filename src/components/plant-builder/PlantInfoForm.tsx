'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, SlidersHorizontal, Package, Plus, Trash2 } from "lucide-react";
import {
  FUEL_TYPES,
  CAPACITY_UNITS,
} from "@/constants/plant-builder";
import type { PlantInfo } from "@/app/plant-operator/plant-builder/types";

type FuelRow = { fuel_type: string; capacity: string; capacity_unit: string };
type SectionKey = "details" | "parameters" | "product";
const SECTION_NAV: { key: SectionKey; label: string; Icon: typeof Building2 }[] = [
  { key: "details", label: "Plant details", Icon: Building2 },
  { key: "parameters", label: "Plant Parameters", Icon: SlidersHorizontal },
  { key: "product", label: "Product details", Icon: Package },
];

type PlantInfoFormProps = {
  onSubmit: (info: PlantInfo) => void;
  initialData?: Partial<PlantInfo>;
  submitLabel?: string;
  /** When true, render a compact layout that fits inside a Dialog/modal. */
  embedded?: boolean;
};

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo, Democratic Republic of the",
  "Congo, Republic of the",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const PRIMARY_PATHWAYS = [
  { value: "synthetic", label: "Synthetic Pathway" },
  { value: "biogenic", label: "Biogenic Pathway" },
  { value: "thermochemical", label: "Thermochemical Pathway" },
  { value: "hybrid", label: "Hybrid Pathway" },
  { value: "physical_recovery", label: "Physical Recovery Pathway" },
  { value: "other", label: "Other" },
];

const PLANT_CONFIGURATIONS = [
  { value: "new_build", label: "New Build" },
  { value: "retrofit", label: "Retrofit" },
  { value: "expansion", label: "Expansion" },
  { value: "mixed", label: "Mixed" },
];

const SITE_ENVIRONMENTS = [
  { value: "coastal", label: "Coastal" },
  { value: "inland", label: "Inland" },
  { value: "industrial_cluster", label: "Industrial Cluster" },
  { value: "port_terminal", label: "Port Terminal" },
  { value: "urban", label: "Urban" },
  { value: "rural", label: "Rural" },
  { value: "other", label: "Other" },
];

const MATURITY_STAGES = [
  { value: "concept", label: "Concept" },
  { value: "pre_feasibility", label: "Pre Feasibility" },
  { value: "feasibility", label: "Feasibility" },
  { value: "pre_feed", label: "Pre FEED" },
  { value: "feed", label: "FEED" },
  { value: "permitting", label: "Permitting" },
  { value: "pre_fid", label: "Pre FID" },
  { value: "fid", label: "FID" },
  { value: "construction", label: "Construction" },
  { value: "commissioning", label: "Commissioning" },
  { value: "operating", label: "Operating" },
];

const CERTIFICATION_PHASES = [
  { value: "not_started", label: "Not Started" },
  { value: "eligibility_scoping", label: "Eligibility Scoping" },
  { value: "data_collection", label: "Data Collection" },
  { value: "pre_assessment", label: "Pre Assessment" },
  { value: "documentation_prepared", label: "Documentation Prepared" },
  { value: "auditor_engagement", label: "Auditor Engagement" },
  { value: "certification_submitted", label: "Certification Submitted" },
  { value: "certified", label: "Certified" },
  { value: "surveillance", label: "Surveillance" },
];

const PlantInfoForm = ({ onSubmit, initialData, submitLabel, embedded = false }: PlantInfoFormProps) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    projectName: "",
    plantName: "",
    companyName: "",
    projectLifetimeYears: "",
    primaryPathway: "",
    plantConfiguration: "",
    country: "",
    region: "",
    city: "",
    address: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    siteEnvironment: "",
    projectMaturityStage: "",
    stageReferenceYear: String(currentYear),
    certificationPhase: "",
    expectedCOD: "",
    expectedCODMode: "year",
    totalCalendarHours: "",
    plantAvailability: "",
    effectiveOperatingHours: "",
    effectiveOperatingDays: "",
  });

  // Embedded modal: which section the right-hand nav is showing.
  const [activeSection, setActiveSection] = useState<SectionKey>("details");

  // Product details = the plant's output fuels (persisted to plant.fuels).
  const [fuels, setFuels] = useState<FuelRow[]>([]);
  const addFuel = () =>
    setFuels((prev) => [...prev, { fuel_type: "", capacity: "", capacity_unit: "" }]);
  const removeFuel = (index: number) =>
    setFuels((prev) => prev.filter((_, i) => i !== index));
  const updateFuel = (index: number, field: keyof FuelRow, value: string) =>
    setFuels((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (!initialData) return;

    const getLegacyPathway = (value?: string) => {
      if (!value) return "";
      const normalized = value.toLowerCase();
      if (normalized.includes("power") || normalized.includes("synthetic")) return "synthetic";
      if (["hefa", "atj", "btl", "biogas"].some((v) => normalized.includes(v))) return "biogenic";
      if (normalized.includes("pyrolysis") || normalized.includes("thermo")) return "thermochemical";
      return "";
    };

    const statusYear = (() => {
      const raw = initialData.commercialOperationalDate;
      if (!raw) return "";
      if (typeof raw === "string") {
        const match = raw.match(/\d{4}/);
        return match ? match[0] : raw;
      }
      return "";
    })();

    const inferredCod = initialData.commercialOperationalDate ?? (initialData as any).expectedCOD ?? "";
    const inferredCodMode =
      typeof inferredCod === "string" && inferredCod.includes("-") ? "date" : "year";

    setFormData((prev) => ({
      ...prev,
      projectName: initialData.projectName ?? prev.projectName,
      plantName: initialData.plantName ?? prev.plantName,
      companyName: (initialData as any).companyName ?? (initialData as any).owner ?? prev.companyName,
      primaryPathway: getLegacyPathway(initialData.projectType) || prev.primaryPathway,
      plantConfiguration: (initialData as any).plantConfiguration ?? prev.plantConfiguration,
      country: initialData.country ?? prev.country,
      region: (initialData as any).region ?? prev.region,
      city: (initialData as any).city ?? prev.city,
      address: (initialData as any).address ?? prev.address,
      postalCode: (initialData as any).postalCode ?? prev.postalCode,
      latitude: (initialData as any)?.coordinates?.latitude ? String((initialData as any).coordinates.latitude) : prev.latitude,
      longitude: (initialData as any)?.coordinates?.longitude ? String((initialData as any).coordinates.longitude) : prev.longitude,
      siteEnvironment: (initialData as any).siteEnvironment ?? prev.siteEnvironment,
      projectMaturityStage: initialData.status ?? prev.projectMaturityStage,
      stageReferenceYear: statusYear || prev.stageReferenceYear,
      certificationPhase: (initialData as any).certificationPhase ?? prev.certificationPhase,
      expectedCOD: inferredCod || prev.expectedCOD,
      expectedCODMode: inferredCod ? inferredCodMode : prev.expectedCODMode,
      totalCalendarHours:
        (initialData as any).totalCalendarHours != null
          ? String((initialData as any).totalCalendarHours)
          : prev.totalCalendarHours,
      plantAvailability:
        (initialData as any).plantAvailability != null
          ? String((initialData as any).plantAvailability)
          : prev.plantAvailability,
      effectiveOperatingHours:
        (initialData as any).effectiveOperatingHours != null
          ? String((initialData as any).effectiveOperatingHours)
          : prev.effectiveOperatingHours,
      effectiveOperatingDays:
        (initialData as any).effectiveOperatingDays != null
          ? String((initialData as any).effectiveOperatingDays)
          : prev.effectiveOperatingDays,
    }));

    const initialFuels = (initialData as any).fuels;
    if (Array.isArray(initialFuels)) {
      setFuels(
        initialFuels.map((f: any) => ({
          fuel_type: f.fuel_type ?? "",
          capacity: f.capacity != null ? String(f.capacity) : "",
          capacity_unit: f.capacity_unit ?? "",
        })),
      );
    }
  }, [initialData]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectLifetime = Number.parseFloat(formData.projectLifetimeYears);
    const latitude = Number.parseFloat(formData.latitude);
    const longitude = Number.parseFloat(formData.longitude);
    const totalCalendarHours = Number.parseFloat(formData.totalCalendarHours);
    const plantAvailability = Number.parseFloat(formData.plantAvailability);
    const effectiveOperatingHours = Number.parseFloat(formData.effectiveOperatingHours);
    const effectiveOperatingDays = Number.parseFloat(formData.effectiveOperatingDays);

    const submitData: PlantInfo = {
      projectName: "",
      plantName: formData.plantName,
      projectLifetimeYears: Number.isFinite(projectLifetime) ? projectLifetime : undefined,
      primaryPathway: formData.primaryPathway || undefined,
      plantConfiguration: formData.plantConfiguration || undefined,
      projectType: formData.primaryPathway || "other",
      primaryFuelType: formData.primaryPathway || "other",
      country: formData.country,
      region: formData.region || undefined,
      city: formData.city || undefined,
      address: formData.address || undefined,
      postalCode: formData.postalCode || undefined,
      coordinates:
        Number.isFinite(latitude) || Number.isFinite(longitude)
          ? {
              latitude: Number.isFinite(latitude) ? latitude : undefined,
              longitude: Number.isFinite(longitude) ? longitude : undefined,
            }
          : undefined,
      siteEnvironment: formData.siteEnvironment || undefined,
      status: formData.projectMaturityStage,
      projectMaturityStage: formData.projectMaturityStage,
      stageReferenceYear: formData.stageReferenceYear || undefined,
      certificationPhase: formData.certificationPhase || undefined,
      commercialOperationalDate: formData.expectedCOD || "",
      expectedCOD: formData.expectedCOD || undefined,
      totalCalendarHours: Number.isFinite(totalCalendarHours) ? totalCalendarHours : undefined,
      plantAvailability: Number.isFinite(plantAvailability) ? plantAvailability : undefined,
      effectiveOperatingHours: Number.isFinite(effectiveOperatingHours)
        ? effectiveOperatingHours
        : undefined,
      effectiveOperatingDays: Number.isFinite(effectiveOperatingDays)
        ? effectiveOperatingDays
        : undefined,
      // Only round-trip fuels from the embedded editor (the Product details section).
      ...(embedded
        ? {
            fuels: fuels
              .filter((f) => f.fuel_type)
              .map((f) => {
                const cap = Number.parseFloat(f.capacity);
                return {
                  fuel_type: f.fuel_type,
                  capacity: Number.isFinite(cap) ? cap : undefined,
                  capacity_unit: f.capacity_unit || undefined,
                };
              }),
          }
        : {}),
    };

    onSubmit(submitData);
  };

  return (
    <div
      className={
        embedded
          ? "plant-info-form w-full"
          : "plant-info-form w-full min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 md:p-8 flex items-start"
      }
    >
      <div className={embedded ? "w-full" : "w-full max-w-none"}>
        <Card
          className={
            embedded
              ? "w-full bg-white border-0 shadow-none rounded-none overflow-hidden flex flex-col"
              : "w-full h-[calc(100vh-140px)] bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden flex flex-col"
          }
        >
          <CardHeader className="bg-gradient-to-br from-[#0F766E] to-[#15936B] text-white p-6">
            <CardTitle className="text-2xl font-bold">
              {embedded ? "Edit Plant Details" : "Project Setup"}
            </CardTitle>
            <CardDescription className="text-teal-50/90 mt-1">
              Provide the baseline project details. Only required fields are marked.
            </CardDescription>
          </CardHeader>

          <CardContent className={embedded ? "p-6 bg-white" : "p-6 md:p-8 bg-white flex-1 min-h-0"}>
            <form onSubmit={handleSubmit} className={embedded ? "flex flex-col gap-6" : "flex flex-col gap-6 h-full"}>
              <div className={embedded ? "flex gap-4" : "contents"}>
              {embedded && (
                <nav className="order-2 w-44 shrink-0 space-y-1">
                  {SECTION_NAV.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSection(key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        activeSection === key
                          ? "bg-[#0F766E] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </nav>
              )}
              <div
                className={
                  embedded
                    ? "order-1 flex-1 min-w-0 overflow-y-auto pr-3 form-scroll space-y-6 max-h-[60vh]"
                    : "flex-1 min-h-0 overflow-y-auto pr-3 form-scroll space-y-8"
                }
              >
              {(!embedded || activeSection === "details") && (
              <>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                  A. Plant Identity
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="plantName">Plant Name *</Label>
                    <Input
                      id="plantName"
                      required
                      value={formData.plantName}
                      onChange={(e) => updateField("plantName", e.target.value)}
                      placeholder="Plant name"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="projectLifetimeYears">Project Lifetime (years)</Label>
                    <Input
                      id="projectLifetimeYears"
                      type="number"
                      min="0"
                      value={formData.projectLifetimeYears}
                      onChange={(e) => updateField("projectLifetimeYears", e.target.value)}
                      placeholder="e.g., 25"
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                  B. Pathway and Configuration
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="primaryPathway">Primary Pathway</Label>
                    <Select value={formData.primaryPathway} onValueChange={(value) => updateField("primaryPathway", value)}>
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select pathway" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {PRIMARY_PATHWAYS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="plantConfiguration">Plant Configuration</Label>
                    <Select
                      value={formData.plantConfiguration}
                      onValueChange={(value) => updateField("plantConfiguration", value)}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select configuration" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {PLANT_CONFIGURATIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                  C. Location
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country *</Label>
                    <Select required value={formData.country} onValueChange={(value) => updateField("country", value)}>
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 max-h-72">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="region">Region or State</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => updateField("region", e.target.value)}
                      placeholder="Region or state"
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="Postal code"
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Street address"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="siteEnvironment">Site Environment</Label>
                    <Select value={formData.siteEnvironment} onValueChange={(value) => updateField("siteEnvironment", value)}>
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {SITE_ENVIRONMENTS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600">Coordinates (optional)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => updateField("latitude", e.target.value)}
                        placeholder="Latitude"
                        className="h-11 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => updateField("longitude", e.target.value)}
                        placeholder="Longitude"
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    If provided, coordinates override address precision.
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                  D. Project Maturity
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectMaturityStage">Project Maturity Stage *</Label>
                    <Select
                      required
                      value={formData.projectMaturityStage}
                      onValueChange={(value) => updateField("projectMaturityStage", value)}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 max-h-72">
                        {MATURITY_STAGES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stageReferenceYear">Stage Reference Year</Label>
                    <Input
                      id="stageReferenceYear"
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.stageReferenceYear}
                      onChange={(e) => updateField("stageReferenceYear", e.target.value)}
                      className="h-11 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="certificationPhase">Certification Phase</Label>
                    <Select
                      value={formData.certificationPhase}
                      onValueChange={(value) => updateField("certificationPhase", value)}
                    >
                      <SelectTrigger className="h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 max-h-72">
                        {CERTIFICATION_PHASES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expectedCOD">Expected COD</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Select
                        value={formData.expectedCODMode}
                        onValueChange={(value) => {
                          const nextMode = value === "date" ? "date" : "year";
                          const nextCod =
                            nextMode === "year"
                              ? formData.expectedCOD.match(/^\\d{4}$/)?.[0] || ""
                              : formData.expectedCOD.match(/^\\d{4}-\\d{2}-\\d{2}$/)?.[0] || "";
                          setFormData((prev) => ({
                            ...prev,
                            expectedCODMode: nextMode,
                            expectedCOD: nextCod,
                          }));
                        }}
                      >
                        <SelectTrigger className="h-11 w-full sm:w-36 bg-white border-gray-300">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="date">Full Date</SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.expectedCODMode === "date" ? (
                        <Input
                          id="expectedCOD"
                          type="date"
                          value={formData.expectedCOD}
                          onChange={(e) => updateField("expectedCOD", e.target.value)}
                          className="h-11 bg-white"
                        />
                      ) : (
                        <Input
                          id="expectedCOD"
                          type="number"
                          min="1900"
                          max="2100"
                          value={formData.expectedCOD}
                          onChange={(e) => updateField("expectedCOD", e.target.value)}
                          placeholder="YYYY"
                          className="h-11 bg-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              </>
              )}

              {(!embedded || activeSection === "parameters") && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                  E. Plant Parameters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalCalendarHours">Total Calendar Hours per Year (h/yr)</Label>
                    <Input
                      id="totalCalendarHours"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.totalCalendarHours}
                      onChange={(e) => updateField("totalCalendarHours", e.target.value)}
                      placeholder="e.g., 8760"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="plantAvailability">Plant Availability (%)</Label>
                    <Input
                      id="plantAvailability"
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={formData.plantAvailability}
                      onChange={(e) => updateField("plantAvailability", e.target.value)}
                      placeholder="e.g., 92"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="effectiveOperatingHours">Effective Operating Hours (h/yr)</Label>
                    <Input
                      id="effectiveOperatingHours"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.effectiveOperatingHours}
                      onChange={(e) => updateField("effectiveOperatingHours", e.target.value)}
                      placeholder="e.g., 8059"
                      className="h-11 bg-white"
                    />
                    <p className="text-xs text-gray-500">Hint: Annual Hours × Plant Availability</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="effectiveOperatingDays">Effective Operating Days (d/yr)</Label>
                    <Input
                      id="effectiveOperatingDays"
                      type="number"
                      step="any"
                      min="0"
                      value={formData.effectiveOperatingDays}
                      onChange={(e) => updateField("effectiveOperatingDays", e.target.value)}
                      placeholder="e.g., 336"
                      className="h-11 bg-white"
                    />
                    <p className="text-xs text-gray-500">Hint: Effective Operating Hours ÷ 24</p>
                  </div>
                </div>
              </div>
              )}

              {embedded && activeSection === "product" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="h-4 w-1 rounded-full bg-[#0F766E]" />
                    Product Details
                  </div>
                  <p className="text-xs text-gray-500">
                    Output fuels this plant produces. Add as many as needed — these appear on the
                    plant cards and across the ecosystem.
                  </p>
                  {fuels.map((row, i) => (
                    <div
                      key={i}
                      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Product {i + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFuel(i)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Fuel Type *</Label>
                        <Select
                          value={row.fuel_type || undefined}
                          onValueChange={(v) => updateFuel(i, "fuel_type", v)}
                        >
                          <SelectTrigger className="h-11 bg-white border-gray-300">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300 max-h-72">
                            {FUEL_TYPES.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label>Production Capacity</Label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={row.capacity}
                            onChange={(e) => updateFuel(i, "capacity", e.target.value)}
                            placeholder="e.g., 1000"
                            className="h-11 bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Capacity Unit</Label>
                          <Select
                            value={row.capacity_unit || undefined}
                            onValueChange={(v) => updateFuel(i, "capacity_unit", v)}
                          >
                            <SelectTrigger className="h-11 bg-white border-gray-300">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {CAPACITY_UNITS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFuel}
                    className="w-full border-dashed border-slate-300 bg-white text-slate-600 hover:border-[#0F766E] hover:bg-[#0F766E]/5 hover:text-[#0F766E]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add product
                  </Button>
                </div>
              )}

              </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200 bg-white shrink-0">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px] bg-[#0F766E] hover:bg-[#0C5F59] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  {submitLabel || "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        .form-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(15, 118, 110, 0.85) rgba(226, 232, 240, 0.8);
        }
        .form-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: rgba(15, 118, 110, 0.85);
          border-radius: 10px;
          border: 2px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>
      <style jsx global>{`
        .plant-info-form input:focus-visible,
        .plant-info-form button[role="combobox"]:focus-visible {
          border-color: #0f766e !important;
          box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.25);
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default PlantInfoForm;
