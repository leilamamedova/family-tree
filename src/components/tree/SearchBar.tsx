'use client';

import { useState } from 'react';
import { Person } from '@/types/person';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
  people: Person[];
  onSelect: (person: Person) => void;
  onClear?: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return format(date, 'dd.MM.yyyy');
}

function getFullName(person: Person) {
  return [person.firstName, person.lastName, person.patronymic]
    .filter(Boolean)
    .join(' ');
}

export default function SearchBar({ people, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      onClear?.();
      return;
    }

    const q = value.toLowerCase();

    const filtered = people.filter((person) => {
      const fullName = getFullName(person).toLowerCase();

      return fullName.includes(q);
    });

    setResults(filtered);

    if (filtered.length === 0) {
      onClear?.();
    }
  };

  const selectPerson = (person: Person) => {
    setQuery(getFullName(person));
    setResults([]);
    onSelect(person);
  };

  const clearInput = () => {
    setQuery('');
    setResults([]);
    onClear?.();
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="relative w-64">
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Axtarış..."
          className="px-4 py-2 w-full rounded-full border shadow-sm outline-none bg-transparent pr-10"
          name="searchBar"
        />

        {query && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-100 hover:text-gray-400"
          >
            <X size={16} />
          </button>
        )}

        {results.length > 0 && (
          <div className="absolute mt-2 w-full bg-transparent border rounded-lg shadow-lg max-h-60 overflow-auto">
            {results.map((person) => (
              <div
                key={person.id}
                onClick={() => selectPerson(person)}
                className={clsx(
                  'px-3 py-2 cursor-pointer text-sm hover:bg-white/10',
                )}
              >
                <div className="font-medium">{getFullName(person)}</div>

                <div className="text-xs text-gray-500">
                  {formatDate(person.birthDate)} -{' '}
                  {formatDate(person.deathDate)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
