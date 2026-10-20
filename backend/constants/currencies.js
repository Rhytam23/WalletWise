/**
 * Supported ISO-4217 currency codes.
 * Keep in sync with frontend/src/utils/currency.js (SUPPORTED_CURRENCIES).
 */
const SUPPORTED_CURRENCY_CODES = Object.freeze([
  'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SGD', 'AED',
  'BRL', 'MXN', 'ZAR', 'NGN', 'PKR', 'BDT', 'LKR', 'NPR', 'IDR', 'PHP', 'KRW'
]);

const DEFAULT_CURRENCY = 'USD';

const isSupportedCurrency = (value) =>
  typeof value === 'string' && SUPPORTED_CURRENCY_CODES.includes(value.trim().toUpperCase());

/** Upper-cases/trims a supported code; returns `fallback` for anything else. */
const normalizeCurrency = (value, fallback = DEFAULT_CURRENCY) =>
  isSupportedCurrency(value) ? value.trim().toUpperCase() : fallback;

module.exports = {
  SUPPORTED_CURRENCY_CODES,
  DEFAULT_CURRENCY,
  isSupportedCurrency,
  normalizeCurrency
};
