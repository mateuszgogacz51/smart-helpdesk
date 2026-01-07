export interface User {
  id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  department?: string; // <--- ZMIANA: Dodajemy brakujące pole
}