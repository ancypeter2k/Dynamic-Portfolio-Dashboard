import express, { Request, Response, Router } from 'express';
import { readExcel } from '../utils/readExcel';
import { getCMP } from '../services/yahooService';
import { getFundamentals } from '../services/googleService';
import {
  StockData,
  ExcelRow,
  ChartResponse,
  SummaryResponse,
  SectorData,
  SectorMap
} from '../types';

const router: Router = express.Router();

// Helper function to fetch and enrich portfolio data
async function getEnrichedPortfolioData(): Promise<StockData[]> {
  const stocks = readExcel();
  let totalInvestment = 0;

  // Filter out header rows and sector rows, only process actual stock data
  const validStocks = stocks.filter((stock: ExcelRow) => {
    const stockName = stock['__EMPTY_1'];
    return (
      stockName &&
      stockName !== 'Particulars' &&
      stockName !== 'Financial Sector' &&
      typeof stock['__EMPTY_4'] === 'number' && // Investment column
      stock['__EMPTY_4'] > 0 // Must have investment value
    );
  });

  const enriched = await Promise.all(
    validStocks.map(async (stock: ExcelRow): Promise<StockData> => {
      try {
        const stockName = (stock['__EMPTY_1'] as string) || '';
        const purchasePrice = (stock['__EMPTY_2'] as number) || 0;
        const qty = (stock['__EMPTY_3'] as number) || 0;
        // Use Investment directly from Excel (__EMPTY_4)
        const investment = (stock['__EMPTY_4'] as number) || 0;
        // Use Present Value directly from Excel (__EMPTY_8)
        const presentValue = (stock['__EMPTY_8'] as number) || 0;
        // Use Gain/Loss directly from Excel (__EMPTY_9)
        const gainLoss = (stock['__EMPTY_9'] as number) || 0;
        // Use CMP from Excel (__EMPTY_7) - handle both number and string
        const cmpValue = stock['__EMPTY_7'];
        const cmp = typeof cmpValue === 'number' ? cmpValue : (typeof cmpValue === 'string' ? parseFloat(cmpValue) || 0 : 0);
        
        totalInvestment += investment;

        // Convert symbol to string in case it's a number
        const symbol = String(stock['__EMPTY_6'] || '').trim();
        const sector = String(stock['__EMPTY_7'] || stock['__EMPTY_5'] || '').trim();
        
        // Get P/E and Earnings from Excel if available, otherwise try API
        let peRatioNum = (stock['__EMPTY_12'] as number) || 0; // P/E (TTM)
        let earningsNum = (stock['__EMPTY_13'] as number) || 0; // Latest Earnings
        
        // If not in Excel, try API
        if (peRatioNum === 0 || earningsNum === 0) {
          let symbolForAPI = symbol;
          if (symbol && typeof symbol === 'string' && symbol.length > 0 && !symbol.includes('.')) {
            symbolForAPI = `${symbol}.NS`;
          }
          
          if (symbolForAPI && symbolForAPI.length > 0) {
            try {
              const { peRatio, earnings } = await getFundamentals(symbolForAPI);
              
              if (peRatioNum === 0) {
                if (typeof peRatio === 'string') {
                  peRatioNum = peRatio === 'N/A' ? 0 : parseFloat(peRatio) || 0;
                } else {
                  peRatioNum = peRatio || 0;
                }
              }
              
              if (earningsNum === 0) {
                if (typeof earnings === 'string') {
                  if (earnings !== 'N/A') {
                    const cleaned = earnings.replace(/[₹\s]/g, '');
                    earningsNum = parseFloat(cleaned) || 0;
                  }
                } else {
                  earningsNum = earnings || 0;
                }
              }
            } catch (apiErr) {
              // Keep Excel values if API fails
              console.error(`API error for ${symbolForAPI}:`, apiErr);
            }
          }
        }

        return {
          name: stockName,
          qty: qty,
          purchasePrice: purchasePrice,
          investment,
          portfolioPercent: 0, // Will be calculated later
          exchange: 'NSE',
          symbol: symbol,
          sector: sector,
          cmp,
          presentValue,
          gainLoss, // Use Gain/Loss directly from Excel
          peRatio: peRatioNum,
          earnings: earningsNum
        };
      } catch (stockErr: any) {
        console.error(`Error processing stock ${stock['__EMPTY_1']}:`, stockErr.message);
        const investment = (stock['__EMPTY_4'] as number) || 0;
        const presentValue = (stock['__EMPTY_8'] as number) || 0;
        const gainLoss = (stock['__EMPTY_9'] as number) || 0;
        totalInvestment += investment;
        const symbol = String(stock['__EMPTY_6'] || '').trim();
        const sector = String(stock['__EMPTY_7'] || stock['__EMPTY_5'] || '').trim();
        return {
          name: (stock['__EMPTY_1'] as string) || '',
          qty: (stock['__EMPTY_3'] as number) || 0,
          purchasePrice: (stock['__EMPTY_2'] as number) || 0,
          investment,
          portfolioPercent: 0,
          exchange: 'NSE',
          symbol: symbol,
          sector: sector,
          cmp: typeof stock['__EMPTY_7'] === 'number' ? stock['__EMPTY_7'] : 0,
          presentValue,
          gainLoss,
          peRatio: (stock['__EMPTY_12'] as number) || 0,
          earnings: (stock['__EMPTY_13'] as number) || 0
        };
      }
    })
  );

  enriched.forEach((s) => {
    s.portfolioPercent =
      totalInvestment > 0 ? parseFloat(((s.investment / totalInvestment) * 100).toFixed(2)) : 0;
    // peRatio and earnings are already converted to numbers above
  });

  return enriched;
}

// Main portfolio endpoint (kept for backward compatibility)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const enriched = await getEnrichedPortfolioData();
    res.json(enriched);
  } catch (err: any) {
    console.error('Portfolio route error:', err);
    res.status(500).json({ error: 'Failed to load portfolio', details: err.message });
  }
});

// Portfolio Charts API - Returns data for pie chart and line chart
router.get('/charts', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getEnrichedPortfolioData();

    // Top 8 stocks by investment (for pie chart)
    const topStocks = [...data]
      .sort((a, b) => (b.investment || 0) - (a.investment || 0))
      .slice(0, 8)
      .map((stock, index) => ({
        name: stock.name,
        value: stock.investment || 0,
        investment: stock.investment || 0,
        color: [
          '#3B82F6',
          '#8B5CF6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#06B6D4',
          '#EC4899',
          '#84CC16'
        ][index % 8]
      }));

    const topSum = topStocks.reduce((s, st) => s + (st.investment || 0), 0);
    const pieChartData = topStocks.map((stock) => ({
      ...stock,
      percent: topSum > 0 ? stock.investment / topSum : 0
    }));

    // Top 5 stocks by absolute gain/loss (for line chart)
    // Show mix of top gains and top losses for better visualization
    const sortedByAbsolute = [...data].sort((a, b) => Math.abs(b.gainLoss || 0) - Math.abs(a.gainLoss || 0));
    
    // Separate gains and losses
    const gains = sortedByAbsolute.filter(s => (s.gainLoss || 0) > 0).slice(0, 3);
    const losses = sortedByAbsolute.filter(s => (s.gainLoss || 0) < 0).slice(0, 3);
    
    // Combine: prefer showing both gains and losses, but if one is missing, show top absolute values
    let gainLossData: Array<{ name: string; fullName: string; value: number; isGain: boolean }>;
    
    if (gains.length > 0 && losses.length > 0) {
      // Mix of gains and losses
      gainLossData = [...gains, ...losses]
        .sort((a, b) => Math.abs(b.gainLoss || 0) - Math.abs(a.gainLoss || 0))
        .slice(0, 5)
        .map((stock) => ({
          name: stock.name.length > 12 ? stock.name.substring(0, 12) + '...' : stock.name,
          fullName: stock.name,
          value: stock.gainLoss || 0,
          isGain: (stock.gainLoss || 0) > 0
        }));
    } else {
      // Fallback to top 5 absolute values (all gains or all losses)
      gainLossData = sortedByAbsolute
        .slice(0, 5)
        .map((stock) => ({
          name: stock.name.length > 12 ? stock.name.substring(0, 12) + '...' : stock.name,
          fullName: stock.name,
          value: stock.gainLoss || 0,
          isGain: (stock.gainLoss || 0) > 0
        }));
    }

    const response: ChartResponse = {
      pieChart: pieChartData,
      lineChart: gainLossData
    };

    res.json(response);
  } catch (err: any) {
    console.error('Portfolio charts route error:', err);
    res.status(500).json({ error: 'Failed to load chart data', details: err.message });
  }
});

// Portfolio Table API - Returns table data with optional filtering
router.get('/table', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getEnrichedPortfolioData();
    const { search, exchange, status } = req.query;

    let filtered = [...data];

    // Apply filters
    if (search) {
      const searchLower = search.toString().toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.name?.toLowerCase().includes(searchLower) ||
          stock.symbol?.toLowerCase().includes(searchLower)
      );
    }

    if (exchange && exchange !== 'All Exchanges') {
      filtered = filtered.filter((stock) => stock.exchange === exchange);
    }

    if (status && status !== 'All Statuses') {
      if (status === 'Gain') {
        filtered = filtered.filter((stock) => (stock.gainLoss || 0) > 0);
      } else if (status === 'Loss') {
        filtered = filtered.filter((stock) => (stock.gainLoss || 0) < 0);
      } else if (status === 'Neutral') {
        filtered = filtered.filter((stock) => (stock.gainLoss || 0) === 0);
      }
    }

    res.json(filtered);
  } catch (err: any) {
    console.error('Portfolio table route error:', err);
    res.status(500).json({ error: 'Failed to load table data', details: err.message });
  }
});

// Summary Cards API - Returns aggregated summary data
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getEnrichedPortfolioData();

    const summary = data.reduce(
      (acc, stock) => {
        const investment = stock.investment || 0;
        const presentValue = stock.presentValue || 0;
        const gainLoss = stock.gainLoss || 0;

        acc.totalInvestment += investment;
        acc.currentValue += presentValue;
        acc.totalGainLoss += gainLoss;

        // Separate gains and losses: if < 0 then loss, else profit
        if (gainLoss < 0) {
          acc.totalLoss += Math.abs(gainLoss); // Loss (store as positive for display)
        } else if (gainLoss > 0) {
          acc.totalGain += gainLoss; // Profit (positive value)
        }
        // If gainLoss === 0, neither profit nor loss

        return acc;
      },
      { totalInvestment: 0, currentValue: 0, totalGainLoss: 0, totalGain: 0, totalLoss: 0, totalRevenue: 0 }
    );
    
    // Calculate total revenue from the enriched data
    // We need to read the original Excel to get revenue data
    const stocks = readExcel();
    const validStocksForRevenue = stocks.filter((stock: ExcelRow) => {
      const stockName = stock['__EMPTY_1'];
      return (
        stockName &&
        stockName !== 'Particulars' &&
        stockName !== 'Financial Sector' &&
        stock['Core Fundamentals'] !== undefined &&
        typeof stock['Core Fundamentals'] === 'number'
      );
    });
    
    summary.totalRevenue = validStocksForRevenue.reduce((sum, stock) => {
      const revenue = stock['Core Fundamentals'] as number;
      return sum + (revenue || 0);
    }, 0);

    // Calculate overall return: (Total Gain/Loss / Total Investment) * 100
    const overallReturn =
      summary.totalInvestment > 0
        ? parseFloat(((summary.totalGainLoss / summary.totalInvestment) * 100).toFixed(2))
        : 0;

    const response: SummaryResponse = {
      totalInvestment: summary.totalInvestment,
      currentValue: summary.currentValue,
      totalGainLoss: summary.totalGainLoss,
      totalGain: summary.totalGain,
      totalLoss: summary.totalLoss,
      totalRevenue: summary.totalRevenue,
      overallReturn: overallReturn,
      isGain: summary.totalGainLoss > 0 // Only true if net gain (greater than 0)
    };

    res.json(response);
  } catch (err: any) {
    console.error('Portfolio summary route error:', err);
    res.status(500).json({ error: 'Failed to load summary data', details: err.message });
  }
});

// Sector Summary API - Returns sector-wise aggregated data
router.get('/sectors', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getEnrichedPortfolioData();

    const sectorMap: SectorMap = {};

    data.forEach((stock) => {
      const sector = stock.sector || 'Other';
      if (!sectorMap[sector]) {
        sectorMap[sector] = { investment: 0, presentValue: 0, gainLoss: 0, count: 0 };
      }
      sectorMap[sector].investment += stock.investment || 0;
      sectorMap[sector].presentValue += stock.presentValue || 0;
      sectorMap[sector].gainLoss += stock.gainLoss || 0;
      sectorMap[sector].count += 1;
    });

    const sectorData: SectorData[] = Object.entries(sectorMap)
      .map(([sector, values]) => ({
        sector,
        investment: values.investment,
        presentValue: values.presentValue,
        gainLoss: values.gainLoss,
        count: values.count,
        returnPercent:
          values.investment > 0
            ? parseFloat(((values.gainLoss / values.investment) * 100).toFixed(2))
            : 0
      }))
      .sort((a, b) => b.investment - a.investment);

    res.json(sectorData);
  } catch (err: any) {
    console.error('Portfolio sectors route error:', err);
    res.status(500).json({ error: 'Failed to load sector data', details: err.message });
  }
});

export default router;

