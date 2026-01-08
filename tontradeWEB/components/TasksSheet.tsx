import React, { useState, memo } from 'react';
import { TonCoin } from '../icons';
import { ChevronUp, Clock, Tag, TrendingUp, Users, RefreshCw } from 'lucide-react';
import type { NewsItem } from '../types';

interface TasksSheetProps {
  onBackClick: () => void;
}

// News Data
const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'The Open Network бьет рекорды активности',
    description: 'Количество активных кошельков превысило 10 миллионов за месяц.',
    date: '2 ч. назад',
    category: 'market',
    read: false
  },
  {
    id: '2',
    title: 'Крупное обновление Wallet',
    description: 'Теперь доступны обмены без комиссии для держателей Premium.',
    date: '5 ч. назад',
    category: 'updates',
    read: false
  },
  {
    id: '3',
    title: 'Аирдроп для участников комьюнити',
    description: 'Узнайте, как получить свои токены до конца недели.',
    date: '1 д. назад',
    category: 'community',
    read: true
  },
  {
    id: '4',
    title: 'TON x Telegram: Новая интеграция',
    description: 'Встроенные платежи теперь работают во всех чатах.',
    date: '2 д. назад',
    category: 'updates',
    read: true
  },
  {
    id: '5',
    title: 'Рост цены на 15%',
    description: 'Аналитики предсказывают дальнейший рост на фоне новостей.',
    date: '3 д. назад',
    category: 'market',
    read: true
  },
  {
    id: '6',
    title: 'Hackathon winners announced',
    description: 'Лучшие проекты сезона получили гранты на развитие.',
    date: '4 д. назад',
    category: 'community',
    read: true
  }
];

const TasksSheet: React.FC<TasksSheetProps> = memo(({ onBackClick }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'market' | 'updates' | 'community'>('all');

  const filteredNews = NEWS_ITEMS.filter(item => 
    activeFilter === 'all' ? true : item.category === activeFilter
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return <TrendingUp size={18} className="text-green-400" />;
      case 'updates': return <RefreshCw size={18} className="text-blue-400" />;
      case 'community': return <Users size={18} className="text-purple-400" />;
      default: return <Tag size={18} className="text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'market': return 'Рынок';
      case 'updates': return 'Обновления';
      case 'community': return 'Комьюнити';
      default: return 'Разное';
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] rounded-t-[30px] relative pt-2 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-white/5" style={{ WebkitOverflowScrolling: 'touch' }}>
      
      {/* Header Area with Background */}
      <div className="mb-6">
        <div className="relative w-full h-48 overflow-hidden mb-6 shadow-2xl shadow-blue-900/20 group">
            {/* Background Image */}
            <div className="absolute inset-0 bg-[url('https://s3.coinmarketcap.com/static-gravity/image/04b9c957f16141008342f97caf80aa7e.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ willChange: 'transform' }}></div>
            
            {/* Gradient Overlays for smooth transition */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/60 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#111113] to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#111113] to-transparent"></div>
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#111113] to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#111113] to-transparent"></div>
            
            {/* Back Button */}
            <div 
              onClick={onBackClick}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center py-2 cursor-pointer text-white transition-colors z-20"
            >
              <ChevronUp size={20} className="mb-1 animate-pulse drop-shadow-lg" />
              <span className="text-xs font-medium uppercase tracking-widest opacity-90 drop-shadow-lg">Главная</span>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 backdrop-blur-md mb-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">TON Ecosystem</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">Новости &<br/>Инсайды</h2>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <TabButton 
                label="Все" 
                active={activeFilter === 'all'} 
                onClick={() => setActiveFilter('all')} 
                count={NEWS_ITEMS.length}
            />
            <TabButton 
                label="Рынок" 
                active={activeFilter === 'market'} 
                onClick={() => setActiveFilter('market')} 
            />
            <TabButton 
                label="Обновления" 
                active={activeFilter === 'updates'} 
                onClick={() => setActiveFilter('updates')} 
            />
            <TabButton 
                label="Комьюнити" 
                active={activeFilter === 'community'} 
                onClick={() => setActiveFilter('community')} 
            />
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="px-4 space-y-3">
        {filteredNews.map((item) => (
          <div key={item.id} className="bg-[#1c1c1e] p-4 rounded-2xl flex flex-col gap-3 border border-white/5 active:scale-[0.99] transition-all hover:border-white/10">
             
             <div className="flex justify-between items-start gap-3">
                 <div className="flex-1">
                    <h3 className={`font-semibold text-[15px] leading-snug mb-1 ${item.read ? 'text-gray-300' : 'text-white'}`}>
                        {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                 </div>
                 {!item.read && (
                     <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                 )}
             </div>

             {/* Footer Info */}
             <div className="flex items-center justify-between pt-2 border-t border-white/5">
                 <div className="flex items-center gap-2">
                     <div className="p-1 rounded-md bg-[#1c1c1e] text-gray-400 border border-white/5">
                         {getCategoryIcon(item.category)}
                     </div>
                     <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                         {getCategoryLabel(item.category)}
                     </span>
                 </div>
                 <div className="flex items-center gap-1.5 text-gray-500">
                     <Clock size={12} />
                     <span className="text-[10px]">{item.date}</span>
                 </div>
             </div>

          </div>
        ))}

        {filteredNews.length === 0 && (
            <div className="py-10 text-center text-gray-500 text-sm">
                В этой категории пока нет новостей
            </div>
        )}
        
        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  );
});

const TabButton = ({ label, active, onClick, count }: { label: string, active?: boolean, onClick: () => void, count?: number }) => (
    <button 
        onClick={onClick}
        className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300
        ${active 
            ? 'bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/30 translate-y-[-1px]' 
            : 'bg-[#1c1c1e] text-gray-400 border border-white/5 hover:border-white/10 hover:text-gray-200'}
    `}>
        {label}
        {count !== undefined && (
            <span className={`
                w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold
                ${active ? 'bg-white/20 text-white' : 'bg-[#1c1c1e] text-gray-400 border border-white/5'}
            `}>
                {count}
            </span>
        )}
    </button>
);

export default TasksSheet;