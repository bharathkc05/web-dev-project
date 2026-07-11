// server/src/shared/constants/taxConfig.js

/**
 * Tax configuration constants.
 * Centralised so both server-side order calculation and any future
 * API response can reference the same authoritative value.
 */
export const TAX_RATE = 0.05; // 5% GST

export default { TAX_RATE };
