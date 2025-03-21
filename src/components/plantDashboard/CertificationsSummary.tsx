import { FaCheckCircle, FaClock, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import StatCard from "../dashboard/stats/StatCard";

interface CertificationsSummaryProps {
  stats: { active: number; pending: number; expired: number; rejected: number };
}

const CertificationsSummary: React.FC<CertificationsSummaryProps> = ({ stats }) => {
  return (
    <div className="p-4 rounded-lg">
      <h2 style={{ color: "#17598d" }} className="text-xl font-semibold mb-4">Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Valid" value={stats.active} icon={<FaCheckCircle />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Expired" value={stats.expired} icon={<FaExclamationCircle />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconColor="lightblue" bgColor="lightblue" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} iconColor="lightblue" bgColor="lightblue" />
      </div>
    </div>
  );
};

export default CertificationsSummary;
