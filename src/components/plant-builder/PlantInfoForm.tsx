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
import type { PlantInfo } from "@/pages/PlantBuilder";

type PlantInfoFormProps = {
  onSubmit: (info: PlantInfo) => void;
};

const PlantInfoForm = ({ onSubmit }: PlantInfoFormProps) => {
  const [formData, setFormData] = useState<PlantInfo>({
    projectName: "",
    plantName: "",
    owner: "",
    country: "",
    status: "",
    projectType: "",
    primaryFuelType: "",
    statusDate: "",
    investment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Plant General Information
        </CardTitle>
        <CardDescription>
          Enter the basic details about your renewable fuel plant. This
          information will be used to create your digital twin model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project and Plant Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                required
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantName">Plant Name *</Label>
              <Input
                id="plantName"
                required
                value={formData.plantName}
                onChange={(e) =>
                  setFormData({ ...formData, plantName: e.target.value })
                }
                placeholder="Enter plant name"
              />
            </div>
          </div>

          {/* Owner and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner/Partner *</Label>
              <Input
                id="owner"
                required
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                placeholder="Enter owner name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                required
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger id="country">
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

          {/* Status and Status Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Project Status *</Label>
              <Select
                required
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
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
            <div className="space-y-2">
              <Label htmlFor="statusDate">Status Year *</Label>
              <Input
                id="statusDate"
                type="number"
                required
                value={formData.statusDate}
                onChange={(e) =>
                  setFormData({ ...formData, statusDate: e.target.value })
                }
                placeholder="Enter year (e.g., 2025)"
                min="1900"
                max="2100"
              />
            </div>
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type *</Label>
            <Select
              required
              value={formData.projectType}
              onValueChange={(value) =>
                setFormData({ ...formData, projectType: value })
              }
            >
              <SelectTrigger id="projectType">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="power-to-x">Power-to-X (e-fuels)</SelectItem>
                <SelectItem value="hefa">HEFA/HVO/SAF</SelectItem>
                <SelectItem value="atj">Alcohol-to-Jet</SelectItem>
                <SelectItem value="btl">Biomass-to-Liquids</SelectItem>
                <SelectItem value="pyrolysis">Pyrolysis/HTL</SelectItem>
                <SelectItem value="biogas">
                  Anaerobic Digestion/RNG
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Investment */}
          <div className="space-y-2">
            <Label htmlFor="investment">Investment (CAPEX) *</Label>
            <Input
              id="investment"
              type="number"
              placeholder="Enter amount (€)"
              required
              value={formData.investment}
              onChange={(e) =>
                setFormData({ ...formData, investment: e.target.value })
              }
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90">
              Continue to Product Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlantInfoForm;