"use client";

import Link from "next/link";

interface Certification {
  name: string;
  entity: string;
  date: string;
  type: string;
  status: string;
  id: string;
}

interface CertificationsTableProps {
  certifications: Certification[];
}

const CertificationsTable: React.FC<CertificationsTableProps> = ({ certifications }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-200 text-green-700";
      case "pending":
        return "bg-yellow-200 text-yellow-700";
      case "expired":
        return "bg-orange-200 text-orange-700";  
      case "rejected":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <section>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm uppercase border-b border-gray-200">
              <th className="pb-3 font-medium w-80">Name</th>
              <th className="pb-3 font-medium">Issuing Body</th>
              <th className="pb-3 font-medium">Submission Date</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">View</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {certifications.map(({ id, name, entity, date, type, status }) => (
              <tr key={id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4 font-medium w-80">{name}</td>
                <td className="py-4">{entity}</td>
                <td className="py-4">{date}</td>
                <td className="py-4">{type}</td>
                <td className="py-4">
                  <Link href={`/certifications/${id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details
                  </Link>
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}`}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CertificationsTable;