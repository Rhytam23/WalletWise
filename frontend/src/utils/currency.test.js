import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  detectCurrencyFromLocale,
  formatAmountNumber,
  formatCurrency,
  getCurrencyFractionDigits,
  getCurrencyLocale,
  getCurrencySymbol,
  isSupportedCurrency,
  normalizeCurrency,
} from './currency';

describe('currency utils', () => {
  test('normalizeCurrency upper-cases valid codes and falls back for bad input', () => {
    expect(normalizeCurrency('inr')).toBe('INR');
    expect(normalizeCurrency(' eur ')).toBe('EUR');
    expect(normalizeCurrency('XXX')).toBe(DEFAULT_CURRENCY);
    expect(normalizeCurrency(undefined)).toBe(DEFAULT_CURRENCY);
    expect(normalizeCurrency(42)).toBe(DEFAULT_CURRENCY);
  });

  test('isSupportedCurrency', () => {
    expect(isSupportedCurrency('JPY')).toBe(true);
    expect(isSupportedCurrency('jpy')).toBe(true);
    expect(isSupportedCurrency('ZZZ')).toBe(false);
    expect(isSupportedCurrency(null)).toBe(false);
  });

  test('every supported currency formats without throwing', () => {
    SUPPORTED_CURRENCIES.forEach(({ code }) => {
      expect(() => formatCurrency(1234.5, code)).not.toThrow();
      expect(formatCurrency(1234.5, code)).toEqual(expect.any(String));
    });
  });

  test('formats using the currency symbol and locale grouping', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
    expect(formatCurrency(1234567.5, 'INR')).toBe('₹12,34,567.50');
    expect(formatCurrency(1234.5, 'GBP')).toBe('£1,234.50');
  });

  test('zero-decimal currencies do not show fractions', () => {
    expect(formatCurrency(1500, 'JPY')).not.toMatch(/\./);
    expect(getCurrencyFractionDigits('JPY')).toBe(0);
    expect(getCurrencyFractionDigits('USD')).toBe(2);
  });

  test('bad amounts degrade to zero instead of NaN', () => {
    expect(formatCurrency(undefined, 'USD')).toBe('$0.00');
    expect(formatCurrency(null, 'USD')).toBe('$0.00');
    expect(formatCurrency('abc', 'USD')).toBe('$0.00');
    expect(formatCurrency(NaN, 'USD')).toBe('$0.00');
    expect(formatCurrency('12.5', 'USD')).toBe('$12.50');
  });

  test('unknown currency falls back to USD', () => {
    expect(formatCurrency(10, 'NOPE')).toBe('$10.00');
  });

  test('passes Intl options through and survives invalid ones', () => {
    expect(formatCurrency(10.129, 'USD', { maximumFractionDigits: 0 })).toBe('$10');
    expect(() => formatCurrency(10, 'USD', { maximumFractionDigits: 999 })).not.toThrow();
  });

  test('symbols', () => {
    expect(getCurrencySymbol('INR')).toBe('₹');
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('USD')).toBe('$');
    // ja-JP typography uses the full-width yen sign, so accept either form
    expect(getCurrencySymbol('JPY')).toMatch(/^[¥￥]$/);
    expect(getCurrencySymbol(undefined)).toBe('$');
  });

  test('locale lookup and plain number formatting', () => {
    expect(getCurrencyLocale('INR')).toBe('en-IN');
    expect(getCurrencyLocale('bogus')).toBe('en-US');
    expect(formatAmountNumber(1234567, 'INR')).toBe('12,34,567');
    expect(formatAmountNumber('x', 'INR')).toBe('0');
  });

  test('detectCurrencyFromLocale', () => {
    expect(detectCurrencyFromLocale('en-IN')).toBe('INR');
    expect(detectCurrencyFromLocale('de-DE')).toBe('EUR');
    expect(detectCurrencyFromLocale('en')).toBe(DEFAULT_CURRENCY);
    expect(detectCurrencyFromLocale('xx-ZZ')).toBe(DEFAULT_CURRENCY);
  });

  test('currency codes are unique', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
