import React from 'react';

export const TonLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/toncoin-ton-coin-3d-icon-png-download-7138701.png" 
    alt="TON" 
    className={className}
    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
  />
);

export const TonCoin = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/toncoin-ton-coin-3d-icon-png-download-7138701.png" 
    alt="TON" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const BtcIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/bitcoin-3d-icon-png-download-12212888.png" 
    alt="BTC" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const BtcIconSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F7931A"/>
    <path d="M23.189 14.02c.396-2.653-1.625-4.075-4.387-5.023l.896-3.593-2.185-.544-.872 3.498c-.574-.143-1.164-.28-1.743-.414l.876-3.513-2.186-.545-.9 3.606c-.474-.108-3.045-.694-3.045-.694l-.602 2.417s1.678.384 1.643.407c.916.229 1.081.835 1.054 1.316l-1.056 4.234c.063.016.145.039.234.075l-.237-.06-1.48 5.934c-.112.278-.396.696-1.036.537-.035-.022-1.644-.41-1.644-.41l-1.123 2.59 2.871.716c.534.133 1.058.275 1.577.412l-.91 3.65 2.186.545.9-3.613c.594.16 1.169.31 1.73.453l-.903 3.626 2.185.545.903-3.62c3.727.706 6.533.421 7.712-2.951.95-2.712-.047-4.276-2.006-5.298 1.427-.329 2.502-1.27 2.791-3.216zm-3.523 4.965c-.48 1.923-3.726.883-4.78.621l.853-3.42c1.054.262 4.348.78 3.927 2.799zm.475-4.985c-.438 1.758-3.138.864-4.01.646l.774-3.104c.872.217 3.633.621 3.236 2.458z" fill="white"/>
  </svg>
);

export const EthIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/ethereum-eth-3d-icon-png-download-11442745.png" 
    alt="ETH" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const EthIconSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 4v8.83l7.527 3.354L16 4z" fill="#FFF" fillOpacity=".602"/>
    <path d="M16 4L8.473 16.184 16 12.83V4z" fill="white"/>
    <path d="M16 21.688l7.527-4.363L16 28V21.69z" fill="#FFF" fillOpacity=".602"/>
    <path d="M16 28l-7.527-10.675L16 21.688V28z" fill="white"/>
    <path d="M16 19.864l7.527-4.363L16 12.83v7.034z" fill="#FFF" fillOpacity=".2"/>
    <path d="M8.473 15.5L16 19.864V12.83L8.473 15.5z" fill="#FFF" fillOpacity=".602"/>
  </svg>
);

export const SolIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/solana-3d-icon-png-download-4159458.png" 
    alt="SOL" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const SolIconSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#000"/>
    <path d="M9.5 20.35h9.83L22.5 17h-9.83l-3.17 3.35zm0-8.35h9.83L22.5 8.65h-9.83L9.5 12zm3.17 4.15h9.83L19.33 12.8H9.5l3.17 3.35z" fill="url(#paint0_linear)"/>
    <defs>
      <linearGradient id="paint0_linear" x1="10.87" y1="9.67" x2="22.14" y2="19.16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const ShibIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#FEA41D"/>
    <rect width="16" height="16" x="8" y="8" fill="white" rx="8" fillOpacity="0.2"/>
  </svg>
);

export const XrpIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/xrp-3d-icon-png-download-4159479.png" 
    alt="XRP" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const XrpIconSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#fff"/>
    <path d="M16.002 18.04l-6.28 6.28-.622-.625 6.903-6.902 6.903 6.902-.625.625-6.28-6.28zm6.278-6.277l.625.624-6.903 6.902L9.1 12.387l.624-.624 6.277 6.277 6.28-6.277z" fill="#23292F"/>
  </svg>
);

export const UsdtIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <circle cx="16" cy="16" r="16" fill="#26A17B"/>
    <path d="M17.77 13.9v-2.7h5.83V8.5h-15.2v2.7h5.83v5.4c0 3.8-3.4 3.9-3.4 3.9v2.2s4.9.4 6.75-2.2c1.85 2.6 6.75 2.2 6.75 2.2v-2.2s-3.4-.1-3.4-3.9v-5.4z" fill="white"/>
  </svg>
);

// Новые криптовалютные иконки
export const BnbIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/bnb-3d-icon-png-download-4159481.png" 
    alt="BNB" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const DogeIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://static.vecteezy.com/system/resources/thumbnails/024/239/834/small/dogecoin-doge-crypto-free-png.png" 
    alt="DOGE" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const AdaIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/cardano-ada-3d-icon-png-download-11757503.png" 
    alt="ADA" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const AvaxIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://static.vecteezy.com/system/resources/thumbnails/024/092/645/small_2x/avalanche-avax-glass-crypto-coin-3d-illustration-free-png.png" 
    alt="AVAX" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const MaticIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/polygon-matic-coin-3d-icon-png-download-5326787.png" 
    alt="MATIC" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const LinkIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/chainlink-link-coin-3d-icon-png-download-6044465.png" 
    alt="LINK" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const AtomIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/cosmos-atom-coin-3d-icon-png-download-7138699.png" 
    alt="ATOM" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const UniIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/uniswap-3d-icon-png-download-3684808.png" 
    alt="UNI" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

export const LtcIcon = ({ size = 20 }: { size?: number }) => (
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/litecoin-ltc-3d-icon-png-download-11442747.png" 
    alt="LTC" 
    width={size} 
    height={size}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

// Маппинг всех криптовалютных иконок
export const CryptoIcons = {
  TON: TonCoin,
  BTC: BtcIcon,
  ETH: EthIcon,
  SOL: SolIcon,
  BNB: BnbIcon,
  XRP: XrpIcon,
  DOGE: DogeIcon,
  ADA: AdaIcon,
  AVAX: AvaxIcon,
  MATIC: MaticIcon,
  LINK: LinkIcon,
  ATOM: AtomIcon,
  UNI: UniIcon,
  LTC: LtcIcon,
  USDT: UsdtIcon,
};

// Функция для получения иконки криптовалюты
export const getCryptoIcon = (symbol: string, size = 20) => {
  const IconComponent = CryptoIcons[symbol as keyof typeof CryptoIcons];
  return IconComponent ? (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent size={size} />
    </div>
  ) : (
    <GenericCoin color="#666" letter={symbol.charAt(0)} size={size} />
  );
};

// Generic Coin for expanded list
export const GenericCoin = ({ color, letter, size = 20 }: { color: string, letter: string, size?: number }) => (
  <div 
    style={{ 
      backgroundColor: color, 
      width: size, 
      height: size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>{letter}</span>
  </div>
);

export const ClapperboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <path d="M7 3v18" />
    <path d="M3 7.5h4" />
    <path d="M3 12h18" />
    <path d="M3 16.5h4" />
    <path d="M17 3v18" />
    <path d="M17 7.5h4" />
    <path d="M17 16.5h4" />
  </svg>
);

export const TrophyIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const WalletIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

export const ChartIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const UserIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const CoinsIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);