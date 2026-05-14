export interface AppointmentsClientProps {
  dict: Record<string, any>;
  lang: string;
}

export interface UseAppointmentsClientReturn {
  activeTab: "upcoming" | "history";
  setActiveTab: (tab: "upcoming" | "history") => void;
  activeList: any[];
  upcomingCount: number;
  historyCount: number;
  isLoading: boolean;
  t: Record<string, any>;
}
