import React from 'react';
import Image from 'next/image';
import { CertificationCards } from '@/models/certification';

const CertificationCard: React.FC<CertificationCards> = ({
  imageUrl,
  id,
  certification,
  entity,
  issueDate,
  status,
  description,
  qrCodeUrl,
  validity
}) => {
  // Function to determine the text color based on the status
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      case 'expired':
        return 'text-orange-500';  
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-sm p-6 gap-6">
      {/* Left Div: Certification Image */}
      <div className="w-full md:w-1/3">
        <Image
          src={imageUrl}
          alt="Certification Image"
          width={500}
          height={300}
          quality={100}
          className="rounded-lg"
        />
      </div>

      {/* Right Div: Certification Details and QR Code */}
      <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-6">
        {/* Left Part: Certification Details (2/3 of the right div) */}
        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-bold mb-3">{certification}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {description}  
          </p>

          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Entity:</strong> {entity}</p>
            <p><strong>Issue Date:</strong> {issueDate}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`${getStatusColor()} font-semibold`}>
                {status}
              </span>
            </p>
            <p><strong>Validity:</strong> {validity}</p>
          </div>
        </div>

        {/* Right Part: QR Code and Button (1/3 of the right div) */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-l-0 md:border-l md:pl-6 gap-4">
          {/* QR Code */}
          <div className="p-4 border rounded-lg shadow-sm">
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={120}
              height={120}
              quality={100}
              className="rounded-lg"
            />
          </div>

          {/* View Button */}
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm">
            View Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificationCard;