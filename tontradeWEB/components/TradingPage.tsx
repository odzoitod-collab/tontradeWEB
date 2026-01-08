import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, ChevronLeft, Minus, Plus, Clock, Timer, Zap, AlertTriangle, Star, BarChart3 } from 'lucide-react';
import { getCryptoIcon } from '../icons';
import type { ActiveDeal, CryptoPair } from '../types';

interface TradingPageProps {
    activeDeals: ActiveDeal[];
    onCreateDeal: (deal: ActiveDeal) => void;
    balance: number;
    userLuck: 'win' | 'lose' | 'default';
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

const CryptoIcon = ({ symbol, size = 40 }: { symbol: string; size?: number }) => {
  // Специальные иконки для не-криптовалютных активов
  const getSpecialIcon = (symbol: string) => {
    const iconStyle = { width: size, height: size };
    
    switch (symbol) {
      // Акции - Технологии
      case 'AAPL':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://st3.depositphotos.com/1022135/31848/i/450/depositphotos_318488854-stock-photo-florence-italy-september-2016-detail.jpg" alt="AAPL" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'GOOGL':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-Y51z1Nk0VXrtoweuuYehozvN5gdmDvYM9A&s" alt="GOOGL" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'MSFT':
        return <div style={iconStyle} className="rounded-full overflow-hidden bg-white">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/960px-Microsoft_logo.svg.png" alt="MSFT" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'TSLA':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc6hDexxgSNU_XuskWtMXiVe1KDrTjxROMWg&s" alt="TSLA" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'NVDA':
        return <div style={iconStyle} className="rounded-full overflow-hidden bg-black">
          <img src="https://images.seeklogo.com/logo-png/10/1/nvidia-logo-png_seeklogo-101614.png" alt="NVDA" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'META':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwq7Qd4o7WG8xyZaYx9yAUzNVBvmxmV5GvFQ&s" alt="META" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'AMZN':
        return <div style={iconStyle} className="rounded-full overflow-hidden bg-white">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8bEujb5PyWzjJBw3BTUirmriTqMyzDKXdQg&s" alt="AMZN" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'NFLX':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9xbpsb7xSILvDmi3SU7wzm3IesRmC8QinrA&s" alt="NFLX" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      
      // Акции - Финансы
      case 'JPM':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUj8K_tVL2aZPXwdv0gfHx_W5Wl5gz0tG6lA&s" alt="JPM" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'BAC':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://img.icons8.com/color/1200/bank-of-america.jpg" alt="BAC" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'V':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPFzRy8ax3h59E9kUpcthkjmK8ejKzFvXMvw&s" alt="V" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'MA':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://fondy.ua/uploads/2021/11/knowledge_mastercard_main-1.jpg" alt="MA" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      
      // Акции - Другие
      case 'KO':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://effat.org/wp-content/uploads/2013/12/coca-cola-logo.jpg" alt="KO" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'DIS':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <img src="https://logomaster.com.ua/brand/walt.jpg" alt="DIS" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      case 'NKE':
        return <div style={iconStyle} className="rounded-full overflow-hidden bg-white">
          <img src="https://images.prom.ua/2536264820_w600_h600_swoosh-istoriya.jpg" alt="NKE" width={size} height={size} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>;
      
      // НФТ - Топовые
      case 'BAYC':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#8B4513] flex items-center justify-center text-white font-bold text-sm">🐵</div>
        </div>;
      case 'PUNK':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-sm">👾</div>
        </div>;
      case 'AZUKI':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#FF69B4] flex items-center justify-center text-white font-bold text-sm">🌸</div>
        </div>;
      case 'MAYC':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#9B59B6] flex items-center justify-center text-white font-bold text-sm">🧬</div>
        </div>;
      case 'DOODLE':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#F39C12] flex items-center justify-center text-white font-bold text-sm">🎨</div>
        </div>;
      case 'CLONE':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#E74C3C] flex items-center justify-center text-white font-bold text-sm">👤</div>
        </div>;
      
      // НФТ - Игровые
      case 'AXIE':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#1ABC9C] flex items-center justify-center text-white font-bold text-sm">🎮</div>
        </div>;
      case 'SAND':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#3498DB] flex items-center justify-center text-white font-bold text-sm">🏖️</div>
        </div>;
      case 'MANA':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#FF7675] flex items-center justify-center text-white font-bold text-sm">🌐</div>
        </div>;
      
      // НФТ - Арт
      case 'ART':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#6C5CE7] flex items-center justify-center text-white font-bold text-sm">🖼️</div>
        </div>;
      case 'FIDENZA':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#A29BFE] flex items-center justify-center text-white font-bold text-sm">🎭</div>
        </div>;
      case 'CHROMIE':
        return <div style={iconStyle} className="rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#FD79A8] flex items-center justify-center text-white font-bold text-sm">🌈</div>
        </div>;
      
      // Сырье
      case 'GOLD':
        return <div style={iconStyle} className="rounded-full overflow-hidden flex items-center justify-center">
          <img src="https://cdn3d.iconscout.com/3d/premium/thumb/gold-3d-icon-png-download-10823618.png" alt="GOLD" width={size} height={size} style={{ objectFit: 'cover' }} />
        </div>;
      case 'OIL':
        return <div style={iconStyle} className="rounded-full overflow-hidden flex items-center justify-center">
          <img src="https://img.freepik.com/premium-vector/black-oil-barrel-with-yellow-circle-black-oil-drop-symbol-oil-drum-container-3d-vector-icon_365941-1448.jpg?semt=ais_hybrid&w=740&q=80" alt="OIL" width={size} height={size} style={{ objectFit: 'cover' }} />
        </div>;
      case 'SILVER':
        return <div style={iconStyle} className="rounded-full overflow-hidden flex items-center justify-center">
          <img src="https://foni.papik.pro/uploads/posts/2024-10/foni-papik-pro-snmi-p-kartinki-serebro-na-prozrachnom-fone-2.png" alt="SILVER" width={size} height={size} style={{ objectFit: 'cover' }} />
        </div>;
      
      default:
        return null;
    }
  };

  const specialIcon = getSpecialIcon(symbol);
  if (specialIcon) {
    return <div className="flex items-center justify-center">{specialIcon}</div>;
  }

  // Для криптовалют используем существующую логику
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      {getCryptoIcon(symbol, size)}
    </div>
  );
};

const TradingPage: React.FC<TradingPageProps> = ({ activeDeals, onCreateDeal, balance, userLuck }) => {
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
  const [chartType, setChartType] = useState<'1' | '2'>('1'); // 1 = свечи, 2 = линейный
  const [dynamicPrices, setDynamicPrices] = useState<Record<string, { price: string; change: string; isPositive: boolean }>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  // Обновляем previousPrices каждые 3 секунды для индикаторов направления
  useEffect(() => {
    const priceUpdateTimer = setInterval(() => {
      activeDeals.forEach(deal => {
        const currentPrice = getSimulatedPrice(deal);
        setPreviousPrices(prev => ({ ...prev, [deal.id]: currentPrice }));
      });
    }, 3000); // Каждые 3 секунды
    
    return () => clearInterval(priceUpdateTimer);
  }, [activeDeals]);

  // Динамическое обновление цен в списке (только для отображения)
  useEffect(() => {
    const updateDisplayPrices = () => {
      const newPrices: Record<string, { price: string; change: string; isPositive: boolean }> = {};
      
      PAIRS.forEach(pair => {
        const basePrice = parseFloat(pair.price.replace(/,/g, ''));
        const baseChange = parseFloat(pair.change.replace(/[+%]/g, ''));
        
        // Генерируем небольшие случайные изменения (-0.5% до +0.5%)
        const randomChange = (Math.random() - 0.5) * 1; // от -0.5 до +0.5
        const newChangePercent = baseChange + randomChange;
        const newPrice = basePrice * (1 + newChangePercent / 100);
        
        // Форматируем цену в зависимости от размера
        let formattedPrice: string;
        if (newPrice >= 1000) {
          formattedPrice = newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (newPrice >= 1) {
          formattedPrice = newPrice.toFixed(2);
        } else {
          formattedPrice = newPrice.toFixed(4);
        }
        
        const formattedChange = `${newChangePercent >= 0 ? '+' : ''}${newChangePercent.toFixed(2)}%`;
        
        newPrices[pair.id] = {
          price: formattedPrice,
          change: formattedChange,
          isPositive: newChangePercent >= 0
        };
      });
      
      setDynamicPrices(newPrices);
    };
    
    // Обновляем цены каждые 2-4 секунды (случайный интервал)
    const updatePrices = () => {
      updateDisplayPrices();
      const nextUpdate = 2000 + Math.random() * 2000; // 2-4 секунды
      setTimeout(updatePrices, nextUpdate);
    };
    
    // Первоначальная установка цен
    updateDisplayPrices();
    // Запускаем обновления
    updatePrices();
  }, []);

  useEffect(() => { if (errorMsg) setErrorMsg(null); }, [amount]);

  // Обработчик скролла для скрытия панели категорий
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      // Скролл вниз - скрываем панель
      setIsCategoryPanelVisible(false);
    } else if (currentScrollY < lastScrollY) {
      // Скролл вверх - показываем панель
      setIsCategoryPanelVisible(true);
    }
    
    setLastScrollY(currentScrollY);
  };

  const filteredPairs = useMemo(() => {
    return PAIRS.filter(pair => {
      // Фильтрация по категории
      if (activeCategory === 'Криптовалюта') {
        if (pair.category !== 'crypto') return false;
      } else if (activeCategory === 'Акции') {
        if (pair.category !== 'stocks') return false;
      } else if (activeCategory === 'НФТ') {
        if (pair.category !== 'nft') return false;
      } else if (activeCategory === 'Сырье') {
        if (pair.category !== 'commodities') return false;
      }
      
      // Фильтрация по поисковому запросу
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return pair.symbol.toLowerCase().includes(q) || pair.name.toLowerCase().includes(q);
      }
      
      // Фильтрация по активному фильтру
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
    const pairSuffix = selectedPair.category === 'crypto' ? '/USDT' :
                      selectedPair.category === 'stocks' ? '' :
                      selectedPair.category === 'nft' ? '/ETH' :
                      selectedPair.category === 'commodities' ? '/USD' : '/USDT';
    
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

  // Реалистичная симуляция цены с импульсивными движениями
  const getSimulatedPrice = (deal: ActiveDeal) => {
    const elapsed = (currentTime - deal.startTime) / 1000;
    const totalDuration = deal.durationSeconds;
    const progress = Math.min(elapsed / totalDuration, 1);
    const seed = parseInt(deal.id.slice(-5)) || 1;
    
    // Определяем финальное направление
    const targetChangePercent = 0.05 + (0.07 * ((seed % 100) / 100));
    let finalDirection = 0;
    
    if (userLuck === 'win') {
      finalDirection = deal.type === 'Long' ? 1 : -1;
    } else if (userLuck === 'lose') {
      finalDirection = deal.type === 'Long' ? -1 : 1;
    } else {
      finalDirection = seed % 2 === 0 ? 1 : -1;
      if (deal.type === 'Short') finalDirection *= -1;
      if (seed % 3 === 0) finalDirection *= -1;
    }
    
    // Импульсивные движения каждые 3-4 секунды
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
    for (let i = 0; i <= currentTick; i++) {
      accumulatedChange += getTickMovement(i);
    }
    
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

  // === TRADING VIEW ===
  if (selectedPair) {
    // Формируем символ для TradingView в зависимости от категории актива
    let tvSymbol = '';
    let showNftImage = false;
    let nftImageUrl = '';
    
    if (selectedPair.category === 'crypto') {
      tvSymbol = selectedPair.symbol === 'TON' ? 'BYBIT:TONUSDT' : `BINANCE:${selectedPair.symbol}USDT`;
    } else if (selectedPair.category === 'stocks') {
      // Для акций используем правильные биржи
      const nyseStocks = ['JPM', 'BAC', 'V', 'MA', 'KO', 'DIS', 'NKE']; // NYSE акции
      const exchange = nyseStocks.includes(selectedPair.symbol) ? 'NYSE' : 'NASDAQ';
      tvSymbol = `${exchange}:${selectedPair.symbol}`;
    } else if (selectedPair.category === 'nft') {
      // Для НФТ показываем изображения вместо графиков
      showNftImage = true;
      switch (selectedPair.symbol) {
        case 'BAYC':
          nftImageUrl = 'https://image.binance.vision/editor-uploads-original/9c15d9647b9643dfbc5e522299d13593.png';
          break;
        case 'PUNK':
          nftImageUrl = 'https://rallyrd.com/wp-content/uploads/2022/03/Punk-02.jpg';
          break;
        case 'AZUKI':
          nftImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTvjq-p-Jb9GGpbIzvoB_tMUf3Fga0wDy4aA&s';
          break;
        case 'MAYC':
          nftImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhRIYXscPOFxyZeS9F1koQCR9HgTHybz0Kwg&s';
          break;
        case 'DOODLE':
          nftImageUrl = 'https://nftevening.com/wp-content/uploads/2022/01/Pranksy-Buys-Rare-Golden-Ape-NFT-for-1.1-Million.jpeg';
          break;
        case 'CLONE':
          nftImageUrl = 'https://nftnow.com/wp-content/uploads/2022/09/clonex-4594-murakami.png';
          break;
        case 'AXIE':
          nftImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt-Fw4JAdDyYfPqZA-dgnvdPEWXGJ5y5uOxQ&s';
          break;
        case 'SAND':
          nftImageUrl = 'https://www.sandbox.game/cdn-cgi/image/f=auto,origin-auth=share-publicly,onerror=redirect/img/03_Nav_Bar/avatarShopNav.png';
          break;
        case 'MANA':
          nftImageUrl = 'https://linaali.com/wp-content/uploads/2022/09/manalina-nft2.png';
          break;
        case 'ART':
          nftImageUrl = 'https://nftevening.com/wp-content/uploads/2021/08/Tyler-Hobbs.jpeg';
          break;
        case 'FIDENZA':
          nftImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8qQA87AmOaWX71acYCbdCaidOAT9QaerJRQ&s';
          break;
        case 'CHROMIE':
          nftImageUrl = 'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622024.jpg?semt=ais_hybrid&w=740&q=80';
          break;
        default:
          // Fallback к ETH графику если НФТ не найден
          showNftImage = false;
          tvSymbol = 'BINANCE:ETHUSDT';
      }
    } else if (selectedPair.category === 'commodities') {
      // Для сырья используем соответствующие символы
      if (selectedPair.symbol === 'GOLD') {
        tvSymbol = 'COMEX:GC1!'; // Золото фьючерсы
      } else if (selectedPair.symbol === 'OIL') {
        tvSymbol = 'NYMEX:CL1!'; // Нефть WTI фьючерсы
      } else if (selectedPair.symbol === 'SILVER') {
        tvSymbol = 'COMEX:SI1!'; // Серебро фьючерсы
      } else {
        // Fallback для других товаров
        tvSymbol = 'COMEX:GC1!'; // По умолчанию золото
      }
    } else {
      // Fallback для неизвестных категорий
      tvSymbol = 'BINANCE:BTCUSDT';
    }
    
    // Отладочная информация
    console.log('Selected pair:', selectedPair.symbol, 'Category:', selectedPair.category, 'TradingView symbol:', tvSymbol, 'Show NFT:', showNftImage);
    
    const chartUrl = `https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=5&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=0&saveimage=0&theme=dark&style=${chartType}&timezone=Etc%2FUTC&withdateranges=0&hide_legend=1&hide_volume=1&backgroundColor=rgba(0,0,0,0)&gridLineColor=rgba(40,40,40,0.3)`;

    return (
      <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 absolute top-0 left-0 right-0 z-20 bg-black">
          <button onClick={() => setSelectedPair(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <span className="font-bold text-lg">
              {selectedPair.symbol}
              {selectedPair.category === 'crypto' ? '/USDT' :
               selectedPair.category === 'stocks' ? '' :
               selectedPair.category === 'nft' ? '/ETH' :
               selectedPair.category === 'commodities' ? '/USD' : '/USDT'}
            </span>
          </div>
          <div className="w-9"></div>
        </div>

        {/* Chart - animated */}
        <div className={`flex-1 relative transition-all duration-300 ease-out ${showOrderForm ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          {/* Info Panel */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-20">
            <div className="bg-[#0f0f0f]/95 backdrop-blur-xl rounded-xl border border-gray-800 p-3 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol={selectedPair.symbol} size={40} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-lg">{selectedPair.symbol}</span>
                      <span className="text-gray-500 text-xs font-medium">{selectedPair.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-xl transition-all duration-300">
                        ${dynamicPrices[selectedPair.id]?.price || selectedPair.price}
                      </span>
                      <div className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all duration-300 ${
                        (dynamicPrices[selectedPair.id]?.isPositive ?? selectedPair.isPositive) ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                      }`}>
                        {dynamicPrices[selectedPair.id]?.change || selectedPair.change}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium mb-0.5">24ч Объем</div>
                  <div className="text-white text-xs font-bold">
                    {selectedPair.category === 'crypto' ? '$2.1B' :
                     selectedPair.category === 'stocks' ? '$847M' :
                     selectedPair.category === 'nft' ? '1.2K ETH' :
                     '$156M'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium mb-0.5">Макс 24ч</div>
                  <div className="text-white text-xs font-bold">
                    ${(parseFloat(selectedPair.price.replace(/,/g, '')) * 1.05).toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs font-medium mb-0.5">Мин 24ч</div>
                  <div className="text-white text-xs font-bold">
                    ${(parseFloat(selectedPair.price.replace(/,/g, '')) * 0.95).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Container with Controls */}
          <div className="absolute inset-0 p-4 pt-36">
            <div className="h-full bg-[#0a0a0a] rounded-2xl border border-gray-800 overflow-hidden relative flex flex-col">
              {/* Chart */}
              <div className="flex-1 relative">
                {/* Gradient overlay for better integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none z-10"></div>
                
                {showNftImage ? (
                  /* NFT Image Display */
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-6">
                    <div className="relative">
                      {/* NFT Frame */}
                      <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-1 rounded-3xl shadow-2xl">
                        <div className="bg-gradient-to-br from-white via-gray-100 to-gray-200 p-1 rounded-[22px]">
                          <div className="relative overflow-hidden rounded-[18px] bg-white">
                            <img 
                              src={nftImageUrl} 
                              alt={selectedPair.name}
                              className="w-80 h-80 object-cover"
                            />
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30"></div>
                          </div>
                        </div>
                        
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                      </div>
                      
                      {/* NFT Info */}
                      <div className="text-center mt-6">
                        <div className="text-white font-bold text-xl mb-1">{selectedPair.name}</div>
                        <div className="text-gray-400 text-sm font-medium">Коллекция НФТ</div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-xs font-semibold">Активная торговля</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TradingView iframe */
                  <iframe 
                    src={chartUrl} 
                    className="w-full h-full border-none" 
                    style={{ background: 'transparent' }} 
                    title="Chart" 
                  />
                )}
              </div>
              
              {/* Chart Controls */}
              {!showNftImage && (
                <div className="shrink-0 p-2 border-t border-gray-800 bg-[#0a0a0a]">
                  <div className="flex items-center justify-center">
                    <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 border border-gray-700">
                      <button
                        onClick={() => setChartType('2')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          chartType === '2' 
                            ? 'bg-[#0098EA] text-white' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22,6 13.5,15.5 8.5,10.5 2,17"></polyline>
                        </svg>
                        Линейный
                      </button>
                      <button
                        onClick={() => setChartType('1')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          chartType === '1' 
                            ? 'bg-[#0098EA] text-white' 
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="8" width="4" height="9"></rect>
                          <rect x="9" y="5" width="4" height="12"></rect>
                          <rect x="15" y="10" width="4" height="7"></rect>
                        </svg>
                        Свечной
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Form - animated */}
        <div className={`absolute inset-0 bg-black flex flex-col transition-all duration-300 ease-out ${showOrderForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <div className="pt-20 px-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${orderSide === 'Long' ? 'bg-[#00C896]/20' : 'bg-[#FF3B30]/20'}`}>
                  {orderSide === 'Long' ? <TrendingUp className="text-[#00C896]" size={24} /> : <TrendingDown className="text-[#FF3B30]" size={24} />}
                </div>
                <div>
                  <div className={`text-xl font-bold ${orderSide === 'Long' ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                    {orderSide === 'Long' ? 'LONG позиция' : 'SHORT позиция'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Текущая цена: ${selectedPair.price}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowOrderForm(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <BarChart3 size={18} />
              </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Сумма сделки</label>
              <div className="flex items-center bg-[#1c1c1e] rounded-2xl border border-gray-800 p-1">
                <button onClick={() => setAmount(p => Math.max(10, Number(p)-50).toString())} className="w-12 h-12 flex items-center justify-center text-gray-400 bg-[#2c2c2e] rounded-xl">
                  <Minus size={20}/>
                </button>
                <div className="flex-1 text-center">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent text-center text-2xl font-bold outline-none" />
                  <span className="text-xs text-gray-500">USDT</span>
                </div>
                <button onClick={() => setAmount(p => (Number(p)+50).toString())} className="w-12 h-12 flex items-center justify-center text-gray-400 bg-[#2c2c2e] rounded-xl">
                  <Plus size={20}/>
                </button>
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-gray-500">Баланс: ${balance.toFixed(2)}</span>
                {errorMsg && <span className="text-xs text-[#FF3B30] flex items-center gap-1"><AlertTriangle size={12}/>{errorMsg}</span>}
              </div>
            </div>

            {/* Time */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1"><Clock size={12}/>Время</label>
                <span className="text-lg font-bold text-[#0098EA]">{TIME_OPTIONS[timeIndex].label}</span>
              </div>
              
              {/* Custom Slider */}
              <div className="relative">
                <div className="h-12 bg-[#1c1c1e] rounded-xl border border-gray-800 relative overflow-hidden">
                  {/* Background track */}
                  <div className="absolute inset-0 flex">
                    {TIME_OPTIONS.map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-700 last:border-r-0"></div>
                    ))}
                  </div>
                  
                  {/* Active indicator */}
                  <div 
                    className="absolute top-0 bottom-0 bg-[#0098EA] transition-all duration-300 ease-out rounded-lg m-1"
                    style={{ 
                      left: `${(timeIndex / (TIME_OPTIONS.length - 1)) * (100 - (100 / TIME_OPTIONS.length)) + (100 / TIME_OPTIONS.length / 2)}%`,
                      width: `${100 / TIME_OPTIONS.length - 2}%`,
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                  
                  {/* Labels */}
                  <div className="absolute inset-0 flex items-center">
                    {TIME_OPTIONS.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setTimeIndex(i)}
                        className={`flex-1 text-sm font-semibold transition-all relative z-10 ${
                          i === timeIndex ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leverage info */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-3 mb-6">
              <Zap className="text-yellow-500" size={20} />
              <div>
                <span className="text-yellow-500 text-sm font-bold">Плечо x10</span>
                <p className="text-xs text-gray-500">Автоматически применяется</p>
              </div>
            </div>

            {/* Action Button */}
            <button onClick={handleOpenDeal} className={`w-full font-bold py-4 rounded-2xl text-lg mb-4 active:scale-[0.98] transition-transform ${orderSide === 'Long' ? 'bg-[#00C896] text-black' : 'bg-[#FF3B30] text-white'}`}>
              Открыть {orderSide}
            </button>
          </div>
        </div>

        {/* Bottom Buttons - only when chart visible */}
        {!showOrderForm && (
          <div className="shrink-0 px-4 pb-20 pt-6">
            <div className="flex gap-3">
              <button onClick={() => handleShowOrderForm('Long')} className="flex-1 bg-[#00C896] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#00C896]/25">
                <TrendingUp size={20} /> Вверх
              </button>
              <button onClick={() => handleShowOrderForm('Short')} className="flex-1 bg-[#FF3B30] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#FF3B30]/25">
                <TrendingDown size={20} /> Ввниз
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0a0a] to-black text-white">
      {/* Tabs */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="flex justify-center gap-12">
          <button onClick={() => {
            setViewMode('instruments');
            setIsCategoryPanelVisible(true); // Показываем панель при переходе на инструменты
          }} className={`py-2 text-base font-bold transition-all relative ${viewMode === 'instruments' ? 'text-white' : 'text-gray-500'}`}>
            Инструменты
            {viewMode === 'instruments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0098EA] rounded-full"></div>}
          </button>
          <button onClick={() => {
            setViewMode('deals');
            setIsCategoryPanelVisible(true); // Показываем панель при переходе на сделки
          }} className={`py-2 text-base font-bold relative transition-all ${viewMode === 'deals' ? 'text-white' : 'text-gray-500'}`}>
            Сделки {activeDeals.length > 0 && <span className="absolute -top-1 -right-4 w-2 h-2 bg-[#00C896] rounded-full animate-pulse"></span>}
            {viewMode === 'deals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0098EA] rounded-full"></div>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'instruments' && (
          <>
            {/* Панель фильтров */}
            <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-900 relative z-10 bg-gradient-to-b from-[#0a0a0a] to-black">
              {isSearchOpen ? (
                <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2 border border-gray-700">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input type="text" autoFocus placeholder="Поиск монеты..." className="flex-1 bg-transparent outline-none text-white text-sm min-w-0 placeholder:text-gray-600" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}><X size={16} className="text-gray-400 hover:text-white transition-colors" /></button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
                    {['Все', 'Избранное', 'Рост', 'Падение', 'Топ-10', 'DeFi', 'Мемы', 'Новые'].map(f => (
                      <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${activeFilter === f ? 'border-[#0098EA] text-[#0098EA] bg-[#0098EA]/10' : 'border-gray-700 text-gray-400 bg-transparent hover:border-gray-600'}`}>{f}</button>
                    ))}
                  </div>
                  <button onClick={() => setIsSearchOpen(true)} className="w-8 h-8 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 shrink-0 bg-transparent hover:border-gray-600 hover:text-white transition-all"><Search size={16} /></button>
                </>
              )}
            </div>

            {/* Панель категорий активов */}
            <div className={`px-4 transition-all duration-300 ease-in-out bg-gradient-to-b from-[#0a0a0a] to-black ${
              isCategoryPanelVisible 
                ? 'py-3 translate-y-0 border-b border-gray-900 opacity-100' 
                : 'py-0 -translate-y-full border-b-0 opacity-0 h-0 overflow-hidden'
            }`}>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['Все', 'Криптовалюта', 'Акции', 'НФТ', 'Сырье'].map(category => (
                  <button 
                    key={category} 
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveFilter('Все'); // Сбрасываем фильтр при смене категории
                    }} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                      activeCategory === category 
                        ? 'border-[#0098EA] text-[#0098EA] bg-[#0098EA]/10' 
                        : 'border-gray-700 text-gray-400 bg-transparent hover:border-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Список активов */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 pb-24" onScroll={handleScroll}>
              {filteredPairs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                    <BarChart3 size={32} className="opacity-50" />
                  </div>
                  <span className="text-base font-semibold text-gray-400">
                    {activeCategory === 'Акции' ? 'Торговля акциями' :
                     activeCategory === 'НФТ' ? 'Торговля НФТ' :
                     activeCategory === 'Сырье' ? 'Торговля сырьем' :
                     'Активы не найдены'}
                  </span>
                  <span className="text-sm text-gray-600 mt-2">
                    {activeCategory === 'Криптовалюта' || activeCategory === 'Все' 
                      ? 'Попробуйте изменить фильтры' 
                      : 'Доступно в приложении'}
                  </span>
                </div>
              ) : (
                filteredPairs.map(pair => {
                  // Используем динамические цены для отображения, но оригинальные для торговли
                  const displayPrice = dynamicPrices[pair.id]?.price || pair.price;
                  const displayChange = dynamicPrices[pair.id]?.change || pair.change;
                  const displayIsPositive = dynamicPrices[pair.id]?.isPositive ?? pair.isPositive;
                  
                  return (
                    <div key={pair.id} onClick={() => handleSelectPair(pair)} className="py-3 flex items-center justify-between mb-1 active:scale-[0.98] cursor-pointer transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <CryptoIcon symbol={pair.symbol} />
                          {pair.isFavorite && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Star size={9} className="text-black fill-black" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-black text-base">{pair.symbol}</span>
                            <span className="text-gray-600 text-xs font-semibold">
                              {pair.category === 'crypto' ? '/USDT' :
                               pair.category === 'stocks' ? '' :
                               pair.category === 'nft' ? ' ETH' :
                               pair.category === 'commodities' ? '/USD' : '/USDT'}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs font-medium">{pair.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base block mb-0.5 transition-all duration-300">${displayPrice}</span>
                        <div className={`text-xs font-black px-2 py-0.5 rounded-full inline-block transition-all duration-300 ${displayIsPositive ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>
                          {displayChange}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {viewMode === 'deals' && (
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 pb-24">
            {activeDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                  <Timer size={32} className="opacity-50" />
                </div>
                <span className="text-base font-semibold text-gray-400">Нет активных сделок</span>
                <span className="text-sm text-gray-600 mt-2">Выберите актив для торговли</span>
              </div>
            ) : (
              activeDeals.map(deal => {
                const elapsed = Math.floor((currentTime - deal.startTime) / 1000);
                const remaining = Math.max(0, deal.durationSeconds - elapsed);
                const isFinished = deal.processed || remaining === 0;
                const currentPrice = getSimulatedPrice(deal);
                const pnlRatio = deal.type === 'Long' ? (currentPrice - deal.entryPrice) / deal.entryPrice : (deal.entryPrice - currentPrice) / deal.entryPrice;
                const rawPnl = pnlRatio * 10 * deal.amount;
                const finalPnl = deal.processed && deal.finalPnl !== undefined ? deal.finalPnl : rawPnl;
                const isWinning = deal.processed ? deal.isWinning : (finalPnl > 0);
                const pairData = PAIRS.find(p => p.symbol === deal.symbol);
                
                // Определяем направление изменения цены
                const prevPrice = previousPrices[deal.id] || deal.entryPrice;
                const priceChange = currentPrice - prevPrice;
                const isPriceUp = priceChange > 0.0001;
                const isPriceDown = priceChange < -0.0001;

                return (
                  <div key={deal.id} className={`bg-[#0f0f0f] rounded-2xl p-4 mb-3 border relative overflow-hidden transition-all ${isWinning ? 'border-[#00C896]/30' : 'border-[#FF3B30]/30'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${deal.type === 'Long' ? 'bg-[#00C896]' : 'bg-[#FF3B30]'}`}></div>
                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={deal.symbol} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{deal.pair}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deal.type === 'Long' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>{deal.type}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">${deal.amount} • Плечо x10</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${finalPnl >= 0 ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>{finalPnl > 0 ? '+' : ''}{finalPnl.toFixed(2)}$</div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-gray-500">${currentPrice.toFixed(4)}</span>
                          {isPriceUp && <TrendingUp size={10} className="text-[#00C896]" />}
                          {isPriceDown && <TrendingDown size={10} className="text-[#FF3B30]" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pl-2">
                      <div className={`text-xl font-mono font-black ${remaining < 10 && !isFinished ? 'text-[#FF3B30] animate-pulse' : 'text-white'}`}>{formatTime(remaining)}</div>
                      <div className="flex-1 mx-4 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${finalPnl >= 0 ? 'bg-gradient-to-r from-[#00C896] to-[#00E5A0]' : 'bg-gradient-to-r from-[#FF3B30] to-[#FF6B5A]'}`} style={{ width: `${(remaining / deal.durationSeconds) * 100}%` }}></div>
                      </div>
                    </div>
                    {isFinished && (
                      <div className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                        <div className="text-center">
                          <div className={`text-base font-bold mb-2 ${isWinning ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>{isWinning ? '✓ Выигрыш' : '✗ Проигрыш'}</div>
                          <div className="text-white text-2xl font-black">{finalPnl > 0 ? '+' : ''}{finalPnl.toFixed(2)} USDT</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
