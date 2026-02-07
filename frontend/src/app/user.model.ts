export interface User {
  id?: number;
  username: string;
  password?: string;  // Pamiętaj: backend zazwyczaj nie odsyła hasła (dla bezpieczeństwa), ale w modelu może być
  fullName?: string;  // To pole masz, więc je zostawiamy!
  role: string;
  department?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  defaultPriority?: string;
}