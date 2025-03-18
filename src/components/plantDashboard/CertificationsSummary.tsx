import { FaCheckCircle, FaClock, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import StatCard from "../dashboard/stats/StatCard";

interface CertificationsSummaryProps {
  stats: { active: number; pending: number; expired: number; rejected: number };
}

const CertificationsSummary: React.FC<CertificationsSummaryProps> = ({ stats }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-6">Certifications Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Valid" value={stats.active} icon={<FaCheckCircle />} iconColor="green" bgColor="green" />
        <StatCard title="Expired" value={stats.expired} icon={<FaExclamationCircle />} iconColor="orange" bgColor="orange" />
        <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconColor="yellow" bgColor="yellow" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} iconColor="red" bgColor="red" />
      </div>
    </div>
  );
};

export default CertificationsSummary;
