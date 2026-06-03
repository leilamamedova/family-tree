'use client';

import { useState, useRef } from 'react';
import { Person } from '@/types/person';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import PersonSelect from './PersonSelect';

import 'react-datepicker/dist/react-datepicker.css';

type Mode = 'root' | 'child' | 'parent';

type Props = {
  isOpen: boolean;
  mode: Mode;
  people: Person[];
  onClose: () => void;
  onCreate: (person: Person, mode: Mode) => void;
};

function validateDateInput(value: string) {
  return /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/.test(value);
}

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
  const [patronymic, setPatronymic] = useState('');

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [deathDate, setDeathDate] = useState<Date | null>(null);

  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  const [parentId, setParentId] = useState('');
  const [spouseId, setSpouseId] = useState('');

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    invalidDates: false,
  });

  const [birthDateError, setBirthDateError] = useState(false);
  const [deathDateError, setDeathDateError] = useState(false);

  if (!isOpen) return null;

  const availableSpouses = people.filter((person) => !person.spouseId);

  function resetForm() {
    setFirstName('');
    setLastName('');
    setPatronymic('');
    setBirthDate(null);
    setDeathDate(null);
    setImageFile(null);
    setDescription('');
    setParentId('');
    setSpouseId('');

    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });

    setBirthDateError(false);
    setDeathDateError(false);
  }

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
      invalidDates: !!birthDate && !!deathDate && deathDate < birthDate,
    };

    setErrors(newErrors);

    const hasErrors =
      Object.values(newErrors).some(Boolean) ||
      birthDateError ||
      deathDateError;

    if (hasErrors) return;

    const newPerson: Person = {
      id: crypto.randomUUID(),

      firstName,
      lastName,
      patronymic,

      birthDate: birthDate ? birthDate.toISOString() : null,
      deathDate: deathDate ? deathDate.toISOString() : null,

      image: imageFile || '/placeholder.png',
      description: description || '',

      parents: parentId ? [parentId] : [],
      children: [],

      spouseId: spouseId || null,
    };

    onCreate(newPerson, mode);

    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[380px] rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center text-gray-800">
          Əlavə et
        </h2>

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
              <span className="text-xs">Yüklə</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleImageUpload}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 text-gray-600">
          <input
            className={`border rounded px-3 py-2 text-sm ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ad"
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
            placeholder="Soyad"
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

          <input
            className="border rounded px-3 py-2 text-sm border-gray-300"
            placeholder="Ata adı"
            value={patronymic}
            onChange={(e) => setPatronymic(e.target.value)}
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
              selected={birthDate}
              onChange={(date: Date | null) => {
                setBirthDateError(false);
                setBirthDate(date);
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
              selected={deathDate}
              onChange={(date: Date | null) => {
                setDeathDateError(false);
                setDeathDate(date);
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
            people={people}
            value={parentId}
            placeholder="Valideyn axtar..."
            emptyLabel="Valideyn qeyd olunmayıb"
            onChange={setParentId}
          />

          <PersonSelect
            people={availableSpouses}
            value={spouseId}
            placeholder="Həyat yoldaşı axtar..."
            emptyLabel="Həyat yoldaşı qeyd olunmayıb"
            onChange={setSpouseId}
          />

          <textarea
            className="border rounded px-3 py-2 text-sm"
            placeholder="Təsvir"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleClose}
            className="text-black border px-3 py-1 rounded"
          >
            Ləğv et
          </button>

          <button
            onClick={handleSubmit}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}
