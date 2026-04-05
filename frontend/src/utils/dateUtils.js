import { format } from 'date-fns';

/**
 * Formats a Date object to 'yyyy-MM-dd' string in LOCAL time.
 * This avoids the timezone shift issue with toISOString().
 */
export const formatDateLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
};

/**
 * Formats a Date object to 'yyyy-MM-ddTHH:mm' string in LOCAL time.
 * Perfect for <input type="datetime-local" />.
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
};
