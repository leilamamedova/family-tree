'use client';

import { useRef, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Person } from '@/types/person';
import { Trash2, Pencil } from 'lucide-react';
import Image from 'next/image';

type Props = {
  selectedPerson: Person | null;
  people: Person[];
  setSelectedPerson: (person: Person | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (person: Person) => void;
};

type EditForm = {
  firstName: string;
  lastName: string;
  patronymic: string;
  birthYear: number | '';
  deathYear: number | '';
  description: string;
  image: string;
  parentId: string;
  spouseId: string;
};

function createEditForm(person: Person): EditForm {
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    patronymic: person.patronymic || '',
    birthYear: person.birthYear ?? '',
    deathYear: person.deathYear ?? '',
    description: person.description || '',
    image: person.image || '/placeholder.png',
    parentId: person.parents?.[0] || '',
    spouseId: person.spouseId || '',
  };
}

export default function PersonModal({
  selectedPerson,
  people,
  setSelectedPerson,
  onDelete,
  onUpdate,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
  });

  if (!selectedPerson) return null;

  const person = selectedPerson;
  const form = editForm ?? createEditForm(person);

  const availableParents = people.filter((p) => p.id !== person.id);

  const availableSpouses = people.filter((p) => {
    if (p.id === person.id) return false;
    if (p.id === person.spouseId) return true;

    return !p.spouseId;
  });

  function startEditing() {
    setEditForm(createEditForm(person));
    setErrors({
      firstName: false,
      lastName: false,
    });
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditForm(null);
    setErrors({
      firstName: false,
      lastName: false,
    });
    setIsEditing(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setEditForm((prev) => ({
      ...(prev ?? createEditForm(person)),
      image: url,
    }));
  }

  function handleSave() {
    const currentForm = editForm ?? createEditForm(person);

    const newErrors = {
      firstName: !currentForm.firstName.trim(),
      lastName: !currentForm.lastName.trim(),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    const updatedPerson: Person = {
      ...person,
      firstName: currentForm.firstName,
      lastName: currentForm.lastName,
      patronymic: currentForm.patronymic,
      birthYear: currentForm.birthYear === '' ? null : currentForm.birthYear,
      deathYear: currentForm.deathYear === '' ? null : currentForm.deathYear,
      description: currentForm.description,
      image: currentForm.image || '/placeholder.png',
      parents: currentForm.parentId ? [currentForm.parentId] : [],
      spouseId: currentForm.spouseId || null,
    };

    onUpdate(updatedPerson);

    setEditForm(null);
    setErrors({
      firstName: false,
      lastName: false,
    });
    setIsEditing(false);
  }

  function handleClose() {
    setEditForm(null);
    setErrors({
      firstName: false,
      lastName: false,
    });
    setIsEditing(false);
    setSelectedPerson(null);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-xl w-[320px] shadow-xl">
        {!isEditing && (
          <div className="absolute top-5 right-5 flex items-center gap-3">
            <button
              onClick={startEditing}
              className="text-gray-500 hover:text-gray-900 transition"
            >
              <Pencil size={20} />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <div
            onClick={() => {
              if (isEditing) fileInputRef.current?.click();
            }}
            className={`relative w-24 h-24 rounded-full overflow-hidden border-2 ${
              person.deathYear ? 'grayscale opacity-70' : ''
            } ${isEditing ? 'cursor-pointer hover:border-gray-600' : ''}`}
          >
            <Image
              src={form.image || person.image || '/placeholder.png'}
              alt={`${person.firstName} ${person.lastName} ${person.patronymic}`}
              fill
              sizes="96px"
              loading="eager"
              className="object-cover"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </div>

        {isEditing ? (
          <>
            <div className="mt-4 flex flex-col gap-2 text-gray-600">
              <input
                className={`border rounded px-3 py-2 text-sm ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adı"
                value={form.firstName}
                onChange={(e) => {
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    firstName: e.target.value,
                  }));

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
                placeholder="Soyad"
                value={form.lastName}
                onChange={(e) => {
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    lastName: e.target.value,
                  }));

                  if (errors.lastName) {
                    setErrors((prev) => ({
                      ...prev,
                      lastName: false,
                    }));
                  }
                }}
              />

              <input
                className="border rounded px-3 py-2 text-sm border-gray-300"
                placeholder="Ata adı"
                value={form.patronymic}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    patronymic: e.target.value,
                  }))
                }
              />

              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 text-sm w-1/2"
                  placeholder="Doğum tarixi"
                  type="number"
                  value={form.birthYear}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      birthYear:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />

                <input
                  className="border rounded px-3 py-2 text-sm w-1/2"
                  placeholder="Ölüm tarixi"
                  type="number"
                  value={form.deathYear}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      deathYear:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />
              </div>

              <select
                className="border rounded px-3 py-2 text-sm"
                value={form.parentId}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    parentId: e.target.value,
                  }))
                }
              >
                <option value="">Valideyn qeyd olunmayıb</option>
                {availableParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.patronymic}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-3 py-2 text-sm"
                value={form.spouseId}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    spouseId: e.target.value,
                  }))
                }
              >
                <option value="">Həyat yoldaşı qeyd olunmayıb</option>
                {availableSpouses.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.patronymic}
                  </option>
                ))}
              </select>

              <textarea
                className="border rounded px-3 py-2 text-sm"
                placeholder="Təsvir"
                value={form.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={cancelEditing}
                className="text-black border px-3 py-1 rounded"
              >
                Ləğv et
              </button>

              <button
                onClick={handleSave}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Yadda saxla
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-bold text-center text-gray-600">
              {person.firstName} {person.lastName} {person.patronymic}
            </h1>

            <p className="text-center text-sm text-gray-500">
              {person.birthYear} - {person.deathYear || ''}
            </p>

            <p className="mt-3 text-sm text-center text-gray-600">
              {person.description}
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={handleClose}
                className="text-black border px-3 py-1 rounded"
              >
                Bağla
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete person"
        message={`${person.firstName} ${person.lastName} ${person.patronymic} silmək istədiyinizə əminsiniz?`}
        confirmText="Sil"
        cancelText="Ləğv et"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(person.id);
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
}
