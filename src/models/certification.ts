export interface CertificationCards {
    imageUrl: string;
    id: number;
    certification: string;
    entity: string;
    issueDate: string;
    status: string;
    description: string;
    qrCodeUrl: string; // QR code image URL
    validity: string;
  }
  


  export interface Certification {
    Certification: string;
    "Plant Name": string;
    Entity: string;
    "Submission Date": string;
    Type: string;
    Status: string;
    id: number;
  }


  // For the detailed view
export interface CertificationDetail {
  certification_id: number;
  status: string;
  created_at: string;
  certification_scheme_name: string;
  framework: string;
  certificate_type: string;
  geographic_coverage: string;
  validity: string;
  short_certification_overview: string;
  issuing_body: string;
  plant_id: number;
  operator_id: number;
  plant_name: string;
  plant_email: string;
}


export interface CertificationOption {
  certification_scheme_id: number;
  certification_scheme_name: string;
  certificate_type: string;
  entity: string;
  validity: string;
  certification_bodies: string[];
  complies_with: string[];
  owners: string[];
}