import axios, { AxiosResponse } from 'axios';
import { FundamentalsResponse } from '../types';

interface YahooQuoteSummaryResponse {
  quoteSummary?: {
    result?: Array<{
      defaultKeyStatistics?: {
        trailingPE?: { raw?: number };
        trailingEps?: { raw?: number };
      };
      financialData?: {
        trailingPE?: { raw?: number };
        earningsPerShare?: { raw?: number };
      };
    }>;
  };
}

// Fetches basic fundamentals (P/E and Earnings info) for a symbol.
// Falls back to safe values when the API doesn't return usable data.
export async function getFundamentals(symbol: string): Promise<FundamentalsResponse> {
  try {
    if (!symbol) {
      return { peRatio: 'N/A', earnings: 'N/A' };
    }

    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=defaultKeyStatistics,financialData`;
    const res: AxiosResponse<YahooQuoteSummaryResponse> = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const result = res.data?.quoteSummary?.result?.[0] || {};

    const pe = result.defaultKeyStatistics?.trailingPE?.raw ?? result.financialData?.trailingPE?.raw ?? null;
    // Try a few fields for earnings; fallback to 'N/A'
    const eps = result.defaultKeyStatistics?.trailingEps?.raw ?? result.financialData?.earningsPerShare?.raw ?? null;

    const peRatio = pe != null ? Number(pe).toFixed(2) : 'N/A';
    const earnings = eps != null ? `₹ ${Number(eps).toFixed(2)}` : 'N/A';

    return { peRatio, earnings };
  } catch (err: any) {
    // If anything goes wrong, return safe fallback values
    console.error(`getFundamentals error for ${symbol}:`, err.message || err);
    return { peRatio: 'N/A', earnings: 'N/A' };
  }
}

