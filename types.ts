import React from 'react';

// --- Database Types ---
export interface DbUser {
  user_id: number; // BigInt in SQL
  username?: string;
  full_name?: string;
  referrer_id?: number;
  balance: number;
  luck: 'win' | 'lose' | 'default';
  is_kyc: boolean;
  web_registered?: boolean;
  email?: string;
  photo_url?: string; // Аватарка из Telegram
  preferred_currency?: string; // Предпочитаемая валюта (USD, RUB, EUR и т.д.)
  withdraw_message_type?: string; // Тип сообщения при выводе
  created_at?: string;
}

export interface DbSettings {
  id?: number;
  support_username: string;
  bank_details: string;
  min_deposit?: number;
}

export interface CurrencyRate {
  id: number;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  rate_to_usd: number;
  is_active: boolean;
}

export interface WithdrawMessageTemplate {
  id: number;
  message_type: string;
  title: string;
  description: string;
  icon: string;
  button_text?: string;
  is_active: boolean;
  sort_order: number;
}

// --- Database Trade Type ---
export interface DbTrade {
  id: string;
  user_id: number;
  pair: string;
  symbol: string;
  type: 'Long' | 'Short';
  amount: number;
  entry_price: number;
  start_time: number;
  duration_seconds: number;
  leverage: number;
  status: 'active' | 'completed' | 'cancelled';
  final_pnl?: number;
  final_price?: number;
  is_winning?: boolean;
  created_at?: string;
}

// --- App Types ---
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'all' | 'community' | 'market' | 'updates';
  read: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'transfer' | 'win' | 'loss';
  amount: string;
  amountUsd: string;
  asset: string;
  status: 'completed' | 'pending';
  date: string;
}

export interface ActiveDeal {
  id: string;
  pair: string;
  symbol: string;
  type: 'Long' | 'Short';
  amount: number;
  entryPrice: number;
  startTime: number;
  durationSeconds: number;
  leverage: number;
  // State tracking
  processed?: boolean;
  finalPnl?: number;
  isWinning?: boolean;
  removeAt?: number;
}

export interface CryptoPair {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  isFavorite: boolean;
  Icon?: React.FC<any>;
  color?: string;
  letter?: string;
  category?: 'crypto' | 'stocks' | 'nft' | 'commodities';
}