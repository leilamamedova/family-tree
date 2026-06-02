import { Person } from '@/types/person';

export const people: Person[] = [
  {
    id: '1',
    firstName: 'Leyla',
    lastName: 'Mammadova',
    birthYear: 1940,
    deathYear: 2018,
    image: '',
    description: 'Person',
    parents: [],
    children: ['2'],
  },
  {
    id: '2',
    firstName: 'Alekber',
    lastName: 'Mammadov',
    birthYear: 1965,
    parents: ['1'],
    children: [],
  },
];
