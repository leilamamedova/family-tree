export type Person = {
  id: string;

  firstName: string;
  lastName: string;
  patronymic?: string;

  birthDate?: string | null;
  deathDate?: string | null;

  image?: string;

  description?: string;

  parents: string[];
  children?: string[];
  spouseId?: string | null;
};
