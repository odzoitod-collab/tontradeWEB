import React, { useRef, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import HeroSection from './components/HeroSection';
import TasksSheet from './components/TasksSheet';
import BottomNavigation from './components/BottomNavigation';
import TradingPage from './components/TradingPage';
import WalletPage from './components/WalletPage';
import AccountPage from './components/AccountPage';
import type { ActiveDeal, Transaction, DbUser, DbSettings, DbTrade } from './types';

// ==========================================
// ⚙️ КОНФИГУРАЦИЯ
// ==========================================
// Все взаимодействие через Supabase - не нужен прямой API бота

// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string; // Аватарка пользователя
            language_code?: string;
          };
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [hideNavigation, setHideNavigation] = useState(false);
  
  // --- Global State from DB ---
  const [user, setUser] = useState<DbUser | null>(null);
  const [settings, setSettings] = useState<DbSettings>({ 
    support_username: 'etoooroSupport_Official', 
    bank_details: 'Загрузка...' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- Local Game State ---
  const [activeDeals, setActiveDeals] = useState<ActiveDeal[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (index: number) => {
    if (containerRef.current) {
        const height = window.innerHeight;
        containerRef.current.scrollTo({
            top: index * height,
            behavior: 'smooth'
        });
    }
  };

  // --- 1. Auth & Initial Data Fetch ---
  useEffect(() => {
    const initApp = async () => {
      // 1. Get Telegram User Data
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      let tgId = tgUser?.id;
      
      // Fallback: читаем tgid из URL (передаётся ботом)
      if (!tgId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTgId = urlParams.get('tgid');
        if (urlTgId && !isNaN(Number(urlTgId))) {
          tgId = Number(urlTgId);
          console.log("Using tgid from URL:", tgId);
        }
      }
      
      // Последний fallback только для локальной разработки
      if (!tgId) {
        console.warn("Telegram WebApp not detected and no tgid in URL. Using Dev ID: 12345");
        tgId = 12345; 
      }
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }

      console.log("Authenticating User ID:", tgId);
      console.log("TG User Data:", tgUser);

      // 2. Fetch or Create User
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', tgId)
        .single();

      console.log("Fetch result:", { existingUser, fetchError });

      if (fetchError) {
        // PGRST116 is "Row not found", which is expected for new users.
        if (fetchError.code !== 'PGRST116') {
             console.error('Error fetching user:', JSON.stringify(fetchError, null, 2));
        }
      }

      if (existingUser) {
        // Обновляем photo_url если оно изменилось
        const photoUrl = tgUser?.photo_url;
        if (photoUrl && photoUrl !== existingUser.photo_url) {
          await supabase
            .from('users')
            .update({ photo_url: photoUrl })
            .eq('user_id', tgId);
          setUser({ ...existingUser, photo_url: photoUrl });
        } else {
          setUser(existingUser);
        }
      } else {
        // Auto-register with Full Data
        console.log("Registering new user...");
        
        // Handle Start Param (Referrer)
        const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
        const referrerId = startParam && !isNaN(Number(startParam)) && Number(startParam) !== tgId 
            ? Number(startParam) 
            : null;

        const fullName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') || 'Unknown';
        const username = tgUser?.username ? `@${tgUser.username}` : null;
        const photoUrl = tgUser?.photo_url || null;

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ 
            user_id: tgId, 
            username: username,
            full_name: fullName,
            referrer_id: referrerId,
            photo_url: photoUrl,
            balance: 0, 
            luck: 'default',
            is_kyc: false,
            web_registered: true, // Mark as Web App registration
            email: '-'
          }])
          .select()
          .single();
        
        if (createError) {
            console.error("Registration error:", JSON.stringify(createError, null, 2));
        }
        if (newUser) {
          setUser(newUser);
        }
      }

      // 3. Fetch Settings (Admin configs)
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsError) {
          console.error("Error fetching settings:", JSON.stringify(settingsError, null, 2));
      }
      
      if (settingsData) setSettings(settingsData);

      // 4. Load Active Trades from DB
      const { data: activeTrades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', tgId)
        .eq('status', 'active');
      
      if (tradesError) {
        console.error("Error fetching trades:", JSON.stringify(tradesError, null, 2));
      }
      
      if (activeTrades && activeTrades.length > 0) {
        // Convert DB trades to ActiveDeal format
        const loadedDeals: ActiveDeal[] = activeTrades.map((t: DbTrade) => ({
          id: t.id,
          pair: t.pair,
          symbol: t.symbol,
          type: t.type,
          amount: t.amount,
          entryPrice: t.entry_price,
          startTime: t.start_time,
          durationSeconds: t.duration_seconds,
          leverage: t.leverage,
          processed: false
        }));
        setActiveDeals(loadedDeals);
        console.log("Loaded active trades:", loadedDeals.length);
      }

      // 5. Load Trade History (completed trades)
      const { data: completedTrades, error: historyError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', tgId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (historyError) {
        console.error("Error fetching history:", JSON.stringify(historyError, null, 2));
      }
      
      if (completedTrades && completedTrades.length > 0) {
        const loadedHistory: Transaction[] = completedTrades.map((t: DbTrade) => ({
          id: t.id,
          type: t.is_winning ? 'win' : 'loss',
          amount: `${t.is_winning ? '+' : '-'}${Math.abs(t.final_pnl || 0).toFixed(2)} USD`,
          amountUsd: `${t.symbol} ${t.type}`,
          asset: t.symbol,
          status: 'completed' as const,
          date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Unknown'
        }));
        setHistory(loadedHistory);
        console.log("Loaded trade history:", loadedHistory.length);
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  // --- 2. Realtime Subscription (Balance Updates from Bot) ---
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${user.user_id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          setUser(payload.new as DbUser);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.user_id]);

  // --- 2.1. Realtime Subscription (Settings Updates from Admin Panel) ---
  useEffect(() => {
    const settingsChannel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
        },
        (payload) => {
          console.log('Settings update received:', payload);
          setSettings(payload.new as DbSettings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  // --- 2.2. Realtime Subscription (Deposit Requests Updates) ---
  useEffect(() => {
    if (!user) return;

    const depositChannel = supabase
      .channel('deposit-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deposit_requests',
          filter: `user_id=eq.${user.user_id}`,
        },
        (payload: any) => {
          console.log('Deposit request update:', payload);
          const request = payload.new;
          
          if (request.status === 'approved') {
            // Обновляем баланс пользователя
            const newBalance = (user.balance || 0) + request.amount_usd;
            setUser(prev => prev ? { ...prev, balance: newBalance } : null);
            
            // Обновляем историю
            setHistory(prev => prev.map(tx => 
              tx.id === request.id.toString() 
                ? { ...tx, status: 'completed' as const, amountUsd: 'Подтверждено ✓', date: 'Зачислено' }
                : tx
            ));
          } else if (request.status === 'rejected') {
            // Обновляем историю
            setHistory(prev => prev.map(tx => 
              tx.id === request.id.toString() 
                ? { ...tx, status: 'completed' as const, amountUsd: 'Отклонено', date: 'Отменено' }
                : tx
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositChannel);
    };
  }, [user?.user_id, user?.balance]);

  // --- 3. Trading Engine Logic (Реалистичная симуляция цены) ---
  // Цена движется импульсивно с резкими скачками, обновление каждые 3-4 секунды
  const getRiggedPrice = (deal: ActiveDeal, currentTime: number) => {
     const elapsed = (currentTime - deal.startTime) / 1000;
     const totalDuration = deal.durationSeconds;
     const progress = Math.min(elapsed / totalDuration, 1); // 0 to 1
     
     const seed = parseInt(deal.id.slice(-5)) || 1;
     
     // --- ОПРЕДЕЛЯЕМ НАПРАВЛЕНИЕ НА ОСНОВЕ LUCK ---
     const luck = user?.luck || 'default';
     
     // Целевое изменение цены к концу сделки (5-12%)
     const minChange = 0.05;
     const maxChange = 0.12;
     const randomFactor = (seed % 100) / 100;
     const targetChangePercent = minChange + (maxChange - minChange) * randomFactor;
     
     let finalDirection = 0;
     
     if (luck === 'win') {
         // Цена идет в пользу пользователя
         finalDirection = deal.type === 'Long' ? 1 : -1;
     } else if (luck === 'lose') {
         // Цена идет против пользователя
         finalDirection = deal.type === 'Long' ? -1 : 1;
     } else {
         // Рандомное направление (50/50)
         finalDirection = seed % 2 === 0 ? 1 : -1;
         if (deal.type === 'Short') finalDirection *= -1;
         if (seed % 3 === 0) finalDirection *= -1;
     }
     
     // --- РЕАЛИСТИЧНОЕ ДВИЖЕНИЕ ЦЕНЫ ---
     
     // Количество "тиков" (обновлений) - каждые 3-4 секунды
     const tickInterval = 3.5; // секунды между обновлениями
     const currentTick = Math.floor(elapsed / tickInterval);
     const tickProgress = (elapsed % tickInterval) / tickInterval;
     
     // Генерируем импульсивные движения для каждого тика
     const getTickMovement = (tickNum: number) => {
         const tickSeed = seed + tickNum * 137; // Уникальный seed для каждого тика
         
         // Случайный импульс от -3% до +3%
         const impulse = ((tickSeed % 600) - 300) / 10000; // -0.03 to 0.03
         
         // Добавляем тренд в нужном направлении
         const trendStrength = 0.015; // 1.5% за тик в среднем
         const trend = finalDirection * trendStrength * (1 + (tickSeed % 50) / 100);
         
         return impulse + trend;
     };
     
     // Суммируем все движения до текущего тика
     let accumulatedChange = 0;
     for (let i = 0; i <= currentTick; i++) {
         accumulatedChange += getTickMovement(i);
     }
     
     // Добавляем плавную интерполяцию к следующему тику
     if (currentTick < Math.floor(totalDuration / tickInterval)) {
         const nextTickMovement = getTickMovement(currentTick + 1);
         accumulatedChange += nextTickMovement * tickProgress * 0.3; // Плавный переход
     }
     
     // Добавляем микро-волатильность (мелкие колебания)
     const microNoise = Math.sin(elapsed * 5 + seed) * 0.001 + 
                        Math.cos(elapsed * 3.7 + seed * 2) * 0.0008;
     
     // Применяем ускорение к концу сделки (цена стремится к целевому значению)
     const endGameFactor = Math.pow(progress, 1.5); // Ускорение в конце
     const targetAdjustment = (targetChangePercent * finalDirection - accumulatedChange) * endGameFactor * 0.3;
     
     const totalChange = accumulatedChange + microNoise + targetAdjustment;
     
     // Ограничиваем максимальное изменение
     const clampedChange = Math.max(-0.15, Math.min(0.15, totalChange));
     
     return deal.entryPrice * (1 + clampedChange);
  };

  // Game Loop - обновление каждые 100ms для плавности, но цена меняется каждые 3-4 сек
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
       const now = Date.now();
       setActiveDeals(prevDeals => {
          let hasChanges = false;
          
          const nextDeals = prevDeals.map(deal => {
             if (deal.processed) return deal;

             const elapsed = (now - deal.startTime) / 1000;
             
             if (elapsed >= deal.durationSeconds) {
                 hasChanges = true;
                 
                 // 1. Calculate Price with Luck Factor
                 const currentPrice = getRiggedPrice(deal, now);
                 
                 // 2. PnL Calc
                 let pnlRatio = 0;
                 if (deal.type === 'Long') {
                     pnlRatio = (currentPrice - deal.entryPrice) / deal.entryPrice;
                 } else {
                     pnlRatio = (deal.entryPrice - currentPrice) / deal.entryPrice;
                 }
                 
                 const rawPnl = pnlRatio * deal.leverage * deal.amount;
                 const payout = Math.max(0, deal.amount + rawPnl);
                 const netProfit = payout - deal.amount;
                 const isWinning = netProfit > 0;

                 // 3. Update DB (Settlement)
                 const newBalance = (user.balance || 0) + payout;
                 
                 // Update Local
                 setUser(prev => prev ? { ...prev, balance: newBalance } : null);

                 // Update Remote - Balance
                 supabase.from('users')
                    .update({ balance: newBalance })
                    .eq('user_id', user.user_id)
                    .then(({ error }) => {
                        if (error) console.error("Settlement error:", JSON.stringify(error, null, 2));
                    });

                 // Update Remote - Trade status
                 supabase.from('trades')
                    .update({ 
                      status: 'completed',
                      final_pnl: netProfit,
                      final_price: currentPrice,
                      is_winning: isWinning
                    })
                    .eq('id', deal.id)
                    .then(({ error }) => {
                        if (error) console.error("Trade close error:", JSON.stringify(error, null, 2));
                    });

                 // Уведомляем воркера о результате сделки
                 notifyWorker({
                   type: 'deal_closed',
                   user_id: user.user_id,
                   symbol: deal.symbol,
                   deal_type: deal.type,
                   amount: deal.amount,
                   pnl: netProfit,
                   is_win: isWinning
                 });

                 // 4. History
                 const newTx: Transaction = {
                     id: deal.id,
                     type: isWinning ? 'win' : 'loss',
                     amount: `${isWinning ? '+' : '-'}${Math.abs(netProfit).toFixed(2)} USD`,
                     amountUsd: `${deal.symbol} ${deal.type}`,
                     asset: deal.symbol,
                     status: 'completed',
                     date: 'Только что'
                 };
                 setHistory(h => [newTx, ...h]);

                 return { 
                    ...deal, 
                    processed: true, 
                    finalPnl: netProfit, 
                    isWinning, 
                    removeAt: now + 3000 
                 };
             }
             return deal;
          });

          const remainingDeals = nextDeals.filter(d => !(d.processed && d.removeAt && now > d.removeAt));
          if (nextDeals.length !== remainingDeals.length) hasChanges = true;
          return hasChanges ? remainingDeals : prevDeals;
       });
    }, 100); 
    return () => clearInterval(interval);
  }, [user]); 

  // --- Handlers ---

  const handleCreateDeal = async (deal: ActiveDeal) => {
      if (!user) return;
      if (user.balance >= deal.amount) {
        // Optimistic Update
        const newBalance = user.balance - deal.amount;
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);
        setActiveDeals(prev => [deal, ...prev]);

        // Sync Margin Deduction to DB
        await supabase.from('users').update({ balance: newBalance }).eq('user_id', user.user_id);

        // Save Trade to DB
        const { error: tradeError } = await supabase.from('trades').insert({
          id: deal.id,
          user_id: user.user_id,
          pair: deal.pair,
          symbol: deal.symbol,
          type: deal.type,
          amount: deal.amount,
          entry_price: deal.entryPrice,
          start_time: deal.startTime,
          duration_seconds: deal.durationSeconds,
          leverage: deal.leverage,
          status: 'active'
        });
        
        if (tradeError) {
          console.error("Error saving trade:", JSON.stringify(tradeError, null, 2));
        }

        // Уведомляем воркера об открытии сделки
        notifyWorker({
          type: 'deal_opened',
          user_id: user.user_id,
          symbol: deal.symbol,
          deal_type: deal.type,
          amount: deal.amount
        });
      }
  };

  const handleDeposit = async (amount: number, method: string) => {
      if (!user) return;
      
      const methodNames: Record<string, string> = {
        'card': 'Банковская карта',
        'crypto': 'Криптовалюта'
      };
      
      // Конвертируем RUB в USD (курс ~95 RUB = 1 USD)
      const amountUsd = amount * 0.0105;
      
      // Создаем запрос на пополнение в БД
      const { data: depositRequest, error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: user.user_id,
          amount_rub: amount,
          amount_usd: amountUsd,
          method: method,
          status: 'pending',
          worker_id: user.referrer_id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating deposit request:', error);
        return;
      }
      
      // UI feedback - показываем в истории
      setHistory(prev => [{
          id: depositRequest.id.toString(),
          type: 'deposit',
          amount: `+${amount.toFixed(0)} RUB`,
          amountUsd: `${methodNames[method]} • Ожидает подтверждения`,
          asset: 'RUB',
          status: 'pending',
          date: 'В обработке'
      }, ...prev]);
      
      // Воркер получит уведомление через Supabase Realtime подписку в боте
  };

  const handleWithdraw = (amount: number) => {
      if (user && user.balance >= amount) {
          const newBalance = user.balance - amount;
          setUser(prev => prev ? { ...prev, balance: newBalance } : null);
          
          supabase.from('users').update({ balance: newBalance }).eq('user_id', user.user_id);

          setHistory(prev => [{
              id: Date.now().toString(),
              type: 'withdraw',
              amount: `-${amount.toFixed(2)} USD`,
              amountUsd: `Request Sent`,
              asset: 'USDT',
              status: 'pending',
              date: 'Just now'
          }, ...prev]);
      }
  };

  if (isLoading) {
      return (
          <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white">
              <div className="w-12 h-12 border-4 border-[#0098EA] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="animate-pulse text-sm font-mono">Connecting to Satellite...</p>
          </div>
      );
  }

  const renderContent = () => {
    switch (currentTab) {
        case 'trading':
            return (
                <TradingPage 
                    activeDeals={activeDeals} 
                    onCreateDeal={handleCreateDeal} 
                    balance={user?.balance || 0}
                    userLuck={user?.luck || 'default'} 
                />
            );
        case 'wallet':
            return (
                <WalletPage 
                    history={history} 
                    balance={user?.balance || 0}
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                    settings={settings}
                    onModalChange={setHideNavigation}
                />
            );
        case 'account':
            return <AccountPage user={user} settings={settings} />;
        case 'home':
        default:
            return (
                <div 
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
                >
                    <section className="h-[100dvh] w-full snap-start shrink-0 relative z-10">
                        <HeroSection 
                            onScrollClick={() => scrollToSection(1)} 
                            balance={user?.balance || 0}
                            userId={user?.user_id}
                            supportLink={`https://t.me/${settings.support_username}`}
                        />
                    </section>
                    <section className="min-h-[100dvh] w-full snap-start shrink-0 relative z-20 -mt-4">
                        <TasksSheet onBackClick={() => scrollToSection(0)} />
                    </section>
                </div>
            );
    }
  };

  return (
    <div className="bg-black h-[100dvh] w-full text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
        {renderContent()}
        {!hideNavigation && <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />}
    </div>
  );
};

export default App;