import { Person } from '@/types/person';

export function getFullName(person: Person) {
  return [person.firstName, person.lastName, person.patronymic]
    .filter(Boolean)
    .join(' ');
}

export function getParentsText(person: Person, people: Person[]) {
  if (!person.parents?.length) {
    return 'Qeyd olunmayıb';
  }

  return person.parents
    .map((parentId) => {
      const parent = people.find((p) => p.id === parentId);

      if (!parent) return null;

      return getFullName(parent);
    })
    .filter(Boolean)
    .join(', ');
}

export function getSiblingsText(person: Person, people: Person[]) {
  if (!person.parents?.length) {
    return 'Qeyd olunmayıb';
  }

  const siblings = people.filter((p) => {
    if (p.id === person.id) return false;

    return p.parents?.some((parentId) => person.parents.includes(parentId));
  });

  if (!siblings.length) {
    return 'Qeyd olunmayıb';
  }

  return siblings.map(getFullName).join(', ');
}
