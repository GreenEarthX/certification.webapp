import { FaCheckCircle, FaClock, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import StatCard from "../dashboard/stats/StatCard";

interface CertificationsSummaryProps {
  stats: { active: number; pending: number; expired: number; rejected: number };
}

const CertificationsSummary: React.FC<CertificationsSummaryProps> = ({ stats }) => {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Certifications</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Valid" value={stats.active} icon={<FaCheckCircle />} iconColor="green" bgColor="green" />
        <StatCard title="Expired" value={stats.expired} icon={<FaExclamationCircle />} iconColor="orange" bgColor="orange" />
        <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconColor="yellow" bgColor="yellow" />
        <StatCard title="Rejected" value={stats.rejected} icon={<FaTimesCircle />} iconColor="red" bgColor="red" />
      </div>
    </section>
  );
};

export default CertificationsSummary;
