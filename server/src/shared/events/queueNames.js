// server/src/shared/events/queueNames.js
export const QUEUES = Object.freeze({
  ORDER_CONFIRMATION: 'orderConfirmation',
  LOW_STOCK_ALERT: 'lowStockAlert',
  ORDER_CANCELLATION: 'orderCancellation',
});

export default QUEUES;
