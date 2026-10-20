import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  formatAmountNumber,
  formatCurrency,
  getCurrencyLocale,
  getCurrencySymbol,
  normalizeCurrency,
} from '../utils/currency';

/**
 * Currency helpers bound to the logged-in user's currency setting.
 *
 *   const { format, symbol } = useCurrency();
 *   format(1234.5)            // "₹1,234.50" for an INR user
 */
const useCurrency = () => {
  const { user } = useAuth() || {};
  const currency = normalizeCurrency(user?.currency);

  const format = useCallback(
    (amount, options) => formatCurrency(amount, currency, options),
    [currency]
  );
  const formatNumber = useCallback(
    (amount, options) => formatAmountNumber(amount, currency, options),
    [currency]
  );

  return useMemo(
    () => ({
      currency,
      locale: getCurrencyLocale(currency),
      symbol: getCurrencySymbol(currency),
      format,
      formatNumber,
    }),
    [currency, format, formatNumber]
  );
};

export default useCurrency;
