// types.ts - Updated

export type Position = { x: number; y: number };  // ADD THIS

export interface UserDetails {
  name: string;
  email: string;
  license: 'pro' | 'free';
}

export interface PlantInfo {
  plantName: string;
  projectName: string;
  projectType: string;
  primaryFuelType: string;
  country: string;
  status: string;
  commercialOperationalDate: string;
  investment?: { amount: number; unit: string };
  [key: string]: any;
}

export type OfftakeLocation = { country: string; zip?: string; city?: string; street?: string };

export interface ProductInfo {
  productId: string;
  productName: string;
  productType?: string;
  productionCapacity: number | string;
  unit: string;
  fuelType: string;
  fuelClass?: string;
  feedstock?: string;
  carbonFootprint?: { value: number; unit: string };
  offtakeLocations?: OfftakeLocation[]; // Array
  downstreamOperations?: string; // Legacy single
  downstreamOperationsArray?: string[]; // New: multiple
  verified: boolean;
}

// ... rest unchanged (ComplianceResult, etc.)
export interface ComplianceResult {
  productName: string;
  productId: string;
  scheme: string;
  confidence: number;
  fuelClass: string;
  origin?: string;
  carbonFootprint?: string;
  chainOfCustody?: string;
  eligibleMarkets?: string[];
  
  // Enhanced fields for 3D matrix
  id?: string;
  complianceStatus?: "fully-compliant" | "partial-compliance" | "non-compliant";
  improvementPathways?: string[];
  regulatoryBodies?: string[];
  lastUpdated?: string;
  dataSources?: string[];
  riskLevel?: "low" | "medium" | "high";
  estimatedTimeline?: string;
  revenuePotential?: "Very High" | "High" | "Medium" | "Low";
  
  // Additional compliance attributes
  ghgReduction?: string;
  additionality?: string;
  temporalCorrelation?: string;
  feedstock?: string;
  sustainability?: string;
  ilucRisk?: string;
  capCompliance?: string;
  refuelEUEligible?: string;
  corsiaEligible?: string;
  foodVsFuel?: string;
  
  // Enhanced scoring
  enhancedConfidence?: number;
  lastAudited?: string;
}

export interface ComplianceMatrix3D {
  product: string;
  scheme: string;
  attribute: string;
  confidence: number;
  status: string;
  details?: ComplianceResult;
}

export interface MarketData {
  price: string;
  demandMultiplier: string;
  trend: string;
  certificationRequirements?: string[];
  marketSize?: "Very Large" | "Large" | "Medium" | "Small";
  growthPotential?: "High" | "Medium" | "Low";
  regulatoryFramework?: string;
  marketAccessTime?: string;
  premiumOpportunities?: string[];
}

export interface PlacedComponent {
  id: string;
  name: string;
  type: 'equipment' | 'carrier' | 'gate';
  category: string;
  position: { x: number; y: number };
  data: {
    technicalData?: {
      input?: Array<{ name: string; quantity: number; unit: string }>;
      output?: Array<{ name: string; quantity: number; unit: string }>;
      efficiency?: number;
      capacity?: { value: number; unit: string };
    };
    fuelType?: string;
    temperature?: number;
    pressure?: number;
    gateType?: string;
    sourceOrigin?: string;
    endUse?: string;
    manufacturer?: string;
    product?: string;
    carbonFootprint?: number;
    chainOfCustody?: string;
    [key: string]: any;
  };
  certifications: string[];
  // Optional backend linkage
  componentDefinitionId?: number;
  instanceId?: number; // database primary key for component_instances
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: string;
  reason?: string;
  data?: { [key: string]: any };
}

export interface CertificationScheme {
  id: string;
  name: string;
  criteria: {
    origin?: string[];
    carbonFootprint?: { max: number; unit: string };
    chainOfCustody?: string[];
    markets: string[];
    
    // Enhanced criteria for detailed analysis
    ghgReduction?: { min: number; unit: string };
    additionality?: boolean;
    temporalCorrelation?: string;
    feedstockRestrictions?: string[];
    sustainabilityRequirements?: string[];
    ilucRiskAssessment?: boolean;
    marketSpecificRequirements?: {
      [market: string]: {
        additionalCriteria?: string[];
        multipliers?: number;
        premiumEligibility?: boolean;
      };
    };
  };
  weight: number;
  
  // Additional scheme metadata
  regulatoryBodies?: string[];
  lastUpdated?: string;
  applicableProducts?: string[];
  marketAccess?: string[];
  premiumOpportunities?: string[];
}

// Additional interfaces for enhanced functionality
export interface ComplianceSummary {
  total: number;
  fullyCompliant: number;
  partialCompliant: number;
  nonCompliant: number;
  totalMarkets: number;
  highValueProducts: number;
  overallConfidence: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface MatrixFilter {
  status: "all" | "fully-compliant" | "partial-compliance" | "non-compliant";
  product?: string;
  scheme?: string;
  market?: string;
  confidenceRange?: { min: number; max: number };
}

export interface ExportReportOptions {
  includeMatrix: boolean;
  includeConfidenceScores: boolean;
  includeMarketAnalysis: boolean;
  includeImprovementPathways: boolean;
  format: "pdf" | "excel" | "json";
}