import { User } from './user.model';
import { Ticket } from './ticket.model'; // Upewnij się, że masz ticket.model.ts

export interface Comment {
  id?: number;
  content: string;
  createdDate?: string;
  author?: User;
  ticket?: Ticket;
}