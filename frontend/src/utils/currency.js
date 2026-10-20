/**
 * Central currency / locale helpers for WalletWise.
 *
 * Every screen that shows or asks for a money amount should use these helpers
 * (or the `useCurrency` hook) instead of hardcoding symbols or locales.
 *
 * Keep SUPPORTED_CURRENCIES in sync with backend/constants/currencies.js.
 */

export const DEFAULT_CURRENCY = 'USD';

/**
 * `locale` is the default number-formatting locale for that currency
 * (symbol placement, decimal and grouping separators).
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'BRL', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'ZAR', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'NGN', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'PKR', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'BDT', name: 'Bangladeshi Taka', locale: 'en-BD' },
  { code: 'LKR', name: 'Sri Lankan Rupee', locale: 'en-LK' },
  { code: 'NPR', name: 'Nepalese Rupee', locale: 'en-NP' },
  { code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'PHP', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'KRW', name: 'South Korean Won', locale: 'ko-KR' },
];

const CURRENCY_BY_CODE = new Map(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));

/** Returns an upper-cased supported ISO code, or DEFAULT_CURRENCY. */
export const normalizeCurrency = (currency) => {
  const code = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
  return CURRENCY_BY_CODE.has(code) ? code : DEFAULT_CURRENCY;
};

export const isSupportedCurrency = (currency) =>
  typeof currency === 'string' && CURRENCY_BY_CODE.has(currency.trim().toUpperCase());

/** Default formatting locale for a currency (falls back to en-US). */
export const getCurrencyLocale = (currency) =>
  CURRENCY_BY_CODE.get(normalizeCurrency(currency))?.locale || 'en-US';

const toNumber = (value) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Format an amount as currency, e.g. formatCurrency(1234.5, 'INR') -> "₹1,234.50".
 * Never throws: bad input becomes 0 and an unknown currency falls back to USD.
 * `options` are passed through to Intl.NumberFormat (e.g. maximumFractionDigits).
 */
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY, options = {}) => {
  const code = normalizeCurrency(currency);
  const locale = getCurrencyLocale(code);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, ...options }).format(
      toNumber(amount)
    );
  } catch (error) {
    // Only reachable for invalid `options`; degrade gracefully instead of crashing the UI.
    return `${code} ${toNumber(amount).toFixed(2)}`;
  }
};

/** Plain grouped number in the currency's locale, with no symbol, e.g. "1,23,456". */
export const formatAmountNumber = (amount, currency = DEFAULT_CURRENCY, options = {}) => {
  try {
    return new Intl.NumberFormat(getCurrencyLocale(currency), options).format(toNumber(amount));
  } catch (error) {
    return String(toNumber(amount));
  }
};

/** Currency symbol only, e.g. getCurrencySymbol('EUR') -> "€", ('JPY') -> "¥". */
export const getCurrencySymbol = (currency = DEFAULT_CURRENCY) => {
  const code = normalizeCurrency(currency);
  try {
    const part = new Intl.NumberFormat(getCurrencyLocale(code), {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency');
    return part ? part.value : code;
  } catch (error) {
    return code;
  }
};

/** Number of fraction digits the currency uses (JPY/KRW -> 0, most others -> 2). */
export const getCurrencyFractionDigits = (currency = DEFAULT_CURRENCY) => {
  try {
    return (
      new Intl.NumberFormat(getCurrencyLocale(currency), {
        style: 'currency',
        currency: normalizeCurrency(currency),
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch (error) {
    return 2;
  }
};

/**
 * Best-guess currency for a new user from the browser locale region
 * (e.g. "en-IN" -> INR). Used to pre-select a value on the signup form.
 */
export const detectCurrencyFromLocale = (localeTag) => {
  const tag =
    localeTag || (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
  const region = tag.split('-')[1]?.toUpperCase();
  const byRegion = {
    US: 'USD', GB: 'GBP', IN: 'INR', JP: 'JPY', CN: 'CNY', AU: 'AUD', CA: 'CAD',
    CH: 'CHF', SG: 'SGD', AE: 'AED', BR: 'BRL', MX: 'MXN', ZA: 'ZAR', NG: 'NGN',
    PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', ID: 'IDR', PH: 'PHP', KR: 'KRW',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', PT: 'EUR',
    AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
  };
  return byRegion[region] || DEFAULT_CURRENCY;
};
