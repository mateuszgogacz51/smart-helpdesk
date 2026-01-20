import { User } from './user.model';
import { Ticket } from './ticket.model';

export interface Comment {
  id?: number;
  content: string;
  createdDate?: string;
  author?: User;
  ticket?: Ticket;
}