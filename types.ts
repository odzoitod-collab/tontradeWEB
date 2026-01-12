import React from 'react';

// --- Database Types ---
export interface DbUser {
  user_id: number; // BigInt in SQL
  username?: string;
  full_name?: string;
  referrer_id?: number;
  balance: number;
  worker_min_deposit?: number; // Минимальный депозит воркера
  luck: 'win' | 'lose' | 'default';
  is_kyc: boolean;
  web_registered?: boolean;
  email?: string;
  photo_url?: string; // Аватарка из Telegram
  preferred_currency?: string; // Предпочитаемая валюта (RUB по умолчанию)
  notifications_enabled?: boolean; // Уведомления включены
  withdraw_message_type?: string; // Тип сообщения при выводе
  country_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSettings {
  id?: number;
  support_username: string;
  bank_details: string;
  min_deposit?: number;
  is_tech_work?: boolean;
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

export interface DepositRequest {
  id: number;
  user_id: number;
  worker_id?: number;
  amount_local: number;
  amount_usd: number;
  currency: string;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  processed_at?: string;
}

export interface PromoCode {
  id: number;
  code: string;
  creator_id: number;
  reward_amount: number;
  max_activations: number;
  current_activations: number;
  is_active: boolean;
  description?: string;
  created_at?: string;
  expires_at?: string;
}

export interface CountryBankDetails {
  id: number;
  country_name: string;
  country_code: string;
  currency: string;
  bank_details: string;
  exchange_rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Check {
  id: number;
  check_code: string;
  creator_id: number;
  amount: number;
  max_activations: number;
  current_activations: number;
  is_active: boolean;
  description?: string;
  created_at?: string;
  expires_at?: string;
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