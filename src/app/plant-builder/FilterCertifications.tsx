import React, { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  MapPin, 
  Leaf, 
  Scale, 
  Globe, 
  Info,
  Check,
  Shield,
  Search,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { certificationSchemes } from "./data";

interface FilterCertificationsProps {
  selectedCertifications: string[];
  setSelectedCertifications: React.Dispatch<React.SetStateAction<string[]>>;
  error: string | null;
  handleNextStep: () => void;
  handleBackStep: () => void;
}

export const FilterCertifications = ({
  selectedCertifications,
  setSelectedCertifications,
  error,
  handleNextStep,
  handleBackStep,
}: FilterCertificationsProps) => {
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fuelClassFilter, setFuelClassFilter] = useState<string>("all");

  const currentScheme = certificationSchemes.find(s => s.id === selectedScheme);

  // Derive fuel class from scheme ID (as in compliance logic)
  const getFuelClassForScheme = (id: string) => {
    switch (id) {
      case "rfnbo": return "RFNBO";
      case "advanced": return "Advanced Biofuel";
      case "annexIXA": return "Annex IX Part A";
      case "annexIXB": return "Annex IX Part B";
      default: return "Unknown";
    }
  };

  // Extract unique fuel classes
  const fuelClasses = useMemo(() => {
    const classes = certificationSchemes.map(s => getFuelClassForScheme(s.id));
    return ["all", ...new Set(classes)];
  }, []);

  // Filter schemes based on search and fuel class
  const filteredSchemes = useMemo(() => {
    return certificationSchemes.filter(scheme => {
      const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           scheme.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFuelClass = fuelClassFilter === "all" || getFuelClassForScheme(scheme.id) === fuelClassFilter;
      return matchesSearch && matchesFuelClass;
    });
  }, [searchQuery, fuelClassFilter]);

  const getCertificationDescription = (id: string) => {
    switch (id) {
      case "rfnbo":
        return "Renewable Fuel of Non-Biological Origin (RFNBO) certification ensures fuels are produced from renewable energy sources like wind or solar, meeting strict EU sustainability standards.";
      case "advanced":
        return "Advanced Biofuels certification supports fuels made from sustainable biomass or waste, promoting low-carbon alternatives for transport and industry.";
      case "annexIXA":
        return "Annex IX Part A certification focuses on biofuels from waste and residues, contributing to EU renewable energy targets with high sustainability.";
      case "annexIXB":
        return "Annex IX Part B certification targets biofuels from used cooking oil and animal fats, ensuring traceability and low environmental impact.";
      default:
        return "This certification ensures compliance with sustainability and regulatory standards for fuel production.";
    }
  };

  const getCarbonProgress = (max: number | undefined) => {
    if (!max) return 0;
    return Math.min((max / 10) * 100, 100); // Normalize to 10 gCO2e/MJ as 100%
  };

  const toggleSelection = (id: string) => {
    try {
      setSelectedCertifications((prev) =>
        prev.includes(id)
          ? prev.filter((sid) => sid !== id)
          : [...prev, id]
      );
    } catch (err) {
      toast.error("Error updating certifications.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Filter Certifications</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200">{error}</div>
      )}

      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div>
          <p className="text-sm text-gray-600 mb-6">
            Select the certification schemes relevant to your project. Use filters below to narrow down options.
          </p>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#3c83f6]/30 focus:ring-[#3c83f6]"
              />
            </div>
            <Select value={fuelClassFilter} onValueChange={setFuelClassFilter}>
              <SelectTrigger className="w-full sm:w-64 border-[#3c83f6]/30 focus:ring-[#3c83f6]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Fuel Class" />
              </SelectTrigger>
              <SelectContent>
                {fuelClasses.map((fc) => (
                  <SelectItem key={fc} value={fc}>
                    {fc === "all" ? "All Fuel Classes" : fc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compact List View (Replaced Cards - Saves Space) */}
          <div className="space-y-3">
            {filteredSchemes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No certifications match your filters.
              </div>
            ) : (
              filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className={`group relative bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#3c83f6]/50 flex items-center justify-between ${
                    selectedCertifications.includes(scheme.id) 
                      ? "border-[#3c83f6] bg-[#3c83f6]/5" 
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedScheme(scheme.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      checked={selectedCertifications.includes(scheme.id)}
                      onCheckedChange={(checked) => toggleSelection(scheme.id)}
                      className="border-[#3c83f6]/30 h-5 w-5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{scheme.name}</h3>
                      <p className="text-xs text-gray-500">
                        Fuel Class: <span className="font-medium">{getFuelClassForScheme(scheme.id)}</span> | 
                        Markets: {scheme.criteria.markets.join(", ")}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <Leaf className="h-3 w-3" />
                          Max {scheme.criteria.carbonFootprint?.max || "?"} gCO₂e/MJ
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <Globe className="h-3 w-3" />
                          {scheme.criteria.origin?.join(", ") || "Various"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="h-4 w-4 text-[#3c83f6]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBackStep}
            className="border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold px-6 py-3 rounded-lg"
          >
            ← Back to Downstream Operations
          </Button>
          <Button
            className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold px-8 py-3 rounded-lg shadow-md"
            onClick={() => window.location.href = "/recommendations"}
          >
            View Recommendations →
          </Button>

        </div>
      </div>

      {/* Dialog remains rich */}
      <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <DialogContent className="max-w-lg p-0 bg-white rounded-xl shadow-2xl">
          <div className="relative bg-gradient-to-r from-[#3c83f6]/10 to-[#16a249]/10 p-6 rounded-t-xl">
            <Shield className="absolute top-6 right-6 h-12 w-12 text-[#3c83f6]/20" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Info className="h-6 w-6 text-[#3c83f6]" />
                {currentScheme?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {getCertificationDescription(currentScheme?.id || "")}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#3c83f6] mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">Eligible Origins</h4>
                  <p className="text-sm text-gray-600">
                    {currentScheme?.criteria.origin?.join(", ") || "Various"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Leaf className="h-5 w-5 text-[#3c83f6] mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">Carbon Footprint Limit</h4>
                  <p className="text-sm text-gray-600">
                    {currentScheme?.criteria.carbonFootprint
                      ? `${currentScheme.criteria.carbonFootprint.max} ${currentScheme.criteria.carbonFootprint.unit}`
                      : "N/A"}
                  </p>
                  <Progress
                    value={getCarbonProgress(currentScheme?.criteria.carbonFootprint?.max)}
                    className="w-full h-2 mt-2 [&>div]:bg-[#3c83f6]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-[#3c83f6] mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">Chain of Custody</h4>
                  <p className="text-sm text-gray-600">
                    {currentScheme?.criteria.chainOfCustody?.join(", ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-[#3c83f6] mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">Eligible Markets</h4>
                  <p className="text-sm text-gray-600">
                    {currentScheme?.criteria.markets.join(", ") || "None"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-800 mb-2">Why Choose {currentScheme?.name}?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#16a249]" />
                  Access to {currentScheme?.criteria.markets.length || 0} key markets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#16a249]" />
                  Ensures compliance with strict sustainability regulations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#16a249]" />
                  Promotes low-carbon fuel production
                </li>
              </ul>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                className={`${
                  selectedCertifications.includes(currentScheme?.id || "")
                    ? "bg-[#16a249] hover:bg-[#16a249]/90"
                    : "bg-[#3c83f6] hover:bg-[#3c83f6]/90"
                } text-white font-semibold px-6 py-2 rounded-lg`}
                onClick={() => {
                  toggleSelection(currentScheme?.id || "");
                  toast.success(
                    `${currentScheme?.name} ${selectedCertifications.includes(currentScheme?.id || "") ? "removed" : "added"}!`
                  );
                }}
              >
                {selectedCertifications.includes(currentScheme?.id || "") ? "Selected" : "Select Certification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};