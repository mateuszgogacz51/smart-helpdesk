export interface User {
  id?: number;
  username: string;
  password?: string;    // <--- Twoje pole (zachowane)
  fullName?: string;    // <--- Twoje pole (zachowane)
  role: string;

  // Twoje pola opcjonalne (zachowane):
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;

  // --- NOWE POLE ---
  defaultPriority?: string; // <--- Jedyne, co dodajemy
}