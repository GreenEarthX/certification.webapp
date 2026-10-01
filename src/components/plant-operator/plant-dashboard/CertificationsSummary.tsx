import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import StatCard from "../dashboard/stats/StatCard";

interface CertificationsSummaryProps {
  stats: { active: number; pending: number; expired: number; rejected: number };
}

const CertificationsSummary: React.FC<CertificationsSummaryProps> = ({ stats }) => {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Certifications</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Valid" value={stats.active} icon={<CheckCircle2 />} iconColor="green" bgColor="green" />
        <StatCard title="Expired" value={stats.expired} icon={<AlertCircle />} iconColor="orange" bgColor="orange" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} iconColor="yellow" bgColor="yellow" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle />} iconColor="red" bgColor="red" />
      </div>
    </section>
  );
};

export default CertificationsSummary;
