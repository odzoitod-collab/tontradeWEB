import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ChevronLeft, Minus, Plus, Clock, Zap, AlertTriangle, Star, BarChart3, ArrowLeft, Wallet, History, Maximize2, Minimize2 } from 'lucide-react';
import { getCryptoIcon } from '../icons';
import { formatCurrency, convertFromUSD, getCurrencySymbol, DEFAULT_CURRENCY, getCurrency } from '../utils/currency';
import type { ActiveDeal, CryptoPair } from '../types';

interface TradingPageProps {
    activeDeals: ActiveDeal[];
    onCreateDeal: (deal: ActiveDeal) => void;
    balance: number;
    userLuck: 'win' | 'lose' | 'default';
    onNavigationChange?: (hide: boolean) => void;
    currency?: string;
    isDemoMode?: boolean;
    /** Код элемента (символ пары) для открытия по URL: ?tab=trading&pair=TON */
    initialPair?: string | null;
    onInitialPairConsumed?: () => void;
}

const PAIRS: CryptoPair[] = [
  // Криптовалюты
  { id: '1', symbol: 'TON', name: 'Toncoin', price: '1.46', change: '+2.00%', isPositive: true, isFavorite: true, color: '#0098EA', category: 'crypto' },
  { id: '2', symbol: 'BTC', name: 'Bitcoin', price: '88767.26', change: '+0.80%', isPositive: true, isFavorite: true, color: '#F7931A', category: 'crypto' },
  { id: '3', symbol: 'ETH', name: 'Ethereum', price: '3027.69', change: '+1.80%', isPositive: true, isFavorite: true, color: '#627EEA', category: 'crypto' },
  { id: '4', symbol: 'SOL', name: 'Solana', price: '126.33', change: '+0.80%', isPositive: true, isFavorite: false, color: '#9945FF', category: 'crypto' },
  { id: '5', symbol: 'BNB', name: 'BNB', price: '856.21', change: '+0.80%', isPositive: true, isFavorite: true, color: '#F3BA2F', category: 'crypto' },
  { id: '6', symbol: 'XRP', name: 'Ripple', price: '1.92', change: '+0.10%', isPositive: true, isFavorite: false, color: '#23292F', category: 'crypto' },
  { id: '7', symbol: 'DOGE', name: 'Dogecoin', price: '0.1321', change: '+0.30%', isPositive: true, isFavorite: true, color: '#C2A633', category: 'crypto' },
  { id: '8', symbol: 'ADA', name: 'Cardano', price: '0.3662', change: '+0.70%', isPositive: true, isFavorite: false, color: '#0033AD', category: 'crypto' },
  { id: '9', symbol: 'AVAX', name: 'Avalanche', price: '12.19', change: '+0.30%', isPositive: true, isFavorite: false, color: '#E84142', category: 'crypto' },
  { id: '10', symbol: 'DOT', name: 'Polkadot', price: '1.81', change: '0.00%', isPositive: false, isFavorite: false, color: '#E6007A', category: 'crypto' },
  { id: '11', symbol: 'MATIC', name: 'Polygon', price: '0.107', change: '+2.20%', isPositive: true, isFavorite: false, color: '#8247E5', category: 'crypto' },
  { id: '12', symbol: 'LINK', name: 'Chainlink', price: '12.57', change: '+0.40%', isPositive: true, isFavorite: false, color: '#2A5ADA', category: 'crypto' },
  { id: '13', symbol: 'ATOM', name: 'Cosmos', price: '1.95', change: '+1.30%', isPositive: true, isFavorite: false, color: '#2E3148', category: 'crypto' },
  { id: '14', symbol: 'UNI', name: 'Uniswap', price: '6.18', change: '+3.30%', isPositive: true, isFavorite: false, color: '#FF007A', category: 'crypto' },
  { id: '15', symbol: 'LTC', name: 'Litecoin', price: '78.04', change: '+0.80%', isPositive: true, isFavorite: false, color: '#BFBBBB', category: 'crypto' },
  
  // Акции - Технологии
  { id: '101', symbol: 'AAPL', name: 'Apple Inc.', price: '185.92', change: '+1.20%', isPositive: true, isFavorite: true, color: '#007AFF', category: 'stocks' },
  { id: '102', symbol: 'GOOGL', name: 'Alphabet Inc.', price: '2847.63', change: '+0.95%', isPositive: true, isFavorite: false, color: '#4285F4', category: 'stocks' },
  { id: '103', symbol: 'MSFT', name: 'Microsoft Corp.', price: '378.85', change: '+0.75%', isPositive: true, isFavorite: true, color: '#00BCF2', category: 'stocks' },
  { id: '104', symbol: 'TSLA', name: 'Tesla Inc.', price: '248.42', change: '-1.15%', isPositive: false, isFavorite: false, color: '#CC0000', category: 'stocks' },
  { id: '105', symbol: 'NVDA', name: 'NVIDIA Corp.', price: '875.28', change: '+2.40%', isPositive: true, isFavorite: true, color: '#76B900', category: 'stocks' },
  { id: '106', symbol: 'META', name: 'Meta Platforms', price: '512.73', change: '+1.85%', isPositive: true, isFavorite: false, color: '#1877F2', category: 'stocks' },
  { id: '107', symbol: 'AMZN', name: 'Amazon.com Inc.', price: '178.25', change: '+0.65%', isPositive: true, isFavorite: true, color: '#FF9900', category: 'stocks' },
  { id: '108', symbol: 'NFLX', name: 'Netflix Inc.', price: '692.45', change: '-0.45%', isPositive: false, isFavorite: false, color: '#E50914', category: 'stocks' },
  
  // Акции - Финансы
  { id: '109', symbol: 'JPM', name: 'JPMorgan Chase', price: '218.67', change: '+0.85%', isPositive: true, isFavorite: false, color: '#0066CC', category: 'stocks' },
  { id: '110', symbol: 'BAC', name: 'Bank of America', price: '45.32', change: '+1.12%', isPositive: true, isFavorite: false, color: '#E31837', category: 'stocks' },
  { id: '111', symbol: 'V', name: 'Visa Inc.', price: '289.45', change: '+0.92%', isPositive: true, isFavorite: true, color: '#1A1F71', category: 'stocks' },
  { id: '112', symbol: 'MA', name: 'Mastercard Inc.', price: '467.89', change: '+1.05%', isPositive: true, isFavorite: false, color: '#EB001B', category: 'stocks' },
  
  // Акции - Другие
  { id: '113', symbol: 'KO', name: 'Coca-Cola Co.', price: '62.18', change: '+0.35%', isPositive: true, isFavorite: false, color: '#F40009', category: 'stocks' },
  { id: '114', symbol: 'DIS', name: 'Walt Disney Co.', price: '98.76', change: '-0.78%', isPositive: false, isFavorite: false, color: '#113CCF', category: 'stocks' },
  { id: '115', symbol: 'NKE', name: 'Nike Inc.', price: '78.92', change: '+1.45%', isPositive: true, isFavorite: false, color: '#111111', category: 'stocks' },
  
  // Сырье
  { id: '301', symbol: 'GOLD', name: 'Золото', price: '2018.45', change: '+0.65%', isPositive: true, isFavorite: true, color: '#FFD700', category: 'commodities' },
  { id: '302', symbol: 'OIL', name: 'Нефть WTI', price: '78.92', change: '-1.25%', isPositive: false, isFavorite: false, color: '#000000', category: 'commodities' },
  { id: '303', symbol: 'SILVER', name: 'Серебро', price: '24.18', change: '+1.10%', isPositive: true, isFavorite: false, color: '#C0C0C0', category: 'commodities' },
];

const TIME_OPTIONS = [
  { label: '10 сек', short: '10с', value: 10 },
  { label: '30 сек', short: '30с', value: 30 },
  { label: '1 мин', short: '1м', value: 60 },
  { label: '2 мин', short: '2м', value: 120 },
  { label: '5 мин', short: '5м', value: 300 },
];

// Фейковые активные позиции других трейдеров
interface FakePosition {
  id: string;
  symbol: string;
  name: string;
  type: 'Long' | 'Short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  trader: string;
  openTime: string;
}

const generateFakePositions = (): FakePosition[] => {
  const symbols = ['BTC', 'ETH', 'TON', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'MATIC', 'LINK'];
  const names: Record<string, string> = {
    BTC: 'Bitcoin', ETH: 'Ethereum', TON: 'Toncoin', SOL: 'Solana', BNB: 'BNB',
    XRP: 'Ripple', DOGE: 'Dogecoin', AVAX: 'Avalanche', MATIC: 'Polygon', LINK: 'Chainlink'
  };
  const traders = [
    '@whale_hunter', '@crypto_king', '@moon_trader', '@diamond_hands', '@bull_master',
    '@smart_money', '@degen_pro', '@hodl_king', '@rocket_man', '@profit_maker',
    '@alpha_trader', '@btc_maxi', '@eth_lover', '@ton_whale', '@sol_surfer'
  ];
  const basePrices: Record<string, number> = {
    BTC: 88767, ETH: 3027, TON: 1.46, SOL: 126, BNB: 856,
    XRP: 1.92, DOGE: 0.132, AVAX: 12.19, MATIC: 0.107, LINK: 12.57
  };
  
  const positions: FakePosition[] = [];
  const count = 8 + Math.floor(Math.random() * 7); // 8-14 позиций
  
  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.45 ? 'Long' : 'Short'; // Немного больше лонгов
    const basePrice = basePrices[symbol];
    const entryPrice = basePrice * (0.97 + Math.random() * 0.06); // ±3%
    const priceChange = (Math.random() - 0.4) * 0.08; // Немного в плюс чаще
    const currentPrice = entryPrice * (1 + (type === 'Long' ? priceChange : -priceChange));
    const leverage = [5, 10, 20, 25, 50, 100][Math.floor(Math.random() * 6)];
    const amount = [100, 250, 500, 1000, 2500, 5000, 10000][Math.floor(Math.random() * 7)];
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * (type === 'Long' ? 1 : -1) * leverage;
    const pnl = amount * (pnlPercent / 100);
    
    positions.push({
      id: `fake-${i}-${Date.now()}`,
      symbol,
      name: names[symbol],
      type,
      amount,
      entryPrice,
      currentPrice,
      pnl,
      pnlPercent,
      leverage,
      trader: traders[Math.floor(Math.random() * traders.length)],
      openTime: `${Math.floor(Math.random() * 59) + 1}м назад`
    });
  }
  
  return positions.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)); // Сортировка по размеру PnL
};

const CryptoIcon = memo(({ symbol, size = 44 }: { symbol: string; size?: number }) => {
  const getSpecialIcon = (symbol: string) => {
    const iconStyle = { width: size, height: size };
    const imgStyle = { objectFit: 'cover' as const, width: '100%', height: '100%' };
    
    const renderImg = (src: string, bg = '') => (
        <div style={iconStyle} className={`rounded-full overflow-hidden shadow-sm border border-white/10 ${bg}`}>
          <img src={src} alt={symbol} style={imgStyle} />
        </div>
    );

    const renderEmoji = (emoji: string, bg: string) => (
         <div style={iconStyle} className="rounded-full overflow-hidden shadow-sm border border-white/10">
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: bg }}>{emoji}</div>
        </div>
    );

    switch (symbol) {
      // Акции - Технологии
      case 'AAPL': return renderImg("https://st3.depositphotos.com/1022135/31848/i/450/depositphotos_318488854-stock-photo-florence-italy-september-2016-detail.jpg");
      case 'GOOGL': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-Y51z1Nk0VXrtoweuuYehozvN5gdmDvYM9A&s");
      case 'MSFT': return renderImg("https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/960px-Microsoft_logo.svg.png", "bg-white");
      case 'TSLA': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc6hDexxgSNU_XuskWtMXiVe1KDrTjxROMWg&s");
      case 'NVDA': return renderImg("https://images.seeklogo.com/logo-png/10/1/nvidia-logo-png_seeklogo-101614.png", "bg-black");
      case 'META': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwq7Qd4o7WG8xyZaYx9yAUzNVBvmxmV5GvFQ&s");
      case 'AMZN': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8bEujb5PyWzjJBw3BTUirmriTqMyzDKXdQg&s", "bg-white");
      case 'NFLX': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9xbpsb7xSILvDmi3SU7wzm3IesRmC8QinrA&s");
      
      // Акции - Финансы
      case 'JPM': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUj8K_tVL2aZPXwdv0gfHx_W5Wl5gz0tG6lA&s");
      case 'BAC': return renderImg("https://img.icons8.com/color/1200/bank-of-america.jpg");
      case 'V': return renderImg("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPFzRy8ax3h59E9kUpcthkjmK8ejKzFvXMvw&s");
      case 'MA': return renderImg("https://fondy.ua/uploads/2021/11/knowledge_mastercard_main-1.jpg");
      
      // Акции - Другие
      case 'KO': return renderImg("https://effat.org/wp-content/uploads/2013/12/coca-cola-logo.jpg");
      case 'DIS': return renderImg("https://logomaster.com.ua/brand/walt.jpg");
      case 'NKE': return renderImg("https://images.prom.ua/2536264820_w600_h600_swoosh-istoriya.jpg", "bg-white");
      
      // Сырье
      case 'GOLD': return renderImg("https://cdn3d.iconscout.com/3d/premium/thumb/gold-3d-icon-png-download-10823618.png");
      case 'OIL': return renderImg("https://img.freepik.com/premium-vector/black-oil-barrel-with-yellow-circle-black-oil-drop-symbol-oil-drum-container-3d-vector-icon_365941-1448.jpg?semt=ais_hybrid&w=740&q=80");
      case 'SILVER': return renderImg("https://foni.papik.pro/uploads/posts/2024-10/foni-papik-pro-snmi-p-kartinki-serebro-na-prozrachnom-fone-2.png");
      
      default: return null;
    }
  };

  const specialIcon = getSpecialIcon(symbol);
  if (specialIcon) {
    return <div className="flex items-center justify-center">{specialIcon}</div>;
  }

  return (
    <div className="flex items-center justify-center rounded-full overflow-hidden shadow-sm bg-[#1A1A1A]" style={{ width: size, height: size }}>
      {getCryptoIcon(symbol, size)}
    </div>
  );
});

// --- Main Component ---
const TradingPage: React.FC<TradingPageProps> = ({ activeDeals, onCreateDeal, balance, userLuck, onNavigationChange, currency = DEFAULT_CURRENCY, isDemoMode = false, initialPair, onInitialPairConsumed }) => {
  const [viewMode, setViewMode] = useState<'instruments' | 'deals' | 'positions'>('instruments');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [activeFilter, setActiveFilter] = useState('Все');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<CryptoPair | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSide, setOrderSide] = useState<'Long' | 'Short'>('Long');
  const [timeIndex, setTimeIndex] = useState(1); // Устанавливаем 30с по умолчанию
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(10); // Кредитное плечо x1-x20
  const [stopLoss, setStopLoss] = useState(''); // Stop Loss в %
  const [takeProfit, setTakeProfit] = useState(''); // Take Profit в %
  const [selectedDeal, setSelectedDeal] = useState<ActiveDeal | null>(null); // Выбранная сделка для просмотра
  const [isCategoryPanelVisible, setIsCategoryPanelVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const scrollPendingRef = useRef(false);
  const [chartType, setChartType] = useState<'1' | '2'>('1');
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, { price: string; change: string; isPositive: boolean }>>({});
  const [chartModalHeight, setChartModalHeight] = useState<'medium' | 'large'>('medium'); // medium = 70%, large = 80%
  const [orderFormHeight, setOrderFormHeight] = useState<'small' | 'full'>('full'); // окно настроек торговли сразу в большом режиме
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isOrderFormAnimating, setIsOrderFormAnimating] = useState(false);

  useEffect(() => {
    // Оптимизировано: обновление каждые 500ms вместо 100ms для лучшей производительности
    const timer = setInterval(() => setCurrentTime(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  // Открытие пары по коду из URL (?tab=trading&pair=TON или &code=BTC)
  useEffect(() => {
    if (!initialPair) return;
    const symbol = initialPair.trim().toUpperCase();
    const pair = PAIRS.find(p => p.symbol === symbol);
    if (pair) {
      setSelectedPair(pair);
      onNavigationChange?.(true);
    }
    onInitialPairConsumed?.();
  }, [initialPair]);

  // Гарантируем, что форма заказа скрыта при выборе новой пары
  useEffect(() => {
    if (selectedPair) {
      setShowOrderForm(false);
    }
  }, [selectedPair]);

  // Обновляем URL при выборе пары — можно заходить по ссылке /?tab=trading&pair=TON
  useEffect(() => {
    if (selectedPair && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'trading');
      params.set('pair', selectedPair.symbol);
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', url);
    }
  }, [selectedPair?.symbol]);

  useEffect(() => {
    if (activeDeals.length === 0) return;
    
    // Оптимизировано: обновление цен только для активных сделок
    const priceUpdateTimer = setInterval(() => {
      activeDeals.forEach(deal => {
        if (!deal.processed) {
          const currentPrice = getSimulatedPrice(deal);
          setPreviousPrices(prev => ({ ...prev, [deal.id]: currentPrice }));
        }
      });
    }, 3000);
    return () => clearInterval(priceUpdateTimer);
  }, [activeDeals, currentTime, userLuck]);

  useEffect(() => {
    const updateDisplayPrices = () => {
      const newPrices: Record<string, { price: string; change: string; isPositive: boolean }> = {};
      PAIRS.forEach(pair => {
        const basePrice = parseFloat(pair.price.replace(/,/g, ''));
        const baseChange = parseFloat(pair.change.replace(/[+%]/g, ''));
        const randomChange = (Math.random() - 0.5) * 1;
        const newChangePercent = baseChange + randomChange;
        const newPrice = basePrice * (1 + newChangePercent / 100);
        let formattedPrice: string;
        if (newPrice >= 1000) formattedPrice = newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        else if (newPrice >= 1) formattedPrice = newPrice.toFixed(2);
        else formattedPrice = newPrice.toFixed(4);
        const formattedChange = `${newChangePercent >= 0 ? '+' : ''}${newChangePercent.toFixed(2)}%`;
        newPrices[pair.id] = { price: formattedPrice, change: formattedChange, isPositive: newChangePercent >= 0 };
      });
      setDynamicPrices(newPrices);
    };
    const updatePrices = () => {
      updateDisplayPrices();
      setTimeout(updatePrices, 5000 + Math.random() * 3000);
    };
    updateDisplayPrices();
    const timeoutId = setTimeout(updatePrices, 5000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => { if (errorMsg) setErrorMsg(null); }, [amount]);

  // Автоматическое закрытие модального окна сделки при окончании таймера
  useEffect(() => {
    if (!selectedDeal) return;
    
    const elapsed = Math.floor((currentTime - selectedDeal.startTime) / 1000);
    const remaining = selectedDeal.durationSeconds - elapsed;
    
    // Закрываем модальное окно когда таймер достигает 0
    if (remaining <= 0) {
      setSelectedDeal(null);
    }
  }, [selectedDeal, currentTime]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const last = lastScrollYRef.current;
    lastScrollYRef.current = currentScrollY;
    if (scrollPendingRef.current) return;
    scrollPendingRef.current = true;
    const rafId = requestAnimationFrame(() => {
      scrollPendingRef.current = false;
      scrollRafRef.current = null;
      if (currentScrollY > last && currentScrollY > 50) setIsCategoryPanelVisible(false);
      else if (currentScrollY < last) setIsCategoryPanelVisible(true);
    });
    scrollRafRef.current = rafId;
  }, []);

  useEffect(() => () => { if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current); }, []);

  const filteredPairs = useMemo(() => {
    return PAIRS.filter(pair => {
      if (activeCategory === 'Криптовалюта' && pair.category !== 'crypto') return false;
      if (activeCategory === 'Акции' && pair.category !== 'stocks') return false;
      if (activeCategory === 'Сырье' && pair.category !== 'commodities') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return pair.symbol.toLowerCase().includes(q) || pair.name.toLowerCase().includes(q);
      }
      if (activeFilter === 'Избранное') return pair.isFavorite;
      if (activeFilter === 'Рост') return pair.isPositive;
      if (activeFilter === 'Падение') return !pair.isPositive;
      if (activeFilter === 'Топ-10') return parseInt(pair.id) <= 10;
      if (activeFilter === 'DeFi') return ['ETH', 'UNI', 'LINK', 'MATIC', 'AVAX'].includes(pair.symbol);
      if (activeFilter === 'Мемы') return ['DOGE', 'SHIB'].includes(pair.symbol);
      if (activeFilter === 'Новые') return parseInt(pair.id) > 10;
      return true;
    });
  }, [activeCategory, activeFilter, searchQuery]);

  // Фейковые позиции для вкладки "Позиции"
  const fakePositions = useMemo(() => generateFakePositions(), []);

  const handleSelectPair = useCallback((pair: CryptoPair) => {
    setSelectedPair(pair);
    setShowOrderForm(false);
    setTimeIndex(1); // 30с по умолчанию
    setAmount('100');
    setErrorMsg(null);
    onNavigationChange?.(true);
  }, [onNavigationChange]);

  const handleShowOrderForm = useCallback((side: 'Long' | 'Short') => {
    setOrderSide(side);
    setOrderFormHeight('full');
    setIsOrderFormAnimating(true);
    setShowOrderForm(true);
    // Сбрасываем флаг анимации после завершения
    setTimeout(() => setIsOrderFormAnimating(false), 300);
  }, []);

  // Обработка свайпов для модального окна заказа
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY === null) return;
    setTouchCurrentY(e.touches[0].clientY);
  }, [touchStartY]);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY === null || touchCurrentY === null) {
      setTouchStartY(null);
      setTouchCurrentY(null);
      return;
    }

    const diff = touchStartY - touchCurrentY;
    const threshold = 50; // Минимальное расстояние для свайпа

    if (diff > threshold) {
      // Свайп вверх - открываем на весь экран
      setOrderFormHeight('full');
    } else if (diff < -threshold) {
      // Свайп вниз - закрываем или уменьшаем
      if (orderFormHeight === 'full') {
        setOrderFormHeight('small');
      }
    }

    setTouchStartY(null);
    setTouchCurrentY(null);
  }, [touchStartY, touchCurrentY, orderFormHeight]);

  const handleOpenDeal = () => {
    if (!selectedPair) return;
    const betAmount = Number(amount);
    if (betAmount <= 0) { setErrorMsg("Введите сумму"); return; }
    if (betAmount > balance) { setErrorMsg("Недостаточно средств"); return; }
    const cleanPrice = parseFloat(selectedPair.price.replace(/,/g, ''));
    const pairSuffix = selectedPair.category === 'crypto' ? '/USDT' : selectedPair.category === 'stocks' ? '' : selectedPair.category === 'commodities' ? '/USD' : '/USDT';
    
    const newDeal: ActiveDeal = {
      id: Date.now().toString(),
      pair: `${selectedPair.symbol}${pairSuffix}`,
      symbol: selectedPair.symbol,
      type: orderSide,
      amount: betAmount,
      entryPrice: cleanPrice,
      startTime: Date.now(),
      durationSeconds: TIME_OPTIONS[timeIndex].value,
      leverage: leverage
    };
    onCreateDeal(newDeal);
    setSelectedPair(null);
    setShowOrderForm(false);
    setViewMode('deals');
    onNavigationChange?.(false);
    setChartModalHeight('medium');
    setOrderFormHeight('small');
    // Сбрасываем настройки
    setLeverage(10);
    setStopLoss('');
    setTakeProfit('');
  };

  const formatTime = (s: number) => s <= 0 ? '0:00' : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const getSimulatedPrice = (deal: ActiveDeal) => {
    const elapsed = (currentTime - deal.startTime) / 1000;
    const totalDuration = deal.durationSeconds;
    const progress = Math.min(elapsed / totalDuration, 1);
    const seed = parseInt(deal.id.slice(-5)) || 1;
    
    // Целевое изменение цены к концу сделки (1-3%)
    const minChange = 0.01; // 1%
    const maxChange = 0.03; // 3%
    const randomFactor = (seed % 100) / 100;
    const targetChangePercent = minChange + (maxChange - minChange) * randomFactor;
    
    let finalDirection = 0;
    
    if (userLuck === 'win') {
      finalDirection = deal.type === 'Long' ? 1 : -1;
    } else if (userLuck === 'lose') {
      finalDirection = deal.type === 'Long' ? -1 : 1;
    } else {
      // Рандомное направление (50/50)
      finalDirection = seed % 2 === 0 ? 1 : -1;
    }
    
    // Плавное движение к целевому значению
    const smoothProgress = Math.sin(progress * Math.PI / 2);
    const mainMovement = finalDirection * targetChangePercent * smoothProgress;
    
    // Небольшие случайные колебания
    const microNoise = Math.sin(elapsed * 2 + seed) * 0.001 + 
                       Math.cos(elapsed * 1.5 + seed * 2) * 0.0008;
    
    const totalChange = mainMovement + microNoise;
    const clampedChange = Math.max(-0.03, Math.min(0.03, totalChange));
    
    return deal.entryPrice * (1 + clampedChange);
  };

  // === RENDER CHART MODAL ===
  const renderChartModal = () => {
    if (!selectedPair) return null;
    
    let tvSymbol = '';
    
    if (selectedPair.category === 'crypto') {
      tvSymbol = selectedPair.symbol === 'TON' ? 'BYBIT:TONUSDT' : `BINANCE:${selectedPair.symbol}USDT`;
    } else if (selectedPair.category === 'stocks') {
      const nyseStocks = ['JPM', 'BAC', 'V', 'MA', 'KO', 'DIS', 'NKE'];
      const exchange = nyseStocks.includes(selectedPair.symbol) ? 'NYSE' : 'NASDAQ';
      tvSymbol = `${exchange}:${selectedPair.symbol}`;
    } else if (selectedPair.category === 'commodities') {
      if (selectedPair.symbol === 'GOLD') tvSymbol = 'COMEX:GC1!';
      else if (selectedPair.symbol === 'OIL') tvSymbol = 'NYMEX:CL1!';
      else tvSymbol = 'COMEX:SI1!';
    } else {
      tvSymbol = 'BINANCE:BTCUSDT';
    }
    
    const chartUrl = `https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=5&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=0&saveimage=0&theme=dark&style=${chartType}&timezone=Etc%2FUTC&withdateranges=0&hide_legend=1&hide_volume=1&backgroundColor=rgba(0,0,0,0)&gridLineColor=rgba(40,40,40,0.3)`;
    const heightClass = chartModalHeight === 'large' ? 'h-[85dvh]' : 'h-[72dvh]';

    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
        <div 
          className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity"
          onClick={() => {
            setSelectedPair(null);
            setShowOrderForm(false);
            onNavigationChange?.(false);
          }}
        />
        <div className={`${heightClass} w-full max-w-[420px] bg-[#111113] rounded-t-2xl border-t border-white/8 relative z-10 pointer-events-auto flex flex-col animate-[slideUp_0.25s_ease-out] pb-[env(safe-area-inset-bottom)]`}>
          {/* Drag Handle & Header */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 cursor-ns-resize" />
            
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedPair(null);
                    setShowOrderForm(false);
                    onNavigationChange?.(false);
                  }}
                  className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#252527]"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <CryptoIcon symbol={selectedPair.symbol} size={32} />
                  <div>
                    <div className="font-bold text-sm">{selectedPair.name}</div>
                    <div className="text-xs text-gray-500">{selectedPair.symbol}</div>
                  </div>
                </div>
              </div>
              
              {/* Size Toggle */}
              <button
                onClick={() => setChartModalHeight(chartModalHeight === 'large' ? 'medium' : 'large')}
                className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#252527]"
              >
                {chartModalHeight === 'large' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Chart Area */}
          <div className={`flex-1 relative min-h-0 ${showOrderForm ? 'opacity-30' : 'opacity-100'} transition-opacity duration-300`}>
            <iframe 
              src={chartUrl} 
              className="w-full h-full border-none" 
              style={{ background: 'transparent' }} 
              title="Chart" 
            />
          </div>

          {/* Action Buttons */}
          {!showOrderForm && (
            <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#111113] via-[#111113]/95 to-transparent border-t border-white/5">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleShowOrderForm('Long')} 
                  className="flex-1 h-12 bg-[#00C896] text-black text-base font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <TrendingUp size={20} strokeWidth={2.5} /> Long
                </button>
                <button 
                  onClick={() => handleShowOrderForm('Short')} 
                  className="flex-1 h-12 bg-[#FF3B30] text-white text-base font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <TrendingDown size={20} strokeWidth={3} /> Short
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // === RENDER ORDER FORM MODAL ===
  const renderOrderFormModal = () => {
    if (!showOrderForm) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-[110] bg-black/55 transition-opacity" 
          onClick={() => {
            if (orderFormHeight === 'small') {
              setShowOrderForm(false);
            } else {
              setOrderFormHeight('small');
            }
          }} 
        />
        
        <div 
          className={`fixed bottom-0 left-1/2 z-[120] w-full max-w-[420px] bg-[#1c1c1e] flex flex-col rounded-t-2xl border-t border-white/8 transition-all duration-200 ease-out ${
            isOrderFormAnimating ? 'animate-[slideUpFromBottom_0.25s_ease-out]' : ''
          } ${orderFormHeight === 'full' ? 'h-[90dvh]' : 'h-[65dvh]'}`}
          style={{ 
            transform: isOrderFormAnimating 
              ? undefined 
              : touchCurrentY != null && touchStartY != null 
                ? `translate(-50%, ${Math.min(0, touchStartY - touchCurrentY)}px)` 
                : 'translate(-50%, 0)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            willChange: touchCurrentY != null && touchStartY != null ? 'transform' : 'auto'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2">
            <div 
              className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 cursor-ns-resize"
              onClick={() => setOrderFormHeight(orderFormHeight === 'full' ? 'small' : 'full')}
            />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowOrderForm(false)}
                className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
              >
                <X size={16} />
              </button>
              <div className={`text-lg font-bold flex items-center gap-2 ${orderSide === 'Long' ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                {orderSide === 'Long' ? 'Покупка' : 'Продажа'}
                {orderSide === 'Long' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
              </div>
              <button
                onClick={() => setOrderFormHeight(orderFormHeight === 'full' ? 'small' : 'full')}
                className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
              >
                {orderFormHeight === 'full' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Demo Mode Banner */}
            {isDemoMode && (
              <div className="bg-[#0098EA]/10 border border-[#0098EA]/15 rounded-xl p-3 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0098EA]" />
                <span className="text-sm text-[#0098EA] font-medium">Демо режим</span>
                <span className="text-xs text-[#0098EA]/70 ml-auto">Виртуальные средства</span>
              </div>
            )}

            {/* Balance Info */}
            <div className="flex justify-between items-center mb-4 p-3 bg-[#111113] rounded-xl border border-white/5">
              <div>
                <div className="text-xs text-gray-400 mb-1">
                  {isDemoMode ? 'Демо баланс' : 'Доступный баланс'}
                </div>
                <div className={`text-lg font-bold ${isDemoMode ? 'text-[#0098EA]' : 'text-white'}`}>
                  {formatCurrency(convertFromUSD(balance, currency), currency)}
                  {isDemoMode && <span className="text-xs ml-1 text-[#0098EA]/60">(DEMO)</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Плечо</div>
                <div className="text-gray-300 font-medium text-base flex items-center gap-1 justify-end"><Zap size={14}/> ×{leverage}</div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Сумма сделки</div>
              <div className="bg-[#111113] rounded-xl p-3 flex items-center border border-white/5">
                <button onClick={() => setAmount(p => Math.max(10, Number(p)-50).toString())} className="w-12 h-12 bg-[#1c1c1e] hover:bg-[#252527] rounded-lg flex items-center justify-center text-white transition-colors border border-white/5">
                  <Minus size={20} />
                </button>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      className="bg-transparent text-center text-3xl font-bold text-white outline-none w-32 p-0" 
                    />
                    <span className="text-2xl text-gray-500 font-bold">$</span>
                  </div>
                </div>
                <button onClick={() => setAmount(p => (Number(p)+50).toString())} className="w-12 h-12 bg-[#1c1c1e] hover:bg-[#252527] rounded-lg flex items-center justify-center text-white transition-colors border border-white/5">
                  <Plus size={20} />
                </button>
              </div>
              
              {/* Quick Amount Buttons (% of balance) */}
              <div className="flex gap-2 mt-2">
                {[10, 25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setAmount(Math.floor(balance * pct / 100).toString())}
                    className="flex-1 py-2 bg-[#1c1c1e] hover:bg-[#252527] rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-all border border-white/5"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Кредитное плечо</span>
                <span className="text-gray-400 font-medium">×{leverage}</span>
              </div>
              <div className="bg-[#111113] rounded-xl p-3 border border-white/5">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={leverage}
                  onChange={e => setLeverage(Number(e.target.value))}
                  className="w-full h-2 bg-[#252527] rounded-lg appearance-none cursor-pointer accent-white/30"
                  style={{
                    background: `linear-gradient(to right, #facc15 0%, #facc15 ${(leverage - 1) / 19 * 100}%, #252527 ${(leverage - 1) / 19 * 100}%, #252527 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                  <span>x1</span>
                  <span>x5</span>
                  <span>x10</span>
                  <span>x15</span>
                  <span>x20</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Прибыль: <span className="text-[#00C896]/90">+{(Number(amount) * leverage * 0.1).toFixed(0)}$</span> · Риск: <span className="text-[#FF3B30]/90">−{Number(amount).toFixed(0)}$</span>
              </p>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Stop Loss / Take Profit</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#111113] rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#FF3B30] rounded-full" />
                    <span className="text-[10px] text-gray-400 uppercase">Stop Loss</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      placeholder="—"
                      className="bg-transparent text-white font-bold text-lg outline-none w-full"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                  {stopLoss && (
                    <p className="text-[10px] text-[#FF3B30] mt-1">
                      -{(Number(amount) * Number(stopLoss) / 100).toFixed(2)}$
                    </p>
                  )}
                </div>
                <div className="bg-[#111113] rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#00C896] rounded-full" />
                    <span className="text-[10px] text-gray-400 uppercase">Take Profit</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={e => setTakeProfit(e.target.value)}
                      placeholder="—"
                      className="bg-transparent text-white font-bold text-lg outline-none w-full"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                  {takeProfit && (
                    <p className="text-[10px] text-[#00C896] mt-1">
                      +{(Number(amount) * Number(takeProfit) / 100).toFixed(2)}$
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Time Selector */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2">Время сделки</div>
              <div className="bg-[#111113] p-1 rounded-xl flex gap-1 border border-white/5">
                {TIME_OPTIONS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setTimeIndex(i)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      i === timeIndex 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t.short}
                  </button>
                ))}
              </div>
              <div className="text-center text-xs text-gray-500 mt-1.5">{TIME_OPTIONS[timeIndex].label}</div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-3 bg-red-500/10 border border-red-500/15 text-red-400 text-xs p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}

            {/* Main Action Button */}
            <button 
              onClick={handleOpenDeal} 
              className={`w-full h-14 rounded-xl text-base font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4 ${
                orderSide === 'Long' 
                ? 'bg-[#00C896] text-black' 
                : 'bg-[#FF3B30] text-white'
              }`}
            >
              Открыть сделку
            </button>
          </div>
        </div>
      </>
    );
  };

  // === RENDER LIST VIEW ===
  return (
    <>
      {renderChartModal()}
      {renderOrderFormModal()}
      <div className="h-full min-h-0 flex flex-col bg-black text-white overflow-hidden">
      {/* Top Navigation (Segmented Control) */}
      <div className="shrink-0 pt-4 px-4 pb-2 z-10 bg-black">
         <div className="bg-[#1c1c1e] p-1 rounded-2xl flex relative h-12 border border-white/5">
             {/* Sliding Background */}
             <div 
                className={`absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-[#2a2a2c] rounded-[14px] transition-all duration-300 ease-out ${
                    viewMode === 'instruments' ? 'left-1' : viewMode === 'deals' ? 'left-[calc(33.333%)]' : 'left-[calc(66.666%)]'
                }`} 
             />
             
             <button 
                onClick={() => { setViewMode('instruments'); setIsCategoryPanelVisible(true); }}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 ${viewMode === 'instruments' ? 'text-white' : 'text-gray-400'}`}
             >
                Активы
             </button>
             <button 
                onClick={() => { setViewMode('deals'); setIsCategoryPanelVisible(true); }}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-1.5 ${viewMode === 'deals' ? 'text-white' : 'text-gray-400'}`}
             >
                Сделки
                {activeDeals.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                )}
             </button>
             <button 
                onClick={() => { setViewMode('positions'); setIsCategoryPanelVisible(true); }}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-1.5 ${viewMode === 'positions' ? 'text-white' : 'text-gray-400'}`}
             >
                Позиции
                <span className="w-1.5 h-1.5 rounded-full bg-[#0098EA]" />
             </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
        {viewMode === 'instruments' && (
          <>
            {/* Search & Filters — компактно */}
            <div className={`shrink-0 px-4 bg-black z-20 space-y-2 transition-all duration-300 ease-out overflow-hidden ${
              isCategoryPanelVisible 
                ? 'py-2 max-h-24 opacity-100 translate-y-0' 
                : 'py-0 max-h-0 opacity-0 -translate-y-2'
            }`}>
               {/* Search Bar */}
               <div className="bg-[#1c1c1e] h-8 rounded-lg flex items-center pl-2.5 pr-2 gap-1.5 border border-white/5 transition-colors focus-within:border-white/10">
                   <Search size={14} className="text-gray-500 shrink-0" strokeWidth={2} />
                   <input 
                      type="text" 
                      placeholder="Поиск актива..." 
                      className="bg-transparent w-full text-white placeholder:text-gray-600 outline-none text-xs min-w-0"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
                   {searchQuery && <button onClick={() => setSearchQuery('')} className="shrink-0 p-0.5"><X size={14} className="text-gray-500" strokeWidth={2} /></button>}
               </div>

               {/* Horizontal Filters */}
               <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {['Все', 'Криптовалюта', 'Акции', 'Сырье'].map(cat => (
                      <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                              activeCategory === cat 
                              ? 'bg-white/12 text-white' 
                              : 'text-gray-500 hover:text-gray-400'
                          }`}
                      >
                          {cat}
                      </button>
                  ))}
               </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24" onScroll={handleScroll} style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredPairs.map(pair => {
                 const displayPrice = dynamicPrices[pair.id]?.price || pair.price;
                 const displayChange = dynamicPrices[pair.id]?.change || pair.change;
                 const isPos = dynamicPrices[pair.id]?.isPositive ?? pair.isPositive;
                 
                 // Конвертируем цену в выбранную валюту
                 const priceNum = parseFloat(displayPrice.replace(/,/g, ''));
                 const convertedPrice = convertFromUSD(priceNum, currency);
                 const currencySymbol = getCurrencySymbol(currency);
                 const formattedPrice = currency === 'USD' 
                   ? `$${displayPrice}` 
                   : `${currencySymbol}${convertedPrice.toLocaleString('ru-RU', { maximumFractionDigits: convertedPrice >= 1000 ? 0 : 2 })}`;

                 return (
                    <div 
                        key={pair.id} 
                        onClick={() => handleSelectPair(pair)}
                        className="group flex items-center justify-between py-2.5 border-b border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
                        style={{ contentVisibility: 'auto' }}
                    >
                       <div className="flex items-center gap-3.5">
                           <CryptoIcon symbol={pair.symbol} size={48} />
                           <div>
                               <div className="font-bold text-base flex items-center gap-1.5">
                                   {pair.symbol}
                                   {pair.isFavorite && <Star size={12} fill="#F5C446" stroke="none"/>}
                               </div>
                               <div className="text-xs text-gray-500 font-medium">{pair.name}</div>
                           </div>
                       </div>
                       <div className="flex items-center gap-3">
                           <div className="text-right">
                               <div className="font-mono font-medium text-base mb-0.5 tracking-tight">{formattedPrice}</div>
                               <div className={`text-xs font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${isPos ? 'bg-[#00C896]/8 text-[#00C896]/95' : 'bg-[#FF3B30]/8 text-[#FF3B30]/95'}`}>
                                   {isPos ? '+' : ''}{displayChange}
                               </div>
                               </div>
                       </div>
                    </div>
                 )
              })}
              <div className="h-20" /> {/* Bottom spacer */}
            </div>
          </>
        )}

        {/* Deals List */}
        {viewMode === 'deals' && (
           <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
              {activeDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <div className="w-16 h-16 rounded-2xl bg-[#1c1c1e] flex items-center justify-center mb-4 border border-white/5">
                        <History size={28} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium">Нет активных сделок</span>
                      <span className="text-xs text-gray-600 mt-1">Откройте первую сделку</span>
                  </div>
              ) : (
                  activeDeals.map(deal => {
                      const elapsed = Math.floor((currentTime - deal.startTime) / 1000);
                      const remaining = Math.max(0, deal.durationSeconds - elapsed);
                      const progress = (remaining / deal.durationSeconds) * 100;
                      const currentPrice = getSimulatedPrice(deal);
                      const pnlRatio = deal.type === 'Long' ? (currentPrice - deal.entryPrice) / deal.entryPrice : (deal.entryPrice - currentPrice) / deal.entryPrice;
                      const rawPnl = pnlRatio * deal.leverage * deal.amount;
                      const pnlPercent = pnlRatio * deal.leverage * 100;
                      const isWinning = rawPnl > 0;
                      
                      return (
                          <div 
                            key={deal.id} 
                            onClick={() => setSelectedDeal(deal)}
                            className={`rounded-2xl p-4 mb-3 bg-[#111113] border border-white/6 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                              isWinning ? 'border-l-[#00C896]/30' : 'border-l-[#FF3B30]/30'
                            }`}
                          >
                              {/* Progress Ring */}
                              <div className="absolute top-3 right-3">
                                <svg className="w-10 h-10 -rotate-90">
                                  <circle cx="20" cy="20" r="16" fill="none" stroke="#252527" strokeWidth="3" />
                                  <circle 
                                    cx="20" cy="20" r="16" fill="none" 
                                    stroke={isWinning ? '#00C896' : '#FF3B30'} 
                                    strokeWidth="3"
                                    strokeDasharray={`${progress} 100`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                  {formatTime(remaining)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 mb-3">
                                  <CryptoIcon symbol={deal.symbol} size={44} />
                                  <div>
                                      <div className="font-bold text-base flex items-center gap-2">
                                          {deal.symbol}
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deal.type === 'Long' ? 'bg-[#00C896] text-black' : 'bg-[#FF3B30] text-white'}`}>
                                              {deal.type}
                                          </span>
                                      </div>
                                      <div className="text-xs text-gray-500">${deal.amount} • x{deal.leverage}</div>
                                  </div>
                              </div>
                              
                              {/* PnL Display */}
                              <div className={`text-2xl font-bold mb-1 ${isWinning ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                                  {rawPnl > 0 ? '+' : ''}{rawPnl.toFixed(2)}$
                              </div>
                              <div className={`text-xs ${isWinning ? 'text-[#00C896]/70' : 'text-[#FF3B30]/70'}`}>
                                  {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                              </div>
                              
                              {/* Mini Price Info */}
                              <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-[11px] text-gray-500">
                                <div>Вход: <span className="text-white">${deal.entryPrice.toFixed(2)}</span></div>
                                <div>Сейчас: <span className={isWinning ? 'text-[#00C896]' : 'text-[#FF3B30]'}>${currentPrice.toFixed(2)}</span></div>
                              </div>
                          </div>
                      )
                  })
              )}
           </div>
        )}

        {/* Positions - Minimalist Design */}
        {viewMode === 'positions' && (
           <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Compact Stats */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#00C896] rounded-full" />
                    <span className="text-xs text-gray-400">Long <span className="text-[#00C896] font-semibold">62%</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#FF3B30] rounded-full" />
                    <span className="text-xs text-gray-400">Short <span className="text-[#FF3B30] font-semibold">38%</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-[10px] text-gray-500">LIVE</span>
                </div>
              </div>

              {/* Positions List - Compact */}
              {fakePositions.map(pos => (
                <div key={pos.id} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={pos.symbol} size={32} />
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {pos.symbol}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${pos.type === 'Long' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>
                          x{pos.leverage}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">{pos.trader}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${pos.pnl >= 0 ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                      {pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(0)}$
                    </div>
                    <div className="text-[10px] text-gray-500">${pos.amount}</div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDeal(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[110] bg-[#111113] rounded-t-3xl border-t border-white/10 h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedDeal(null)} className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <CryptoIcon symbol={selectedDeal.symbol} size={28} />
                  <span className="font-bold">{selectedDeal.symbol}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedDeal.type === 'Long' ? 'bg-[#00C896] text-black' : 'bg-[#FF3B30] text-white'}`}>
                    {selectedDeal.type}
                  </span>
                </div>
                <div className="w-8" />
              </div>
            </div>

            {/* Live Chart Area */}
            <div className="flex-1 relative px-4 py-2">
              {(() => {
                const elapsed = Math.floor((currentTime - selectedDeal.startTime) / 1000);
                const remaining = Math.max(0, selectedDeal.durationSeconds - elapsed);
                const progress = elapsed / selectedDeal.durationSeconds;
                const currentPrice = getSimulatedPrice(selectedDeal);
                const pnlRatio = selectedDeal.type === 'Long' 
                  ? (currentPrice - selectedDeal.entryPrice) / selectedDeal.entryPrice 
                  : (selectedDeal.entryPrice - currentPrice) / selectedDeal.entryPrice;
                const rawPnl = pnlRatio * selectedDeal.leverage * selectedDeal.amount;
                const isWinning = rawPnl > 0;

                // Generate chart points
                const points: {x: number, y: number}[] = [];
                const numPoints = 50;
                for (let i = 0; i <= numPoints * progress; i++) {
                  const t = i / numPoints;
                  const seed = parseInt(selectedDeal.id.slice(-5)) || 1;
                  const noise = Math.sin(t * 20 + seed) * 0.02 + Math.cos(t * 15 + seed * 2) * 0.015;
                  const trend = (userLuck === 'win' ? 1 : userLuck === 'lose' ? -1 : (seed % 2 === 0 ? 1 : -1)) * (selectedDeal.type === 'Long' ? 1 : -1);
                  const y = 0.5 - (noise + trend * t * 0.1) * 2;
                  points.push({ x: t * 100, y: Math.max(0.1, Math.min(0.9, y)) * 100 });
                }

                const pathD = points.length > 1 
                  ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                  : '';

                return (
                  <>
                    {/* PnL Display */}
                    <div className="text-center mb-4">
                      <div className={`text-4xl font-bold ${isWinning ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                        {rawPnl > 0 ? '+' : ''}{rawPnl.toFixed(2)}$
                      </div>
                      <div className={`text-sm ${isWinning ? 'text-[#00C896]/70' : 'text-[#FF3B30]/70'}`}>
                        {(pnlRatio * selectedDeal.leverage * 100) > 0 ? '+' : ''}{(pnlRatio * selectedDeal.leverage * 100).toFixed(2)}%
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-[#0a0a0a] rounded-2xl p-4 h-48 relative overflow-hidden border border-white/5">
                      {/* Entry Price Line */}
                      <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-600/50" />
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 bg-[#0a0a0a] px-1">
                        ${selectedDeal.entryPrice.toFixed(2)}
                      </div>

                      {/* SVG Chart */}
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Gradient */}
                        <defs>
                          <linearGradient id={`gradient-${selectedDeal.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isWinning ? '#00C896' : '#FF3B30'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={isWinning ? '#00C896' : '#FF3B30'} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Area */}
                        {points.length > 1 && (
                          <path 
                            d={`${pathD} L ${points[points.length-1].x} 100 L ${points[0].x} 100 Z`}
                            fill={`url(#gradient-${selectedDeal.id})`}
                          />
                        )}
                        
                        {/* Line */}
                        <path 
                          d={pathD}
                          fill="none"
                          stroke={isWinning ? '#00C896' : '#FF3B30'}
                          strokeWidth="0.8"
                          strokeLinecap="round"
                        />
                        
                        {/* Current Point */}
                        {points.length > 0 && (
                          <circle 
                            cx={points[points.length-1]?.x || 0} 
                            cy={points[points.length-1]?.y || 50}
                            r="2"
                            fill={isWinning ? '#00C896' : '#FF3B30'}
                          />
                        )}
                      </svg>

                      {/* Current Price */}
                      <div className={`absolute right-2 text-xs font-bold px-2 py-1 rounded ${isWinning ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}
                        style={{ top: `${(points[points.length-1]?.y || 50)}%`, transform: 'translateY(-50%)' }}>
                        ${currentPrice.toFixed(2)}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="text-center mt-4">
                      <div className="text-3xl font-mono font-bold text-white">{formatTime(remaining)}</div>
                      <div className="text-xs text-gray-500 mt-1">до закрытия</div>
                    </div>

                    {/* Deal Info */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-[#1c1c1e] rounded-xl p-3 text-center">
                        <div className="text-[10px] text-gray-500 mb-1">Сумма</div>
                        <div className="font-bold">${selectedDeal.amount}</div>
                      </div>
                      <div className="bg-[#1c1c1e] rounded-xl p-3 text-center">
                        <div className="text-[10px] text-gray-500 mb-1">Плечо</div>
                        <div className="font-bold text-yellow-400">x{selectedDeal.leverage}</div>
                      </div>
                      <div className="bg-[#1c1c1e] rounded-xl p-3 text-center">
                        <div className="text-[10px] text-gray-500 mb-1">Время</div>
                        <div className="font-bold">{TIME_OPTIONS.find(t => t.value === selectedDeal.durationSeconds)?.label}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default TradingPage;