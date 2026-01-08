import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, ChevronLeft, Minus, Plus, Clock, Zap, AlertTriangle, Star, BarChart3, ArrowLeft, Wallet, History } from 'lucide-react';
import { getCryptoIcon } from '../icons';
import type { ActiveDeal, CryptoPair } from '../types';

interface TradingPageProps {
    activeDeals: ActiveDeal[];
    onCreateDeal: (deal: ActiveDeal) => void;
    balance: number;
    userLuck: 'win' | 'lose' | 'default';
    onNavigationChange?: (hide: boolean) => void;
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
  
  // НФТ коллекции - Топовые
  { id: '201', symbol: 'BAYC', name: 'Bored Ape Yacht Club', price: '12.45', change: '+5.20%', isPositive: true, isFavorite: true, color: '#8B4513', category: 'nft' },
  { id: '202', symbol: 'PUNK', name: 'CryptoPunks', price: '45.67', change: '+3.80%', isPositive: true, isFavorite: false, color: '#FF6B35', category: 'nft' },
  { id: '203', symbol: 'AZUKI', name: 'Azuki', price: '8.92', change: '-2.10%', isPositive: false, isFavorite: false, color: '#FF69B4', category: 'nft' },
  { id: '204', symbol: 'MAYC', name: 'Mutant Ape Yacht Club', price: '6.78', change: '+4.15%', isPositive: true, isFavorite: true, color: '#9B59B6', category: 'nft' },
  { id: '205', symbol: 'DOODLE', name: 'Doodles', price: '3.45', change: '+2.85%', isPositive: true, isFavorite: false, color: '#F39C12', category: 'nft' },
  { id: '206', symbol: 'CLONE', name: 'CloneX', price: '4.23', change: '-1.25%', isPositive: false, isFavorite: false, color: '#E74C3C', category: 'nft' },
  
  // НФТ коллекции - Игровые
  { id: '207', symbol: 'AXIE', name: 'Axie Infinity', price: '2.89', change: '+6.45%', isPositive: true, isFavorite: false, color: '#1ABC9C', category: 'nft' },
  { id: '208', symbol: 'SAND', name: 'The Sandbox', price: '1.67', change: '+3.92%', isPositive: true, isFavorite: true, color: '#3498DB', category: 'nft' },
  { id: '209', symbol: 'MANA', name: 'Decentraland', price: '2.34', change: '-0.85%', isPositive: false, isFavorite: false, color: '#FF7675', category: 'nft' },
  
  // НФТ коллекции - Арт
  { id: '210', symbol: 'ART', name: 'Art Blocks Curated', price: '7.56', change: '+1.75%', isPositive: true, isFavorite: false, color: '#6C5CE7', category: 'nft' },
  { id: '211', symbol: 'FIDENZA', name: 'Fidenza', price: '15.23', change: '+8.12%', isPositive: true, isFavorite: true, color: '#A29BFE', category: 'nft' },
  { id: '212', symbol: 'CHROMIE', name: 'Chromie Squiggle', price: '9.87', change: '+2.45%', isPositive: true, isFavorite: false, color: '#FD79A8', category: 'nft' },
  
  // Сырье
  { id: '301', symbol: 'GOLD', name: 'Золото', price: '2018.45', change: '+0.65%', isPositive: true, isFavorite: true, color: '#FFD700', category: 'commodities' },
  { id: '302', symbol: 'OIL', name: 'Нефть WTI', price: '78.92', change: '-1.25%', isPositive: false, isFavorite: false, color: '#000000', category: 'commodities' },
  { id: '303', symbol: 'SILVER', name: 'Серебро', price: '24.18', change: '+1.10%', isPositive: true, isFavorite: false, color: '#C0C0C0', category: 'commodities' },
];

const TIME_OPTIONS = [
  { label: '10с', value: 10 },
  { label: '30с', value: 30 },
  { label: '1м', value: 60 },
  { label: '2м', value: 120 },
  { label: '5м', value: 300 },
];

const CryptoIcon = ({ symbol, size = 44 }: { symbol: string; size?: number }) => {
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
      
      // НФТ
      case 'BAYC': return renderEmoji("🐵", "#8B4513");
      case 'PUNK': return renderEmoji("👾", "#FF6B35");
      case 'AZUKI': return renderEmoji("🌸", "#FF69B4");
      case 'MAYC': return renderEmoji("🧬", "#9B59B6");
      case 'DOODLE': return renderEmoji("🎨", "#F39C12");
      case 'CLONE': return renderEmoji("👤", "#E74C3C");
      case 'AXIE': return renderEmoji("🎮", "#1ABC9C");
      case 'SAND': return renderEmoji("🏖️", "#3498DB");
      case 'MANA': return renderEmoji("🌐", "#FF7675");
      case 'ART': return renderEmoji("🖼️", "#6C5CE7");
      case 'FIDENZA': return renderEmoji("🎭", "#A29BFE");
      case 'CHROMIE': return renderEmoji("🌈", "#FD79A8");
      
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
};

// --- Main Component ---
const TradingPage: React.FC<TradingPageProps> = ({ activeDeals, onCreateDeal, balance, userLuck, onNavigationChange }) => {
  const [viewMode, setViewMode] = useState<'instruments' | 'deals'>('instruments');
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
  const [timeIndex, setTimeIndex] = useState(2);
  const [amount, setAmount] = useState('100');
  const [isCategoryPanelVisible, setIsCategoryPanelVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [chartType, setChartType] = useState<'1' | '2'>('1');
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, { price: string; change: string; isPositive: boolean }>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const priceUpdateTimer = setInterval(() => {
      activeDeals.forEach(deal => {
        const currentPrice = getSimulatedPrice(deal);
        setPreviousPrices(prev => ({ ...prev, [deal.id]: currentPrice }));
      });
    }, 3000);
    return () => clearInterval(priceUpdateTimer);
  }, [activeDeals]);

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
      const nextUpdate = 2000 + Math.random() * 2000;
      setTimeout(updatePrices, nextUpdate);
    };
    updateDisplayPrices();
    updatePrices();
  }, []);

  useEffect(() => { if (errorMsg) setErrorMsg(null); }, [amount]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) setIsCategoryPanelVisible(false);
    else if (currentScrollY < lastScrollY) setIsCategoryPanelVisible(true);
    setLastScrollY(currentScrollY);
  };

  const filteredPairs = useMemo(() => {
    return PAIRS.filter(pair => {
      if (activeCategory === 'Криптовалюта' && pair.category !== 'crypto') return false;
      if (activeCategory === 'Акции' && pair.category !== 'stocks') return false;
      if (activeCategory === 'НФТ' && pair.category !== 'nft') return false;
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

  const handleSelectPair = (pair: CryptoPair) => {
    setSelectedPair(pair);
    setShowOrderForm(false);
    setTimeIndex(2);
    setAmount('100');
    setErrorMsg(null);
    onNavigationChange?.(true); // Скрываем навигацию
  };

  const handleShowOrderForm = (side: 'Long' | 'Short') => {
    setOrderSide(side);
    setShowOrderForm(true);
  };

  const handleOpenDeal = () => {
    if (!selectedPair) return;
    const betAmount = Number(amount);
    if (betAmount <= 0) { setErrorMsg("Введите сумму"); return; }
    if (betAmount > balance) { setErrorMsg("Недостаточно средств"); return; }
    const cleanPrice = parseFloat(selectedPair.price.replace(/,/g, ''));
    const pairSuffix = selectedPair.category === 'crypto' ? '/USDT' : selectedPair.category === 'stocks' ? '' : selectedPair.category === 'nft' ? '/ETH' : selectedPair.category === 'commodities' ? '/USD' : '/USDT';
    
    const newDeal: ActiveDeal = {
      id: Date.now().toString(),
      pair: `${selectedPair.symbol}${pairSuffix}`,
      symbol: selectedPair.symbol,
      type: orderSide,
      amount: betAmount,
      entryPrice: cleanPrice,
      startTime: Date.now(),
      durationSeconds: TIME_OPTIONS[timeIndex].value,
      leverage: 10
    };
    onCreateDeal(newDeal);
    setSelectedPair(null);
    setShowOrderForm(false);
    setViewMode('deals');
  };

  const formatTime = (s: number) => s <= 0 ? '0:00' : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const getSimulatedPrice = (deal: ActiveDeal) => {
    const elapsed = (currentTime - deal.startTime) / 1000;
    const totalDuration = deal.durationSeconds;
    const progress = Math.min(elapsed / totalDuration, 1);
    const seed = parseInt(deal.id.slice(-5)) || 1;
    const targetChangePercent = 0.05 + (0.07 * ((seed % 100) / 100));
    let finalDirection = 0;
    
    if (userLuck === 'win') finalDirection = deal.type === 'Long' ? 1 : -1;
    else if (userLuck === 'lose') finalDirection = deal.type === 'Long' ? -1 : 1;
    else {
      finalDirection = seed % 2 === 0 ? 1 : -1;
      if (deal.type === 'Short') finalDirection *= -1;
      if (seed % 3 === 0) finalDirection *= -1;
    }
    
    const tickInterval = 3.5;
    const currentTick = Math.floor(elapsed / tickInterval);
    const tickProgress = (elapsed % tickInterval) / tickInterval;
    const getTickMovement = (tickNum: number) => {
      const tickSeed = seed + tickNum * 137;
      const impulse = ((tickSeed % 600) - 300) / 10000;
      const trend = finalDirection * 0.015 * (1 + (tickSeed % 50) / 100);
      return impulse + trend;
    };
    let accumulatedChange = 0;
    for (let i = 0; i <= currentTick; i++) accumulatedChange += getTickMovement(i);
    if (currentTick < Math.floor(totalDuration / tickInterval)) {
      const nextTickMovement = getTickMovement(currentTick + 1);
      accumulatedChange += nextTickMovement * tickProgress * 0.3;
    }
    const microNoise = Math.sin(elapsed * 5 + seed) * 0.001 + Math.cos(elapsed * 3.7 + seed * 2) * 0.0008;
    const endGameFactor = Math.pow(progress, 1.5);
    const targetAdjustment = (targetChangePercent * finalDirection - accumulatedChange) * endGameFactor * 0.3;
    const totalChange = accumulatedChange + microNoise + targetAdjustment;
    const clampedChange = Math.max(-0.15, Math.min(0.15, totalChange));
    return deal.entryPrice * (1 + clampedChange);
  };

  // === RENDER CHART VIEW ===
  if (selectedPair) {
    let tvSymbol = '';
    let showNftImage = false;
    let nftImageUrl = '';
    
    if (selectedPair.category === 'crypto') {
      tvSymbol = selectedPair.symbol === 'TON' ? 'BYBIT:TONUSDT' : `BINANCE:${selectedPair.symbol}USDT`;
    } else if (selectedPair.category === 'stocks') {
      const nyseStocks = ['JPM', 'BAC', 'V', 'MA', 'KO', 'DIS', 'NKE'];
      const exchange = nyseStocks.includes(selectedPair.symbol) ? 'NYSE' : 'NASDAQ';
      tvSymbol = `${exchange}:${selectedPair.symbol}`;
    } else if (selectedPair.category === 'nft') {
      showNftImage = true;
       switch (selectedPair.symbol) {
        case 'BAYC': nftImageUrl = 'https://image.binance.vision/editor-uploads-original/9c15d9647b9643dfbc5e522299d13593.png'; break;
        case 'PUNK': nftImageUrl = 'https://rallyrd.com/wp-content/uploads/2022/03/Punk-02.jpg'; break;
        default: nftImageUrl = 'https://nftevening.com/wp-content/uploads/2021/08/Tyler-Hobbs.jpeg';
      }
    } else if (selectedPair.category === 'commodities') {
      if (selectedPair.symbol === 'GOLD') tvSymbol = 'COMEX:GC1!';
      else if (selectedPair.symbol === 'OIL') tvSymbol = 'NYMEX:CL1!';
      else tvSymbol = 'COMEX:SI1!';
    } else {
      tvSymbol = 'BINANCE:BTCUSDT';
    }
    
    const chartUrl = `https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=5&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=0&saveimage=0&theme=dark&style=${chartType}&timezone=Etc%2FUTC&withdateranges=0&hide_legend=1&hide_volume=1&backgroundColor=rgba(0,0,0,0)&gridLineColor=rgba(40,40,40,0.3)`;

    return (
      <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 bg-black">
          <button onClick={() => {
            setSelectedPair(null);
            onNavigationChange?.(false); // Показываем навигацию
          }} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex flex-col items-center">
             <span className="font-bold text-sm tracking-wide">{selectedPair.name}</span>
          </div>
          <div className="w-10" />
        </div>



        {/* Chart Area */}
        <div className={`flex-1 relative transition-all duration-500 ${showOrderForm ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          <div className="absolute inset-0 pb-24">
             {showNftImage ? (
                  <div className="w-full h-full flex items-center justify-center">
                     <img src={nftImageUrl} className="w-full h-full object-contain p-8 opacity-90" alt="" />
                  </div>
             ) : (
                <iframe src={chartUrl} className="w-full h-full border-none pointer-events-auto" style={{ background: 'transparent' }} title="Chart" />
             )}
          </div>
        </div>



        {/* Action Buttons (Always Visible at Bottom) */}
        {!showOrderForm && (
          <div className="absolute bottom-0 left-0 right-0 p-5 pt-0 bg-gradient-to-t from-black via-black to-transparent z-30 pb-safe">
            <div className="flex gap-4">
              <button onClick={() => handleShowOrderForm('Long')} className="flex-1 h-14 bg-[#00C896] text-black text-lg font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,200,150,0.3)]">
                <TrendingUp size={24} strokeWidth={3} /> Вверх
              </button>
              <button onClick={() => handleShowOrderForm('Short')} className="flex-1 h-14 bg-[#FF3B30] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)]">
                <TrendingDown size={24} strokeWidth={3} /> Вниз
              </button>
            </div>
          </div>
        )}

        {/* Order Form (Modern Bottom Sheet) */}
        {showOrderForm && (
            <>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowOrderForm(false)} />
                <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#141414] rounded-t-[32px] border-t border-white/10 pb-safe animate-in slide-in-from-bottom duration-300">
                    <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-6 opacity-50" />
                    
                    <div className="px-6">
                        {/* Header Info */}
                        <div className="flex justify-between items-center mb-6">
                             <div>
                                 <div className={`text-2xl font-bold flex items-center gap-2 ${orderSide === 'Long' ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                                     {orderSide === 'Long' ? 'Покупка' : 'Продажа'}
                                     {orderSide === 'Long' ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                                 </div>
                                 <div className="text-gray-500 text-sm font-medium mt-1">Баланс: <span className="text-white">${balance.toFixed(2)}</span></div>
                             </div>
                             <div className="text-right">
                                 <div className="text-sm text-gray-400">Плечо</div>
                                 <div className="text-yellow-400 font-bold text-lg flex items-center gap-1 justify-end"><Zap size={16} fill="currentColor"/> 10x</div>
                             </div>
                        </div>

                        {/* Amount Input */}
                        <div className="bg-[#1c1c1e] rounded-2xl p-2 flex items-center mb-4 border border-white/5">
                            <button onClick={() => setAmount(p => Math.max(10, Number(p)-50).toString())} className="w-12 h-12 bg-[#2c2c2e] hover:bg-[#3a3a3c] rounded-xl flex items-center justify-center text-white transition-colors">
                                <Minus size={20} />
                            </button>
                            <div className="flex-1 text-center">
                                <span className="text-gray-500 text-sm font-semibold block -mb-1">Сумма</span>
                                <div className="flex items-center justify-center gap-1">
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)} 
                                        className="bg-transparent text-center text-2xl font-bold text-white outline-none w-24 p-0" 
                                    />
                                    <span className="text-xl text-gray-500 font-bold">$</span>
                                </div>
                            </div>
                            <button onClick={() => setAmount(p => (Number(p)+50).toString())} className="w-12 h-12 bg-[#2c2c2e] hover:bg-[#3a3a3c] rounded-xl flex items-center justify-center text-white transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Time Selector */}
                        <div className="mb-8">
                             <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider px-1">
                                 <span>Таймер сделки</span>
                                 <span className="text-[#0098EA]">{TIME_OPTIONS[timeIndex].label}</span>
                             </div>
                             <div className="bg-[#1c1c1e] p-1 rounded-xl flex gap-1 border border-white/5">
                                 {TIME_OPTIONS.map((t, i) => (
                                     <button
                                         key={i}
                                         onClick={() => setTimeIndex(i)}
                                         className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                                             i === timeIndex 
                                             ? 'bg-[#3a3a3c] text-white shadow-sm ring-1 ring-white/10' 
                                             : 'text-gray-500 hover:text-gray-300'
                                         }`}
                                     >
                                         {t.label}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                             <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 animate-pulse">
                                 <AlertTriangle size={16} /> {errorMsg}
                             </div>
                        )}

                        {/* Main Action Button */}
                        <button 
                            onClick={handleOpenDeal} 
                            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-2 ${
                                orderSide === 'Long' 
                                ? 'bg-[#00C896] text-black shadow-[0_4px_20px_rgba(0,200,150,0.2)]' 
                                : 'bg-[#FF3B30] text-white shadow-[0_4px_20px_rgba(255,59,48,0.2)]'
                            }`}
                        >
                            Открыть сделку
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>
    );
  }

  // === RENDER LIST VIEW ===
  return (
    <div className="h-full flex flex-col bg-black text-white overflow-hidden">
      {/* Top Navigation (Segmented Control) */}
      <div className="shrink-0 pt-4 px-4 pb-2 z-10 bg-black">
         <div className="bg-[#1c1c1e] p-1 rounded-2xl flex relative h-12 border border-white/5">
             {/* Sliding Background */}
             <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#3a3a3c] rounded-[14px] shadow-lg transition-all duration-300 ease-out border border-white/5 ${
                    viewMode === 'instruments' ? 'left-1' : 'left-[calc(50%)]'
                }`} 
             />
             
             <button 
                onClick={() => { setViewMode('instruments'); setIsCategoryPanelVisible(true); }}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 ${viewMode === 'instruments' ? 'text-white' : 'text-gray-400'}`}
             >
                Инструменты
             </button>
             <button 
                onClick={() => { setViewMode('deals'); setIsCategoryPanelVisible(true); }}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${viewMode === 'deals' ? 'text-white' : 'text-gray-400'}`}
             >
                Сделки
                {activeDeals.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] shadow-[0_0_8px_#00C896]" />
                )}
             </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {viewMode === 'instruments' && (
          <>
            {/* Search & Filters */}
            <div className={`shrink-0 px-4 bg-black z-20 space-y-3 transition-all duration-500 ease-out overflow-hidden ${
              isCategoryPanelVisible 
                ? 'py-3 max-h-32 opacity-100 translate-y-0' 
                : 'py-0 max-h-0 opacity-0 -translate-y-4'
            }`}>
               {/* Search Bar */}
               <div className="bg-[#1c1c1e] h-10 rounded-xl flex items-center px-3 gap-2 border border-white/5 transition-all focus-within:border-white/20">
                   <Search size={18} className="text-gray-500" />
                   <input 
                      type="text" 
                      placeholder="Поиск актива..." 
                      className="bg-transparent w-full text-white placeholder:text-gray-600 outline-none text-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
                   {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-500" /></button>}
               </div>

               {/* Horizontal Filters */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Все', 'Криптовалюта', 'Акции', 'НФТ', 'Сырье'].map(cat => (
                      <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                              activeCategory === cat 
                              ? 'bg-white text-black border-white' 
                              : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                          }`}
                      >
                          {cat}
                      </button>
                  ))}
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-24" onScroll={handleScroll}>
              {filteredPairs.map(pair => {
                 const displayPrice = dynamicPrices[pair.id]?.price || pair.price;
                 const displayChange = dynamicPrices[pair.id]?.change || pair.change;
                 const isPos = dynamicPrices[pair.id]?.isPositive ?? pair.isPositive;

                 return (
                    <div 
                        key={pair.id} 
                        onClick={() => handleSelectPair(pair)}
                        className="group flex items-center justify-between py-3 border-b border-white/5 active:scale-[0.98] transition-all cursor-pointer"
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
                       <div className="text-right">
                           <div className="font-mono font-medium text-base mb-0.5 tracking-tight">${displayPrice}</div>
                           <div className={`text-xs font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 ${isPos ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
                               {isPos ? '+' : ''}{displayChange}
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
           <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24">
              {activeDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 opacity-50">
                      <History size={48} strokeWidth={1} />
                      <span className="mt-4 text-sm">История сделок пуста</span>
                  </div>
              ) : (
                  activeDeals.map(deal => {
                      const elapsed = Math.floor((currentTime - deal.startTime) / 1000);
                      const remaining = Math.max(0, deal.durationSeconds - elapsed);
                      const currentPrice = getSimulatedPrice(deal);
                      const pnlRatio = deal.type === 'Long' ? (currentPrice - deal.entryPrice) / deal.entryPrice : (deal.entryPrice - currentPrice) / deal.entryPrice;
                      const rawPnl = pnlRatio * 10 * deal.amount;
                      const isWinning = rawPnl > 0;
                      
                      return (
                          <div key={deal.id} className="bg-[#1c1c1e] rounded-2xl p-4 mb-3 border border-white/5 relative overflow-hidden">
                              {/* Progress Bar Background */}
                              <div 
                                className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${isWinning ? 'bg-[#00C896]' : 'bg-[#FF3B30]'}`} 
                                style={{ width: `${(remaining / deal.durationSeconds) * 100}%` }} 
                              />
                              
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                      <CryptoIcon symbol={deal.symbol} size={40} />
                                      <div>
                                          <div className="font-bold flex items-center gap-2">
                                              {deal.pair}
                                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${deal.type === 'Long' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>
                                                  {deal.type}
                                              </span>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-0.5">${deal.amount} • x10</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className={`text-lg font-bold ${rawPnl >= 0 ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                                          {rawPnl > 0 ? '+' : ''}{rawPnl.toFixed(2)}$
                                      </div>
                                      <div className="text-xs text-gray-500 font-mono">
                                          {formatTime(remaining)}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )
                  })
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
