import { AlertCircle } from 'lucide-react';

const StepNotice: React.FC = () => (
  <div className="flex items-start  text-red-600 text-sm mb-4">
    <AlertCircle className="w-4 h-4 mt-0.5 mr-2 text-red-600" />
    <span>You Don&apos;t need to answer every question. Feel free to skip and move on the next section.</span>
  </div>
);

export default StepNotice;