'use client';

import { useMemo, useState } from 'react';
import { Person } from '@/types/person';
import clsx from 'clsx';

type Props = {
  people: Person[];
  value: string;
  placeholder: string;
  emptyLabel: string;
  onChange: (personId: string) => void;
};

function getFullName(person: Person) {
  return [person.firstName, person.lastName, person.patronymic]
    .filter(Boolean)
    .join(' ');
}

export default function PersonSelect({
  people,
  value,
  placeholder,
  emptyLabel,
  onChange,
}: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedPerson = people.find((person) => person.id === value);

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return people;

    return people.filter((person) => {
      const fullName = getFullName(person).toLowerCase();

      return fullName.includes(q);
    });
  }, [people, query]);

  return (
    <div className="relative">
      <input
        value={
          isOpen ? query : selectedPerson ? getFullName(selectedPerson) : ''
        }
        placeholder={placeholder}
        onFocus={() => {
          setIsOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        className="border rounded px-3 py-2 text-sm w-full outline-none"
      />

      {isOpen && (
        <div className="absolute z-[200] mt-1 w-full max-h-48 overflow-auto rounded border bg-white shadow-lg">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setQuery('');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            {emptyLabel}
          </button>

          {filteredPeople.map((person) => (
            <button
              key={person.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(person.id);
                setQuery('');
                setIsOpen(false);
              }}
              className={clsx(
                'w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100',
              )}
            >
              {getFullName(person)}
            </button>
          ))}

          {filteredPeople.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              Nəticə tapılmadı
            </div>
          )}
        </div>
      )}
    </div>
  );
}
