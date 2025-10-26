import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, AlertCircle, X } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceResult, ProductInfo } from "./types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Extended attributes as requested
const attributes = [
  "COD",
  "36 month window",
  "operational year",
  "temporal matching",
  "PPA information",
  "Direct Line",
  "Bidding Zone",
  "Feedstock",
  "Process Emissions",
  "End Use Emissions",
  "Bio Feedstock",
  "CO2 Origin",
  "Fossil Inputs",
  "Bio Feedstock",
  "Grid Carbon Intensity",
];

// Market data
const marketData: Record<string, { price: string; demandMultiplier: string }> = {
  EU: { price: "120.50", demandMultiplier: "2.5" },
  UK: { price: "110.75", demandMultiplier: "2.0" },
  US: { price: "95.00", demandMultiplier: "1.8" },
  India: { price: "85.25", demandMultiplier: "1.5" },
};

// Updated compliance results based on hardcodedProducts from ComplianceCheck
const comprehensiveComplianceResults: ComplianceResult[] = [
  // Hydrogen (P001)
  {
    productName: "Hydrogen",
    productId: "P001",
    scheme: "RFNBO",
    fuelClass: "RFNBO",
    confidence: 92,
    eligibleMarkets: ["EU", "UK"],
  },
  {
    productName: "Hydrogen",
    productId: "P001",
    scheme: "Advanced Biofuels",
    fuelClass: "Advanced Biofuel",
    confidence: 65,
    eligibleMarkets: ["US"],
  },
  {
    productName: "Hydrogen",
    productId: "P001",
    scheme: "Annex IX Part A",
    fuelClass: "Annex IX Part A",
    confidence: 45,
    eligibleMarkets: ["EU"],
  },
  {
    productName: "Hydrogen",
    productId: "P001",
    scheme: "Annex IX Part B",
    fuelClass: "Annex IX Part B",
    confidence: 88,
    eligibleMarkets: ["EU", "US"],
  },
  // MeOH (P002)
  {
    productName: "Methanol",
    productId: "P002",
    scheme: "RFNBO",
    fuelClass: "RFNBO",
    confidence: 70,
    eligibleMarkets: ["India"],
  },
  {
    productName: "Methanol",
    productId: "P002",
    scheme: "Advanced Biofuels",
    fuelClass: "Advanced Biofuel",
    confidence: 78,
    eligibleMarkets: ["EU", "UK"],
  },
  {
    productName: "Methanol",
    productId: "P002",
    scheme: "Annex IX Part A",
    fuelClass: "Annex IX Part A",
    confidence: 45,
    eligibleMarkets: ["EU"],
  },
  {
    productName: "Methanol",
    productId: "P002",
    scheme: "Annex IX Part B",
    fuelClass: "Annex IX Part B",
    confidence: 88,
    eligibleMarkets: ["EU", "US"],
  },
  // H2 (P003)
  {
    productName: "Hydrogen",
    productId: "P003",
    scheme: "RFNBO",
    fuelClass: "RFNBO",
    confidence: 85,
    eligibleMarkets: ["EU", "UK"],
  },
  {
    productName: "Hydrogen",
    productId: "P003",
    scheme: "Advanced Biofuels",
    fuelClass: "Advanced Biofuel",
    confidence: 60,
    eligibleMarkets: ["US"],
  },
  {
    productName: "Hydrogen",
    productId: "P003",
    scheme: "Annex IX Part A",
    fuelClass: "Annex IX Part A",
    confidence: 40,
    eligibleMarkets: ["EU"],
  },
  {
    productName: "Hydrogen",
    productId: "P003",
    scheme: "Annex IX Part B",
    fuelClass: "Annex IX Part B",
    confidence: 80,
    eligibleMarkets: ["EU", "US"],
  },
  // MeOH (P004)
  {
    productName: "Methanol",
    productId: "P004",
    scheme: "RFNBO",
    fuelClass: "RFNBO",
    confidence: 65,
    eligibleMarkets: ["India"],
  },
  {
    productName: "Methanol",
    productId: "P004",
    scheme: "Advanced Biofuels",
    fuelClass: "Advanced Biofuel",
    confidence: 75,
    eligibleMarkets: ["EU", "UK"],
  },
  {
    productName: "Methanol",
    productId: "P004",
    scheme: "Annex IX Part A",
    fuelClass: "Annex IX Part A",
    confidence: 45,
    eligibleMarkets: ["EU"],
  },
  {
    productName: "Methanol",
    productId: "P004",
    scheme: "Annex IX Part B",
    fuelClass: "Annex IX Part B",
    confidence: 85,
    eligibleMarkets: ["EU", "US"],
  },
];

// Modal Component
interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    product: string;
    scheme: string;
    attribute: string;
    confidence: number;
    color: string;
  };
}

const AttributeModal: React.FC<AttributeModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const { product, scheme, attribute, confidence, color } = data;

  const getStatusLabel = (c: number) => {
    if (c >= 80) return "Fully Compliant";
    if (c >= 50) return "Partial Compliance";
    return "Non-Compliant";
  };

  const getExplanation = (c: number) => {
    if (c >= 80)
      return "This attribute meets all compliance requirements for renewable verification.";
    if (c >= 50)
      return "This attribute partially meets compliance requirements. Some verifications are pending.";
    return "This attribute fails to meet compliance standards. Review corrective actions.";
  };

  const getRecommendations = (c: number) => {
    if (c >= 80) return [
      "Continue current operational practices",
      "Maintain documentation for audits",
      "Monitor for regulatory updates"
    ];
    if (c >= 50) return [
      "Review documentation completeness",
      "Verify temporal matching criteria",
      "Consider additional verification steps"
    ];
    return [
      "Conduct gap analysis",
      "Implement corrective actions",
      "Seek expert consultation"
    ];
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-gray-900 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4 border-b pb-3">
          Attribute Compliance Detail
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <strong>Product:</strong>
            <span>{product}</span>
          </div>
          <div className="flex justify-between">
            <strong>Fuel Class:</strong>
            <span>{scheme}</span>
          </div>
          <div className="flex justify-between">
            <strong>Attribute:</strong>
            <span>{attribute}</span>
          </div>
          <div className="flex justify-between">
            <strong>Confidence:</strong>
            <span className="font-medium">{confidence}%</span>
          </div>
          <div className="flex items-center justify-between">
            <strong>Status:</strong>
            <span className={`px-3 py-1 rounded text-white text-sm font-medium ${color}`}>
              {getStatusLabel(confidence)}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700 leading-relaxed">
            {getExplanation(confidence)}
          </p>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recommendations:</h4>
          <ul className="space-y-1 text-sm">
            {getRecommendations(confidence).map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline" className="mr-2">
            Close
          </Button>
          <Button 
            onClick={() => {
              // Action for detailed analysis
              console.log('View detailed analysis for:', data);
              toast.success("Detailed analysis opened");
            }}
            className="bg-blue-600 text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper to get status color class
const getStatusColor = (confidence: number): string => {
  if (confidence >= 80) return "bg-green-500";
  if (confidence >= 50) return "bg-orange-500";
  return "bg-red-500";
};

// Mock attribute compliance per product-scheme-attribute (rounded to nearest integer)
const getAttributeConfidence = (baseConfidence: number, attribute: string): number => {
  const variance = attribute.length % 5; // Simple mock variation
  return Math.round(Math.max(0, Math.min(100, baseConfidence + (Math.random() * 20 - 10) + variance - 2)));
};

export const RecommendationInterface: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const {
    productInfo = [],
    complianceResults = comprehensiveComplianceResults,
  } = (state || {}) as {
    productInfo: ProductInfo[];
    complianceResults: ComplianceResult[];
  };

  const [filterBy, setFilterBy] = useState<"all" | "green" | "orange" | "red">("all");
  const [activeTab, setActiveTab] = useState("matrix");
  const [modalData, setModalData] = useState<AttributeModalProps["data"]>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group by product
  const products = useMemo(() => {
    const groups: Record<string, ComplianceResult[]> = {};
    complianceResults.forEach(r => {
      if (!groups[r.productName]) groups[r.productName] = [];
      groups[r.productName].push(r);
    });
    return groups;
  }, [complianceResults]);

  // Filtered results for other tabs
  const filteredResults = useMemo(() => {
    if (filterBy === "all") return complianceResults;
    return complianceResults.filter(result => {
      if (filterBy === "green") return result.confidence >= 80;
      if (filterBy === "orange") return result.confidence >= 50 && result.confidence < 80;
      return result.confidence < 50;
    });
  }, [complianceResults, filterBy]);

  // Handle cell click
  const handleCellClick = (product: string, scheme: string, attribute: string, confidence: number) => {
    const color = getStatusColor(confidence);
    setModalData({
      product,
      scheme,
      attribute,
      confidence,
      color
    });
    setIsModalOpen(true);
  };

  // Get compliance status
  const getComplianceStatus = (confidence: number): { emoji: string; label: string } => {
    if (confidence >= 80) return { emoji: "Fully Compliant", label: "Fully Compliant" };
    if (confidence >= 50) return { emoji: "Partial Compliance", label: "Partial Compliance" };
    return { emoji: "Non-Compliant", label: "Non-Compliant" };
  };

  // Export PDF - enhanced to include more sections
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = 20;

      const addSectionToPDF = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        pdf.setFontSize(14);
        pdf.text(title, margin, currentY);
        currentY += 10;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      };

      // Add matrix per product
      for (const product of Object.keys(products)) {
        await addSectionToPDF(`matrix-${product}`, `${product} Compliance Matrix`);
      }

      // Add confidence and markets
      await addSectionToPDF("confidence-section", "Confidence Scores");
      await addSectionToPDF("markets-section", "Accessible Markets");

      pdf.save("compliance-report.pdf");
      toast.success("Report exported!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed.");
    }
  };

  // Stats
  const complianceStats = useMemo(() => {
    const total = complianceResults.length;
    const green = complianceResults.filter(r => r.confidence >= 80).length;
    const orange = complianceResults.filter(r => r.confidence >= 50 && r.confidence < 80).length;
    const red = complianceResults.filter(r => r.confidence < 50).length;
    return { total, green, orange, red };
  }, [complianceResults]);

  if (!complianceResults.length) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance Recommendations</h2>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            No data.
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Compliance Recommendations</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border text-center">
          <div className="text-2xl font-bold">{complianceStats.total}</div>
          <div className="text-sm text-gray-600">Combinations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{complianceStats.green}</div>
          <div className="text-sm text-green-700">Fully Compliant</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 shadow border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{complianceStats.orange}</div>
          <div className="text-sm text-orange-700">Partial</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow border-red-200 text-center">
          <div className="text-2xl font-bold text-red-600">{complianceStats.red}</div>
          <div className="text-sm text-red-700">Non-Compliant</div>
        </div>
      </div>
      
      <div className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-4">
          <Label className="font-semibold text-lg">Filter:</Label>
          <Select value={filterBy} onValueChange={(v) => setFilterBy(v as "all" | "green" | "orange" | "red")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({complianceStats.total})</SelectItem>
              <SelectItem value="green">Fully Compliant ({complianceStats.green})</SelectItem>
              <SelectItem value="orange">Partial ({complianceStats.orange})</SelectItem>
              <SelectItem value="red">Non-Compliant ({complianceStats.red})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="matrix">3D Matrix</TabsTrigger>
            <TabsTrigger value="confidence">Confidence</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          {/* 3D Compliance Matrix - Separate table per product */}
          <TabsContent value="matrix" className="mt-6 space-y-8">
            {Object.entries(products).map(([product, schemes]) => {
              const productSchemes = schemes.map(s => ({ 
                scheme: s.scheme, 
                fuelClass: s.fuelClass, 
                confidence: s.confidence 
              }));
              return (
                <div key={product} id={`matrix-${product}`}>
                  <h3 className="text-xl font-semibold mb-4">{product} Compliance Matrix</h3>
                  <div className="border rounded-lg overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'scroll' }}>
                    <Table style={{ minWidth: '2000px' }}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px] p-2 sticky left-0 bg-white z-10">Fuel Class</TableHead>
                          {attributes.map((attr, index) => (
                            <TableHead
                              key={attr}
                              className={`text-center min-w-[120px] p-2 ${index < 7 ? 'visible' : 'hidden md:table-cell'}`}
                            >
                              {attr}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSchemes.map(({ scheme, fuelClass, confidence: baseConf }) => (
                          <TableRow key={scheme}>
                            <TableCell className="font-medium min-w-[200px] p-2 sticky left-0 bg-white z-10">
                              {scheme}<br />
                              <span className="text-xs text-gray-500">{fuelClass}</span>
                            </TableCell>
                            {attributes.map((attr, index) => {
                              const attrConf = getAttributeConfidence(baseConf, attr);
                              const statusColor = getStatusColor(attrConf);
                              return (
                                <TableCell
                                  key={attr}
                                  className={`text-center p-2 ${index < 7 ? 'visible' : 'hidden md:table-cell'}`}
                                  style={{ minWidth: '120px' }}
                                >
                                  <div 
                                    className={`w-full h-10 rounded ${statusColor} cursor-pointer hover:opacity-80 transition-opacity`}
                                    onClick={() => handleCellClick(product, scheme, attr, attrConf)}
                                    title={`Click to view ${attr} details - ${attrConf}% confidence`}
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
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded cursor-pointer" 
                           onClick={() => handleCellClick(product, "Example Scheme", "Example Attribute", 85)} />
                      Compliant
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded cursor-pointer"
                           onClick={() => handleCellClick(product, "Example Scheme", "Example Attribute", 65)} />
                      Partial
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded cursor-pointer"
                           onClick={() => handleCellClick(product, "Example Scheme", "Example Attribute", 35)} />
                      Non-Compliant
                    </span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Accessible Markets */}
          <TabsContent value="markets" className="mt-6">
            <div id="markets-section">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Accessible Markets</h3>
              <div className="overflow-x-auto border rounded-2xl shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-left text-xl font-bold">Product</TableHead>
                      <TableHead className="text-left text-xl font-bold">Geographic Coverage</TableHead>
                      <TableHead className="text-left text-xl font-bold">Market</TableHead>
                      <TableHead className="text-left text-xl font-bold">Confidence Score</TableHead>
                      <TableHead className="text-left text-xl font-bold">Index</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8 text-lg">
                          No accessible market data available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.flatMap((r, i) =>
                        r.eligibleMarkets?.map((m) => {
                          const marketInfo = marketData[m];
                          const marketExamples = [
                            "Refineries", "Chemical Manufacturers", "Steel Industry", 
                            "Glass Industry", "Electronics & Semiconductor Industry"
                          ];
                          const randomMarket = marketExamples[Math.floor(Math.random() * marketExamples.length)];

                          return (
                            <TableRow key={`${i}-${m}`} className="hover:bg-gray-50 text-lg">
                              <TableCell className="text-left font-semibold text-gray-900">
                                {r.productName} ({r.fuelClass})
                              </TableCell>
                              <TableCell className="text-left bg-blue-50 text-blue-800 font-medium rounded-md">
                                {m === "EU" && "Europe"}
                                {m === "UK" && "United Kingdom"}
                                {m === "US" && "United States"}
                                {m === "India" && "India"}
                                {!["EU", "UK", "US", "India"].includes(m) && "Global"}
                              </TableCell>
                              <TableCell className="text-left bg-green-50 text-green-800 font-semibold rounded-md">
                                {randomMarket}
                              </TableCell>
                              <TableCell className="text-left font-semibold">
                                {r.confidence}%
                              </TableCell>
                              <TableCell className="text-left font-semibold text-gray-700">
                                ${marketInfo?.price || "N/A"}
                              </TableCell>
                            </TableRow>
                          );
                        }) ?? []
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={handleExportPDF} className="bg-green-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Attribute Modal */}
      <AttributeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={modalData} 
      />
    </div>
  );
};

export default RecommendationInterface;