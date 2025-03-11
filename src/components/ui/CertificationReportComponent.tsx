import React from 'react';
import { FaDownload } from 'react-icons/fa'; 
import { Report } from '@/models/report';

interface CertificationReportComponentProps {
  reports: Report[]; 
}

const CertificationReportComponent: React.FC<CertificationReportComponentProps> = ({ reports }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Reports of Approval</h2>
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{report.title}</h3>
                <a
                  href={report.link}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Read report
                </a>
              </div>
              {/* Download Icon */}
              <a
                href={report.pdfUrl}
                download
                className="text-gray-600 hover:text-gray-800"
              >
                <FaDownload className="w-5 h-5" />
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