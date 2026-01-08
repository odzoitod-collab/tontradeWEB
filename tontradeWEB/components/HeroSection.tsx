import React, { useState } from 'react';
import { TonLogo } from '../icons';
import { ChevronDown, HelpCircle, Headset, Gift, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface HeroSectionProps {
  onScrollClick: () => void;
  balance: number;
  supportLink: string;
  userId?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollClick, balance, supportLink, userId }) => {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);

  const handleActivatePromo = async () => {
    if (!promoCode.trim() || !userId) return;
    
    setPromoStatus('loading');
    setPromoMessage('');

    try {
        // 1. Check if promo exists and is active
        const { data: promo, error: promoError } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode.trim())
            .single();

        if (promoError || !promo) {
            setPromoStatus('error');
            setPromoMessage('Промокод не найден');
            return;
        }

        if (promo.current_activations >= promo.max_activations) {
            setPromoStatus('error');
            setPromoMessage('Лимит активаций исчерпан');
            return;
        }

        // 2. Check if user already used it
        const { data: used, error: usedError } = await supabase
            .from('user_promos')
            .select('*')
            .eq('user_id', userId)
            .eq('promo_id', promo.id)
            .single();

        if (used) {
            setPromoStatus('error');
            setPromoMessage('Вы уже активировали этот код');
            return;
        }

        // 3. Activate: Add balance, Record usage, Update counts
        // Note: Ideally this should be an RPC function for atomicity, but client-side sequence works for MVP with RLS.
        
        // A. Update User Balance
        const { error: balanceError } = await supabase
            .from('users')
            .update({ balance: balance + promo.reward_amount })
            .eq('user_id', userId);

        if (balanceError) throw balanceError;

        // B. Record Usage
        await supabase
            .from('user_promos')
            .insert({ user_id: userId, promo_id: promo.id });

        // C. Increment Count (Optional, best effort)
        await supabase
            .from('promo_codes')
            .update({ current_activations: promo.current_activations + 1 })
            .eq('id', promo.id);

        setRewardAmount(promo.reward_amount);
        setPromoStatus('success');
        setPromoMessage(`+${promo.reward_amount} USDT`);
        
    } catch (e) {
        console.error(e);
        setPromoStatus('error');
        setPromoMessage('Ошибка сети. Попробуйте позже.');
    }
  };

  const closePromo = () => {
      setShowPromoModal(false);
      setPromoCode('');
      setPromoStatus('idle');
  };

  return (
    <div className="h-full flex flex-col items-center justify-between pt-6 pb-32 px-4 relative">

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md mt-4">
        {/* Logo & Balance */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-36 h-36 mb-6 relative">
             {/* Glow effect */}
             <div className="absolute inset-0 bg-[#0098EA] ton-glow blur-3xl rounded-full"></div>
             {/* Floating Animation Wrapper */}
             <div className="w-full h-full ton-logo-container">
                 <TonLogo className="w-full h-full" />
             </div>
          </div>
          <span className="text-gray-400 text-sm font-medium mb-1">Доступно</span>
          <h1 className="text-6xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              {balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="font-bold text-[#26A17B] drop-shadow-md">USDT</span>
          </h1>
        </div>

        {/* CTA Button - Moved up */}
        <div className="w-full mb-8">
          <button 
             onClick={() => setShowPromoModal(true)}
             className="w-full bg-gradient-to-r from-[#0098EA] to-[#00C896] hover:from-[#0088D1] hover:to-[#00B886] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#0098EA]/40 transition-all transform active:scale-95 text-lg flex items-center justify-center gap-2"
          >
             <Gift size={24} />
             <span>Ввести промокод</span>
          </button>
        </div>

        {/* Steps */}
        <div className="flex w-full justify-between items-end px-2 gap-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 w-1/3 opacity-70">
             <div className="text-[60px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#005582] to-black stroke-[#0098EA] relative" style={{ WebkitTextStroke: '1px #0098EA' }}>
              1
            </div>
            <span className="text-center text-xs text-gray-300 leading-tight">
              Майнинг<br/>TON
            </span>
          </div>

          {/* Step 2 (Active) */}
          <div className="flex flex-col items-center gap-2 w-1/3 relative -top-4">
             <div className="relative">
                <div className="text-[80px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#0098EA] to-black relative z-10" style={{ WebkitTextStroke: '2px #0098EA' }}>
                  2
                </div>
                {/* Glow behind 2 */}
                <div className="absolute inset-0 blur-xl bg-[#0098EA]/30 z-0"></div>
             </div>
             
             <div className="border border-[#0098EA]/50 bg-[#0098EA]/10 rounded-xl px-3 py-2 text-center w-full backdrop-blur-sm shadow-[0_0_15px_rgba(0,152,234,0.3)]">
                <span className="text-center text-xs font-bold text-white leading-tight block">
                  Фарминг<br/>в Пуле
                </span>
             </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 w-1/3 opacity-70">
            <div className="text-[60px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#005582] to-black stroke-[#0098EA] relative" style={{ WebkitTextStroke: '1px #0098EA' }}>
              3
            </div>
            <span className="text-center text-xs text-gray-300 leading-tight">
              Битва<br/>Сквадов
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Hint */}
      <div 
        onClick={onScrollClick}
        className="flex flex-col items-center gap-1 cursor-pointer animate-bounce mt-4"
      >
        <span className="text-gray-400 text-sm">Листай вниз к новостям</span>
        <ChevronDown className="text-gray-400" />
      </div>

      {/* --- Promo Modal --- */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closePromo}></div>
            <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-gray-700 relative z-10 p-6 flex flex-col items-center text-center animate-[float_0.3s_ease-out] shadow-2xl shadow-blue-500/10">
                <button onClick={closePromo} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0098EA] to-[#00C896] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,152,234,0.4)]">
                    <Gift size={32} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Промокод</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                   Введите код, чтобы получить<br/>бонус на торговый счет.
                </p>

                {promoStatus === 'success' ? (
                     <div className="w-full py-8 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
                        <CheckCircle2 size={48} className="text-[#00C896] mb-3" />
                        <span className="text-3xl font-bold text-white mb-1">{promoMessage}</span>
                        <span className="text-sm text-gray-500">Успешно начислено!</span>
                     </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div>
                            <input 
                                type="text" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="w-full bg-[#111113] border border-gray-700 rounded-xl px-4 py-3.5 text-center text-lg font-bold text-white tracking-widest placeholder-gray-600 focus:border-[#0098EA] outline-none transition-colors uppercase"
                            />
                            {promoStatus === 'error' && (
                                <p className="text-[#FF3B30] text-xs font-bold mt-2 animate-pulse">{promoMessage}</p>
                            )}
                        </div>

                        <button 
                            onClick={handleActivatePromo}
                            disabled={promoStatus === 'loading' || !promoCode}
                            className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${promoCode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            {promoStatus === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'АКТИВИРОВАТЬ'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default HeroSection;