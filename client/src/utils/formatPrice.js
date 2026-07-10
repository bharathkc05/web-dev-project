/**
 * Formats a number as an Indian Rupee string with thousands separator.
 * @example formatPrice(1250) // "₹1,250"
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
