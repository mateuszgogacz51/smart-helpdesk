// Importujemy Twojego rozbudowanego Usera z pliku obok
import { User } from './user.model'; 

export interface Category {
  id?: number;
  name: string;
}

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;

  // --- TO JEST NAJWAŻNIEJSZE DLA BŁĘDU 500 ---
  // Musi być 'any' lub 'Category', żeby przyjąć obiekt {id: 1, name: "Sprzęt"}
  category: any; 
  // -------------------------------------------

  location?: string;
  createdDate?: string;
  lastUpdated?: string;

  // Tutaj używamy Twojego Usera (z polami fullName, phone itp.)
  author?: User;        
  assignedUser?: User;
}

export interface TicketHistory {
  id: number;
  modifier: User;
  changeType: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}