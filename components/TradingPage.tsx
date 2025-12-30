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
  { id: '1', symbol: 'TON', name: 'Toncoin', price: '1.46', change: '+2.00%', isPositive: true, isFavorite: true, color: '#0098EA' },
  { id: '2', symbol: 'BTC', name: 'Bitcoin', price: '88767.26', change: '+0.80%', isPositive: true, isFavorite: true, color: '#F7931A' },
  { id: '3', symbol: 'ETH', name: 'Ethereum', price: '3027.69', change: '+1.80%', isPositive: true, isFavorite: true, color: '#627EEA' },
  { id: '4', symbol: 'SOL', name: 'Solana', price: '126.33', change: '+0.80%', isPositive: true, isFavorite: false, color: '#9945FF' },
  { id: '5', symbol: 'BNB', name: 'BNB', price: '856.21', change: '+0.80%', isPositive: true, isFavorite: true, color: '#F3BA2F' },
  { id: '6', symbol: 'XRP', name: 'Ripple', price: '1.92', change: '+0.10%', isPositive: true, isFavorite: false, color: '#23292F' },
  { id: '7', symbol: 'DOGE', name: 'Dogecoin', price: '0.1321', change: '+0.30%', isPositive: true, isFavorite: true, color: '#C2A633' },
  { id: '8', symbol: 'ADA', name: 'Cardano', price: '0.3662', change: '+0.70%', isPositive: true, isFavorite: false, color: '#0033AD' },
  { id: '9', symbol: 'AVAX', name: 'Avalanche', price: '12.19', change: '+0.30%', isPositive: true, isFavorite: false, color: '#E84142' },
  { id: '10', symbol: 'DOT', name: 'Polkadot', price: '1.81', change: '0.00%', isPositive: false, isFavorite: false, color: '#E6007A' },
  { id: '11', symbol: 'MATIC', name: 'Polygon', price: '0.107', change: '+2.20%', isPositive: true, isFavorite: false, color: '#8247E5' },
  { id: '12', symbol: 'LINK', name: 'Chainlink', price: '12.57', change: '+0.40%', isPositive: true, isFavorite: false, color: '#2A5ADA' },
  { id: '13', symbol: 'ATOM', name: 'Cosmos', price: '1.95', change: '+1.30%', isPositive: true, isFavorite: false, color: '#2E3148' },
  { id: '14', symbol: 'UNI', name: 'Uniswap', price: '6.18', change: '+3.30%', isPositive: true, isFavorite: false, color: '#FF007A' },
  { id: '15', symbol: 'LTC', name: 'Litecoin', price: '78.04', change: '+0.80%', isPositive: true, isFavorite: false, color: '#BFBBBB' },
];

const TIME_OPTIONS = [
  { label: '10с', value: 10 },
  { label: '30с', value: 30 },
  { label: '1м', value: 60 },
  { label: '2м', value: 120 },
  { label: '5м', value: 300 },
];

const CryptoIcon = ({ symbol, size = 40 }: { symbol: string; size?: number }) => (
  <div className="flex items-center justify-center" style={{ width: size, height: size }}>
    {getCryptoIcon(symbol, size)}
  </div>
);

const TradingPage: React.FC<TradingPageProps> = ({ activeDeals, onCreateDeal, balance, userLuck }) => {
  const [viewMode, setViewMode] = useState<'instruments' | 'deals'>('instruments');
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (errorMsg) setErrorMsg(null); }, [amount]);

  const filteredPairs = useMemo(() => {
    return PAIRS.filter(pair => {
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
  }, [activeFilter, searchQuery]);

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
    const newDeal: ActiveDeal = {
      id: Date.now().toString(),
      pair: `${selectedPair.symbol}/USDT`,
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
    const tvSymbol = selectedPair.symbol === 'TON' ? 'BYBIT:TONUSDT' : `BINANCE:${selectedPair.symbol}USDT`;
    const chartUrl = `https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=5&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=0&saveimage=0&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=0&hide_legend=1&hide_volume=1&backgroundColor=rgba(0,0,0,0)&gridLineColor=rgba(40,40,40,0.3)`;

    return (
      <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 absolute top-0 left-0 right-0 z-20 bg-black">
          <button onClick={() => setSelectedPair(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <CryptoIcon symbol={selectedPair.symbol} />
              <div>
                <span className="font-bold text-lg">{selectedPair.symbol}/USDT</span>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-white/90 text-sm">${selectedPair.price}</span>
                  <span className={`text-xs font-semibold ${selectedPair.isPositive ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>
                    {selectedPair.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-9"></div>
        </div>

        {/* Chart - animated */}
        <div className={`flex-1 relative transition-all duration-300 ease-out ${showOrderForm ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <iframe src={chartUrl} className="absolute inset-0 w-full h-full border-none" style={{ background: 'transparent' }} title="Chart" />
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
          <div className="shrink-0 px-4 pb-20 pt-3 bg-gradient-to-t from-black via-black to-transparent">
            <div className="flex gap-3">
              <button onClick={() => handleShowOrderForm('Long')} className="flex-1 bg-[#00C896] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]">
                <TrendingUp size={18} /> LONG
              </button>
              <button onClick={() => handleShowOrderForm('Short')} className="flex-1 bg-[#FF3B30] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]">
                <TrendingDown size={18} /> SHORT
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
          <button onClick={() => setViewMode('instruments')} className={`py-2 text-base font-bold transition-all relative ${viewMode === 'instruments' ? 'text-white' : 'text-gray-500'}`}>
            Инструменты
            {viewMode === 'instruments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0098EA] rounded-full"></div>}
          </button>
          <button onClick={() => setViewMode('deals')} className={`py-2 text-base font-bold relative transition-all ${viewMode === 'deals' ? 'text-white' : 'text-gray-500'}`}>
            Сделки {activeDeals.length > 0 && <span className="absolute -top-1 -right-4 w-2 h-2 bg-[#00C896] rounded-full animate-pulse"></span>}
            {viewMode === 'deals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0098EA] rounded-full"></div>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'instruments' && (
          <>
            <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-900">
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
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 pb-24">
              {filteredPairs.map(pair => (
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
                        <span className="text-gray-600 text-xs font-semibold">/USDT</span>
                      </div>
                      <span className="text-gray-500 text-xs font-medium">{pair.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base block mb-0.5">${pair.price}</span>
                    <div className={`text-xs font-black px-2 py-0.5 rounded-full inline-block ${pair.isPositive ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}`}>
                      {pair.change}
                    </div>
                  </div>
                </div>
              ))}
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
                
                // Обновляем предыдущую цену каждые 3 секунды
                if (Math.floor(elapsed) % 3 === 0 && Math.floor(elapsed) !== 0) {
                  setPreviousPrices(prev => ({ ...prev, [deal.id]: currentPrice }));
                }

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
