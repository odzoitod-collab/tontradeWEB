import React from 'react';
import { WalletIcon, ChartIcon, UserIcon, CoinsIcon } from '../icons';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111113]/95 backdrop-blur-lg border-t border-gray-800/50 pb-safe">
      <div className="h-14 flex items-center justify-around px-4 max-w-lg mx-auto">
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
          highlight
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
    className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      active 
        ? 'text-white' 
        : 'text-gray-500 hover:text-gray-400'
    } ${highlight && active ? 'bg-[#0098EA]/10' : ''}`}
  >
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
  </button>
);

export default BottomNavigation;
