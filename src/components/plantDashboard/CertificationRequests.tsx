import React from "react";

interface CertificationRequestsProps {
  requests: { name: string; entity: string; progress: number }[];
}

const CertificationRequests: React.FC<CertificationRequestsProps> = ({ requests }) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm uppercase border-b border-gray-200">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Entity</th>
              <th className="pb-3 font-medium">Progress</th>
              <th className="pb-3 font-medium">Action</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {requests.map(({ name, entity, progress }) => (
              <tr key={name} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4 font-medium">{name}</td>
                <td className="py-4">{entity}</td>
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    Track my certification
                  </span>
                </td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificationRequests;
