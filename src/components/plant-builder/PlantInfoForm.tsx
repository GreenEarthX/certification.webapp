'use client';

import { useState } from "react";
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
import type { PlantInfo } from "../../app/plant-builder/types";

type PlantInfoFormProps = {
  onSubmit: (info: PlantInfo) => void;
};

const PlantInfoForm = ({ onSubmit }: PlantInfoFormProps) => {
  const [formData, setFormData] = useState<{
    projectName: string;
    plantName: string;
    owner: string;
    country: string;
    status: string;
    projectType: string;
    statusDate: string;
    investment: string;
  }>({
    projectName: "",
    plantName: "",
    owner: "",
    country: "",
    status: "",
    projectType: "",
    statusDate: "",
    investment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const investmentAmount = parseFloat(formData.investment);
    const investment = isNaN(investmentAmount)
      ? undefined
      : { amount: investmentAmount, unit: "EUR" };

    // Derive primaryFuelType from projectType
    const primaryFuelType = (() => {
      if (formData.projectType === "power-to-x") return "electricity";
      if (["hefa", "btl", "atj", "pyrolysis", "biogas"].includes(formData.projectType))
        return "biomass";
      return "other";
    })();

    const submitData: PlantInfo = {
      projectName: formData.projectName,
      plantName: formData.plantName,
      projectType: formData.projectType,
      primaryFuelType,
      country: formData.country,
      status: formData.status,
      commercialOperationalDate: formData.statusDate,
      investment,
      // Optional: add owner if needed in PlantInfo
      // owner: formData.owner,
    };

    onSubmit(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <CardTitle className="text-2xl font-bold">Plant General Information</CardTitle>
          <CardDescription className="text-blue-100 mt-1">
            Enter the basic details about your renewable fuel plant.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROJECT & PLANT NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g., GreenFuel 2030"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plantName">Plant Name *</Label>
                <Input
                  id="plantName"
                  required
                  value={formData.plantName}
                  onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                  placeholder="e.g., BioRefinery Alpha"
                  className="h-11"
                />
              </div>
            </div>

            {/* OWNER & COUNTRY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="owner">Owner/Partner *</Label>
                <Input
                  id="owner"
                  required
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="e.g., EcoEnergy Corp"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country *</Label>
                <Select
                  required
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger id="country" className="h-11">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="netherlands">Netherlands</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="china">China</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* STATUS & YEAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="status">Project Status *</Label>
                <Select
                  required
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="feasibility">Feasibility Study</SelectItem>
                    <SelectItem value="design">Detailed Design</SelectItem>
                    <SelectItem value="construction">Under Construction</SelectItem>
                    <SelectItem value="commissioning">Commissioning</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="statusDate">Status Year *</Label>
                <Input
                  id="statusDate"
                  type="number"
                  required
                  value={formData.statusDate}
                  onChange={(e) => setFormData({ ...formData, statusDate: e.target.value })}
                  placeholder="2025"
                  min="1900"
                  max="2100"
                  className="h-11"
                />
              </div>
            </div>

            {/* PROJECT TYPE */}
            <div className="space-y-1.5">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select
                required
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
              >
                <SelectTrigger id="projectType" className="h-11">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power-to-x">Power-to-X (e-fuels)</SelectItem>
                  <SelectItem value="hefa">HEFA/HVO/SAF</SelectItem>
                  <SelectItem value="atj">Alcohol-to-Jet</SelectItem>
                  <SelectItem value="btl">Biomass-to-Liquids</SelectItem>
                  <SelectItem value="pyrolysis">Pyrolysis/HTL</SelectItem>
                  <SelectItem value="biogas">Anaerobic Digestion/RNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* INVESTMENT */}
            <div className="space-y-1.5">
              <Label htmlFor="investment">Investment (CAPEX) *</Label>
              <Input
                id="investment"
                type="number"
                required
                value={formData.investment}
                onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                placeholder="e.g., 150000000"
                min="0"
                step="1000"
                className="h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Enter amount in EUR</p>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                size="lg"
                className="min-w-[200px] bg-[#4F8FF7] hover:bg-[#3A78E0] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Continue to Product Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantInfoForm;