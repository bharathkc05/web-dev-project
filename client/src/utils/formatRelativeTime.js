/**
 * Shows relative timestamps.
 * @example formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2 hours ago"
 */
export const formatRelativeTime = (dateInput) => {
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) {
    return rtf.format(Math.sign(diffInSeconds) * absDiff, 'second');
  }

  const diffInMinutes = Math.floor(absDiff / 60);
  if (diffInMinutes < 60) {
    return rtf.format(Math.sign(diffInSeconds) * diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(Math.sign(diffInSeconds) * diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(Math.sign(diffInSeconds) * diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(Math.sign(diffInSeconds) * diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return rtf.format(Math.sign(diffInSeconds) * diffInYears, 'year');
};
