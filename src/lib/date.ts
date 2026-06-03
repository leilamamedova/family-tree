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
