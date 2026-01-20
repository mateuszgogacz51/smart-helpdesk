export interface User {
  id?: number;
  username: string;
  password?: string;
  fullName?: string; // Backend teraz zwraca to pole
  role: string;
  
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;

  defaultPriority?: string; // KLUCZOWE POLE
}