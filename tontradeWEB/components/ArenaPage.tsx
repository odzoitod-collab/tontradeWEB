import React from 'react';
import { Trophy, Shield, Zap, Clock, Star } from 'lucide-react';
import { TrophyIcon } from '../icons';

// --- Types ---
interface Player {
  id: string;
  name: string;
  rank: number;
  score: string;
  avatarColor: string;
  isUser?: boolean;
  change?: 'up' | 'down' | 'same';
}

// Топ трейдеров платформы
const TOP_PLAYERS: Player[] = {
  { id: '1', name: 'AlexMaster', rank: 1, score: '12,450,900', avatarColor: '#F7931A', change: 'same' }, // Gold
  { id: '2', name: 'CryptoKing', rank: 2, score: '11,200,500', avatarColor: '#C0C0C0', change: 'up' },   // Silver
  { id: '3', name: 'TonWhale', rank: 3, score: '10,850,000', avatarColor: '#CD7F32', change: 'down' },   // Bronze
  { id: '4', name: 'ElonMusk', rank: 4, score: '9,500,000', avatarColor: '#0098EA', change: 'up' },
  { id: '5', name: 'Satoshi_N', rank: 5, score: '8,200,100', avatarColor: '#E84142', change: 'same' },
  { id: '6', name: 'Durov.ton', rank: 6, score: '7,900,000', avatarColor: '#345D9D', change: 'down' },
  { id: '7', name: 'NotcoinUser', rank: 7, score: '6,400,000', avatarColor: '#1c1c1e', change: 'up' },
  { id: '8', name: 'GemHunter', rank: 8, score: '5,100,000', avatarColor: '#8247E5', change: 'same' },
];

const ArenaPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-black text-white relative">
      
      {/* --- Header / League Status --- */}
      <div className="shrink-0 relative overflow-hidden pb-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0098EA]/20 to-black z-0"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0098EA] blur-[100px] opacity-30 rounded-full pointer-events-none"></div>

        <div className="relative z-10 px-4 pt-6 flex flex-col items-center">
            
            {/* Season Timer */}
            <div className="flex items-center gap-1.5 bg-[#1c1c1e]/80 backdrop-blur-md border border-gray-800 px-3 py-1 rounded-full mb-4">
                <Clock size={12} className="text-[#0098EA]" />
                <span className="text-[10px] font-medium text-gray-300">Сезон заканчивается через 4д 12ч</span>
            </div>

            {/* League Icon & Title */}
            <div className="flex flex-col items-center mb-6">
                 <div className="relative mb-2">
                    <div className="w-20 h-20 bg-gradient-to-tr from-[#0098EA] to-[#00C896] rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(0,152,234,0.4)]">
                        <TrophyIcon active={true} />
                        <div className="-rotate-45"></div>
                    </div>
                    {/* Stars */}
                    <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse"><Star size={16} fill="currentColor" /></div>
                    <div className="absolute bottom-0 -left-2 text-yellow-400 animate-pulse delay-100"><Star size={12} fill="currentColor" /></div>
                 </div>
                 <h1 className="text-2xl font-bold text-white tracking-wide">Diamond League</h1>
                 <span className="text-sm text-gray-400">Топ 1% игроков</span>
            </div>

            {/* Battle Button */}
            <button className="w-full max-w-xs bg-white text-black font-bold py-3.5 rounded-2xl shadow-lg shadow-white/10 active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Zap size={20} className="fill-black" />
                В БИТВУ
            </button>
        </div>
      </div>

      {/* --- Leaderboard List --- */}
      <div className="flex-1 bg-[#111113] rounded-t-[30px] border-t border-gray-800 relative overflow-hidden flex flex-col">
          
          {/* Header of List */}
          <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b border-gray-800/50">
              <span className="text-xs font-semibold text-gray-500 uppercase">Ранг</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">Очки</span>
          </div>

          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-2 pt-2">
            
            {/* Top 3 Visuals */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center justify-end">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-gray-400 bg-[#1c1c1e] flex items-center justify-center text-sm font-bold text-gray-400 overflow-hidden">
                             {TOP_PLAYERS[1].name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-600 text-[10px] font-bold px-1.5 rounded text-white">#2</div>
                    </div>
                    <div className="text-center mt-2">
                        <div className="text-[10px] font-bold text-gray-300 truncate w-20">{TOP_PLAYERS[1].name}</div>
                        <div className="text-[9px] text-gray-500">{TOP_PLAYERS[1].score}</div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-yellow-500 bg-[#1c1c1e] flex items-center justify-center text-lg font-bold text-yellow-500 overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <Trophy size={24} className="text-yellow-500 fill-yellow-500/20" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded text-black">#1</div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2"><Shield size={16} className="text-yellow-500 fill-yellow-500" /></div>
                    </div>
                    <div className="text-center mt-2">
                        <div className="text-xs font-bold text-white truncate w-24">{TOP_PLAYERS[0].name}</div>
                        <div className="text-[10px] text-yellow-500 font-bold">{TOP_PLAYERS[0].score}</div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center justify-end">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-orange-700 bg-[#1c1c1e] flex items-center justify-center text-sm font-bold text-orange-700 overflow-hidden">
                            {TOP_PLAYERS[2].name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-800 text-[10px] font-bold px-1.5 rounded text-white">#3</div>
                    </div>
                    <div className="text-center mt-2">
                        <div className="text-[10px] font-bold text-gray-300 truncate w-20">{TOP_PLAYERS[2].name}</div>
                        <div className="text-[9px] text-gray-500">{TOP_PLAYERS[2].score}</div>
                    </div>
                </div>
            </div>

            {/* Rest of List */}
            {TOP_PLAYERS.slice(3).map((player) => (
                <div key={player.id} className="bg-[#1c1c1e] p-3 rounded-2xl flex items-center justify-between border border-transparent hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-500 w-6 text-center">{player.rank}</span>
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: player.avatarColor }}
                        >
                            {player.name.substring(0, 1)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{player.name}</span>
                            <span className="text-[10px] text-gray-500">League Member</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-white">{player.score}</div>
                        {player.change === 'up' && <span className="text-[10px] text-green-500 flex items-center justify-end gap-0.5">▲ 120</span>}
                        {player.change === 'down' && <span className="text-[10px] text-red-500 flex items-center justify-end gap-0.5">▼ 45</span>}
                    </div>
                </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default ArenaPage;