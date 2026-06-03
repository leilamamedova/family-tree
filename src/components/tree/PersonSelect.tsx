'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { getFullName } from '@/lib/text';
import { Person } from '@/types/person';

type Props = {
  people: Person[];
  value: string;
  placeholder: string;
  emptyLabel: string;
  showSpouseName?: boolean;
  onChange: (personId: string) => void;
};

function getOptionLabel(
  person: Person,
  people: Person[],
  showSpouseName: boolean,
) {
  const fullName = getFullName(person);

  if (!showSpouseName || !person.spouseId) {
    return fullName;
  }

  const spouse = people.find((p) => p.id === person.spouseId);

  if (!spouse) {
    return fullName;
  }

  return `${fullName} (${getFullName(spouse)})`;
}

export default function PersonSelect({
  people,
  value,
  placeholder,
  emptyLabel,
  showSpouseName = false,
  onChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function openSelect() {
    setIsOpen(true);
    setQuery('');
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={
          isOpen && query
            ? query
            : selectedPerson
              ? getOptionLabel(selectedPerson, people, showSpouseName)
              : ''
        }
        autoComplete="off"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={placeholder}
        onFocus={openSelect}
        onClick={openSelect}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        className="border rounded px-3 py-2 text-sm w-full outline-none"
        name="selectBox"
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
              {getOptionLabel(person, people, showSpouseName)}{' '}
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
