'use client';

import { PlantInfo, ProductInfo } from "./types";
import type { PlacedComponent, Connection } from "@/app/plant-builder/types"; // CORRECT NEXT.JS 15 PATH

export type CertificationScheme = {
  id: string;
  name: string;
  criteria: {
    origin?: string[];
    carbonFootprint?: { max: number; unit: string };
    chainOfCustody?: string[];
    markets: string[];
  };
  weight: number;
};

export type ComplianceResult = {
  product: ProductInfo;
  scheme: CertificationScheme;
  attributes: {
    origin: { status: "match" | "mismatch" | "risk"; value: string; details?: string };
    carbonFootprint: { status: "match" | "mismatch" | "risk"; value: number | string; details?: string };
    chainOfCustody: { status: "match" | "mismatch" | "risk"; value: string; details?: string };
  };
  confidenceScore: number;
  eligibleMarkets: string[];
  fuelClass: string;
};

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

export const calculateCompliance = (
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
            ? `Matches: ${origins.join(", ")}`
            : `Required: ${scheme.criteria.origin!.join(", ")}`;
        } else {
          originDetails = "Missing origin data";
        }
        confidenceScore += (originStatus === "match" ? 1 : originStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.4;

        // === CARBON FOOTPRINT ===
        const carbonFootprint = relatedCarriers.reduce((sum, c) => {
          const cf = c.data?.carbonFootprint || 0;
          return sum + (typeof cf === "number" ? cf : 0);
        }, 0) / (relatedCarriers.length || 1);

        if (scheme.criteria.carbonFootprint && carbonFootprint > 0) {
          carbonFootprintStatus =
            carbonFootprint <= scheme.criteria.carbonFootprint.max ? "match" : "mismatch";
          carbonFootprintDetails = carbonFootprintStatus === "match"
            ? `Value: ${carbonFootprint.toFixed(2)} ${scheme.criteria.carbonFootprint.unit} (Max: ${scheme.criteria.carbonFootprint.max})`
            : `Value: ${carbonFootprint.toFixed(2)} ${scheme.criteria.carbonFootprint.unit} exceeds max (${scheme.criteria.carbonFootprint.max})`;
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
            ? `Matches: ${custodyMethods.join(", ")}`
            : `Required: ${scheme.criteria.chainOfCustody!.join(", ")}`;
        } else {
          chainOfCustodyDetails = "Missing chain of custody data";
        }
        confidenceScore += (chainOfCustodyStatus === "match" ? 1 : chainOfCustodyStatus === "risk" ? 0.5 : 0) * scheme.weight * 0.2;

        // === MARKET ELIGIBILITY (FIXED: offtakeLocations is array) ===
        let eligibleMarkets: string[] = scheme.criteria.markets;

        const primaryOfftake = product.offtakeLocations?.[0];
        if (primaryOfftake?.country) {
          const marketMatch = scheme.criteria.markets.includes(primaryOfftake.country);
          confidenceScore *= marketMatch ? 1 : 0.5;
          eligibleMarkets = marketMatch
            ? [primaryOfftake.country, ...scheme.criteria.markets]
            : scheme.criteria.markets;
        } else if (plantInfo?.country) {
          const marketMatch = scheme.criteria.markets.includes(plantInfo.country);
          confidenceScore *= marketMatch ? 1 : 0.8;
          eligibleMarkets = marketMatch
            ? [plantInfo.country, ...scheme.criteria.markets]
            : scheme.criteria.markets;
        }

        // === DOWNSTREAM OPERATIONS PENALTY ===
        if (product.downstreamOperations) {
          confidenceScore *= 0.9;
        }

        // === FUEL CLASS ===
        const fuelClass =
          scheme.id === "rfnbo"
            ? "RFNBO"
            : scheme.id === "advanced"
            ? "Advanced Biofuel"
            : `Annex IX ${scheme.id === "annexIXA" ? "Part A" : "Part B"}`;

        // === PUSH RESULT ===
        results.push({
          product,
          scheme,
          attributes: {
            origin: { status: originStatus, value: origins.join(", ") || "N/A", details: originDetails },
            carbonFootprint: {
              status: carbonFootprintStatus,
              value: carbonFootprint > 0 ? carbonFootprint.toFixed(2) : "N/A",
              details: carbonFootprintDetails,
            },
            chainOfCustody: {
              status: chainOfCustodyStatus,
              value: custodyMethods.join(", ") || "N/A",
              details: chainOfCustodyDetails,
            },
          },
          confidenceScore: Math.round(confidenceScore * 100),
          eligibleMarkets,
          fuelClass,
        });
      });
  });

  return results;
};

export const sortComplianceResults = (
  results: ComplianceResult[],
  sortBy: "product" | "scheme" | "confidence" | "fuelClass" = "confidence",
  sortOrder: "asc" | "desc" = "desc"
): ComplianceResult[] => {
  return [...results].sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;

    switch (sortBy) {
      case "product":
        return a.product.productName.localeCompare(b.product.productName) * factor;
      case "scheme":
        return a.scheme.name.localeCompare(b.scheme.name) * factor;
      case "fuelClass":
        return a.fuelClass.localeCompare(b.fuelClass) * factor;
      default:
        return (a.confidenceScore - b.confidenceScore) * factor;
    }
  });
};