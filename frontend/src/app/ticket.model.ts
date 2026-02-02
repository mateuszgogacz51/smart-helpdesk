// Rozbudowany interfejs User o nowe pola (telefon, dział, imię...)
export interface User {
  id?: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;   // <--- NOWE
  phoneNumber?: string;  // <--- NOWE
  defaultPriority?: string;
}

// Bilet z nowym polem lokalizacji
export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  location?: string;     // <--- NOWE
  createdDate?: string;
  lastUpdated?: string;
  author?: User;
  assignedUser?: User;
}

// Historia (której brakowało w Twoim kodzie)
export interface TicketHistory {
  id: number;
  modifier: User;       // Zmieniono na pełny obiekt User, żeby mieć dostęp do nazwy
  changeType: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}