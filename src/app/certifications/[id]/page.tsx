'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CertificationCard from '@/components/certifications/CertificationCard';
import CertificationReportComponent from '@/components/certifications/CertificationReportComponent'; // Import the Reports Component

// Data
import certificationData from '@/data/certificationsTableData.json';
import reportsData from '@/data/reportsData.json';

export default function CertificationDetails() {
  const params = useParams();
  const certificationId = params.id;

  // Find the certification by id
  const certification = certificationData.find(cert => cert.id.toString() === certificationId);

  if (!certification) {
    return <div className="p-6">Certification not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Certification Card Section */}
      <CertificationCard
        imageUrl={certification.imageUrl}
        id={certification.id}
        certification={certification.Certification}
        entity={certification.Entity}
        issueDate={certification['Issue Date']}
        status={certification.Status}
        description={certification.description}
        qrCodeUrl='https://hexdocs.pm/qr_code/docs/qrcode.svg'
      />

      {/* Reports Section */}
      <CertificationReportComponent reports={reportsData} />
    </div>
  );
}