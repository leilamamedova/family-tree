'use client';

import { useRef, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Person } from '@/types/person';
import { Trash2, Pencil } from 'lucide-react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import PersonSelect from './PersonSelect';

import 'react-datepicker/dist/react-datepicker.css';

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
  birthDate: Date | null;
  deathDate: Date | null;
  description: string;
  image: string;
  parentId: string;
  spouseId: string;
};

function validateDateInput(value: string) {
  return /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/.test(value);
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

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

function createEditForm(person: Person): EditForm {
  return {
    firstName: person.firstName,
    lastName: person.lastName,
    patronymic: person.patronymic || '',
    birthDate: parseDate(person.birthDate),
    deathDate: parseDate(person.deathDate),
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
    invalidDates: false,
  });

  const [birthDateError, setBirthDateError] = useState(false);
  const [deathDateError, setDeathDateError] = useState(false);

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
      invalidDates: false,
    });
    setBirthDateError(false);
    setDeathDateError(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditForm(null);
    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });
    setBirthDateError(false);
    setDeathDateError(false);
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
      invalidDates:
        !!currentForm.birthDate &&
        !!currentForm.deathDate &&
        currentForm.deathDate < currentForm.birthDate,
    };

    setErrors(newErrors);

    const hasErrors =
      Object.values(newErrors).some(Boolean) ||
      birthDateError ||
      deathDateError;

    if (hasErrors) return;

    const updatedPerson: Person = {
      ...person,
      firstName: currentForm.firstName,
      lastName: currentForm.lastName,
      patronymic: currentForm.patronymic,
      birthDate: currentForm.birthDate
        ? currentForm.birthDate.toISOString()
        : null,
      deathDate: currentForm.deathDate
        ? currentForm.deathDate.toISOString()
        : null,
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
      invalidDates: false,
    });
    setBirthDateError(false);
    setDeathDateError(false);
    setIsEditing(false);
  }

  function handleClose() {
    setEditForm(null);
    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });
    setBirthDateError(false);
    setDeathDateError(false);
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
              person.deathDate ? 'grayscale opacity-70' : ''
            } ${isEditing ? 'cursor-pointer hover:border-gray-600' : ''}`}
          >
            <Image
              src={form.image || person.image || '/placeholder.png'}
              alt={getFullName(person)}
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

              {birthDateError && (
                <span className="text-red-500 text-xs">
                  Doğru tarix formatı daxil edin: dd.mm.yyyy
                </span>
              )}

              {deathDateError && (
                <span className="text-red-500 text-xs">
                  Doğru tarix formatı daxil edin: dd.mm.yyyy
                </span>
              )}

              {errors.invalidDates && (
                <span className="text-red-500 text-xs">
                  Ölüm tarixi doğum tarixindən əvvəl ola bilməz
                </span>
              )}

              <div className="flex gap-2">
                <DatePicker
                  selected={form.birthDate}
                  onChange={(date: Date | null) => {
                    setBirthDateError(false);

                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      birthDate: date,
                    }));
                  }}
                  onChangeRaw={(e) => {
                    if (!e) return;

                    const value = (e.target as HTMLInputElement).value;

                    if (!value) {
                      setBirthDateError(false);
                      return;
                    }

                    setBirthDateError(!validateDateInput(value));
                  }}
                  onBlur={(e) => {
                    if (!e) return;

                    const value = (e.target as HTMLInputElement).value;

                    if (!value) {
                      setBirthDateError(false);
                    }
                  }}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="Doğum tarixi"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  isClearable
                  popperPlacement="top-start"
                  className={`border rounded px-3 py-2 text-sm w-full ${
                    birthDateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />

                <DatePicker
                  selected={form.deathDate}
                  onChange={(date: Date | null) => {
                    setDeathDateError(false);

                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      deathDate: date,
                    }));
                  }}
                  onChangeRaw={(e) => {
                    if (!e) return;

                    const value = (e.target as HTMLInputElement).value;

                    if (!value) {
                      setDeathDateError(false);
                      return;
                    }

                    setDeathDateError(!validateDateInput(value));
                  }}
                  onBlur={(e) => {
                    if (!e) return;

                    const value = (e.target as HTMLInputElement).value;

                    if (!value) {
                      setDeathDateError(false);
                    }
                  }}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="Ölüm tarixi"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  isClearable
                  popperPlacement="top-start"
                  className={`border rounded px-3 py-2 text-sm w-full ${
                    deathDateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              <PersonSelect
                people={availableParents}
                value={form.parentId}
                placeholder="Valideyn axtar..."
                emptyLabel="Valideyn qeyd olunmayıb"
                onChange={(personId) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    parentId: personId,
                  }))
                }
              />

              <PersonSelect
                people={availableSpouses}
                value={form.spouseId}
                placeholder="Həyat yoldaşı axtar..."
                emptyLabel="Həyat yoldaşı qeyd olunmayıb"
                onChange={(personId) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    spouseId: personId,
                  }))
                }
              />

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
              {getFullName(person)}
            </h1>

            <p className="text-center text-sm text-gray-500">
              {formatDate(person.birthDate)} - {formatDate(person.deathDate)}
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
        message={`${getFullName(person)} silmək istədiyinizə əminsiniz?`}
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
