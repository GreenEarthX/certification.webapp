export interface UploadedData {
  plant_id: number;
  operator_id: number;
  certificationName?: string;
  type?: string;
  entity?: string;
  certificationBody?: string;
  issueDate?: string;
  validityDate?: string;
  certificateNumber?: string;
  compliesWith?: string;
  owner?: string;
}


export const fieldLabels: Record<string, string> = {
  owner: "Scheme Owner",
  issueDate: "Issue Date",
  validityDate: "Validity Date",
  certificationBody: "Certification Body",
  compliesWith: "Complies With",
  certificateNumber: "Certificate Number",
  type: "Type",
  entity: "Entity",
  certificationName: "Certification Name",
};
