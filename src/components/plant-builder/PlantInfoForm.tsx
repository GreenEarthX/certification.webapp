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
import type { PlantInfo } from "@/app/plant-operator/plant-builder/types";

type PlantInfoFormProps = {
  onSubmit: (info: PlantInfo) => void;
  initialData?: Partial<PlantInfo>;
  submitLabel?: string;
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

const PlantInfoForm = ({ onSubmit, initialData, submitLabel }: PlantInfoFormProps) => {
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
  });

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
    }));
  }, [initialData]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectLifetime = Number.parseFloat(formData.projectLifetimeYears);
    const latitude = Number.parseFloat(formData.latitude);
    const longitude = Number.parseFloat(formData.longitude);

    const submitData: PlantInfo = {
      projectName: formData.projectName,
      plantName: formData.plantName,
      companyName: formData.companyName,
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
    };

    onSubmit(submitData);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8 flex items-start">
      <div className="w-full max-w-none">
        <Card className="w-full h-[calc(100vh-140px)] bg-white border border-gray-300 shadow-xl rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <CardTitle className="text-2xl font-bold">Project Setup</CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Provide the baseline project details. Only required fields are marked.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8 bg-white flex-1 min-h-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
              <div className="flex-1 min-h-0 overflow-y-auto pr-3 form-scroll space-y-8">
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-700">A. Project Identity</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      required
                      value={formData.projectName}
                      onChange={(e) => updateField("projectName", e.target.value)}
                      placeholder="Project name"
                      className="h-11 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="plantName">Plant Name</Label>
                    <Input
                      id="plantName"
                      value={formData.plantName}
                      onChange={(e) => updateField("plantName", e.target.value)}
                      placeholder="Plant name"
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder="Company name"
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
                <div className="text-sm font-semibold text-gray-700">B. Pathway and Configuration</div>
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
                <div className="text-sm font-semibold text-gray-700">C. Location</div>
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
                <div className="text-sm font-semibold text-gray-700">D. Project Maturity</div>
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

              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200 bg-white shrink-0">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px] bg-[#4F8FF7] hover:bg-[#3A78E0] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
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
          scrollbar-color: rgba(79, 143, 247, 0.85) rgba(226, 232, 240, 0.8);
        }
        .form-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.8);
          border-radius: 10px;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: rgba(79, 143, 247, 0.85);
          border-radius: 10px;
          border: 2px solid rgba(226, 232, 240, 0.8);
        }
      `}</style>
    </div>
  );
};

export default PlantInfoForm;
