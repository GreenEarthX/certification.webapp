export interface CertificationCards {
    imageUrl: string;
    id: number;
    certification: string;
    entity: string;
    issueDate: string;
    status: string;
    description: string;
    qrCodeUrl: string; // QR code image URL
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