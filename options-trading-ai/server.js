import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Yahoo Finance scraping endpoint
app.get('/api/research/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const yahooUrl = `https://finance.yahoo.com/quote/${symbol}`;

    // Fetch the main page
    const response = await axios.get(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Extract basic company info
    const companyName = $('h1[data-reactroot]').text() || $('h1').first().text() || symbol;
    const currentPrice = $('fin-streamer[data-field="regularMarketPrice"]').first().attr('data-value') ||
                        $('span[data-reactroot]').filter((i, el) => $(el).text().match(/^\d+\.\d+$/)).first().text();

    // Market position analysis
    const marketCap = $('td[data-test="MARKET_CAP-value"]').text() || 'N/A';
    const peRatio = $('td[data-test="PE_RATIO-value"]').text() || 'N/A';
    const beta = $('td[data-test="BETA_5Y-value"]').text() || 'N/A';

    // Financials
    const revenue = $('td[data-test="TOTAL_REVENUE-value"]').text() || 'N/A';
    const netIncome = $('td[data-test="NET_INCOME-value"]').text() || 'N/A';
    const eps = $('td[data-test="EPS_RATIO-value"]').text() || 'N/A';

    // Technical analysis (simplified)
    const fiftyDayMA = $('td[data-test="FIFTY_DAY_AVG-value"]').text() || 'N/A';
    const twoHundredDayMA = $('td[data-test="TWO_HUNDRED_DAY_AVG-value"]').text() || 'N/A';

    // Options data
    const optionsUrl = `https://finance.yahoo.com/quote/${symbol}/options`;
    let optionsData = null;
    try {
      const optionsResponse = await axios.get(optionsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $options = cheerio.load(optionsResponse.data);
      const openInterest = $options('td[data-col="OPEN_INTEREST"]').first().text() || 'N/A';
      optionsData = { openInterest };
    } catch (error) {
      console.log('Options data not available');
    }

    // News (simplified)
    const newsItems = [];
    $('h3 a[href*="/news/"]').each((i, el) => {
      if (i < 3) { // Get first 3 news items
        newsItems.push($(el).text().trim());
      }
    });

    // Calculate ratings (simplified equal weighting system)
    const calculateRating = (data) => {
      let score = 0;
      let factors = 0;

      // Market position factors
      if (marketCap !== 'N/A') {
        const capValue = parseFloat(marketCap.replace(/[^0-9.]/g, ''));
        if (capValue > 10000000000) score += 1; // Large cap
        factors++;
      }

      // Financial health
      if (peRatio !== 'N/A') {
        const pe = parseFloat(peRatio);
        if (pe > 0 && pe < 25) score += 1;
        factors++;
      }

      // Technical strength
      if (currentPrice && fiftyDayMA !== 'N/A') {
        const price = parseFloat(currentPrice);
        const ma50 = parseFloat(fiftyDayMA.replace(/[^0-9.]/g, ''));
        if (price > ma50) score += 1;
        factors++;
      }

      // Options liquidity
      if (optionsData && optionsData.openInterest !== 'N/A') {
        const oi = parseInt(optionsData.openInterest.replace(/[^0-9]/g, ''));
        if (oi > 1000) score += 1;
        factors++;
      }

      // News sentiment (simplified)
      if (newsItems.length > 0) score += 1;
      factors++;

      return factors > 0 ? Math.min(5, Math.max(1, Math.round((score / factors) * 5))) : 3;
    };

    const overallRating = calculateRating({
      marketCap, peRatio, currentPrice, fiftyDayMA, optionsData, newsItems
    });

    // Structure the response
    const research = {
      symbol: symbol.toUpperCase(),
      companyName,
      currentPrice: currentPrice ? parseFloat(currentPrice) : null,
      marketPosition: {
        rating: overallRating,
        summary: `${companyName} shows ${overallRating >= 4 ? 'strong' : overallRating >= 3 ? 'moderate' : 'weak'} market positioning.`,
        details: [
          `Market Cap: ${marketCap}`,
          `P/E Ratio: ${peRatio}`,
          `Beta: ${beta}`
        ]
      },
      financials: {
        rating: overallRating,
        summary: `Financial metrics indicate ${overallRating >= 4 ? 'healthy' : overallRating >= 3 ? 'stable' : 'concerning'} performance.`,
        details: [
          `Revenue: ${revenue}`,
          `Net Income: ${netIncome}`,
          `EPS: ${eps}`
        ]
      },
      technical: {
        rating: overallRating,
        summary: `Technical indicators suggest ${overallRating >= 4 ? 'bullish' : overallRating >= 3 ? 'neutral' : 'bearish'} momentum.`,
        details: [
          `Current Price: ${currentPrice}`,
          `50-Day MA: ${fiftyDayMA}`,
          `200-Day MA: ${twoHundredDayMA}`
        ]
      },
      options: {
        rating: optionsData ? (overallRating >= 3 ? 4 : 3) : 2,
        summary: optionsData ? 'Options market shows reasonable liquidity.' : 'Limited options data available.',
        details: optionsData ? [
          `Open Interest: ${optionsData.openInterest}`
        ] : ['Options data not available']
      },
      news: {
        rating: newsItems.length > 0 ? 4 : 2,
        summary: newsItems.length > 0 ? 'Recent news coverage available.' : 'Limited recent news.',
        details: newsItems.length > 0 ? newsItems : ['No recent news available']
      }
    };

    res.json(research);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Failed to fetch company data',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Options Trading AI proxy server running on port ${PORT}`);
});