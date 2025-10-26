import { useState, useEffect } from "react";
import { VerifyProducts } from "./VerifyProducts";
import { OfftakeLocation as OfftakeLocationComponent } from "./OfftakeLocation"; // Renamed import to avoid conflict
import { DownstreamOperations } from "./DownstreamOperations";
import { FilterCertifications } from "./FilterCertifications";
import { ComplianceResults } from "./ComplianceResults";
import { toast } from "sonner";
import { ProductInfo, ComplianceResult, PlacedComponent, PlantInfo, CertificationScheme, UserDetails, Connection, OfftakeLocation } from "./types"; // OfftakeLocation is the type

const certificationSchemes: CertificationScheme[] = [
  {
    id: "rfnbo",
    name: "RFNBO",
    criteria: {
      origin: ["wind", "solar", "hydro"],
      carbonFootprint: { max: 3.4, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance", "book-and-claim"],
      markets: ["EU", "UK"],
    },
    weight: 0.4,
  },
  {
    id: "advanced",
    name: "Advanced Biofuels",
    criteria: {
      origin: ["biomass", "waste"],
      carbonFootprint: { max: 5.0, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU", "US"],
    },
    weight: 0.3,
  },
  {
    id: "annexIXA",
    name: "Annex IX Part A",
    criteria: {
      origin: ["waste", "residues"],
      carbonFootprint: { max: 4.0, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU"],
    },
    weight: 0.2,
  },
  {
    id: "annexIXB",
    name: "Annex IX Part B",
    criteria: {
      origin: ["used cooking oil", "animal fats"],
      carbonFootprint: { max: 4.5, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU"],
    },
    weight: 0.1,
  },
];

// Updated hardcoded products to use new offtakeLocations array (empty by default)
const hardcodedProducts: ProductInfo[] = [
  {
    productId: "P001",
    productName: "H2",
    productType: "Fuel",
    productionCapacity: "1000",
    unit: "kg/day",
    fuelType: "Hydrogen",
    fuelClass: "RFNBO",
    feedstock: "RES, WATER",
    carbonFootprint: { value: 2.5, unit: "gCO2e/MJ" },
    offtakeLocations: [], // Changed to array
    downstreamOperations: "",
    verified: true,
  },
  {
    productId: "P002",
    productName: "MeOH",
    productType: "Fuel",
    productionCapacity: "5000",
    unit: "liters/day",
    fuelType: "Methanol",
    fuelClass: "RFNBO",
    feedstock: "Hydrogen H2, RES, Water, CO2",
    carbonFootprint: { value: 3.0, unit: "gCO2e/MJ" },
    offtakeLocations: [], // Changed to array
    downstreamOperations: "",
    verified: true,
  },
  {
    productId: "P003",
    productName: "H2",
    productType: "Fuel",
    productionCapacity: "1000",
    unit: "kg/day",
    fuelType: "Hydrogen",
    fuelClass: "RFNBO",
    feedstock: "Biomass, Water (via gasification and electrolysis)",
    carbonFootprint: { "value": 3.2, unit: "gCO2e/MJ" },
    offtakeLocations: [],
    downstreamOperations: "",
    verified: false
  },
  {
    productId: "P004",
    productName: "MeOH",
    productType: "Fuel",
    productionCapacity: "5000",
    unit: "liters/day",
    fuelType: "Methanol",
    fuelClass: "RFNBO",
    feedstock: "Biomass, CO2 (via syngas from biomass gasification)",
    carbonFootprint: { value: 3.5, unit: "gCO2e/MJ" },
    offtakeLocations: [], // Changed to array
    downstreamOperations: "",
    verified: false,
  },
];

const calculateCompliance = (
  products: ProductInfo[],
  components: PlacedComponent[],
  plantInfo: PlantInfo | null,
  selectedCertifications: string[],
  verifiedProducts: string[]
): ComplianceResult[] => {
  const results: ComplianceResult[] = [];

  products.forEach((product) => {
    if (!verifiedProducts.includes(product.productName)) return;

    const outputGates = components.filter(
      (c) => c.type === "gate" && c.data?.gateType === "output" && c.data?.product === product.productType
    );
    const relatedCarriers = components.filter(
      (c) => c.type === "carrier" && c.data?.product === product.productType
    );

    certificationSchemes
      .filter((scheme) => selectedCertifications.includes(scheme.id))
      .forEach((scheme) => {
        let originStatus: "match" | "mismatch" | "risk" = "risk";
        let carbonFootprintStatus: "match" | "mismatch" | "risk" = "risk";
        let chainOfCustodyStatus: "match" | "mismatch" | "risk" = "risk";
        let confidenceScore = 0;
        let originDetails: string | undefined = undefined;
        let carbonFootprintDetails: string | undefined = undefined;
        let chainOfCustodyDetails: string | undefined = undefined;

        const origins = outputGates
          .map((gate) => gate.data?.sourceOrigin)
          .filter((o): o is string => !!o);
        if (origins.length > 0 && scheme.criteria.origin) {
          originStatus = origins.every((o) => scheme.criteria.origin!.includes(o))
            ? "match"
            : "mismatch";
          originDetails = originStatus === "match"
            ? origins.join(", ") || "N/A"
            : "N/A";
        } else {
          originDetails = "N/A";
        }
        confidenceScore += (originStatus === "match" ? 1 : originStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.4;

        const carbonFootprint = relatedCarriers.reduce((sum, c) => {
          const cf = c.data?.carbonFootprint || 0;
          return sum + (typeof cf === "number" ? cf : 0);
        }, 0) / (relatedCarriers.length || 1);
        if (scheme.criteria.carbonFootprint && carbonFootprint > 0) {
          carbonFootprintStatus =
            carbonFootprint <= scheme.criteria.carbonFootprint.max ? "match" : "mismatch";
          carbonFootprintDetails = carbonFootprint > 0 ? `${carbonFootprint} ${scheme.criteria.carbonFootprint.unit}` : "N/A";
        } else {
          carbonFootprintDetails = "N/A";
        }
        confidenceScore += (carbonFootprintStatus === "match" ? 1 : carbonFootprintStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.4;

        const custodyMethods = outputGates
          .map((gate) => gate.data?.chainOfCustody)
          .filter((c): c is string => !!c);
        if (custodyMethods.length > 0 && scheme.criteria.chainOfCustody) {
          chainOfCustodyStatus = custodyMethods.every((c) =>
            scheme.criteria.chainOfCustody!.includes(c)
          )
            ? "match"
            : "mismatch";
          chainOfCustodyDetails = chainOfCustodyStatus === "match"
            ? custodyMethods.join(", ") || "N/A"
            : "N/A";
        } else {
          chainOfCustodyDetails = "N/A";
        }
        confidenceScore += (chainOfCustodyStatus === "match" ? 1 : chainOfCustodyStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.2;

        // Updated market eligibility for multiple offtake locations
        let eligibleMarkets: string[] = scheme.criteria.markets;
        let marketMatchFactor = 1; // Default no penalty

        if (product.offtakeLocations && product.offtakeLocations.length > 0) {
          const countries = product.offtakeLocations.map(loc => loc.country).filter(Boolean);
          if (countries.length > 0) {
            const matches = countries.filter(country => scheme.criteria.markets.includes(country)).length;
            const matchRatio = matches / countries.length;
            marketMatchFactor = matchRatio > 0 ? (0.5 + (0.5 * matchRatio)) : 0.5; // Scale between 0.5 (no match) to 1 (full match)
            eligibleMarkets = [...new Set([...countries, ...scheme.criteria.markets])];
          }
        } else if (plantInfo?.country) {
          const marketMatch = scheme.criteria.markets.includes(plantInfo.country);
          marketMatchFactor = marketMatch ? 1 : 0.8;
          eligibleMarkets = marketMatch ? [plantInfo.country, ...scheme.criteria.markets] : scheme.criteria.markets;
        }

        confidenceScore *= marketMatchFactor;

        if (product.downstreamOperations) {
          confidenceScore *= 0.9;
        }

        const fuelClass = scheme.id === "rfnbo" ? "RFNBO" : scheme.id === "advanced" ? "Advanced Biofuel" : `Annex IX ${scheme.id === "annexIXA" ? "Part A" : "Part B"}`;

        results.push({
          productName: product.productName,
          scheme: scheme.name,
          confidence: Math.round(confidenceScore * 100),
          fuelClass,
          origin: originDetails,
          carbonFootprint: carbonFootprintDetails,
          chainOfCustody: chainOfCustodyDetails,
          eligibleMarkets,
        });
      });
  });

  return results;
};

const sortComplianceResults = (
  results: ComplianceResult[],
  sortBy: "product" | "scheme" | "confidence" | "fuelClass",
  sortOrder: "asc" | "desc"
): ComplianceResult[] => {
  return [...results].sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "product") {
      return a.productName.localeCompare(b.productName) * factor;
    } else if (sortBy === "scheme") {
      return a.scheme.localeCompare(b.scheme) * factor;
    } else if (sortBy === "fuelClass") {
      return a.fuelClass.localeCompare(b.fuelClass) * factor;
    } else {
      return (a.confidence - b.confidence) * factor;
    }
  });
};

interface ComplianceCheckProps {
  productInfo: ProductInfo[];
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo[]>>;
  components: PlacedComponent[];
  plantInfo: PlantInfo | null;
  verifiedProducts: string[];
  setVerifiedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCertifications: string[];
  setSelectedCertifications: React.Dispatch<React.SetStateAction<string[]>>;
  complianceResults: ComplianceResult[];
  setComplianceResults: React.Dispatch<React.SetStateAction<ComplianceResult[]>>;
  sortBy: "product" | "scheme" | "confidence" | "fuelClass";
  setSortBy: React.Dispatch<React.SetStateAction<"product" | "scheme" | "confidence" | "fuelClass">>;
  sortOrder: "asc" | "desc";
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  onBack: () => void;
  userDetails: UserDetails | null;
  connections: Connection[];
}

export const ComplianceCheck = ({
  productInfo: propProductInfo,
  setProductInfo: propSetProductInfo,
  components,
  plantInfo: propPlantInfo,
  verifiedProducts,
  setVerifiedProducts,
  selectedCertifications,
  setSelectedCertifications,
  complianceResults,
  setComplianceResults,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  error,
  setError,
  onBack,
  userDetails,
  connections,
}: ComplianceCheckProps) => {
  const [step, setStep] = useState<"verify" | "offtake" | "downstream" | "certifications" | "results">("verify");
  const [productInfo, setProductInfo] = useState<ProductInfo[]>(hardcodedProducts);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(propPlantInfo);

  useEffect(() => {
    // Migrate any legacy offtakeLocation to offtakeLocations array
    // Safely handle legacy field with type assertion and optional chaining
    const migratedProducts = hardcodedProducts.map(p => ({
      ...p,
      // @ts-ignore - Ignore legacy field error; it's for migration only
      offtakeLocations: p.offtakeLocations || (p.offtakeLocation ? [p.offtakeLocation] : []),
      // @ts-ignore
      offtakeLocation: undefined, // Clean up
    }));
    setProductInfo(migratedProducts);
    setVerifiedProducts(migratedProducts.filter((p) => p.verified).map((p) => p.productName));
    setSelectedCertifications(certificationSchemes.map((s) => s.id));
  }, []);

  const handleNextStep = () => {
    console.log("Moving to next step from:", step);
    if (step === "verify" && verifiedProducts.length === 0) {
      setError("Please verify at least one product to proceed.");
      toast.error("Please verify at least one product.");
      return;
    }
    if (step === "certifications") {
      if (selectedCertifications.length === 0) {
        setError("Please select at least one certification scheme.");
        toast.error("Please select at least one certification scheme.");
        return;
      }
      try {
        const results = calculateCompliance(productInfo, components, plantInfo, selectedCertifications, verifiedProducts);
        const sortedResults = sortComplianceResults(results, sortBy, sortOrder);
        setComplianceResults(sortedResults);
        setStep("results");
        toast.success("Compliance check completed! Review the results below.");
      } catch (err) {
        setError("Failed to calculate compliance results. Please try again.");
        toast.error("Error during compliance check.");
      }
      return;
    }
    setStep((prev) => {
      switch (prev) {
        case "verify":
          return "offtake";
        case "offtake":
          return "downstream";
        case "downstream":
          return "certifications";
        default:
          return prev;
      }
    });
    setError(null);
  };

  const handleBackStep = () => {
    console.log("Moving to previous step from:", step);
    if (step === "verify") {
      onBack();
    } else {
      setStep((prev) => {
        switch (prev) {
          case "offtake":
            return "verify";
          case "downstream":
            return "offtake";
          case "certifications":
            return "downstream";
          case "results":
            return "certifications";
          default:
            return prev;
        }
      });
      setError(null);
    }
  };

  return (
    <div className="h-full">
      {step === "verify" && <VerifyProducts productInfo={productInfo} setProductInfo={setProductInfo} verifiedProducts={verifiedProducts} setVerifiedProducts={setVerifiedProducts} error={error} handleNextStep={handleNextStep} handleBackStep={handleBackStep} />}
      {step === "offtake" && <OfftakeLocationComponent productInfo={productInfo} setProductInfo={setProductInfo} verifiedProducts={verifiedProducts} error={error} handleNextStep={handleNextStep} handleBackStep={handleBackStep} />}
      {step === "downstream" && <DownstreamOperations productInfo={productInfo} setProductInfo={setProductInfo} verifiedProducts={verifiedProducts} error={error} handleNextStep={handleNextStep} handleBackStep={handleBackStep} />}
      {step === "certifications" && <FilterCertifications selectedCertifications={selectedCertifications} setSelectedCertifications={setSelectedCertifications} error={error} handleNextStep={handleNextStep} handleBackStep={handleBackStep} />}
      {step === "results" && <ComplianceResults productInfo={productInfo} complianceResults={complianceResults} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} setComplianceResults={setComplianceResults} error={error} handleBackStep={handleBackStep} userDetails={userDetails} plantInfo={plantInfo} components={components} connections={connections} sortComplianceResults={sortComplianceResults} />}
    </div>
  );
};

export default ComplianceCheck;