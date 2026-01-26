import React, { useState } from 'react';
import { 
  Loader2, 
  Send, 
  ShieldCheck, 
  User, 
  KeyRound, 
  ArrowRight, 
  X, 
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { checkUserExists, verifyTelegramCode } from '../api/verify-telegram';
import type { DbUser } from '../types';

interface TelegramAuthProps {
  onAuthSuccess: (user: DbUser) => void;
  onClose?: () => void;
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuthSuccess, onClose }) => {
  const [step, setStep] = useState<'username' | 'code' | 'success'>('username');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- ЛОГИКА ОСТАЛАСЬ ПРЕЖНЕЙ ---
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const userExists = await checkUserExists(username);
      
      if (!userExists) {
        setError('Аккаунт не найден. Зарегистрируйтесь в боте.');
        setIsLoading(false);
        return;
      }

      setStep('code');
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyTelegramCode(username, code.trim());

      if (!result.success) {
        setError(result.error || 'Неверный код доступа');
        setIsLoading(false);
        return;
      }

      setStep('success');
      
      setTimeout(() => {
        onAuthSuccess(result.user);
      }, 1000); // Чуть увеличил задержку для визуального наслаждения галочкой

    } catch (err) {
      setError('Ошибка аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('username');
    setUsername('');
    setCode('');
    setError('');
    setIsLoading(false);
  };

  // --- РЕНДЕР ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop с блюром */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Main Card */}
      <div className="relative w-full max-w-[400px] bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {onClose && step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all z-10"
          >
            <X size={20} />
          </button>
        )}

        {/* Header Section */}
        <div className="pt-8 px-8 pb-4 text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            {step === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#0098EA]" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            TonTrader <span className="text-[#0098EA]">ID</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'username' && 'Вход через Telegram'}
            {step === 'code' && 'Подтверждение личности'}
            {step === 'success' && 'Успешный вход'}
          </p>
        </div>

        {/* Body Section */}
        <div className="p-8 pt-2">
          
          {/* STEP 1: Username */}
          {step === 'username' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">
                  Ваш юзернейм
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#0098EA] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#1A1D24] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0098EA]/50 focus:border-[#0098EA] transition-all"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!username.trim() || isLoading}
                className="w-full py-3.5 bg-[#0098EA] hover:bg-[#008ACD] active:scale-[0.98] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(0,152,234,0.3)]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Продолжить <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <a 
                  href="https://t.me/tontraderbot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  Нет аккаунта? <span className="text-[#0098EA]">Запустить бота</span>
                </a>
              </div>
            </form>
          )}

          {/* STEP 2: Code */}
          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
                <Send className="w-5 h-5 text-[#0098EA] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-300">Получите код для входа, в телеграм боте</p>
                  <p className="text-gray-500 mt-0.5 text-xs">Нажмите кнопку "🔐 код" и получите ваш код для входа</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-[#0098EA] transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000 000"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#1A1D24] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0098EA]/50 focus:border-[#0098EA] transition-all font-mono text-lg tracking-[0.2em]"
                    disabled={isLoading}
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={code.length !== 6 || isLoading}
                  className="w-full py-3.5 bg-[#0098EA] hover:bg-[#008ACD] active:scale-[0.98] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(0,152,234,0.3)]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Войти в систему'
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" /> Вернуться назад
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Доступ разрешен
              </h3>
              <p className="text-gray-500 text-sm">
                Перенаправление на торговую панель...
              </p>
            </div>
          )}
        </div>
        
        {/* Footer gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#0098EA]/50 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default TelegramAuth;