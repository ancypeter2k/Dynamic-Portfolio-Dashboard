// Type definitions for portfolio data structures

export interface StockData {
  name: string;
  qty: number;
  purchasePrice: number;
  investment: number;
  portfolioPercent: number;
  exchange: 'NSE' | 'BSE';
  symbol: string;
  sector: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number;
  earnings: number;
}

export interface ExcelRow {
  [key: string]: string | number | undefined;
  __EMPTY_1?: string; // Stock Name
  __EMPTY_2?: number; // Purchase Price
  __EMPTY_3?: number; // Qty
  __EMPTY_5?: string; // Sector (alternative)
  __EMPTY_6?: string; // Symbol
  __EMPTY_7?: string; // Sector
}

export interface PieChartData {
  name: string;
  value: number;
  investment: number;
  percent: number;
  color: string;
}

export interface LineChartData {
  name: string;
  fullName: string;
  value: number;
  isGain: boolean;
}

export interface ChartResponse {
  pieChart: PieChartData[];
  lineChart: LineChartData[];
}

export interface SummaryResponse {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGain: number;
  totalLoss: number;
  totalRevenue: number;
  overallReturn: number;
  isGain: boolean;
}

export interface SectorData {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  count: number;
  returnPercent: number;
}

export interface SectorMap {
  [key: string]: {
    investment: number;
    presentValue: number;
    gainLoss: number;
    count: number;
  };
}

export interface FundamentalsResponse {
  peRatio: string | number;
  earnings: string | number;
}

