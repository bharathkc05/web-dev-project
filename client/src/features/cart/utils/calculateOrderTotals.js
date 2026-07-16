/**
 * Calculates order totals consistently between UI and backend.
 */
export const calculateOrderTotals = (
  items,
  discountAmount = 0,
  taxRate = 0.18 // Default 18% tax rate
) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.min(Math.max(0, discountAmount), subtotal); // Prevent negative discount or discount > subtotal
  
  const amountAfterDiscount = subtotal - discount;
  const tax = amountAfterDiscount * taxRate;
  const total = amountAfterDiscount + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};
