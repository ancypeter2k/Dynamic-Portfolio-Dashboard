import axios, { AxiosResponse } from 'axios';

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: Array<{
      regularMarketPrice?: number;
    }>;
  };
}

export async function getCMP(symbol: string): Promise<number> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    const res: AxiosResponse<YahooQuoteResponse> = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const price = res.data?.quoteResponse?.result?.[0]?.regularMarketPrice;
    return price || 0;
  } catch (error: any) {
    console.error(`Error fetching CMP for ${symbol}:`, error.message);
    return 0;
  }
}

