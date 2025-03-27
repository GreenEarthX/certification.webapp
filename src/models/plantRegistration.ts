export interface CertificationRegistrationPayload {
  plant_id: number;
  certificationName: string;
  certificationBody: string;
  type?: string;
  entity?: string;
  issueDate?: string;
  validityDate?: string;
  certificateNumber?: string;
  compliesWith?: string; // comma-separated string
}

export interface FormData {
  role: string;
  plantName: string;
  fuelType: string;
  address: { country: string; region: string };
  plantStage: string;
  certification: boolean;
}