
export type Language = 'en' | 'zh-CN' | 'zh-TW';

export type Theme = 'light' | 'dark';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export enum MarginMode {
  CROSS = 'CROSS',
  ISOLATED = 'ISOLATED',
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  marginMode: MarginMode;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  status: 'OPEN' | 'FILLED' | 'CANCELED';
  time: string;
}

export interface MarketData {
  symbol: string;
  lastPrice: number;
  markPrice: number;
  indexPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number; // In XAU
  turnover24h: number; // In USDC
  openInterest: number; // In USDC
  fundingRate: number;
  nextFundingTime: number; // timestamp
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type WalletProvider = 'WalletConnect' | 'Metamask' | 'OKX Wallet' | 'Binance Wallet';

export interface AccountInfo {
  totalValue: number;
  unrealizedPnl: number;
  marginRatio: number;
  maintenanceMargin: number;
  marginBalance: number;
  walletBalance: number;
}
