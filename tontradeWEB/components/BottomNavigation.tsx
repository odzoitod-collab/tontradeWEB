import React from 'react';
import { WalletIcon, ChartIcon, UserIcon, CoinsIcon } from '../icons';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onTabChange }) => {
  return (
    // Контейнер позиционирования: фиксирован внизу, по центру
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 max-w-[420px]">
      
      {/* Сам "остров" навигации */}
      <div className="
        flex items-center justify-between 
        px-2 py-2
        bg-[#111113]/85 backdrop-blur-xl 
        border border-white/10 
        rounded-[24px] 
        shadow-lg shadow-black/40
      ">
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
};

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
      w-full h-12 rounded-[18px] 
      transition-all duration-300 ease-out
      active:scale-95
      group
    `}
  >
    {/* Фон для активной вкладки (мягкое свечение) */}
    {active && (
      <div className="absolute inset-0 bg-white/5 rounded-[18px] opacity-100 transition-opacity" />
    )}
    
    {/* Иконка с анимацией цвета и позиции */}
    <div className={`
      w-6 h-6 flex items-center justify-center mb-0.5 z-10 
      transition-transform duration-300 
      ${active ? 'text-white scale-110 -translate-y-0.5' : 'text-gray-500 group-hover:text-gray-400'}
      ${highlight && !active ? 'text-[#0098EA]' : ''}
    `}>
      {icon}
    </div>

    {/* Текст (минималистичный, чуть меньше обычного) */}
    <span className={`
      text-[9px] font-medium tracking-wide z-10 transition-colors duration-300
      ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}
    `}>
      {label}
    </span>
  </button>
);

export default BottomNavigation;
