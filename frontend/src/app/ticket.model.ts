import { User } from "./user.model";

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  priority?: string;
  createdDate?: string;
  author?: User; 
  assignedUser?: User; 
  lastUpdated?: string;
}

export interface TicketHistory {
  id: number;
  modifier: { username: string }; // Użytkownik, który zmienił
  changeType: string;             // np. STATUS_CHANGE
  oldValue: string;
  newValue: string;
  timestamp: string;
}