'use client';

import { useState, useRef } from 'react';
import { Person } from '@/types/person';
import Image from 'next/image';

type Mode = 'root' | 'child' | 'parent';

type Props = {
  isOpen: boolean;
  mode: Mode;
  people: Person[];
  onClose: () => void;
  onCreate: (person: Person, mode: Mode) => void;
};

export default function AddPersonModal({
  isOpen,
  mode,
  people,
  onClose,
  onCreate,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [deathYear, setDeathYear] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const [imageFile, setImageFile] = useState<string | null>(null);

  const [parentId, setParentId] = useState('');
  const [spouseId, setSpouseId] = useState('');

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
  });

  if (!isOpen) return null;

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageFile(url);
  }

  function handleSubmit() {
    const newErrors = {
      firstName: !firstName.trim(),
      lastName: !lastName.trim(),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    const newPerson: Person = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      birthYear: birthYear || null,
      deathYear: deathYear || null,
      image: imageFile || '/placeholder.png',
      description: description || '',
      parents: parentId ? [parentId] : [],
      children: [],
      spouseId: spouseId || null,
    };

    onCreate(newPerson, mode);

    setFirstName('');
    setLastName('');
    setBirthYear('');
    setDeathYear('');
    setImageFile(null);
    setDescription('');
    setParentId('');
    setSpouseId('');
    setErrors({
      firstName: false,
      lastName: false,
    });

    onClose();
  }

  function handleClose() {
    setFirstName('');
    setLastName('');
    setBirthYear('');
    setDeathYear('');
    setImageFile(null);
    setDescription('');
    setParentId('');
    setSpouseId('');
    setErrors({
      firstName: false,
      lastName: false,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center text-gray-800">
          Add Person
        </h2>

        {/* IMAGE */}
        <div className="flex justify-center mt-4 text-black">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full border-2 border-black border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-600"
          >
            {imageFile ? (
              <Image
                src={imageFile}
                alt="avatar"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs">Upload</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleImageUpload}
          />
        </div>

        {/* FORM */}
        <div className="mt-4 flex flex-col gap-2 text-gray-600">
          <input
            className={`border rounded px-3 py-2 text-sm ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);

              if (errors.firstName) {
                setErrors((prev) => ({
                  ...prev,
                  firstName: false,
                }));
              }
            }}
          />

          <input
            className={`border rounded px-3 py-2 text-sm ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);

              if (errors.lastName) {
                setErrors((prev) => ({
                  ...prev,
                  lastName: false,
                }));
              }
            }}
          />

          <select
            className="border rounded px-3 py-2 text-sm"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No parent</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm"
            value={spouseId}
            onChange={(e) => setSpouseId(e.target.value)}
          >
            <option value="">No spouse</option>
            {people
              .filter((p) => !p.spouseId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
          </select>

          <textarea
            className="border rounded px-3 py-2 text-sm"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleClose}
            className="text-black border px-3 py-1 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
