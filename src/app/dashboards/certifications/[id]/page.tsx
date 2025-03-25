'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CertificationCard from '@/components/certifications/CertificationCard';
import CertificationReportComponent from '@/components/certifications/CertificationReportComponent';
import reportsData from '@/data/reportsData.json';
import { useCertifications } from '@/hooks/useCertifications';

export default function CertificationDetails() {
  const { id: certificationId } = useParams();
  const {
    certification,
    loading,
    error,
  } = useCertifications(certificationId as string);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !certification) return <div className="p-6">Certification not found</div>;

  return (
    <div className="p-6 space-y-6">
      <CertificationCard
        imageUrl="/certification1.jpeg"
        id={certification.certification_id}
        certification={certification.certification_scheme_name}
        entity={certification.issuing_body}
        issueDate={certification.created_at}
        status={certification.status}
        description={certification.short_certification_overview}
        validity={certification.validity}
        qrCodeUrl="https://hexdocs.pm/qr_code/docs/qrcode.svg"
      />

      {/* Reports Section */}
      <CertificationReportComponent reports={reportsData} />
    </div>
  );
}
