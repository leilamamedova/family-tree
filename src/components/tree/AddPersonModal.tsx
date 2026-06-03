'use client';

import { useState, useRef } from 'react';
import { Person } from '@/types/person';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import PersonSelect from './PersonSelect';
import { uploadImage } from '@/lib/uploadImage';
import { format, isValid, parse } from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';

type Mode = 'root' | 'child' | 'parent';

type Props = {
  isOpen: boolean;
  mode: Mode;
  people: Person[];
  onClose: () => void;
  onCreate: (person: Person, mode: Mode) => void;
};

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseDateInput(value: string) {
  if (!value) return null;
  if (value.length !== 10) return null;

  const parsedDate = parse(value, 'dd.MM.yyyy', new Date());

  if (!isValid(parsedDate)) return null;

  if (format(parsedDate, 'dd.MM.yyyy') !== value) return null;

  return parsedDate;
}

function validateDateInput(value: string) {
  if (!value) return true;

  return !!parseDateInput(value);
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

  const [birthDateInput, setBirthDateInput] = useState('');
  const [deathDateInput, setDeathDateInput] = useState('');

  const [description, setDescription] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [parentId, setParentId] = useState('');
  const [spouseId, setSpouseId] = useState('');

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    invalidDates: false,
  });

  const [birthDateError, setBirthDateError] = useState(false);
  const [deathDateError, setDeathDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableSpouses = people.filter((person) => !person.spouseId);

  function resetForm() {
    setFirstName('');
    setLastName('');
    setPatronymic('');

    setBirthDate(null);
    setDeathDate(null);
    setBirthDateInput('');
    setDeathDateInput('');

    setImageFile(null);
    setImagePreview(null);
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
    setIsSubmitting(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    const isBirthFormatInvalid =
      !!birthDateInput && !validateDateInput(birthDateInput);

    const isDeathFormatInvalid =
      !!deathDateInput && !validateDateInput(deathDateInput);

    setBirthDateError(isBirthFormatInvalid);
    setDeathDateError(isDeathFormatInvalid);

    const newErrors = {
      firstName: !firstName.trim(),
      lastName: !lastName.trim(),
      invalidDates: !!birthDate && !!deathDate && deathDate < birthDate,
    };

    setErrors(newErrors);

    const hasErrors =
      Object.values(newErrors).some(Boolean) ||
      isBirthFormatInvalid ||
      isDeathFormatInvalid;

    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      const uploadedImageUrl = imageFile
        ? await uploadImage(imageFile)
        : '/placeholder.png';

      const newPerson: Person = {
        id: crypto.randomUUID(),

        firstName,
        lastName,
        patronymic,

        birthDate: birthDate ? birthDate.toISOString() : null,
        deathDate: deathDate ? deathDate.toISOString() : null,

        image: uploadedImageUrl,
        description: description || '',

        parents: parentId ? [parentId] : [],
        children: [],

        spouseId: spouseId || null,
      };

      onCreate(newPerson, mode);

      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[480px] rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center text-gray-800">
          Əlavə et
        </h2>

        <div className="flex justify-center mt-4 text-black">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-full border-2 border-black border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-600"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
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
            accept="image/*"
            hidden
            onChange={handleImageUpload}
            name="addFileInput"
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
                setErrors((prev) => ({ ...prev, firstName: false }));
              }
            }}
            name="addFirstName"
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
                setErrors((prev) => ({ ...prev, lastName: false }));
              }
            }}
            name="addLastName"
          />

          <input
            className="border rounded px-3 py-2 text-sm border-gray-300"
            placeholder="Ata adı"
            value={patronymic}
            onChange={(e) => setPatronymic(e.target.value)}
            name="addPatronymicName"
          />

          <div className="flex gap-2 w-full">
            <DatePicker
              selected={birthDate}
              value={birthDateInput}
              onChange={(
                date: Date | null,
                event?:
                  | React.MouseEvent<HTMLElement>
                  | React.KeyboardEvent<HTMLElement>,
              ) => {
                if (event?.type === 'change') return;

                setBirthDate(date);
                setBirthDateInput(date ? format(date, 'dd.MM.yyyy') : '');
                setBirthDateError(false);
              }}
              onChangeRaw={(e) => {
                e?.preventDefault();

                const input = e?.target as HTMLInputElement | null;
                if (!input) return;

                const formattedValue = formatDateInput(input.value);

                setBirthDateInput(formattedValue);

                if (!formattedValue || formattedValue.length < 10) {
                  setBirthDate(null);
                  setBirthDateError(false);
                  return;
                }

                const parsedDate = parseDateInput(formattedValue);

                setBirthDate(parsedDate);
                setBirthDateError(!parsedDate);
              }}
              onBlur={() => {
                if (!birthDateInput) {
                  setBirthDateError(false);
                  return;
                }

                setBirthDateError(!validateDateInput(birthDateInput));
              }}
              dateFormat="dd.MM.yyyy"
              placeholderText="Doğum tarixi"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              isClearable
              popperPlacement="top-start"
              wrapperClassName="w-1/2"
              className={`border rounded px-3 py-2 text-sm w-full min-w-0 ${
                birthDateError ? 'border-red-500' : 'border-gray-300'
              }`}
              name="birthDate"
            />

            <DatePicker
              selected={deathDate}
              value={deathDateInput}
              onChange={(
                date: Date | null,
                event?:
                  | React.MouseEvent<HTMLElement>
                  | React.KeyboardEvent<HTMLElement>,
              ) => {
                if (event?.type === 'change') return;

                setDeathDate(date);
                setDeathDateInput(date ? format(date, 'dd.MM.yyyy') : '');
                setDeathDateError(false);
              }}
              onChangeRaw={(e) => {
                e?.preventDefault();

                const input = e?.target as HTMLInputElement | null;
                if (!input) return;

                const formattedValue = formatDateInput(input.value);

                setDeathDateInput(formattedValue);

                if (!formattedValue || formattedValue.length < 10) {
                  setDeathDate(null);
                  setDeathDateError(false);
                  return;
                }

                const parsedDate = parseDateInput(formattedValue);

                setDeathDate(parsedDate);
                setDeathDateError(!parsedDate);
              }}
              onBlur={() => {
                if (!deathDateInput) {
                  setDeathDateError(false);
                  return;
                }

                setDeathDateError(!validateDateInput(deathDateInput));
              }}
              dateFormat="dd.MM.yyyy"
              placeholderText="Ölüm tarixi"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              isClearable
              popperPlacement="top-start"
              wrapperClassName="w-1/2"
              className={`border rounded px-3 py-2 text-sm w-full min-w-0 ${
                deathDateError ? 'border-red-500' : 'border-gray-300'
              }`}
              name="deathDate"
            />
          </div>

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
            name="description"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleClose}
            className="text-black border px-3 py-1 rounded"
            disabled={isSubmitting}
          >
            Ləğv et
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Yüklənir...' : 'Yadda saxla'}
          </button>
        </div>
      </div>
    </div>
  );
}
