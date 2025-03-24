export interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    iconColor: string; // Optional, in case it's needed later
    bgColor: string;
  }
  
  export interface Stats {
    active: number;
    expired: number;
    pending: number;
    rejected: number;
  }