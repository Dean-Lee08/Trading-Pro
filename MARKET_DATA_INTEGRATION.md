# Alpha Vantage Market Data Integration

## Overview
The Trading Platform Pro now integrates with Alpha Vantage API to provide real-time market data for your traded symbols. This enhancement allows you to see market context for your trades, including how your entry and exit prices compared to the market's daily range.

## Features

### 1. **Symbol Quotes**
- Real-time price information for all traded symbols
- Current price, day change, and volume
- Daily high, low, open prices
- Your personal trading statistics for each symbol (win rate, total P/L, trade count)

### 2. **Price Context Analysis**
- See where your buy and sell prices fell within the day's market range
- Entry and exit position as percentage of daily range
- Market high/low/open/close data for context
- Visual comparison of your trade execution against market movement

### 3. **Smart Caching**
- All market data is cached locally to minimize API calls
- 5-minute cache duration for fresh data
- Respects API rate limits (5 calls/minute, 25 calls/day)

## Setup Instructions

### Step 1: Get Your API Key
Your API key is already included: `XLAZ5MW6NTMVPLKE`

If you need a new key:
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Copy your API key

### Step 2: Configure API Key (Optional)
1. Open the application
2. Navigate to **Settings** page
3. Find the "API Key Settings" section
4. Enter your Alpha Vantage API key
5. Click "Save API Key"

The default key is already configured, so this step is optional unless you want to use your own key.

### Step 3: View Market Data
1. Navigate to **Analytics** page
2. Click the **Market Data** tab
3. Click **Refresh Quotes** to load current market data
4. View:
   - Symbol quote cards with live prices
   - Price context analysis for recent trades

## API Rate Limits

Alpha Vantage Free Tier:
- **5 API calls per minute**
- **25 API calls per day**

The application automatically:
- Limits queries to 5 symbols at once
- Adds 12-second delays between calls
- Caches all data to minimize API usage
- Shows only the 3 most recent trades for price context

## Features Explained

### Symbol Quote Card
Each traded symbol displays:
- **Current Price**: Latest market price
- **Day Change**: Price change and percentage from previous close
- **Open/High/Low**: Daily price range
- **Volume**: Trading volume (in millions)
- **Your Stats**: Your personal win rate and total P/L for this symbol

### Price Context Analysis
For each analyzed trade, you'll see:
- **Market Range**: The day's high and low prices
- **Entry Position**: Where your buy price fell in the range (0-100%)
  - Low % = bought near the low (good for long trades)
  - High % = bought near the high (potentially worse entry)
- **Exit Position**: Where your sell price fell in the range (0-100%)
  - High % = sold near the high (good for long trades)
  - Low % = sold near the low (potentially early exit)

### Example Interpretation
```
Symbol: AAPL
Date: 2025-01-15
Market Range: $180.00 - $185.00

Entry Position: 20% of range
Exit Position: 85% of range
```

This means:
- You bought at $181.00 (near the daily low - good entry!)
- You sold at $184.25 (near the daily high - excellent exit!)
- You captured most of the day's price movement

## Cache Management

### View Cache Status
Cache data is stored in browser localStorage with:
- Symbol quotes (5-minute expiration)
- Price context data (5-minute expiration)

### Clear Cache
1. Go to Settings
2. Click "Clear Market Data Cache"
3. Confirm the action

This will force fresh API calls on next data load.

## Troubleshooting

### "API rate limit exceeded" Error
**Cause**: Too many API calls in a short time
**Solution**:
- Wait 1 minute before trying again
- Clear cache and reload less frequently
- Reduce number of symbols being tracked

### "Failed to load market data" Error
**Cause**: Network issue or invalid API key
**Solution**:
- Check internet connection
- Verify API key in Settings
- Try refreshing after a few minutes

### No Data Showing
**Cause**: No trades recorded yet, or symbol not found
**Solution**:
- Make sure you have recorded trades
- Verify symbol tickers are correct (e.g., "AAPL" not "Apple")
- Check that symbols are valid US stock tickers

## Data Privacy

All market data is:
- Fetched directly from Alpha Vantage
- Cached locally in your browser
- Never sent to any third-party servers
- Deleted when you clear browser data

## Advanced Features (Future)

Planned enhancements:
- Intraday charts with entry/exit markers
- Symbol comparison charts
- Performance attribution analysis
- Market benchmark comparisons (SPY, QQQ)

## Support

For issues or questions:
- Check API key is valid
- Verify symbols are US stocks (Alpha Vantage supports US markets)
- Ensure you haven't exceeded daily API limits
- Clear cache and try again

## API Documentation

For more information about Alpha Vantage API:
- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [API Support](https://www.alphavantage.co/support/)

---

**Note**: This integration requires an active internet connection to fetch market data. Offline mode will continue to work with your trade data, but market context features will be unavailable.
