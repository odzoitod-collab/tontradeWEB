import type { CurrencyRate } from '../types';

// Курсы валют (синхронизированы с базой данных)
export const DEFAULT_RATES: Record<string, CurrencyRate> = {
  USD: {
    id: 1,
    currency_code: 'USD',
    currency_name: 'Доллар США',
    currency_symbol: '$',
    rate_to_usd: 1.0,
    is_active: true
  },
  RUB: {
    id: 2,
    currency_code: 'RUB',
    currency_name: 'Российский рубль',
    currency_symbol: '₽',
    rate_to_usd: 0.010,
    is_active: true
  },
  EUR: {
    id: 3,
    currency_code: 'EUR',
    currency_name: 'Евро',
    currency_symbol: '€',
    rate_to_usd: 1.08,
    is_active: true
  },
  KZT: {
    id: 4,
    currency_code: 'KZT',
    currency_name: 'Казахстанский тенге',
    currency_symbol: '₸',
    rate_to_usd: 0.0022,
    is_active: true
  },
  UAH: {
    id: 5,
    currency_code: 'UAH',
    currency_name: 'Украинская гривна',
    currency_symbol: '₴',
    rate_to_usd: 0.024,
    is_active: true
  },
  BYN: {
    id: 6,
    currency_code: 'BYN',
    currency_name: 'Белорусский рубль',
    currency_symbol: 'Br',
    rate_to_usd: 0.31,
    is_active: true
  }
};

/**
 * Получить информацию о валюте по коду
 */
export function getCurrencyInfo(currencyCode: string): CurrencyRate {
  return DEFAULT_RATES[currencyCode] || DEFAULT_RATES.USD;
}

/**
 * Конвертировать из USD в выбранную валюту
 */
export function convertFromUSD(amountUSD: number, currencyCode: string): number {
  const rate = getCurrencyInfo(currencyCode).rate_to_usd;
  return amountUSD / rate;
}

/**
 * Конвертировать из выбранной валюты в USD
 */
export function convertToUSD(amount: number, currencyCode: string): number {
  const rate = getCurrencyInfo(currencyCode).rate_to_usd;
  return amount * rate;
}

/**
 * Форматировать сумму с символом валюты
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string, 
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, decimals = 2 } = options || {};
  const currency = getCurrencyInfo(currencyCode);
  
  const formattedAmount = amount.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (showSymbol) {
    // Для рубля и других валют символ после числа
    if (currencyCode === 'RUB' || currencyCode === 'UAH' || currencyCode === 'KZT') {
      return `${formattedAmount} ${currency.currency_symbol}`;
    }
    // Для доллара и евро символ перед числом
    return `${currency.currency_symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
}

/**
 * Получить баланс пользователя в его валюте
 */
export function getUserBalance(balanceUSD: number, currencyCode: string): number {
  return convertFromUSD(balanceUSD, currencyCode);
}

/**
 * Форматировать баланс пользователя
 */
export function formatUserBalance(balanceUSD: number, currencyCode: string): string {
  const balance = getUserBalance(balanceUSD, currencyCode);
  return formatCurrency(balance, currencyCode);
}

/**
 * Получить список всех доступных валют
 */
export function getAvailableCurrencies(): CurrencyRate[] {
  return Object.values(DEFAULT_RATES).filter(c => c.is_active);
}
