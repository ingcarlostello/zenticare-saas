import { Break } from "../../lib/slot-generation";

export interface DayConfig {
  day: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breaks: Break[];
}

export interface ScheduleManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: any;
}

export interface ToastState {
  type: "success" | "error";
  message: string;
}
