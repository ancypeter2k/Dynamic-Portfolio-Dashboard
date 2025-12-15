export interface StockData {
  name: string;
  symbol: string;
  purchasePrice: number;
  qty: number;
  investment: number;
  portfolioPercent: number;
  exchange: 'NSE' | 'BSE';
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number;
  earnings: number;
  sector: string;
}

export interface FilterState {
  search: string;
  exchange: 'All Exchanges' | 'NSE' | 'BSE';
  status: 'All Statuses' | 'Gain' | 'Loss' | 'Neutral';
}