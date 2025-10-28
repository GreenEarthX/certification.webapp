'use client';

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceResult, ProductInfo } from "../types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// === ATTRIBUTES ===
const attributes = [
  "COD", "36 month window", "operational year", "temporal matching",
  "PPA information", "Direct Line", "Bidding Zone", "Feedstock",
  "Process Emissions", "End Use Emissions", "Bio Feedstock",
  "CO2 Origin", "Fossil Inputs", "Grid Carbon Intensity",
];

// === MARKET DATA ===
const marketData: Record<string, { price: string; demandMultiplier: string }> = {
  EU: { price: "120.50", demandMultiplier: "2.5" },
  UK: { price: "110.75", demandMultiplier: "2.0" },
  US: { price: "95.00", demandMultiplier: "1.8" },
  India: { price: "85.25", demandMultiplier: "1.5" },
};

// === FALLBACK DATA ===
export const fallbackComplianceResults: ComplianceResult[] = [
  { productId: "P001", productName: "Hydrogen", scheme: "RFNBO", fuelClass: "RFNBO", confidence: 92, eligibleMarkets: ["EU", "UK"] },
  { productId: "P001", productName: "Hydrogen", scheme: "Advanced Biofuels", fuelClass: "Advanced Biofuel", confidence: 65, eligibleMarkets: ["US"] },
  { productId: "P001", productName: "Hydrogen", scheme: "Annex IX Part A", fuelClass: "Annex IX Part A", confidence: 45, eligibleMarkets: ["EU"] },
  { productId: "P001", productName: "Hydrogen", scheme: "Annex IX Part B", fuelClass: "Annex IX Part B", confidence: 88, eligibleMarkets: ["EU", "US"] },
  { productId: "P002", productName: "Methanol", scheme: "RFNBO", fuelClass: "RFNBO", confidence: 70, eligibleMarkets: ["India"] },
  { productId: "P002", productName: "Methanol", scheme: "Advanced Biofuels", fuelClass: "Advanced Biofuel", confidence: 78, eligibleMarkets: ["EU", "UK"] },
  { productId: "P002", productName: "Methanol", scheme: "Annex IX Part A", fuelClass: "Annex IX Part A", confidence: 45, eligibleMarkets: ["EU"] },
  { productId: "P002", productName: "Methanol", scheme: "Annex IX Part B", fuelClass: "Annex IX Part B", confidence: 88, eligibleMarkets: ["EU", "US"] },
];

// === MODAL ===
interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: { product: string; scheme: string; attribute: string; confidence: number; color: string };
}

const AttributeModal: React.FC<AttributeModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const { product, scheme, attribute, confidence, color } = data;

  const getStatusLabel = (c: number) => c >= 80 ? "Fully Compliant" : c >= 50 ? "Partial Compliance" : "Non-Compliant";
  const getExplanation = (c: number) => c >= 80
    ? "This attribute meets all compliance requirements."
    : c >= 50
    ? "Partial compliance. Some verifications pending."
    : "Non-compliant. Review corrective actions.";

  const getRecommendations = (c: number) => c >= 80
    ? ["Continue current practices", "Maintain audit docs"]
    : c >= 50
    ? ["Review docs", "Verify data"]
    : ["Conduct gap analysis", "Fix issues"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-gray-900 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold mb-4 border-b pb-3">Attribute Detail</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><strong>Product:</strong> <span>{product}</span></div>
          <div className="flex justify-between"><strong>Scheme:</strong> <span>{scheme}</span></div>
          <div className="flex justify-between"><strong>Attribute:</strong> <span>{attribute}</span></div>
          <div className="flex justify-between"><strong>Confidence:</strong> <span className="font-medium">{confidence}%</span></div>
          <div className="flex items-center justify-between">
            <strong>Status:</strong>
            <span className={`px-3 py-1 rounded text-white text-xs font-medium ${color}`}>
              {getStatusLabel(confidence)}
            </span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">{getExplanation(confidence)}</div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-sm">Recommendations:</h4>
          <ul className="space-y-1 text-xs">
            {getRecommendations(confidence).map((rec, i) => (
              <li key={i} className="flex items-start gap-2">• {rec}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-blue-600 text-white">View Details</Button>
        </div>
      </div>
    </div>
  );
};

// === UTILS ===
const getStatusColor = (c: number): string => c >= 80 ? "bg-green-500" : c >= 50 ? "bg-orange-500" : "bg-red-500";
const getAttributeConfidence = (base: number, attr: string): number => {
  const variance = attr.length % 5;
  return Math.round(Math.max(0, Math.min(100, base + (Math.random() * 20 - 10) + variance - 2)));
};

// === PROPS ===
interface RecommendationProps {
  complianceResults: ComplianceResult[];
  productInfo?: ProductInfo[];
  onBack?: () => void;
}

// === REPORT SECTIONS (Render Props for re-use in Tabs) ===

// 1. Compliance Matrix Component
const ComplianceMatrix = ({ products, handleCellClick }: { products: Record<string, ComplianceResult[]>, handleCellClick: (product: string, scheme: string, attribute: string, confidence: number) => void }) => (
  <div className="space-y-8">
    {Object.entries(products).map(([product, schemes]) => (
      <div key={product} className="matrix-section"> {/* Removed ID for cleaner export setup */}
        <h3 className="text-xl font-semibold mb-4">{product} Compliance Matrix</h3>
        <div className="border rounded-lg overflow-x-auto">
          <Table style={{ minWidth: "2000px" }}>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-48">Scheme</TableHead>
                {attributes.map((a, i) => (
                  <TableHead key={a} className={`text-center min-w-32 ${i >= 7 ? 'hidden md:table-cell' : ''}`}>
                    {a}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.map((s) => (
                <TableRow key={s.scheme}>
                  <TableCell className="font-medium sticky left-0 bg-white z-10">
                    {s.scheme}<br /><span className="text-xs text-gray-500">{s.fuelClass}</span>
                  </TableCell>
                  {attributes.map((attr, i) => {
                    const conf = getAttributeConfidence(s.confidence, attr);
                    return (
                      <TableCell key={attr} className={`text-center ${i >= 7 ? 'hidden md:table-cell' : ''}`}>
                        <div
                          className={`h-10 rounded ${getStatusColor(conf)} cursor-pointer hover:opacity-80`}
                          onClick={() => handleCellClick(product, s.scheme, attr, conf)}
                          title={`${attr}: ${conf}%`}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 flex gap-4 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded" /> Compliant</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded" /> Partial</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Non-Compliant</span>
        </div>
      </div>
    ))}
  </div>
);

// 2. Confidence Overview Component
const ConfidenceOverview = ({ products, complianceResults }: { products: Record<string, ComplianceResult[]>, complianceResults: ComplianceResult[] }) => (
  <div id="confidence-section">
    <h3 className="text-2xl font-bold mb-6">Compliance Confidence Overview</h3>
    <div className="space-y-6">
      {Object.entries(products).map(([product, schemes]) => (
        <div key={product} className="bg-gray-50 rounded-lg p-6 border">
          <h4 className="text-lg font-semibold mb-4">{product}</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme</TableHead>
                <TableHead>Fuel Class</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Markets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.map((s) => (
                <TableRow key={s.scheme}>
                  <TableCell className="font-medium">{s.scheme}</TableCell>
                  <TableCell>{s.fuelClass}</TableCell>
                  <TableCell className="text-center font-bold">
                    <span className={s.confidence >= 80 ? "text-green-600" : s.confidence >= 50 ? "text-orange-600" : "text-red-600"}>
                      {s.confidence}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${
                      s.confidence >= 80 ? "bg-green-600" :
                      s.confidence >= 50 ? "bg-orange-600" : "bg-red-600"
                    }`}>
                      {s.confidence >= 80 ? "Compliant" : s.confidence >= 50 ? "Partial" : "Non-Compliant"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {s.eligibleMarkets?.join(", ") || "None"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>

    {complianceResults.length === 0 && (
      <div className="text-center py-12 text-muted-foreground">
        No compliance data available.
      </div>
    )}
  </div>
);


export const RecommendationInterface: React.FC<RecommendationProps> = ({
  complianceResults,
  productInfo = [],
  onBack,
}) => {
  const [filterBy, setFilterBy] = useState<"all" | "green" | "orange" | "red">("all");
  const [activeTab, setActiveTab] = useState("matrix"); // Changed default to matrix
  const [modalData, setModalData] = useState<AttributeModalProps["data"]>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = useMemo(() => {
    const groups: Record<string, ComplianceResult[]> = {};
    complianceResults.forEach(r => {
      if (!groups[r.productName]) groups[r.productName] = [];
      groups[r.productName].push(r);
    });
    return groups;
  }, [complianceResults]);

  const filteredResults = useMemo(() => {
    if (filterBy === "all") return complianceResults;
    return complianceResults.filter(r => {
      if (filterBy === "green") return r.confidence >= 80;
      if (filterBy === "orange") return r.confidence >= 50 && r.confidence < 80;
      return r.confidence < 50;
    });
  }, [complianceResults, filterBy]);

  const handleCellClick = (product: string, scheme: string, attribute: string, confidence: number) => {
    setModalData({ product, scheme, attribute, confidence, color: getStatusColor(confidence) });
    setIsModalOpen(true);
  };

  const stats = useMemo(() => {
    const total = complianceResults.length;
    const green = complianceResults.filter(r => r.confidence >= 80).length;
    const orange = complianceResults.filter(r => r.confidence >= 50 && r.confidence < 80).length;
    const red = total - green - orange;
    return { total, green, orange, red };
  }, [complianceResults]);

  // === FIXED AND IMPROVED PDF EXPORT HANDLER ===
  const handleExportPDF = async () => {
    // Temporarily switch to the 'report' tab to ensure all elements are visible
    const originalTab = activeTab;
    setActiveTab("report");

    // Wait a brief moment for the DOM to update with the new tab content
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const input = document.getElementById("full-report-content");
      if (!input) {
        toast.error("Report content not found for export.");
        return;
      }

      // Hide elements that should not be in the PDF (e.g., scrollbars in tables for better view)
      const tables = input.querySelectorAll(".overflow-x-auto");
      tables.forEach(table => table.classList.add('overflow-visible')); // Use class name for visibility

      const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better resolution 
        logging: true,
        useCORS: true,
      });

      tables.forEach(table => table.classList.remove('overflow-visible')); // Restore scrollbars

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add image data, slicing it across pages if necessary
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("compliance-report.pdf");
      toast.success("Report exported successfully!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Export failed. Please check the console for details.");
    } finally {
      // Restore the original tab
      setActiveTab(originalTab);
    }
  };


  if (!complianceResults || complianceResults.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Compliance Recommendations</h2>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> No data.
          </div>
          <Button variant="outline" onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  // --- JSX RENDER ---
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance Recommendations</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Combinations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.green}</div>
          <div className="text-sm text-green-700">Fully Compliant</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 shadow border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.orange}</div>
          <div className="text-sm text-orange-700">Partial</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow border-red-200 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.red}</div>
          <div className="text-sm text-red-700">Non-Compliant</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <Label className="font-semibold text-lg">Filter:</Label>
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({stats.total})</SelectItem>
              <SelectItem value="green">Compliant ({stats.green})</SelectItem>
              <SelectItem value="orange">Partial ({stats.orange})</SelectItem>
              <SelectItem value="red">Non-Compliant ({stats.red})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Added 'report' tab */}
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="matrix">3D Matrix</TabsTrigger>
            <TabsTrigger value="confidence">Confidence</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="report" className="font-bold text-blue-600">Full Report</TabsTrigger>
          </TabsList>

          {/* Tab 1: 3D Matrix */}
          <TabsContent value="matrix" className="mt-6">
            <ComplianceMatrix products={products} handleCellClick={handleCellClick} />
          </TabsContent>

          {/* Tab 2: Confidence */}
          <TabsContent value="confidence" className="mt-6">
            <ConfidenceOverview products={products} complianceResults={complianceResults} />
          </TabsContent>

          {/* Tab 3: Markets (Unchanged logic) */}
          <TabsContent value="markets" className="mt-6">
            <div id="markets-section">
              <h3 className="text-2xl font-bold mb-6">Accessible Markets</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No markets match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.flatMap((r) =>
                      (r.eligibleMarkets ?? []).map((m) => {
                        const examples = ["Refineries", "Chemical", "Steel", "Glass", "Electronics"];
                        const market = examples[Math.floor(Math.random() * examples.length)];
                        return (
                          <TableRow key={`${r.productId}-${r.scheme}-${m}`}>
                            <TableCell>{r.productName} ({r.fuelClass})</TableCell>
                            <TableCell>{m}</TableCell>
                            <TableCell>{market}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              {r.confidence}%
                            </TableCell>
                            <TableCell>${marketData[m]?.price || "N/A"}</TableCell>
                          </TableRow>
                        );
                      })
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* NEW Tab 4: Full Report (The target for PDF export) */}
          <TabsContent value="report" className="mt-6 p-4 border rounded-lg bg-white shadow-inner">
            <div id="full-report-content">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2">Full Compliance Report</h2>
              <p className="text-gray-600 mb-6">Generated on: {new Date().toLocaleDateString()}</p>

              <ConfidenceOverview products={products} complianceResults={complianceResults} />
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-2xl font-bold mb-6">Detailed Compliance Matrix</h3>
                <ComplianceMatrix products={products} handleCellClick={handleCellClick} />
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleExportPDF} className="bg-green-600 text-white">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <AttributeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} />
    </div>
  );
};