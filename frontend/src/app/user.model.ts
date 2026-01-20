export interface User {
  id?: number;
  username: string;
  password?: string;    // <--- DODAJ TO (potrzebne do rejestracji nowego usera)
  fullName?: string;    // <--- DODAJ TO (potrzebne, bo używasz tego w tabeli HTML)
  role: string;
  
  // Te pola możesz zostawić na przyszłość, ale na razie są opcjonalne:
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string; 
}