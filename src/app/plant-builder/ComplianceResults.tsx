import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ComplianceResult, ProductInfo, UserDetails, PlantInfo, PlacedComponent, Connection } from "./types";

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
  userDetails: UserDetails | null;
  plantInfo: PlantInfo | null;
  components: PlacedComponent[];
  connections: Connection[];
  sortComplianceResults: (results: ComplianceResult[], sortBy: "product" | "scheme" | "confidence" | "fuelClass", sortOrder: "asc" | "desc") => ComplianceResult[];
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
  userDetails,
  plantInfo,
  components,
  connections,
  sortComplianceResults,
}: ComplianceResultsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  const handleExport = (data: ComplianceResult[], filename: string) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${filename} exported successfully!`);
    } catch (err) {
      toast.error(`Error exporting ${filename}.`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;
      let currentY = 20;

      const addTableToPDF = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) {
          console.warn(`Element ${elementId} not found`);
          return;
        }

        pdf.setFontSize(14);
        pdf.text(title, margin, currentY);
        currentY += 10;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = maxWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      };

      await addTableToPDF("products-table", "Products");
      await addTableToPDF("eligibility-table", "Certification Eligibility Matrix");
      await addTableToPDF("product-scheme-table", "Product-Scheme Table");

      pdf.save("compliance-results.pdf");
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error exporting PDF.");
    }
  };

  const handleSortChange = (newSortBy: "product" | "scheme" | "confidence" | "fuelClass") => {
    try {
      setSortBy(newSortBy);
      setComplianceResults(sortComplianceResults(complianceResults, newSortBy, sortOrder));
    } catch (err) {
      toast.error("Error sorting results.");
    }
  };

  const handleOrderChange = (newSortOrder: "asc" | "desc") => {
    try {
      setSortOrder(newSortOrder);
      setComplianceResults(sortComplianceResults(complianceResults, sortBy, newSortOrder));
    } catch (err) {
      toast.error("Error sorting results.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Compliance Check Results</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200">{error}</div>
      )}
      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48 border-[#3c83f6]/30 focus:ring-[#3c83f6] rounded-md">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="scheme">Certification Scheme</SelectItem>
              <SelectItem value="confidence">Confidence Score</SelectItem>
              <SelectItem value="fuelClass">Fuel Class</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={handleOrderChange}
          >
            <SelectTrigger className="w-48 border-[#3c83f6]/30 focus:ring-[#3c83f6] rounded-md">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 gap-4 bg-[#3c83f6]/10 rounded-lg p-2">
            <TabsTrigger
              value="products"
              className="text-gray-700 font-semibold rounded-md data-[state=active]:bg-[#3c83f6] data-[state=active]:text-white"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="eligibility"
              className="text-gray-700 font-semibold rounded-md data-[state=active]:bg-[#3c83f6] data-[state=active]:text-white"
            >
              Eligibility Matrix
            </TabsTrigger>
            <TabsTrigger
              value="product-scheme"
              className="text-gray-700 font-semibold rounded-md data-[state=active]:bg-[#3c83f6] data-[state=active]:text-white"
            >
              Product-Scheme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div id="products-table">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Products</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#3c83f6]/10">
                      <TableHead className="font-semibold text-gray-700">Product Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Fuel Type</TableHead>
                      <TableHead className="font-semibold text-gray-700">Production Capacity</TableHead>
                      <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                      <TableHead className="font-semibold text-gray-700">Feedstock</TableHead>
                      <TableHead className="font-semibold text-gray-700">Offtake Location</TableHead>
                      <TableHead className="font-semibold text-gray-700">Downstream Operations</TableHead>
                      <TableHead className="font-semibold text-gray-700">Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productInfo.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                          No products defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      productInfo.map((p, index) => (
                        <TableRow key={index} className="hover:bg-[#3c83f6]/5 transition-colors">
                          <TableCell className="text-gray-900">{p.productName}</TableCell>
                          <TableCell className="text-gray-900">{p.fuelType}</TableCell>
                          <TableCell className="text-gray-900">{p.productionCapacity}</TableCell>
                          <TableCell className="text-gray-900">{p.unit}</TableCell>
                          <TableCell className="text-gray-900">{p.feedstock || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{p.offtakeLocations?.[0]?.country || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{p.downstreamOperationsArray?.join("; ") || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{p.verified ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eligibility" className="mt-6">
            <div id="eligibility-table">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Certification Eligibility Matrix</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#3c83f6]/10">
                      <TableHead className="font-semibold text-gray-700">Product</TableHead>
                      <TableHead className="font-semibold text-gray-700">Fuel Class</TableHead>
                      <TableHead className="font-semibold text-gray-700">Scheme</TableHead>
                      <TableHead className="font-semibold text-gray-700">Origin</TableHead>
                      <TableHead className="font-semibold text-gray-700">Carbon Footprint</TableHead>
                      <TableHead className="font-semibold text-gray-700">Chain of Custody</TableHead>
                      <TableHead className="font-semibold text-gray-700">Confidence Score</TableHead>
                      <TableHead className="font-semibold text-gray-700">Eligible Markets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                          No compliance results
                        </TableCell>
                      </TableRow>
                    ) : (
                      complianceResults.map((result, index) => (
                        <TableRow key={index} className="hover:bg-[#3c83f6]/5 transition-colors">
                          <TableCell className="text-gray-900">{result.productName}</TableCell>
                          <TableCell className="text-gray-900">{result.fuelClass}</TableCell>
                          <TableCell className="text-gray-900">{result.scheme}</TableCell>
                          <TableCell className="text-gray-900">{result.origin || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{result.carbonFootprint || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{result.chainOfCustody || "N/A"}</TableCell>
                          <TableCell className="text-gray-900">{result.confidence}%</TableCell>
                          <TableCell className="text-gray-900">{result.eligibleMarkets?.join(", ") || "None"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="product-scheme" className="mt-6">
            <div id="product-scheme-table">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Product-Scheme Table</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#3c83f6]/10">
                      <TableHead className="font-semibold text-gray-700">Product</TableHead>
                      <TableHead className="font-semibold text-gray-700">Fuel Class</TableHead>
                      <TableHead className="font-semibold text-gray-700">Scheme</TableHead>
                      <TableHead className="font-semibold text-gray-700">Confidence Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                          No product-scheme results
                        </TableCell>
                      </TableRow>
                    ) : (
                      complianceResults.map((result, index) => (
                        <TableRow key={index} className="hover:bg-[#3c83f6]/5 transition-colors">
                          <TableCell className="text-gray-900">{result.productName}</TableCell>
                          <TableCell className="text-gray-900">{result.fuelClass}</TableCell>
                          <TableCell className="text-gray-900">{result.scheme}</TableCell>
                          <TableCell className="text-gray-900">{result.confidence}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleBackStep}
            className="border-[#3c83f6]/30 hover:bg-[#3c83f6]/10 text-gray-700 font-semibold px-6 py-3 rounded-lg"
          >
            Back to Certifications
          </Button>
          <div className="flex gap-4">
            <Button
              className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={() => navigate("/recommendations", { state: { productInfo, complianceResults, userDetails, plantInfo, components, connections } })}
            >
              View Recommendations
            </Button>
            <Button
              className="bg-[#3c83f6] hover:bg-[#3c83f6]/90 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={() => navigate("/details", { state: { userDetails, plantInfo, productInfo, components, connections, complianceResults } })}
            >
              View Detailed Data
            </Button>
            <Button
              className="bg-[#16a249] hover:bg-[#16a249]/90 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={() => handleExport(complianceResults, "compliance-results.json")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button
              className="bg-[#16a249] hover:bg-[#16a249]/90 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};