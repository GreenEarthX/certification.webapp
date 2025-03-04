export interface Notification {
    id: number;
    type: string;
    message: string;
    timestamp: string;
    read: boolean;
  }
  
  export interface NavbarProps {
    title: string;
    notifications: Notification[];
    userName: string;
  }