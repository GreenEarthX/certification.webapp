'use client';

import React from 'react';
import { memo } from 'react';

interface Certification {
  id: number;
  Certification: string;
  'Plant Name': string;
  Entity: string;
  'Submission Date': string;
  Type: string;
  Status: string;
}

interface CertificationsTableProps {
  certifications: Certification[];
}

const CertificationsTable: React.FC<CertificationsTableProps> = ({ certifications }) => {
  // Get the status label color based on the status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'valid':
        return 'bg-green-500'; // Green for valid
      case 'pending':
        return 'bg-yellow-500'; // Yellow for pending
      case 'expiring':
        return 'bg-orange-500'; // Orange for expiring
      case 'rejected':
        return 'bg-red-500'; // Red for rejected
      default:
        return 'bg-gray-500'; // Default color
    }
  };

  // Mock function for handling certification details
  const handleViewDetails = (id: number) => {
    console.log(`View details for certification with ID: ${id}`);
  };

  return (
    <section className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Certifications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm uppercase">
              <th className="pb-3 font-medium">Certification</th>
              <th className="pb-3 font-medium">Plant Name</th>
              <th className="pb-3 font-medium">Entity</th>
              <th className="pb-3 font-medium">Submission Date</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Details</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {certifications.map(({ id, Certification, 'Plant Name': plantName, Entity, 'Submission Date': submissionDate, Type, Status }) => (
              <tr key={id} className="border-t border-gray-100">
                <td className="py-4 font-medium">{Certification}</td>
                <td className="py-4">{plantName}</td>
                <td className="py-4">{Entity}</td>
                <td className="py-4">{submissionDate}</td>
                <td className="py-4">{Type}</td>
                <td className="py-4">
                  <div
                    onClick={() => handleViewDetails(id)}
                    className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-sm font-medium">View Details</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </td>
                <td className="py-4">
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(Status)}`}
                    style={{ minWidth: '60px', textAlign: 'center' }}
                  >
                    {Status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default memo(CertificationsTable);
