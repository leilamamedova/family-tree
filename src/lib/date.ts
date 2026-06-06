import { format, isValid, parse } from 'date-fns';

export function formatDateForDisplay(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB').format(date);
}

export function isValidDateRange(
  birthDate?: string | null,
  deathDate?: string | null,
) {
  if (!birthDate || !deathDate) return true;

  return new Date(deathDate) >= new Date(birthDate);
}

export function formatDateInput(value?: string | null) {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function parseDateInput(value: string) {
  if (!value) return null;
  if (value.length !== 10) return null;

  const parsedDate = parse(value, 'dd.MM.yyyy', new Date());

  if (!isValid(parsedDate)) return null;

  if (format(parsedDate, 'dd.MM.yyyy') !== value) return null;

  return parsedDate;
}

export function validateDateInput(value: string) {
  if (!value) return true;

  return !!parseDateInput(value);
}

export function parseDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function formatDate(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return format(date, 'dd.MM.yyyy');
}
