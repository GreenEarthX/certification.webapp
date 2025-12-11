'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ComplianceResult, ProductInfo } from "@/app/plant-operator/plant-builder/types";
import {
  UserDetails,     // interface
  PlantInfo,       // interface
  PlacedComponent, // interface
  Connection,      // interface
} from "@/app/plant-operator/plant-builder/types"; // EXACT PATH

interface ComplianceResultsProps {
  productInfo: ProductInfo[];
  complianceResults: ComplianceResult[];
  sortBy: "product" | "scheme" | "confidence" | "fuelClass";
  setSortBy: React.Dispatch<React.SetStateAction<"product" | "scheme" | "confidence" | "fuelClass">>;
  sortOrder: "asc" | "desc";
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  setComplianceResults: React.Dispatch<React.SetStateAction<ComplianceResult[]>>;
  error: string | null;
  handleBackStep: () => void;
  sortComplianceResults: (results: ComplianceResult[], sortBy: any, sortOrder: any) => ComplianceResult[];
  userDetails: UserDetails | null;
  plantInfo: PlantInfo | null;
  components: PlacedComponent[];
  connections: Connection[];
}

export const ComplianceResults = ({
  productInfo,
  complianceResults,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setComplianceResults,
  error,
  handleBackStep,
  sortComplianceResults,
  userDetails,        // NEW
  plantInfo,          // NEW
  components,         // NEW
  connections,        // NEW
}: ComplianceResultsProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");

  const handleExport = (data: ComplianceResult[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename} exported!`);
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let y = 20;

    const addTable = async (id: string, title: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      pdf.setFontSize(14);
      pdf.text(title, margin, y);
      y += 10;
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      if (y + imgHeight > 280) { pdf.addPage(); y = 20; }
      pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
      y += imgHeight + 15;
    };

    await addTable("products-table", "Products");
    await addTable("eligibility-table", "Eligibility");
    await addTable("product-scheme-table", "Product-Scheme");

    pdf.save("compliance-results.pdf");
    toast.success("PDF exported!");
  };

  const handleSortChange = (value: any) => {
    setSortBy(value);
    setComplianceResults(sortComplianceResults(complianceResults, value, sortOrder));
  };

  const handleOrderChange = (value: any) => {
    setSortOrder(value);
    setComplianceResults(sortComplianceResults(complianceResults, sortBy, value));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance Check Results</h2>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-lg p-8 border">
        <div className="flex gap-4 mb-6">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="scheme">Scheme</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="fuelClass">Fuel Class</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={handleOrderChange}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="product-scheme">Product-Scheme</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div id="products-table">{/* ... same table ... */}</div>
          </TabsContent>

          <TabsContent value="eligibility">
            <div id="eligibility-table">{/* ... same ... */}</div>
          </TabsContent>

          <TabsContent value="product-scheme">
            <div id="product-scheme-table">{/* ... same ... */}</div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBackStep}>Back</Button>
          <div className="flex gap-2">
            <Button
              className="bg-[#3c83f6]"
              onClick={() => {
                const data = encodeURIComponent(JSON.stringify(complianceResults));
                router.push(`/plant-operator/plant-builder/recommendations?data=${data}`);
              }}
            >
              View Recommendations
            </Button>
            <Button className="bg-[#16a249]" onClick={() => handleExport(complianceResults, "results.json")}>
              <Download className="h-4 w-4 mr-2" /> JSON
            </Button>
            <Button className="bg-[#16a249]" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
