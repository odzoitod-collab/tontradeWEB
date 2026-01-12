import React, { useState, useCallback, memo } from 'react';
import { TonLogo } from '../icons';
import { ChevronDown, HelpCircle, Headset, Gift, X, Loader2, CheckCircle2, Minimize2, Maximize2 } from 'lucide-react';
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
  const [promoHeight, setPromoHeight] = useState<'small' | 'full'>('small');
  const [isPromoAnimating, setIsPromoAnimating] = useState(false);

  const handleActivatePromo = useCallback(async () => {
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
  }, [promoCode, userId, balance]);

  const handleOpenPromo = useCallback(() => {
    setPromoHeight('small');
    setIsPromoAnimating(true);
    setShowPromoModal(true);
    setTimeout(() => setIsPromoAnimating(false), 300);
  }, []);

  const closePromo = useCallback(() => {
      setShowPromoModal(false);
      setPromoCode('');
      setPromoStatus('idle');
      setPromoHeight('small');
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-between pt-6 pb-32 px-4 relative">

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
              balance >= 10000 ? 'text-4xl' : 
              balance >= 1000 ? 'text-5xl' : 
              'text-6xl'
            }`}>
              {balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className={`font-bold text-[#26A17B] drop-shadow-md ${
              balance >= 10000 ? 'text-2xl' : 
              balance >= 1000 ? 'text-3xl' : 
              'text-4xl'
            }`}>USDT</span>
          </h1>
        </div>

        {/* CTA Button - Moved up */}
        <div className="w-full mb-8">
          <button 
             onClick={handleOpenPromo}
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

      {/* --- Promo Bottom Sheet --- */}
      {showPromoModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              if (promoHeight === 'small') {
                closePromo();
              } else {
                setPromoHeight('small');
              }
            }} 
          />
          
          {/* Promo Form Bottom Sheet */}
          <div 
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-[120] w-full max-w-[420px] bg-[#1c1c1e] flex flex-col rounded-t-[32px] border-t border-white/10 shadow-2xl transition-all duration-300 ease-out ${
              isPromoAnimating ? 'animate-[slideUpFromBottom_0.3s_ease-out]' : ''
            } ${
              promoHeight === 'full' ? 'h-[95vh]' : 'h-[70vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              willChange: isPromoAnimating ? 'transform' : 'height'
            }}
          >
            {/* Drag Handle & Header */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2">
              <div 
                className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 cursor-ns-resize"
                onClick={() => setPromoHeight(promoHeight === 'full' ? 'small' : 'full')}
              />
              
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={closePromo}
                  className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
                >
                  <X size={16} />
                </button>
                <div className="text-lg font-bold flex items-center gap-2 text-[#0098EA]">
                  <Gift size={20} />
                  Промокод
                </div>
                <button
                  onClick={() => setPromoHeight(promoHeight === 'full' ? 'small' : 'full')}
                  className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
                >
                  {promoHeight === 'full' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 flex flex-col items-center justify-center" style={{ WebkitOverflowScrolling: 'touch' }}>
              {promoStatus === 'success' ? (
                <div className="w-full py-8 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0098EA] to-[#00C896] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,152,234,0.5)]">
                    <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <span className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-[#0098EA] to-[#00C896] bg-clip-text text-transparent">
                    {promoMessage}
                  </span>
                  <span className="text-sm text-gray-400">Успешно начислено на ваш счет!</span>
                  <button
                    onClick={closePromo}
                    className="mt-6 w-full bg-[#0098EA] text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
                  >
                    Отлично!
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0098EA] to-[#00C896] flex items-center justify-center shadow-[0_0_30px_rgba(0,152,234,0.5)]">
                      <Gift size={40} className="text-white" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Активация промокода</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Введите код, чтобы получить<br/>бонус на торговый счет
                    </p>
                  </div>

                  {/* Input */}
                  <div>
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ВВЕДИТЕ КОД"
                      className="w-full bg-[#111113] border-2 border-white/10 rounded-xl px-4 py-4 text-center text-xl font-bold text-white tracking-widest placeholder-gray-500 focus:border-[#0098EA] outline-none transition-colors uppercase"
                      autoFocus
                    />
                    {promoStatus === 'error' && (
                      <p className="text-[#FF3B30] text-sm font-semibold mt-3 text-center animate-pulse">
                        {promoMessage}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    onClick={handleActivatePromo}
                    disabled={promoStatus === 'loading' || !promoCode.trim()}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-lg ${
                      promoCode.trim() && promoStatus !== 'loading'
                        ? 'bg-gradient-to-r from-[#0098EA] to-[#00C896] text-white shadow-lg shadow-[#0098EA]/40 hover:from-[#0088D1] hover:to-[#00B886]' 
                        : 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed border border-white/5'
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
                  <div className="text-center pt-4">
                    <p className="text-xs text-gray-500">
                      Промокод можно использовать только один раз
                    </p>
                  </div>
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