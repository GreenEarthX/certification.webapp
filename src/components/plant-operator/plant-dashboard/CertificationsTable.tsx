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
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-orange-100 text-orange-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <section>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="w-80 pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Issuing Body</th>
              <th className="pb-3 pr-4">Submission Date</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">View</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {certifications.map(({ id, name, entity, date, type, status }) => (
              <tr
                key={id}
                className="border-b border-slate-100 last:border-0 transition-colors duration-150 hover:bg-slate-50"
              >
                <td className="w-80 py-3.5 pr-4 font-medium text-slate-900">{name}</td>
                <td className="py-3.5 pr-4">{entity}</td>
                <td className="py-3.5 pr-4 tabular-nums">{date}</td>
                <td className="py-3.5 pr-4">{type}</td>
                <td className="py-3.5 pr-4">
                  <Link
                    href={`/certifications/${id}`}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline underline-offset-4"
                  >
                    View Details
                  </Link>
                </td>
                <td className="py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(status)}`}>
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