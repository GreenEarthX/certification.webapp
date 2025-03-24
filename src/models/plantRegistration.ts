export interface CertificationRegistrationPayload {
    plant_id: number;
    certificationName: string;
    certificationBody: string;
    type: string;
    entity: string;
    issueDate: string;
    validityDate: string;
    certificateNumber: string;
    compliesWith: string;
  }