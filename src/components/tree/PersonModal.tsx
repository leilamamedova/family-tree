'use client';

import { useRef, useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

import ConfirmModal from '@/components/ui/ConfirmModal';
import PersonSelect from '@/components/tree/PersonSelect';
import { useGlobalLoading } from '@/components/providers/GlobalLoadingProvider';
import {
  formatDate,
  formatDateInput,
  parseDate,
  parseDateInput,
  validateDateInput,
} from '@/lib/date';
import { getFullName, getParentsText, getSiblingsText } from '@/lib/text';
import { Person } from '@/types/person';
import { uploadImage } from '@/lib/uploadImage';
import { deleteImage } from '@/lib/deleteImage';

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
  birthDateInput: string;
  deathDateInput: string;
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
    birthDate: parseDate(person.birthDate),
    deathDate: parseDate(person.deathDate),
    birthDateInput: formatDate(person.birthDate),
    deathDateInput: formatDate(person.deathDate),
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
  const { withLoading } = useGlobalLoading();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [deletedImageUrl, setDeletedImageUrl] = useState<string | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    invalidDates: false,
  });

  const [birthDateError, setBirthDateError] = useState(false);
  const [deathDateError, setDeathDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setImageFile(null);
    setIsImageLoading(false);

    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });

    setBirthDateError(false);
    setDeathDateError(false);
    setIsEditing(true);
    setDeletedImageUrl(null);
  }

  function cancelEditing() {
    setEditForm(null);
    setImageFile(null);
    setIsImageLoading(false);

    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });

    setBirthDateError(false);
    setDeathDateError(false);
    setIsEditing(false);
    setDeletedImageUrl(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageFile && form.image.startsWith('blob:')) {
      URL.revokeObjectURL(form.image);
    }

    setImageFile(file);
    setIsImageLoading(true);

    const previewUrl = URL.createObjectURL(file);

    setEditForm((prev) => ({
      ...(prev ?? createEditForm(person)),
      image: previewUrl,
    }));
  }

  function handleDeleteImage() {
    const currentForm = editForm ?? createEditForm(person);
    const currentImage =
      currentForm.image || person.image || '/placeholder.png';

    if (!currentImage || currentImage === '/placeholder.png') return;

    if (currentImage.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage);
    } else if (currentImage.startsWith('/uploads/')) {
      setDeletedImageUrl(currentImage);
    }

    setImageFile(null);
    setIsImageLoading(false);

    setEditForm((prev) => ({
      ...(prev ?? createEditForm(person)),
      image: '/placeholder.png',
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    const currentForm = editForm ?? createEditForm(person);

    const isBirthFormatInvalid =
      !!currentForm.birthDateInput &&
      !validateDateInput(currentForm.birthDateInput);

    const isDeathFormatInvalid =
      !!currentForm.deathDateInput &&
      !validateDateInput(currentForm.deathDateInput);

    setBirthDateError(isBirthFormatInvalid);
    setDeathDateError(isDeathFormatInvalid);

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
      isBirthFormatInvalid ||
      isDeathFormatInvalid;

    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      let finalImageUrl = currentForm.image || '/placeholder.png';

      if (imageFile) {
        finalImageUrl = await withLoading(() => uploadImage(imageFile));
      } else if (deletedImageUrl) {
        await withLoading(() => deleteImage(deletedImageUrl));
        finalImageUrl = '/placeholder.png';
      }

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
        image: finalImageUrl,
        parents: currentForm.parentId ? [currentForm.parentId] : [],
        spouseId: currentForm.spouseId || null,
      };

      await onUpdate(updatedPerson);

      setEditForm(null);
      setImageFile(null);
      setIsImageLoading(false);

      setErrors({
        firstName: false,
        lastName: false,
        invalidDates: false,
      });

      setBirthDateError(false);
      setDeathDateError(false);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setEditForm(null);
    setImageFile(null);
    setIsImageLoading(false);

    setErrors({
      firstName: false,
      lastName: false,
      invalidDates: false,
    });

    setBirthDateError(false);
    setDeathDateError(false);
    setIsEditing(false);
    setSelectedPerson(null);
    setDeletedImageUrl(null);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-xl w-[480px] shadow-xl">
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

        {isEditing && (
          <h2 className="text-lg font-semibold text-center text-gray-800">
            Redakt elə
          </h2>
        )}

        <div className="flex flex-col items-center mt-8">
          <div
            onClick={() => {
              if (isEditing) fileInputRef.current?.click();
            }}
            className={`relative w-24 h-24 rounded-full overflow-hidden border-2 ${
              person.deathDate ? 'grayscale opacity-70' : ''
            } ${isEditing ? 'cursor-pointer hover:border-gray-600' : ''}`}
          >
            {isImageLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-gray-600">
                Yüklənir...
              </div>
            )}

            <Image
              src={form.image || person.image || '/placeholder.png'}
              alt={getFullName(person)}
              fill
              sizes="96px"
              loading="eager"
              className={`object-cover ${isEditing || form.image !== '/placeholder.png' ? 'cursor-pointer hover:border-gray-600' : ''}`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
              onClick={(e) => {
                e.stopPropagation();

                if (isEditing) {
                  fileInputRef.current?.click();
                  return;
                }

                if (form.image && form.image !== '/placeholder.png') {
                  setIsImagePreviewOpen(true);
                }
              }}
            />
          </div>

          {isEditing && form.image && form.image !== '/placeholder.png' && (
            <button
              type="button"
              onClick={handleDeleteImage}
              disabled={isImageLoading || isSubmitting}
              className="mt-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
            name="editFileInput"
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
                    setErrors((prev) => ({ ...prev, firstName: false }));
                  }
                }}
                name="editFirstName"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
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
                    setErrors((prev) => ({ ...prev, lastName: false }));
                  }
                }}
                name="addLastName"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
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
                name="addPatronymicName"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />

              <div className="flex gap-2 w-full">
                <DatePicker
                  selected={form.birthDate}
                  value={form.birthDateInput}
                  onChange={(
                    date: Date | null,
                    event?:
                      | React.MouseEvent<HTMLElement>
                      | React.KeyboardEvent<HTMLElement>,
                  ) => {
                    if (event?.type === 'change') return;

                    setBirthDateError(false);

                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      birthDate: date,
                      birthDateInput: date ? format(date, 'dd.MM.yyyy') : '',
                    }));
                  }}
                  onChangeRaw={(e) => {
                    e?.preventDefault();

                    const input = e?.target as HTMLInputElement | null;
                    if (!input) return;

                    const formattedValue = formatDateInput(input.value);

                    setEditForm((prev) => {
                      const current = prev ?? createEditForm(person);
                      const parsedDate =
                        formattedValue.length === 10
                          ? parseDateInput(formattedValue)
                          : null;

                      return {
                        ...current,
                        birthDate: parsedDate,
                        birthDateInput: formattedValue,
                      };
                    });

                    if (!formattedValue || formattedValue.length < 10) {
                      setBirthDateError(false);
                      return;
                    }

                    setBirthDateError(!parseDateInput(formattedValue));
                  }}
                  onBlur={() => {
                    const currentForm = editForm ?? createEditForm(person);

                    if (!currentForm.birthDateInput) {
                      setBirthDateError(false);
                      return;
                    }

                    setBirthDateError(
                      !validateDateInput(currentForm.birthDateInput),
                    );
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
                  autoComplete="off"
                />

                <DatePicker
                  selected={form.deathDate}
                  value={form.deathDateInput}
                  onChange={(
                    date: Date | null,
                    event?:
                      | React.MouseEvent<HTMLElement>
                      | React.KeyboardEvent<HTMLElement>,
                  ) => {
                    if (event?.type === 'change') return;

                    setDeathDateError(false);

                    setEditForm((prev) => ({
                      ...(prev ?? createEditForm(person)),
                      deathDate: date,
                      deathDateInput: date ? format(date, 'dd.MM.yyyy') : '',
                    }));
                  }}
                  onChangeRaw={(e) => {
                    e?.preventDefault();

                    const input = e?.target as HTMLInputElement | null;
                    if (!input) return;

                    const formattedValue = formatDateInput(input.value);

                    setEditForm((prev) => {
                      const current = prev ?? createEditForm(person);
                      const parsedDate =
                        formattedValue.length === 10
                          ? parseDateInput(formattedValue)
                          : null;

                      return {
                        ...current,
                        deathDate: parsedDate,
                        deathDateInput: formattedValue,
                      };
                    });

                    if (!formattedValue || formattedValue.length < 10) {
                      setDeathDateError(false);
                      return;
                    }

                    setDeathDateError(!parseDateInput(formattedValue));
                  }}
                  onBlur={() => {
                    const currentForm = editForm ?? createEditForm(person);

                    if (!currentForm.deathDateInput) {
                      setDeathDateError(false);
                      return;
                    }

                    setDeathDateError(
                      !validateDateInput(currentForm.deathDateInput),
                    );
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
                  autoComplete="off"
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
                people={availableParents}
                value={form.parentId}
                placeholder="Valideyn..."
                emptyLabel="Valideyn qeyd olunmayıb"
                onChange={(personId) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    parentId: personId,
                  }))
                }
                showSpouseName
              />

              <PersonSelect
                people={availableSpouses}
                value={form.spouseId}
                placeholder="Həyat yoldaşı..."
                emptyLabel="Həyat yoldaşı qeyd olunmayıb"
                onChange={(personId) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    spouseId: personId,
                  }))
                }
              />

              <textarea
                className="border rounded px-3 py-2 text-sm min-h-[120px] max-h-[160px] resize-y"
                placeholder="Təsvir"
                value={form.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...(prev ?? createEditForm(person)),
                    description: e.target.value,
                  }))
                }
                name="description"
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={cancelEditing}
                className="text-black border px-3 py-1 rounded"
                disabled={isSubmitting}
              >
                Ləğv et
              </button>

              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-black text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Yüklənir...' : 'Yadda saxla'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-bold text-center text-gray-600">
              {getFullName(person)}
            </h1>

            <p className="text-center text-sm text-gray-500">
              {formatDate(person.birthDate)}
              {person.deathDate ? ` - ${formatDate(person.deathDate)}` : ''}
            </p>

            <div className="mt-3 text-sm text-center text-gray-600">
              <div>
                <span className="font-semibold">Valideynlər:</span>{' '}
                {getParentsText(person, people)}
              </div>

              <div className="mt-1">
                <span className="font-semibold">Qardaş/Bacı:</span>{' '}
                {getSiblingsText(person, people)}
              </div>

              {person.description && (
                <div className="mt-3 max-h-48 overflow-y-auto pr-2 whitespace-pre-wrap text-left">
                  {person.description}
                </div>
              )}
            </div>

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

      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={form.image || person.image || '/placeholder.png'}
              alt={getFullName(person)}
              width={900}
              height={900}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              loading="eager"
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Silmək"
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
