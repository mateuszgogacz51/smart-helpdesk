import { User } from './user.model';

export interface Comment {
  id?: number;
  content: string;
  createdDate: string;
  author: User;
}