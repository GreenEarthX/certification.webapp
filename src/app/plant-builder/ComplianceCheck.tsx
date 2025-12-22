'use client';

import { useState, useEffect } from "react";
import { VerifyProducts } from "./VerifyProducts";
import { OfftakeLocation as OfftakeLocationComponent } from "./OfftakeLocation";
import { DownstreamOperations } from "./DownstreamOperations";
import { FilterCertifications } from "./FilterCertifications";
import { ComplianceResults } from "./ComplianceResults";
import { toast } from "sonner";
import {
  ProductInfo,
  ComplianceResult,
  PlacedComponent,
  PlantInfo,
  CertificationScheme,
  UserDetails,
  Connection,
  OfftakeLocation,
} from "./types";

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
    offtakeLocations: [],
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
    offtakeLocations: [],
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
    carbonFootprint: { value: 3.2, unit: "gCO2e/MJ" },
    offtakeLocations: [],
    downstreamOperations: "",
    verified: false,
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
    offtakeLocations: [],
    downstreamOperations: "",
    verified: false,
  },
];

// FIXED: calculateCompliance now returns full ComplianceResult
const calculateCompliance = (
  products: ProductInfo[],
  components: PlacedComponent[],
  plantInfo: PlantInfo | null,
  selectedCertifications: string[],
  verifiedProducts: string[]
): ComplianceResult[] => {
  const results: ComplianceResult[] = [];

  products.forEach((product) => {
    // Only check compliance for products that have been verified in the first step
    if (!verifiedProducts.includes(product.productName)) return;

    // Filter components related to this specific product type
    const outputGates = components.filter(
      (c) =>
        c.type === "gate" &&
        c.data?.gateType === "output" &&
        c.data?.product === product.productType
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
        let originDetails: string | undefined;
        let carbonFootprintDetails: string | undefined;
        let chainOfCustodyDetails: string | undefined;

        // === ORIGIN ===
        const origins = outputGates
          .map((gate) => gate.data?.sourceOrigin)
          .filter((o): o is string => !!o);

        if (origins.length > 0 && scheme.criteria.origin) {
          originStatus = origins.every((o) => scheme.criteria.origin!.includes(o))
            ? "match"
            : "mismatch";
          originDetails = originStatus === "match"
            ? origins.join(", ")
            : `Required: ${scheme.criteria.origin!.join(", ")}`;
        } else {
          originDetails = "Missing origin data";
        }
        confidenceScore += (originStatus === "match" ? 1 : originStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.4;

        // === CARBON FOOTPRINT ===
        // Simple average of related carrier carbon footprints
        const carbonFootprint = relatedCarriers.reduce((sum, c) => {
          const cf = c.data?.carbonFootprint || 0;
          return sum + (typeof cf === "number" ? cf : 0);
        }, 0) / (relatedCarriers.length || 1);

        if (scheme.criteria.carbonFootprint && carbonFootprint > 0) {
          carbonFootprintStatus =
            carbonFootprint <= scheme.criteria.carbonFootprint.max ? "match" : "mismatch";
          carbonFootprintDetails = carbonFootprintStatus === "match"
            ? `${carbonFootprint.toFixed(2)} ${scheme.criteria.carbonFootprint.unit}`
            : `Exceeds max (${scheme.criteria.carbonFootprint.max})`;
        } else {
          carbonFootprintDetails = "Missing carbon footprint data";
        }
        confidenceScore += (carbonFootprintStatus === "match" ? 1 : carbonFootprintStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.4;

        // === CHAIN OF CUSTODY ===
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
            ? custodyMethods.join(", ")
            : `Required: ${scheme.criteria.chainOfCustody!.join(", ")}`;
        } else {
          chainOfCustodyDetails = "Missing chain of custody data";
        }
        confidenceScore += (chainOfCustodyStatus === "match" ? 1 : chainOfCustodyStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.2;

        // === MARKET ELIGIBILITY (MULTIPLE OFFTAKE LOCATIONS) ===
        let eligibleMarkets: string[] = scheme.criteria.markets;
        let marketMatchFactor = 1;

        if (product.offtakeLocations && product.offtakeLocations.length > 0) {
          const countries = product.offtakeLocations.map(loc => loc.country).filter(Boolean);
          if (countries.length > 0) {
            const matches = countries.filter(country => scheme.criteria.markets.includes(country)).length;
            const matchRatio = matches / countries.length;
            // Market match adds confidence: 50% if any match, 100% if all match.
            marketMatchFactor = matchRatio > 0 ? (0.5 + (0.5 * matchRatio)) : 0.5;
            eligibleMarkets = [...new Set([...countries, ...scheme.criteria.markets])];
          }
        } else if (plantInfo?.country) {
          const marketMatch = scheme.criteria.markets.includes(plantInfo.country);
          // If plant country matches, full confidence, otherwise slight penalty.
          marketMatchFactor = marketMatch ? 1 : 0.8;
          eligibleMarkets = marketMatch ? [plantInfo.country, ...scheme.criteria.markets] : scheme.criteria.markets;
        }

        confidenceScore *= marketMatchFactor;

        // === DOWNSTREAM PENALTY ===
        // Apply a small penalty if downstream operations are required but not defined, implying risk
        if (product.downstreamOperations) {
          confidenceScore *= 0.9;
        }

        // === FUEL CLASS MAPPING ===
        const fuelClass =
          scheme.id === "rfnbo"
            ? "RFNBO"
            : scheme.id === "advanced"
            ? "Advanced Biofuel"
            : `Annex IX ${scheme.id === "annexIXA" ? "Part A" : "Part B"}`;

        // Create the final result object
        results.push({
          productId: product.productId, // REQUIRED
          productName: product.productName,
          scheme: scheme.name,
          confidence: Math.round(confidenceScore * 100),
          fuelClass,
          origin: originDetails,
          carbonFootprint: carbonFootprintDetails,
          chainOfCustody: chainOfCustodyDetails,
          eligibleMarkets,
          complianceStatus: confidenceScore > 0.8 ? "fully-compliant" : confidenceScore > 0.5 ? "partial-compliance" : "non-compliant",
          enhancedConfidence: Math.round(confidenceScore * 100),
        });
      });
  });

  return results;
};

const sortComplianceResults = (
  results: ComplianceResult[],
  sortBy: "product" | "scheme" | "confidence" | "fuelClass" = "confidence",
  sortOrder: "asc" | "desc" = "desc"
): ComplianceResult[] => {
  return [...results].sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;
    switch (sortBy) {
      case "product":
        return a.productName.localeCompare(b.productName) * factor;
      case "scheme":
        return a.scheme.localeCompare(b.scheme) * factor;
      case "fuelClass":
        return a.fuelClass.localeCompare(b.fuelClass) * factor;
      default:
        // Default to sorting by confidence (number)
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
  productInfo: propProductInfo, // Renamed to propProductInfo to avoid shadowing state variable
  setProductInfo: propSetProductInfo, // Renamed to avoid shadowing
  components,
  plantInfo: propPlantInfo, // Renamed to propPlantInfo to avoid shadowing state variable
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
  // Use internal state for product info and plant info if needed, or stick to prop values if they are the source of truth
  const [productInfo, setProductInfo] = useState<ProductInfo[]>(hardcodedProducts);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(propPlantInfo);

  // Initialize state based on hardcoded products and default selections
  useEffect(() => {
    // Ensure offtakeLocations array exists for existing products
    const migratedProducts = hardcodedProducts.map(p => ({
      ...p,
      offtakeLocations: p.offtakeLocations || [],
    }));
    setProductInfo(migratedProducts);
    setVerifiedProducts(migratedProducts.filter(p => p.verified).map(p => p.productName));
    setSelectedCertifications(certificationSchemes.map(s => s.id));
    setPlantInfo(propPlantInfo); // Ensure plantInfo is initialized from props
  }, [propPlantInfo, setVerifiedProducts, setSelectedCertifications]); // Dependencies added

  const handleNextStep = () => {
    // Step validation checks
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
        // Calculate compliance results
        const results = calculateCompliance(productInfo, components, plantInfo, selectedCertifications, verifiedProducts);
        const sortedResults = sortComplianceResults(results, sortBy, sortOrder);
        setComplianceResults(sortedResults);
        setStep("results");
        toast.success("Compliance check completed! Review the results below.");
      } catch (err) {
        console.error("Compliance Calculation Error:", err);
        setError("Failed to calculate compliance results. Please check your model and selections.");
        toast.error("Error during compliance check.");
      }
      return;
    }

    // Move to next step
    setStep(prev => {
      switch (prev) {
        case "verify": return "offtake";
        case "offtake": return "downstream";
        case "downstream": return "certifications";
        default: return prev; // Should not happen
      }
    });
    setError(null);
  };

  const handleBackStep = () => {
    if (step === "verify") {
      // If on the first step, call the main back handler
      onBack();
    } else {
      // Move to previous step
      setStep(prev => {
        switch (prev) {
          case "offtake": return "verify";
          case "downstream": return "offtake";
          case "certifications": return "downstream";
          case "results": return "certifications";
          default: return prev; // Should not happen
        }
      });
      setError(null);
    }
  };

  return (
    <div className="h-full">
      {step === "verify" && (
        <VerifyProducts
          productInfo={productInfo}
          setProductInfo={setProductInfo}
          verifiedProducts={verifiedProducts}
          setVerifiedProducts={setVerifiedProducts}
          error={error}
          handleNextStep={handleNextStep}
          handleBackStep={handleBackStep}
        />
      )}
      {step === "offtake" && (
        <OfftakeLocationComponent
          productInfo={productInfo}
          setProductInfo={setProductInfo}
          verifiedProducts={verifiedProducts}
          error={error}
          handleNextStep={handleNextStep}
          handleBackStep={handleBackStep}
        />
      )}
      {step === "downstream" && (
        <DownstreamOperations
          productInfo={productInfo}
          setProductInfo={setProductInfo}
          verifiedProducts={verifiedProducts}
          error={error}
          handleNextStep={handleNextStep}
          handleBackStep={handleBackStep}
        />
      )}
      {step === "certifications" && (
        <FilterCertifications
          selectedCertifications={selectedCertifications}
          setSelectedCertifications={setSelectedCertifications}
          error={error}
          handleNextStep={handleNextStep}
          handleBackStep={handleBackStep}
        />
      )}
      {step === "results" && (
        <ComplianceResults
          productInfo={productInfo}
          complianceResults={complianceResults}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          setComplianceResults={setComplianceResults}
          error={error}
          handleBackStep={handleBackStep}
          // The following props were added to fix the type error from previous interactions
          userDetails={userDetails}
          plantInfo={plantInfo}
          components={components}
          connections={connections}
          sortComplianceResults={sortComplianceResults} // Pass the helper function
        />
      )}
    </div>
  );
};

export default ComplianceCheck;
