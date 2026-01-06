import { User } from "./user.model";

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  createdDate?: string;
  author?: User; 
  assignedEmployee?: User; 
}