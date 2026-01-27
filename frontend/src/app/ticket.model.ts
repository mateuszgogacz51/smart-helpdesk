export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdDate?: string;
  lastUpdated?: string;
  author?: User;
  assignedUser?: User;
}

export interface TicketHistory {
  id: number;
  modifier: { username: string };
  changeType: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}