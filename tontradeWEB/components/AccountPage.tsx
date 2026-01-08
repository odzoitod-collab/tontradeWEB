import React, { useState } from 'react';
import { User, Shield, Globe, Bell, ChevronRight, BadgeCheck, Headset, ShieldCheck, MessageCircle, LogOut, Copy, Check } from 'lucide-react';
import type { DbUser, DbSettings } from '../types';

interface AccountPageProps {
  user: DbUser | null;
  settings: DbSettings;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, settings }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const supportLink = `https://t.me/${settings.support_username}`;

  const copyUserId = () => {
    if (user?.user_id) {
      navigator.clipboard.writeText(user.user_id.toString());
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white relative">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-4 shrink-0 bg-black">
        <h1 className="text-2xl font-bold mb-6">Аккаунт</h1>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#1c1c1e] to-[#111113] rounded-3xl p-5 border border-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#2c2c2e] flex items-center justify-center overflow-hidden border border-gray-700/50">
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
                className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5 hover:text-gray-300 transition-colors"
              >
                <span className="font-mono">ID: {user?.user_id || '—'}</span>
                {copiedId ? <Check size={12} className="text-[#00C896]" /> : <Copy size={12} />}
              </button>
            </div>

            {user?.is_kyc && (
              <div className="w-8 h-8 rounded-full bg-[#00C896]/15 flex items-center justify-center">
                <BadgeCheck size={18} className="text-[#00C896]" />
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="flex gap-2 mt-4">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              user?.is_kyc 
                ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/20' 
                : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${user?.is_kyc ? 'bg-[#00C896]' : 'bg-yellow-500'}`}></div>
              {user?.is_kyc ? 'Верифицирован' : 'Не верифицирован'}
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0098EA]/15 text-[#0098EA] border border-[#0098EA]/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0098EA]"></div>
              Активен
            </div>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
        <div className="space-y-2">
          <MenuItem 
            icon={<BadgeCheck size={20} className="text-[#0098EA]" />} 
            label="Верификация KYC" 
            value={user?.is_kyc ? 'Пройдена' : 'Требуется'} 
            valueColor={user?.is_kyc ? 'text-[#00C896]' : 'text-yellow-500'}
            onClick={() => setShowVerifyModal(true)}
          />

          <MenuItem 
            icon={<Shield size={20} className="text-[#00C896]" />} 
            label="Безопасность" 
            value="Защищено" 
            valueColor="text-[#00C896]"
            onClick={() => setShowSecurityModal(true)}
          />

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

          <div className="h-4"></div>

          <a 
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1c1c1e] p-4 rounded-xl flex items-center justify-between border border-gray-800/50 hover:border-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Headset size={20} className="text-[#0098EA]" />
              <span className="font-medium">Поддержка</span>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </a>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c1e] border border-gray-800/50">
            <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></div>
            <span className="text-gray-400 text-xs font-medium">Dollr v1.0.5</span>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <Modal onClose={() => setShowVerifyModal(false)}>
          <div className="w-14 h-14 rounded-2xl bg-[#0098EA]/15 flex items-center justify-center mb-4">
            <Shield size={28} className="text-[#0098EA]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Верификация KYC</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Для подтверждения личности свяжитесь с поддержкой. Верификация открывает доступ к выводу средств.
          </p>
          <a 
            href={supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#0098EA] hover:bg-[#0088D1] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Headset size={18} />
            Написать в поддержку
          </a>
        </Modal>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <Modal onClose={() => setShowSecurityModal(false)}>
          <div className="w-14 h-14 rounded-2xl bg-[#00C896]/15 flex items-center justify-center mb-4 relative">
            <ShieldCheck size={28} className="text-[#00C896]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Защита аккаунта</h3>
          <div className="w-full bg-[#00C896]/10 border border-[#00C896]/20 rounded-xl p-3 mb-4">
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
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Уведомления</h3>
          <p className="text-gray-400 text-sm mb-4">
            Уведомления приходят в Telegram
          </p>
          <div className="w-full bg-[#2c2c2e] rounded-xl p-4 space-y-3">
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
    className="bg-[#1c1c1e] p-4 rounded-xl flex items-center justify-between active:bg-[#252527] transition-colors cursor-pointer border border-gray-800/50 hover:border-gray-700/50"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm ${valueColor}`}>{value}</span>
      <ChevronRight size={16} className="text-gray-600" />
    </div>
  </div>
);

const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl border border-gray-700/50 relative z-10 p-6 flex flex-col items-center text-center animate-[scaleIn_0.2s_ease-out]">
      {children}
      <button 
        onClick={onClose}
        className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-medium py-3 rounded-xl transition-colors mt-4"
      >
        Закрыть
      </button>
    </div>
  </div>
);

export default AccountPage;
