import React, { useState } from 'react';
import { User, Shield, Globe, Bell, ChevronRight, BadgeCheck, Headset, ShieldCheck, MessageCircle, LogOut, Copy, Check, Settings, Star, Zap } from 'lucide-react';
import type { DbUser, DbSettings } from '../types';

interface AccountPageProps {
  user: DbUser | null;
  settings: DbSettings;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, settings }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
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
    <div className="h-full flex flex-col bg-black text-white overflow-hidden">
      
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
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#2c2c2e] flex items-center justify-center overflow-hidden border border-white/10 shadow-sm">
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
                onClick={() => setShowVerifyModal(true)}
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

      {/* Verification Modal */}
      {showVerifyModal && (
        <Modal onClose={() => setShowVerifyModal(false)}>
          <div className="w-14 h-14 rounded-2xl bg-[#0098EA]/15 flex items-center justify-center mb-4 border border-[#0098EA]/20">
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
            className="w-full bg-[#0098EA] hover:bg-[#0088D1] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,152,234,0.2)]"
          >
            <Headset size={18} />
            Написать в поддержку
          </a>
        </Modal>
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
        className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-medium py-3 rounded-2xl transition-all mt-4 active:scale-[0.98]"
      >
        Закрыть
      </button>
    </div>
  </div>
);

export default AccountPage;
