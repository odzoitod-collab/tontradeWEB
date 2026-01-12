import React, { useState, useCallback, useEffect, memo } from 'react';
import { TonLogo } from '../icons';
import { ChevronDown, Gift, X, Loader2, CheckCircle2, Users, ArrowUpRight, ArrowDownLeft, BarChart3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatCurrency, convertFromUSD, DEFAULT_CURRENCY } from '../utils/currency';

// Типы уведомлений
type NotificationType = 'withdraw' | 'deposit' | 'trade';

interface LiveNotification {
  id: number;
  type: NotificationType;
  username: string;
  amount: number;
  crypto?: string;
}

// Генерация случайных данных - Telegram usernames
const randomUsernames = [
  '@alex_trader', '@maria_crypto', '@ivan_ton', '@olga_invest', '@dmitry_btc',
  '@anna_trade', '@sergey_pro', '@elena_coin', '@nikita_fx', '@kate_usdt',
  '@max_profit', '@vlad_moon', '@artem_sol', '@dasha_eth', '@pavel_ton',
  '@crypto_king', '@ton_master', '@btc_whale', '@eth_lover', '@usdt_pro',
  '@trader_777', '@moon_boy', '@diamond_hands', '@rocket_man', '@bull_run',
  '@smart_money', '@degen_ape', '@hodl_king', '@pump_it', '@lambo_soon',
  '@rich_dad', '@wolf_street', '@golden_bull', '@silver_fox', '@iron_hands'
];
const cryptos = ['BTC', 'ETH', 'TON', 'USDT', 'SOL', 'BNB', 'XRP'];

const generateNotification = (): LiveNotification => {
  const types: NotificationType[] = ['withdraw', 'deposit', 'trade'];
  const type = types[Math.floor(Math.random() * types.length)];
  const username = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
  
  let amount: number;
  if (type === 'withdraw') {
    amount = Math.floor(Math.random() * 5000) + 100; // 100-5100 USD
  } else if (type === 'deposit') {
    amount = Math.floor(Math.random() * 3000) + 50; // 50-3050 USD
  } else {
    amount = Math.floor(Math.random() * 10000) + 500; // 500-10500 USD
  }
  
  return {
    id: Date.now(),
    type,
    username,
    amount,
    crypto: type === 'trade' ? cryptos[Math.floor(Math.random() * cryptos.length)] : undefined
  };
};

// Форматирование больших чисел (миллионы/миллиарды)
const formatLargeNumber = (num: number, currencyCode: string): string => {
  const converted = convertFromUSD(num, currencyCode);
  const symbol = currencyCode === 'RUB' ? '₽' : 
                 currencyCode === 'KZT' ? '₸' : 
                 currencyCode === 'UAH' ? '₴' : 
                 currencyCode === 'EUR' ? '€' : '$';
  
  if (converted >= 1000000000) {
    return `${symbol}${(converted / 1000000000).toFixed(1)}B`;
  }
  if (converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(1)}M`;
  }
  if (converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toFixed(0)}`;
};

interface HeroSectionProps {
  onScrollClick: () => void;
  balance: number;
  supportLink: string;
  userId?: number;
  currency?: string;
  isDemoMode?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollClick, balance, supportLink, userId, currency = DEFAULT_CURRENCY, isDemoMode = false }) => {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  
  // Live stats
  const [onlineUsers, setOnlineUsers] = useState(() => Math.floor(Math.random() * 1000) + 1000);
  const [notification, setNotification] = useState<LiveNotification | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  // Статистика биржи (в USD)
  const exchangeStats = {
    capitalization: 847500000, // $847.5M
    totalTraded: 2340000000,   // $2.34B
    totalWithdrawn: 156000000  // $156M
  };
  
  // Конвертируем баланс в выбранную валюту
  const displayBalance = convertFromUSD(balance, currency);
  
  // Обновление онлайна каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 50) - 25; // -25 to +25
        const newValue = prev + change;
        return Math.max(1000, Math.min(2000, newValue));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Уведомления каждые 10-20 секунд
  useEffect(() => {
    const showNewNotification = () => {
      const newNotif = generateNotification();
      setNotification(newNotif);
      setShowNotification(true);
      
      // Скрыть через 4 секунды
      setTimeout(() => setShowNotification(false), 4000);
    };
    
    // Первое уведомление через 3 секунды
    const firstTimeout = setTimeout(showNewNotification, 3000);
    
    // Последующие уведомления каждые 10-20 секунд
    const interval = setInterval(() => {
      showNewNotification();
    }, Math.random() * 10000 + 10000);
    
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleActivatePromo = useCallback(async () => {
    if (!promoCode.trim() || !userId) return;
    
    setPromoStatus('loading');
    setPromoMessage('');

    try {
        // Используем атомарную RPC функцию для активации промокода
        const { data, error } = await supabase.rpc('activate_promo', {
            p_promo_code: promoCode.trim().toUpperCase(),
            p_user_id: userId
        });

        if (error) {
            console.error('Promo activation error:', error);
            setPromoStatus('error');
            setPromoMessage('Ошибка активации. Попробуйте позже.');
            return;
        }

        if (data && data.length > 0) {
            const result = data[0];
            
            if (result.success) {
                setPromoStatus('success');
                setPromoMessage(`+${result.amount} USDT`);
            } else {
                setPromoStatus('error');
                setPromoMessage(result.message || 'Ошибка активации');
            }
        } else {
            setPromoStatus('error');
            setPromoMessage('Промокод не найден');
        }
        
    } catch (e) {
        console.error('Promo error:', e);
        setPromoStatus('error');
        setPromoMessage('Ошибка сети. Попробуйте позже.');
    }
  }, [promoCode, userId]);

  const closePromo = useCallback(() => {
      setShowPromoModal(false);
      setPromoCode('');
      setPromoStatus('idle');
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-between pt-6 pb-32 px-4 relative">

      {/* Live Notification Toast */}
      {notification && (
        <div 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[380px] w-[calc(100%-32px)] transition-all duration-500 ${
            showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              notification.type === 'withdraw' ? 'bg-green-500/20' :
              notification.type === 'deposit' ? 'bg-blue-500/20' : 'bg-purple-500/20'
            }`}>
              {notification.type === 'withdraw' && <ArrowUpRight className="text-green-400" size={20} />}
              {notification.type === 'deposit' && <ArrowDownLeft className="text-blue-400" size={20} />}
              {notification.type === 'trade' && <BarChart3 className="text-purple-400" size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {notification.username}
              </p>
              <p className="text-gray-400 text-xs">
                {notification.type === 'withdraw' && `Вывел ${formatCurrency(convertFromUSD(notification.amount, currency), currency, 0)}`}
                {notification.type === 'deposit' && `Пополнил ${formatCurrency(convertFromUSD(notification.amount, currency), currency, 0)}`}
                {notification.type === 'trade' && `Открыл сделку ${notification.crypto} на ${formatCurrency(convertFromUSD(notification.amount, currency), currency, 0)}`}
              </p>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
              notification.type === 'withdraw' ? 'bg-green-500/20 text-green-400' :
              notification.type === 'deposit' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
            }`}>
              Сейчас
            </div>
          </div>
        </div>
      )}

      {/* Online Users Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#1c1c1e]/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-white text-xs font-medium">{onlineUsers.toLocaleString()}</span>
        <Users size={14} className="text-gray-400" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md mt-4">
        {/* Logo & Balance */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-36 h-36 mb-6 relative" style={{ willChange: 'transform' }}>
             {/* Glow effect */}
             <div className="absolute inset-0 bg-[#0098EA] ton-glow blur-3xl rounded-full"></div>
             {/* Floating Animation Wrapper */}
             <div className="w-full h-full ton-logo-container" style={{ willChange: 'transform, filter' }}>
                 <TonLogo className="w-full h-full" />
             </div>
          </div>
          <span className="text-gray-400 text-sm font-medium mb-1">Доступно</span>
          <h1 className="font-black text-white tracking-tight flex items-center gap-2 drop-shadow-lg">
            <span className={`bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent ${
              displayBalance >= 100000 ? 'text-3xl' : 
              displayBalance >= 10000 ? 'text-4xl' : 
              displayBalance >= 1000 ? 'text-5xl' : 
              'text-6xl'
            }`}>
              {formatCurrency(displayBalance, currency, currency === 'USD' ? 2 : 0)}
            </span>
          </h1>
        </div>

        {/* CTA Button */}
        <div className="w-full mb-4">
          <button 
             onClick={() => setShowPromoModal(true)}
             className="w-full bg-gradient-to-r from-[#0098EA] to-[#00C896] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0098EA]/30 transition-all transform active:scale-95 text-base flex items-center justify-center gap-2"
          >
             <Gift size={18} />
             <span>Ввести промокод</span>
          </button>
        </div>

        {/* Exchange Stats */}
        <div className="w-full grid grid-cols-3 gap-1.5 mb-4">
          <div className="bg-[#1c1c1e]/60 border border-white/5 rounded-lg p-2 text-center">
            <span className="text-[8px] text-gray-500 uppercase block mb-0.5">Капитализация</span>
            <p className="text-white text-xs font-bold">
              {formatLargeNumber(exchangeStats.capitalization, currency)}
            </p>
          </div>
          <div className="bg-[#1c1c1e]/60 border border-white/5 rounded-lg p-2 text-center">
            <span className="text-[8px] text-gray-500 uppercase block mb-0.5">Наторговано</span>
            <p className="text-white text-xs font-bold">
              {formatLargeNumber(exchangeStats.totalTraded, currency)}
            </p>
          </div>
          <div className="bg-[#1c1c1e]/60 border border-white/5 rounded-lg p-2 text-center">
            <span className="text-[8px] text-gray-500 uppercase block mb-0.5">Выведено</span>
            <p className="text-white text-xs font-bold">
              {formatLargeNumber(exchangeStats.totalWithdrawn, currency)}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex w-full justify-between items-center px-2 gap-2 mt-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 w-1/3 opacity-70">
             <div className="text-[36px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#005582] to-black stroke-[#0098EA] relative" style={{ WebkitTextStroke: '1px #0098EA' }}>
              1
            </div>
            <span className="text-center text-[10px] text-gray-300 leading-tight">
              Майнинг<br/>TON
            </span>
          </div>

          {/* Step 2 (Active) */}
          <div className="flex flex-col items-center gap-1 w-1/3 relative -top-1">
             <div className="relative">
                <div className="text-[44px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#0098EA] to-black relative z-10" style={{ WebkitTextStroke: '2px #0098EA' }}>
                  2
                </div>
                <div className="absolute inset-0 blur-xl bg-[#0098EA]/30 z-0"></div>
             </div>
             
             <div className="border border-[#0098EA]/50 bg-[#0098EA]/10 rounded-lg px-2 py-1 text-center w-full backdrop-blur-sm shadow-[0_0_15px_rgba(0,152,234,0.3)]">
                <span className="text-center text-[9px] font-bold text-white leading-tight block">
                  Фарминг<br/>в Пуле
                </span>
             </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 w-1/3 opacity-70">
            <div className="text-[36px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#005582] to-black stroke-[#0098EA] relative" style={{ WebkitTextStroke: '1px #0098EA' }}>
              3
            </div>
            <span className="text-center text-[10px] text-gray-300 leading-tight">
              Битва<br/>Сквадов
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Hint */}
      <div 
        onClick={onScrollClick}
        className="flex flex-col items-center gap-1 cursor-pointer animate-bounce mt-2"
      >
        <span className="text-gray-400 text-xs">Листай вниз</span>
        <ChevronDown className="text-gray-400" size={18} />
      </div>

      {/* --- Promo Modal (Optimized for mobile keyboard) --- */}
      {showPromoModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm" 
            onClick={closePromo} 
          />
          
          {/* Promo Form - Fixed position, won't jump with keyboard */}
          <div 
            className="fixed inset-x-4 top-[10%] z-[120] max-w-[400px] mx-auto bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <button
                onClick={closePromo}
                className="w-9 h-9 rounded-full bg-[#252527] flex items-center justify-center active:scale-90 transition-transform text-white"
              >
                <X size={18} />
              </button>
              <div className="text-lg font-bold flex items-center gap-2 text-[#0098EA]">
                <Gift size={20} />
                Промокод
              </div>
              <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="px-5 py-6">
              {promoStatus === 'success' ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0098EA] to-[#00C896] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,152,234,0.5)]">
                    <CheckCircle2 size={36} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0098EA] to-[#00C896] bg-clip-text text-transparent">
                    {promoMessage}
                  </span>
                  <span className="text-sm text-gray-400 mb-5">Успешно начислено на ваш счет!</span>
                  <button
                    onClick={closePromo}
                    className="w-full bg-[#0098EA] text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform"
                  >
                    Отлично!
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0098EA] to-[#00C896] flex items-center justify-center shadow-[0_0_30px_rgba(0,152,234,0.5)]">
                      <Gift size={32} className="text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">Активация промокода</h3>
                    <p className="text-gray-400 text-sm">Введите код для получения бонуса</p>
                  </div>

                  {/* Input - Large and easy to tap */}
                  <div>
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ВВЕДИТЕ КОД"
                      className="w-full bg-[#111113] border-2 border-white/10 rounded-2xl px-4 py-5 text-center text-2xl font-bold text-white tracking-[0.2em] placeholder-gray-600 focus:border-[#0098EA] outline-none transition-colors uppercase"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    {promoStatus === 'error' && (
                      <p className="text-[#FF3B30] text-sm font-medium mt-2 text-center">
                        {promoMessage}
                      </p>
                    )}
                  </div>

                  {/* Submit Button - Large touch target */}
                  <button 
                    onClick={handleActivatePromo}
                    disabled={promoStatus === 'loading' || !promoCode.trim()}
                    className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-lg ${
                      promoCode.trim() && promoStatus !== 'loading'
                        ? 'bg-gradient-to-r from-[#0098EA] to-[#00C896] text-white shadow-lg shadow-[#0098EA]/30' 
                        : 'bg-[#252527] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {promoStatus === 'loading' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Активация...
                      </>
                    ) : (
                      'АКТИВИРОВАТЬ'
                    )}
                  </button>

                  {/* Info */}
                  <p className="text-center text-xs text-gray-500">
                    Промокод можно использовать только один раз
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default HeroSection;