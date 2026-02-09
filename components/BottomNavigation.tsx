import React, { memo } from 'react';
import { WalletIcon, ChartIcon, UserIcon, CoinsIcon } from '../icons';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = memo(({ currentTab, onTabChange }) => {
  return (
    // Контейнер позиционирования: фиксирован внизу, по центру
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 max-w-[420px]">
      
      {/* Сам "остров" навигации */}
      <div 
        className="flex items-center justify-between px-2 py-1.5 bg-[#111113]/95 border border-white/5 rounded-2xl"
        style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      >
        <NavButton 
          icon={<CoinsIcon active={currentTab === 'home'} />} 
          label="Главная" 
          active={currentTab === 'home'} 
          onClick={() => onTabChange('home')}
        />
        <NavButton 
          icon={<ChartIcon active={currentTab === 'trading'} />} 
          label="Торговля" 
          active={currentTab === 'trading'}
          onClick={() => onTabChange('trading')}
          highlight // Опционально: можно оставить подсветку для главного действия
        />
        <NavButton 
          icon={<WalletIcon active={currentTab === 'wallet'} />} 
          label="Баланс" 
          active={currentTab === 'wallet'}
          onClick={() => onTabChange('wallet')}
        />
        <NavButton 
          icon={<UserIcon active={currentTab === 'account'} />} 
          label="Аккаунт" 
          active={currentTab === 'account'}
          onClick={() => onTabChange('account')}
        />
      </div>
    </div>
  );
});

const NavButton = ({ 
  icon, 
  label, 
  active, 
  onClick,
  highlight 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick: () => void,
  highlight?: boolean 
}) => (
  <button 
    onClick={onClick}
    className={`
      relative flex flex-col items-center justify-center 
      w-full h-11 rounded-2xl 
      transition-colors duration-200
      active:scale-[0.98]
      group
    `}
  >
    {/* Фон для активной вкладки (мягкое свечение) */}
    {active && (
      <div className="absolute inset-0 bg-white/5 rounded-2xl transition-opacity" />
    )}
    <div className={`
      w-5 h-5 flex items-center justify-center mb-0.5 z-10 transition-colors duration-200
      ${active ? 'text-white scale-105' : 'text-gray-500 group-hover:text-gray-400'}
      ${highlight && !active ? 'text-[#0098EA]' : ''}
    `}>
      {icon}
    </div>
    <span className={`
      text-[9px] font-medium z-10 transition-colors duration-200
      ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}
    `}>
      {label}
    </span>
  </button>
);

export default BottomNavigation;