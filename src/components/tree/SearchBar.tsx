'use client';

import { useState } from 'react';
import { Person } from '@/types/person';
import clsx from 'clsx';
import { X } from 'lucide-react';

type Props = {
  people: Person[];
  onSelect: (person: Person) => void;
  onClear?: () => void;
};

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

    const filtered = people.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();

      return (
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        fullName.includes(q)
      );
    });

    setResults(filtered);

    if (filtered.length === 0) {
      onClear?.();
    }
  };

  const selectPerson = (person: Person) => {
    setQuery(`${person.firstName} ${person.lastName}`);
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
        {/* INPUT */}
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search person..."
          className="px-4 py-2 w-full rounded-full border shadow-sm outline-none bg-transparent pr-10"
        />

        {/* CLEAR BUTTON */}
        {query && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-100 hover:text-gray-400"
          >
            <X size={16} />
          </button>
        )}

        {/* DROPDOWN */}
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
                <div className="font-medium">
                  {person.firstName} {person.lastName}
                </div>

                <div className="text-xs text-gray-500">
                  {person.birthYear} - {person.deathYear || ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
