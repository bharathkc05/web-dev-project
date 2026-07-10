/**
 * Formats an ISO date string into a readable format.
 * @example formatDate('2024-01-15T10:30:00Z') // "15 Jan 2024, 10:30 AM"
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};
