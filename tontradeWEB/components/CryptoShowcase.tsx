import React from 'react';
import { getCryptoIcon } from '../icons';

const CryptoShowcase: React.FC = () => {
  const cryptos = [
    { symbol: 'TON', name: 'Toncoin' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'ATOM', name: 'Cosmos' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'USDT', name: 'Tether' },
  ];

  return (
    <div className="p-6 bg-black text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Криптовалютные логотипы</h2>
      
      <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
        {cryptos.map(crypto => (
          <div key={crypto.symbol} className="flex flex-col items-center gap-2 p-3 bg-[#1c1c1e] rounded-xl">
            <div className="w-12 h-12 flex items-center justify-center">
              {getCryptoIcon(crypto.symbol, 48)}
            </div>
            <div className="text-center">
              <div className="font-bold text-sm">{crypto.symbol}</div>
              <div className="text-xs text-gray-500">{crypto.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            Все логотипы теперь используют 3D иконки высокого качества с одинаковыми размерами
          </p>
        </div>
        
        {/* Демонстрация разных размеров */}
        <div className="bg-[#1c1c1e] rounded-xl p-4">
          <h3 className="text-lg font-bold mb-3 text-center">Разные размеры</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="mb-2">{getCryptoIcon('BTC', 24)}</div>
              <span className="text-xs text-gray-500">24px</span>
            </div>
            <div className="text-center">
              <div className="mb-2">{getCryptoIcon('ETH', 32)}</div>
              <span className="text-xs text-gray-500">32px</span>
            </div>
            <div className="text-center">
              <div className="mb-2">{getCryptoIcon('TON', 40)}</div>
              <span className="text-xs text-gray-500">40px</span>
            </div>
            <div className="text-center">
              <div className="mb-2">{getCryptoIcon('SOL', 48)}</div>
              <span className="text-xs text-gray-500">48px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoShowcase;