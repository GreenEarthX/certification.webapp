export interface Recommendation {
  id: number;
  title: string;
  overview: string;
  details: string[]; 
  certifyingEntity: string;
  validity: string;
  certificationCoverage: string; 
  compliancePercentage: number;
  plantId: number; 
  plantName: string; 
}
