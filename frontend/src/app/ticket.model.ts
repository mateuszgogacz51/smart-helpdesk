export interface Ticket {
  id?: number;              // Znak zapytania oznacza, że przy tworzeniu ID może nie być
  title: string;
  description: string;
  category: string;         // To co dodaliśmy wczoraj
  location: string;         // To co dodaliśmy wczoraj
  status: string;
  createdDate?: string;     // Data przyjdzie z backendu jako napis
}