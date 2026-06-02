export type Person = {
  id: string;

  firstName: string;
  lastName: string;

  birthYear: number | null;
  deathYear?: number | null;

  image?: string;

  description?: string;

  parents: string[];
  children?: string[];
  spouseId?: string | null;
};
