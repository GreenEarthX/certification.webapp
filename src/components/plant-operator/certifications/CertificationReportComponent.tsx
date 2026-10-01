import React from 'react';
import { Download } from 'lucide-react';
import { Report } from '@/models/report';

interface CertificationReportComponentProps {
  reports: Report[]; 
}

const CertificationReportComponent: React.FC<CertificationReportComponentProps> = ({ reports }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-6">Reports of Approval</h2>
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{report.title}</h3>
                <a
                  href={report.link}
                  className="text-brand-700 hover:text-brand-800 underline"
                >
                  Read report
                </a>
              </div>
              {/* Download Icon */}
              <a
                href={report.pdfUrl}
                download
                className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                aria-label="Download report"
              >
                <Download className="size-5" />
              </a>
            </div>
            {index < reports.length - 1 && <hr className="my-4 border-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationReportComponent;