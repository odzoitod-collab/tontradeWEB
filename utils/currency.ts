// Валюты и курсы
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Курс к USD (сколько единиц валюты за 1 USD)
  flag?: string;
}

// Курсы валют (сколько единиц валюты за 1 USD)
export const CURRENCIES: Record<string, Currency> = {
  RUB: { code: 'RUB', name: 'Российский рубль', symbol: '₽', rate: 89.5, flag: '🇷🇺' },
  KZT: { code: 'KZT', name: 'Казахский тенге', symbol: '₸', rate: 450.0, flag: '🇰🇿' },
  UAH: { code: 'UAH', name: 'Украинская гривна', symbol: '₴', rate: 41.5, flag: '🇺🇦' },
  USD: { code: 'USD', name: 'Доллар США', symbol: '$', rate: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Евро', symbol: '€', rate: 0.92, flag: '🇪🇺' },
  UZS: { code: 'UZS', name: 'Узбекский сум', symbol: 'сум', rate: 12350.0, flag: '🇺🇿' },
  KGS: { code: 'KGS', name: 'Киргизский сом', symbol: 'сом', rate: 87.0, flag: '🇰🇬' },
  TJS: { code: 'TJS', name: 'Таджикский сомони', symbol: 'сом.', rate: 10.9, flag: '🇹🇯' },
};

// Дефолтная валюта
export const DEFAULT_CURRENCY = 'RUB';

// Конвертация из USD в выбранную валюту
export function convertFromUSD(amountUSD: number, currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return amountUSD * currency.rate;
}

// Конвертация из выбранной валюты в USD
export function convertToUSD(amount: number, currencyCode: string): number {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return amount / currency.rate;
}

// Форматирование суммы с символом валюты
export function formatCurrency(amount: number, currencyCode: string, decimals: number = 2): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  // Для больших сумм в некоторых валютах не показываем копейки
  const actualDecimals = (currencyCode === 'KZT' || currencyCode === 'UZS') && amount > 100 ? 0 : decimals;
  
  const formatted = amount.toLocaleString('ru-RU', {
    minimumFractionDigits: actualDecimals,
    maximumFractionDigits: actualDecimals
  });
  
  return `${currency.symbol}${formatted}`;
}

// Форматирование цены криптовалюты в выбранной валюте
export function formatCryptoPrice(priceUSD: number, currencyCode: string): string {
  const converted = convertFromUSD(priceUSD, currencyCode);
  return formatCurrency(converted, currencyCode, currencyCode === 'USD' ? 2 : 0);
}

// Получить символ валюты
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || '$';
}

// Получить информацию о валюте
export function getCurrency(currencyCode: string): Currency {
  return CURRENCIES[currencyCode] || CURRENCIES.USD;
}
