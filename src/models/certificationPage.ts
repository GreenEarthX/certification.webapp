export interface Certification {
    certification_id: number;
    status: string;
    created_at: string;
    certification_scheme_name: string;
    imageUrl: string;
    framework: string;
    certificate_type: string;
    geographic_coverage: string;
    issuing_body: string;
    plant_name: string;
    plant_email: string;
    operator_id: number;
    description?: string; // Add description if it's optional
  }
  