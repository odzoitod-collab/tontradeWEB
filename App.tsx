import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { notifyRegistration, notifyTrade, notifyWithdraw, showDealResultNotification, notifyDealResult, notifyDeposit } from './utils/notifications';
import { DEFAULT_CURRENCY } from './utils/currency';
import { useAuth } from './hooks/useAuth';
import { initPWA, isStandalone } from './utils/pwa';
import HeroSection from './components/HeroSection';
import TasksSheet from './components/TasksSheet';
import BottomNavigation from './components/BottomNavigation';
import TradingPage from './components/TradingPage';
import WalletPage from './components/WalletPage';
import AccountPage from './components/AccountPage';
import TelegramAuth from './components/TelegramAuth';
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
  
  // --- Используем хук useAuth для управления аутентификацией ---
  const { user, isLoading, showTelegramAuth, setAuthenticatedUser, updateUser, logout, setShowTelegramAuth } = useAuth();
  
  // --- Demo Mode State ---
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(100); // $100 демо баланс
  const [demoDeals, setDemoDeals] = useState<ActiveDeal[]>([]);
  const [demoHistory, setDemoHistory] = useState<Transaction[]>([]);
  
  // --- Global State from DB ---
  const [settings, setSettings] = useState<DbSettings>({ 
    support_username: 'etoooroSupport_Official', 
    bank_details: 'Загрузка...' 
  });

  // --- Local Game State ---
  const [activeDeals, setActiveDeals] = useState<ActiveDeal[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((index: number) => {
    if (containerRef.current) {
        const height = window.innerHeight;
        containerRef.current.scrollTo({
            top: index * height,
            behavior: 'smooth'
        });
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setCurrentTab(tab);
    setHideNavigation(false); // Всегда показываем навигацию при смене вкладки
  }, []);

  // --- PWA Initialization ---
  useEffect(() => {
    // Инициализируем PWA функционал
    initPWA();
    
    // Логируем режим работы
    if (isStandalone()) {
      console.log('📱 Running as PWA/APK');
    } else {
      console.log('🌐 Running in browser');
    }
  }, []);

  // --- Demo Mode Toggle ---
  const toggleDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      // Сбрасываем демо данные при включении
      setDemoBalance(100);
      setDemoDeals([]);
      setDemoHistory([]);
    }
  }, []);

  // --- Demo Mode Deal Handler ---
  const handleCreateDemoDeal = useCallback((deal: ActiveDeal) => {
    if (demoBalance >= deal.amount) {
      setDemoBalance(prev => prev - deal.amount);
      setDemoDeals(prev => [deal, ...prev]);
    }
  }, [demoBalance]);

  // --- Telegram Auth Handler ---
  const handleTelegramAuthSuccess = useCallback((userData: DbUser) => {
    setAuthenticatedUser(userData);
  }, [setAuthenticatedUser]);

  // --- 1. Initial Data Fetch (Settings & User Data) ---
  useEffect(() => {
    const initApp = async () => {
      // Загружаем настройки приложения
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsError) {
        console.error("Error fetching settings:", JSON.stringify(settingsError, null, 2));
      }
      
      if (settingsData) setSettings(settingsData);

      // Если пользователь авторизован, загружаем его данные
      if (user) {
        // Загружаем активные сделки
        const { data: activeTrades, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('status', 'active');
        
        if (tradesError) {
          console.error("Error fetching trades:", JSON.stringify(tradesError, null, 2));
        }
        
        if (activeTrades && activeTrades.length > 0) {
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

        // Загружаем историю сделок
        const { data: completedTrades, error: historyError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.user_id)
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
      }
    };

    initApp();
  }, [user]);

  // --- 2. Realtime Subscription (Balance Updates from Bot) ---
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for user:', user.user_id);

    const channel = supabase
      .channel(`user-${user.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${user.user_id}`,
        },
        (payload) => {
          console.log('🔄 Realtime update received:', payload);
          const newUser = payload.new as DbUser;
          const oldUser = payload.old as DbUser;
          
          // Показываем уведомления о изменениях
          if (newUser.balance !== oldUser.balance) {
            const diff = (newUser.balance || 0) - (oldUser.balance || 0);
            console.log(`💰 Баланс изменен: ${diff > 0 ? '+' : ''}${diff.toFixed(2)} USD`);
            
            // Показываем уведомление пользователю
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Баланс обновлен', {
                  body: `${diff > 0 ? '+' : ''}${diff.toFixed(2)} USD`,
                  icon: '/favicon.ico'
                });
              }
            }
          }
          
          if (newUser.luck !== oldUser.luck) {
            console.log(`🍀 Удача изменена: ${oldUser.luck} → ${newUser.luck}`);
          }
          
          if (newUser.is_kyc !== oldUser.is_kyc) {
            console.log(`🛡️ KYC статус: ${newUser.is_kyc ? 'Включен' : 'Отключен'}`);
          }
          
          updateUser(newUser);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
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
            updateUser(prev => prev ? { ...prev, balance: newBalance } : null);
            
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

  // --- 2.5. Fallback Polling (если Realtime не работает) - оптимизировано ---
  useEffect(() => {
    if (!user) return;

    const pollUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.user_id)
          .single();

        if (error) {
          console.error('Error polling user data:', error);
          return;
        }

        if (data) {
          // Проверяем изменения
          const hasChanges = 
            data.balance !== user.balance ||
            data.luck !== user.luck ||
            data.is_kyc !== user.is_kyc;

          if (hasChanges) {
            console.log('📊 Polling detected changes, updating user data');
            updateUser(data as DbUser);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Увеличено до 5 секунд для снижения нагрузки
    const interval = setInterval(pollUserData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.user_id, user?.balance, user?.luck, user?.is_kyc]);

  // --- 3. Trading Engine Logic (Симуляция цены с изменением 1-3%) ---
  // Цена изменяется на 1-3% в течение времени сделки
  const getRiggedPrice = (deal: ActiveDeal, currentTime: number) => {
     const elapsed = (currentTime - deal.startTime) / 1000;
     const totalDuration = deal.durationSeconds;
     const progress = Math.min(elapsed / totalDuration, 1); // 0 to 1
     
     const seed = parseInt(deal.id.slice(-5)) || 1;
     
     // --- ОПРЕДЕЛЯЕМ НАПРАВЛЕНИЕ НА ОСНОВЕ LUCK ---
     const luck = user?.luck || 'default';
     
     // Целевое изменение цены к концу сделки (1-3%)
     const minChange = 0.01; // 1%
     const maxChange = 0.03; // 3%
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
     }
     
     // --- ПЛАВНОЕ ДВИЖЕНИЕ ЦЕНЫ К ЦЕЛЕВОМУ ЗНАЧЕНИЮ ---
     
     // Используем плавную функцию для достижения целевого изменения
     const smoothProgress = Math.sin(progress * Math.PI / 2); // Плавное ускорение в начале, замедление в конце
     
     // Основное движение к цели
     const mainMovement = finalDirection * targetChangePercent * smoothProgress;
     
     // Добавляем небольшие случайные колебания (не более 0.2%)
     const microNoise = Math.sin(elapsed * 2 + seed) * 0.001 + 
                        Math.cos(elapsed * 1.5 + seed * 2) * 0.0008;
     
     const totalChange = mainMovement + microNoise;
     
     // Ограничиваем изменение в пределах 1-3%
     const clampedChange = Math.max(-0.03, Math.min(0.03, totalChange));
     
     return deal.entryPrice * (1 + clampedChange);
  };

  // Game Loop - оптимизировано: обновление каждые 500ms вместо 100ms для лучшей производительности
  useEffect(() => {
    if (!user || activeDeals.length === 0) return;

    const interval = setInterval(() => {
       try {
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
                   updateUser(prev => prev ? { ...prev, balance: newBalance } : null);

                   // Update Remote - Balance
                   (async () => {
                       try {
                           const { error } = await supabase.from('users')
                               .update({ balance: newBalance })
                               .eq('user_id', user.user_id);
                           
                           if (error) console.error("Settlement error:", JSON.stringify(error, null, 2));
                       } catch (err) {
                           console.error("Settlement error:", err);
                       }
                   })();

                   // Update Remote - Trade status
                   (async () => {
                       try {
                           const { error } = await supabase.from('trades')
                               .update({ 
                                   status: 'completed',
                                   final_pnl: netProfit,
                                   final_price: currentPrice,
                                   is_winning: isWinning
                               })
                               .eq('id', deal.id);
                           
                           if (error) {
                               console.error("Trade close error:", JSON.stringify(error, null, 2));
                           } else {
                               // Показываем push-уведомление пользователю
                               showDealResultNotification(deal.symbol, deal.type, netProfit, isWinning);
                               
                               // Уведомляем воркера о результате
                               notifyDealResult(deal.symbol, deal.type, deal.amount, netProfit, isWinning);
                               
                               // После успешного обновления в БД, обновляем локальную историю
                               const newTx: Transaction = {
                                   id: deal.id,
                                   type: isWinning ? 'win' : 'loss',
                                   amount: `${isWinning ? '+' : '-'}${Math.abs(netProfit).toFixed(2)} USD`,
                                   amountUsd: `${deal.symbol} ${deal.type}`,
                                   asset: deal.symbol,
                                   status: 'completed',
                                   date: 'Только что'
                               };
                               // Проверяем, нет ли уже этой сделки в истории (по ID)
                               setHistory(h => {
                                   const exists = h.some(tx => tx.id === deal.id);
                                   if (!exists) {
                                       console.log(`Adding new trade to history: ${deal.id}`);
                                       return [newTx, ...h];
                                   } else {
                                       console.log(`Trade ${deal.id} already exists in history, skipping`);
                                       return h;
                                   }
                               });
                           }
                       } catch (err) {
                           console.error("Trade close error:", err);
                       }
                   })();

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
       } catch (error) {
         console.error("Game loop error:", error);
       }
    }, 500); // Увеличено с 100ms до 500ms для лучшей производительности
    return () => clearInterval(interval);
  }, [user, activeDeals.length]); 

  // --- Demo Mode Game Loop ---
  useEffect(() => {
    if (!isDemoMode || demoDeals.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setDemoDeals(prevDeals => {
        let hasChanges = false;
        
        const nextDeals = prevDeals.map(deal => {
          if (deal.processed) return deal;

          const elapsed = (now - deal.startTime) / 1000;
          
          if (elapsed >= deal.durationSeconds) {
            hasChanges = true;
            
            // Симуляция цены (50/50 шанс)
            const seed = parseInt(deal.id.slice(-5)) || 1;
            const isWinning = seed % 2 === 0;
            const changePercent = 0.05 + Math.random() * 0.07;
            const direction = isWinning ? (deal.type === 'Long' ? 1 : -1) : (deal.type === 'Long' ? -1 : 1);
            const currentPrice = deal.entryPrice * (1 + direction * changePercent);
            
            let pnlRatio = deal.type === 'Long' 
              ? (currentPrice - deal.entryPrice) / deal.entryPrice 
              : (deal.entryPrice - currentPrice) / deal.entryPrice;
            
            const rawPnl = pnlRatio * deal.leverage * deal.amount;
            const payout = Math.max(0, deal.amount + rawPnl);
            const netProfit = payout - deal.amount;
            const finalIsWinning = netProfit > 0;

            // Обновляем демо баланс
            setDemoBalance(prev => prev + payout);

            // Добавляем в демо историю
            const newTx: Transaction = {
              id: deal.id,
              type: finalIsWinning ? 'win' : 'loss',
              amount: `${finalIsWinning ? '+' : '-'}${Math.abs(netProfit).toFixed(2)} USD`,
              amountUsd: `${deal.symbol} ${deal.type} (DEMO)`,
              asset: deal.symbol,
              status: 'completed',
              date: 'Только что'
            };
            setDemoHistory(h => [newTx, ...h]);

            return { 
              ...deal, 
              processed: true, 
              finalPnl: netProfit, 
              isWinning: finalIsWinning, 
              removeAt: now + 3000 
            };
          }
          return deal;
        });

        const remainingDeals = nextDeals.filter(d => !(d.processed && d.removeAt && now > d.removeAt));
        if (nextDeals.length !== remainingDeals.length) hasChanges = true;
        return hasChanges ? remainingDeals : prevDeals;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isDemoMode, demoDeals.length]);

  // --- Handlers ---

  const handleCreateDeal = async (deal: ActiveDeal) => {
      if (!user) return;
      if (user.balance >= deal.amount) {
        // Optimistic Update
        const newBalance = user.balance - deal.amount;
        updateUser(prev => prev ? { ...prev, balance: newBalance } : null);
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
        } else {
          // Уведомляем воркера об открытии сделки
          notifyTrade(deal.symbol, deal.amount);
        }
      }
  };

  const handleDeposit = async (amount: number, method: string, currency: string) => {
      if (!user) return;
      
      const methodNames: Record<string, string> = {
        'card': 'Банковская карта',
        'crypto': 'Криптовалюта'
      };
      
      // Получаем курс валюты для конвертации в USD
      const currencyRates: Record<string, number> = {
        'RUB': 0.0105,
        'KZT': 0.0022,
        'UZS': 0.000081,
        'KGS': 0.0115,
        'TJS': 0.092,
        'USD': 1.0,
        'EUR': 1.08,
        'USDT': 1.0
      };
      
      const rate = currencyRates[currency] || 0.0105;
      const amountUsd = amount * rate;
      
      // Создаем запрос на пополнение в БД
      const { data: depositRequest, error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: user.user_id,
          amount_local: amount,
          amount_usd: amountUsd,
          currency: currency,
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
          amount: `+${amount.toFixed(0)} ${currency}`,
          amountUsd: `${methodNames[method]} • Ожидает подтверждения`,
          asset: currency,
          status: 'pending',
          date: 'В обработке'
      }, ...prev]);
      
      // Отправляем уведомления
      console.log('📤 Отправка уведомлений о пополнении...');
      
      // Уведомление воркеру (уведомление в канал отправляется из WalletPage)
      await notifyDeposit(amount, currency, methodNames[method]);
      
      console.log('✅ Уведомления о пополнении отправлены');
  };

  const handleWithdraw = (amount: number) => {
      if (user && user.balance >= amount) {
          const newBalance = user.balance - amount;
          updateUser(prev => prev ? { ...prev, balance: newBalance } : null);
          
          supabase.from('users').update({ balance: newBalance }).eq('user_id', user.user_id);

          // Уведомляем воркера о запросе на вывод
          notifyWithdraw(amount);

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
    const userCurrency = user?.preferred_currency || DEFAULT_CURRENCY;
    
    // Выбираем данные в зависимости от режима
    const currentBalance = isDemoMode ? demoBalance : (user?.balance || 0);
    const currentDeals = isDemoMode ? demoDeals : activeDeals;
    const currentHistory = isDemoMode ? demoHistory : history;
    const currentLuck = isDemoMode ? 'default' : (user?.luck || 'default');
    
    switch (currentTab) {
        case 'trading':
            return (
                <TradingPage 
                    activeDeals={currentDeals} 
                    onCreateDeal={isDemoMode ? handleCreateDemoDeal : handleCreateDeal} 
                    balance={currentBalance}
                    userLuck={currentLuck} 
                    onNavigationChange={setHideNavigation}
                    currency={userCurrency}
                    isDemoMode={isDemoMode}
                />
            );
        case 'wallet':
            return (
                <WalletPage 
                    history={currentHistory} 
                    balance={currentBalance}
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                    settings={settings}
                    onModalChange={setHideNavigation}
                    userLuck={currentLuck}
                    isKyc={user?.is_kyc || false}
                    userId={user?.user_id}
                    currency={userCurrency}
                    isDemoMode={isDemoMode}
                />
            );
        case 'account':
            return (
                <AccountPage 
                    user={user} 
                    settings={settings} 
                    isDemoMode={isDemoMode}
                    onDemoModeChange={toggleDemoMode}
                />
            );
        case 'home':
        default:
            return (
                <div 
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <section className="h-[100dvh] w-full snap-start shrink-0 relative z-10">
                        <HeroSection 
                            onScrollClick={() => scrollToSection(1)} 
                            balance={currentBalance}
                            userId={user?.user_id}
                            supportLink={`https://t.me/${settings.support_username}`}
                            currency={userCurrency}
                            isDemoMode={isDemoMode}
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
    <div className="bg-black h-[100dvh] w-full text-white overflow-hidden relative font-sans selection:bg-blue-500/30" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {renderContent()}
        {!hideNavigation && <BottomNavigation currentTab={currentTab} onTabChange={handleTabChange} />}
        
        {/* Telegram Authentication Modal */}
        {showTelegramAuth && (
          <TelegramAuth 
            onAuthSuccess={handleTelegramAuthSuccess}
            onClose={() => setShowTelegramAuth(false)}
          />
        )}
    </div>
  );
};

export default App;
