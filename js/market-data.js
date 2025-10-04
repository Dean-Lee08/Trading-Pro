// market-data.js - Alpha Vantage API 통합 및 시장 데이터 관리

// ==================== Alpha Vantage API Configuration ====================

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_RATE_LIMIT = {
    callsPerMinute: 5,
    callsPerDay: 25
};

// ==================== Market Data State ====================

let alphaVantageApiKey = 'XLAZ5MW6NTMVPLKE'; // Default API key
let marketDataCache = {};
let apiCallLog = [];

// ==================== API Call Management ====================

/**
 * API 호출 제한 체크
 */
function canMakeApiCall() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Remove old entries
    apiCallLog = apiCallLog.filter(timestamp => timestamp > oneDayAgo);

    // Check limits
    const callsInLastMinute = apiCallLog.filter(timestamp => timestamp > oneMinuteAgo).length;
    const callsInLastDay = apiCallLog.length;

    if (callsInLastMinute >= API_RATE_LIMIT.callsPerMinute) {
        console.warn('API rate limit: Too many calls per minute');
        return false;
    }

    if (callsInLastDay >= API_RATE_LIMIT.callsPerDay) {
        console.warn('API rate limit: Daily limit reached');
        return false;
    }

    return true;
}

/**
 * API 호출 로그 기록
 */
function logApiCall() {
    apiCallLog.push(Date.now());
    localStorage.setItem('tradingPlatformApiCallLog', JSON.stringify(apiCallLog));
}

/**
 * API 호출 로그 불러오기
 */
function loadApiCallLog() {
    const stored = localStorage.getItem('tradingPlatformApiCallLog');
    if (stored) {
        try {
            apiCallLog = JSON.parse(stored);
            // Clean old entries
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            apiCallLog = apiCallLog.filter(timestamp => timestamp > oneDayAgo);
        } catch (error) {
            console.error('Failed to load API call log:', error);
            apiCallLog = [];
        }
    }
}

// ==================== Market Data Cache Management ====================

/**
 * 캐시에서 데이터 가져오기
 */
function getCachedData(cacheKey) {
    if (marketDataCache[cacheKey]) {
        const cached = marketDataCache[cacheKey];
        const now = Date.now();
        const cacheAge = now - cached.timestamp;
        const maxAge = 5 * 60 * 1000; // 5 minutes cache

        if (cacheAge < maxAge) {
            console.log('Using cached data for:', cacheKey);
            return cached.data;
        }
    }
    return null;
}

/**
 * 캐시에 데이터 저장
 */
function setCachedData(cacheKey, data) {
    marketDataCache[cacheKey] = {
        data: data,
        timestamp: Date.now()
    };

    // Save to localStorage
    try {
        localStorage.setItem('tradingPlatformMarketDataCache', JSON.stringify(marketDataCache));
    } catch (error) {
        console.error('Failed to save market data cache:', error);
    }
}

/**
 * 캐시 불러오기
 */
function loadMarketDataCache() {
    const stored = localStorage.getItem('tradingPlatformMarketDataCache');
    if (stored) {
        try {
            marketDataCache = JSON.parse(stored);
            console.log('Market data cache loaded');
        } catch (error) {
            console.error('Failed to load market data cache:', error);
            marketDataCache = {};
        }
    }
}

/**
 * 캐시 클리어
 */
function clearMarketDataCache() {
    marketDataCache = {};
    localStorage.removeItem('tradingPlatformMarketDataCache');
    console.log('Market data cache cleared');
}

// ==================== Alpha Vantage API Functions ====================

/**
 * Alpha Vantage API 호출 (공통 함수)
 */
async function callAlphaVantageAPI(params) {
    if (!alphaVantageApiKey) {
        throw new Error('Alpha Vantage API key not set');
    }

    if (!canMakeApiCall()) {
        throw new Error('API rate limit exceeded. Please wait before making more requests.');
    }

    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    url.searchParams.append('apikey', alphaVantageApiKey);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    console.log('Calling Alpha Vantage API:', url.toString().replace(alphaVantageApiKey, 'API_KEY'));

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check for API error messages
        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }

        if (data['Note']) {
            // Rate limit message
            throw new Error('API call frequency limit reached. Please wait a minute.');
        }

        logApiCall();
        return data;
    } catch (error) {
        console.error('Alpha Vantage API error:', error);
        throw error;
    }
}

/**
 * 일일 시세 데이터 가져오기 (TIME_SERIES_DAILY)
 */
async function getDailyStockData(symbol, outputsize = 'compact') {
    const cacheKey = `daily_${symbol}_${outputsize}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    const params = {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: outputsize // 'compact' (100 days) or 'full' (20+ years)
    };

    const data = await callAlphaVantageAPI(params);

    if (data['Time Series (Daily)']) {
        setCachedData(cacheKey, data);
        return data;
    } else {
        throw new Error(`Failed to fetch daily data for ${symbol}`);
    }
}

/**
 * 인트라데이 시세 데이터 가져오기 (TIME_SERIES_INTRADAY)
 */
async function getIntradayStockData(symbol, interval = '5min', outputsize = 'compact') {
    const cacheKey = `intraday_${symbol}_${interval}_${outputsize}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    const params = {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval, // '1min', '5min', '15min', '30min', '60min'
        outputsize: outputsize
    };

    const data = await callAlphaVantageAPI(params);

    if (data[`Time Series (${interval})`]) {
        setCachedData(cacheKey, data);
        return data;
    } else {
        throw new Error(`Failed to fetch intraday data for ${symbol}`);
    }
}

/**
 * 종목 개요 정보 가져오기 (OVERVIEW)
 */
async function getStockOverview(symbol) {
    const cacheKey = `overview_${symbol}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    const params = {
        function: 'OVERVIEW',
        symbol: symbol
    };

    const data = await callAlphaVantageAPI(params);

    if (data.Symbol) {
        setCachedData(cacheKey, data);
        return data;
    } else {
        throw new Error(`Failed to fetch overview for ${symbol}`);
    }
}

/**
 * 글로벌 시세 데이터 가져오기 (GLOBAL_QUOTE)
 */
async function getGlobalQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
        return cached;
    }

    const params = {
        function: 'GLOBAL_QUOTE',
        symbol: symbol
    };

    const data = await callAlphaVantageAPI(params);

    if (data['Global Quote']) {
        setCachedData(cacheKey, data);
        return data;
    } else {
        throw new Error(`Failed to fetch quote for ${symbol}`);
    }
}

// ==================== Market Data Analysis Functions ====================

/**
 * 거래의 가격 컨텍스트 분석
 * (매수/매도가가 당일 고가/저가 대비 어느 위치인지)
 */
async function analyzeTradePriceContext(trade) {
    try {
        const dailyData = await getDailyStockData(trade.symbol, 'compact');
        const timeSeries = dailyData['Time Series (Daily)'];

        if (!timeSeries || !timeSeries[trade.date]) {
            return null;
        }

        const dayData = timeSeries[trade.date];
        const high = parseFloat(dayData['2. high']);
        const low = parseFloat(dayData['3. low']);
        const open = parseFloat(dayData['1. open']);
        const close = parseFloat(dayData['4. close']);

        // Calculate entry position in day's range
        const entryPosition = ((trade.buyPrice - low) / (high - low)) * 100;
        const exitPosition = ((trade.sellPrice - low) / (high - low)) * 100;

        return {
            date: trade.date,
            symbol: trade.symbol,
            marketHigh: high,
            marketLow: low,
            marketOpen: open,
            marketClose: close,
            entryPrice: trade.buyPrice,
            exitPrice: trade.sellPrice,
            entryPositionPct: entryPosition, // 0-100%
            exitPositionPct: exitPosition,   // 0-100%
            entryVsOpen: ((trade.buyPrice - open) / open) * 100,
            exitVsClose: ((trade.sellPrice - close) / close) * 100
        };
    } catch (error) {
        console.error(`Failed to analyze price context for ${trade.symbol}:`, error);
        return null;
    }
}

/**
 * 종목별 현재 시세 정보 가져오기
 */
async function getSymbolQuoteInfo(symbol) {
    try {
        const quoteData = await getGlobalQuote(symbol);
        const quote = quoteData['Global Quote'];

        return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'],
            volume: parseInt(quote['06. volume']),
            latestTradingDay: quote['07. latest trading day'],
            previousClose: parseFloat(quote['08. previous close']),
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low'])
        };
    } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error);
        return null;
    }
}

/**
 * 여러 종목의 현재 시세 정보 가져오기 (배치)
 */
async function getMultipleQuotes(symbols) {
    const results = {};

    for (const symbol of symbols) {
        try {
            // Add delay between calls to respect rate limits
            if (Object.keys(results).length > 0) {
                await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds delay (5 calls/min)
            }

            const quote = await getSymbolQuoteInfo(symbol);
            results[symbol] = quote;
        } catch (error) {
            console.error(`Failed to fetch quote for ${symbol}:`, error);
            results[symbol] = null;
        }
    }

    return results;
}

/**
 * 트레이딩한 모든 종목 목록 가져오기
 */
function getTradedSymbols() {
    if (!trades || trades.length === 0) {
        return [];
    }

    const symbols = [...new Set(trades.map(trade => trade.symbol))];
    return symbols.sort();
}

/**
 * 종목별 거래 통계
 */
function getSymbolTradeStats(symbol) {
    const symbolTrades = trades.filter(trade => trade.symbol === symbol);

    if (symbolTrades.length === 0) {
        return null;
    }

    const totalPnL = symbolTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = symbolTrades.filter(trade => trade.pnl > 0).length;
    const losses = symbolTrades.filter(trade => trade.pnl < 0).length;
    const winRate = (wins / symbolTrades.length) * 100;
    const avgPnL = totalPnL / symbolTrades.length;

    return {
        symbol,
        tradeCount: symbolTrades.length,
        totalPnL,
        avgPnL,
        wins,
        losses,
        winRate,
        firstTradeDate: symbolTrades[0].date,
        lastTradeDate: symbolTrades[symbolTrades.length - 1].date
    };
}

/**
 * 종목의 상세 Overview 데이터 가져오기 (파싱된 형태)
 */
async function getSymbolOverviewData(symbol) {
    try {
        const overview = await getStockOverview(symbol);

        return {
            symbol: overview.Symbol,
            name: overview.Name,
            marketCap: parseFloat(overview.MarketCapitalization) || 0,
            sharesFloat: parseFloat(overview.SharesFloat) || 0,
            sharesOutstanding: parseFloat(overview.SharesOutstanding) || 0,
            beta: parseFloat(overview.Beta) || 0,
            peRatio: parseFloat(overview.PERatio) || 0,
            eps: parseFloat(overview.EPS) || 0,
            week52High: parseFloat(overview['52WeekHigh']) || 0,
            week52Low: parseFloat(overview['52WeekLow']) || 0,
            sector: overview.Sector || 'Unknown',
            industry: overview.Industry || 'Unknown',
            description: overview.Description || ''
        };
    } catch (error) {
        console.error(`Failed to get overview data for ${symbol}:`, error);
        return null;
    }
}

/**
 * 여러 종목의 Overview 데이터 배치 조회
 */
async function getMultipleOverviews(symbols, maxSymbols = 5) {
    const results = {};
    const limitedSymbols = symbols.slice(0, maxSymbols);

    for (const symbol of limitedSymbols) {
        try {
            if (Object.keys(results).length > 0) {
                await new Promise(resolve => setTimeout(resolve, 12000)); // 12초 delay
            }

            const overview = await getSymbolOverviewData(symbol);
            results[symbol] = overview;
        } catch (error) {
            console.error(`Failed to fetch overview for ${symbol}:`, error);
            results[symbol] = null;
        }
    }

    return results;
}

/**
 * 승리 거래의 평균 시장 특성 계산
 */
async function analyzeWinningTradesMarketChar(filteredTrades) {
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);

    if (winningTrades.length === 0) {
        return null;
    }

    // 승리 거래 종목 목록
    const winningSymbols = [...new Set(winningTrades.map(trade => trade.symbol))];

    // Overview 데이터 가져오기
    const overviews = await getMultipleOverviews(winningSymbols, 5);

    // 데이터가 있는 것만 필터링
    const validOverviews = Object.values(overviews).filter(o => o !== null);

    if (validOverviews.length === 0) {
        return null;
    }

    // 평균 계산
    const avgFloat = validOverviews.reduce((sum, o) => sum + o.sharesFloat, 0) / validOverviews.length;
    const avgMarketCap = validOverviews.reduce((sum, o) => sum + o.marketCap, 0) / validOverviews.length;
    const avgBeta = validOverviews.reduce((sum, o) => sum + o.beta, 0) / validOverviews.length;

    return {
        avgFloat,
        avgMarketCap,
        avgBeta,
        symbolsAnalyzed: validOverviews.length,
        totalWinningSymbols: winningSymbols.length
    };
}

/**
 * 거래량 기반 성과 분석
 */
async function analyzeVolumePerformance(filteredTrades) {
    const tradesWithVolume = [];

    // 각 거래의 당일 거래량 가져오기
    const symbols = [...new Set(filteredTrades.map(t => t.symbol))].slice(0, 5);

    for (const trade of filteredTrades) {
        if (!symbols.includes(trade.symbol)) continue;

        try {
            const dailyData = await getDailyStockData(trade.symbol, 'compact');
            const timeSeries = dailyData['Time Series (Daily)'];

            if (timeSeries && timeSeries[trade.date]) {
                const volume = parseInt(timeSeries[trade.date]['5. volume']);
                tradesWithVolume.push({
                    ...trade,
                    volume
                });
            }

            // Delay between API calls
            if (filteredTrades.indexOf(trade) < Math.min(filteredTrades.length - 1, 4)) {
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        } catch (error) {
            console.error(`Failed to get volume for ${trade.symbol}:`, error);
        }
    }

    if (tradesWithVolume.length === 0) {
        return null;
    }

    // 거래량으로 정렬
    const sorted = [...tradesWithVolume].sort((a, b) => b.volume - a.volume);
    const median = sorted[Math.floor(sorted.length / 2)].volume;

    const highVolumeTrades = tradesWithVolume.filter(t => t.volume > median);
    const lowVolumeTrades = tradesWithVolume.filter(t => t.volume <= median);

    const highVolumeWins = highVolumeTrades.filter(t => t.pnl > 0).length;
    const highVolumeWinRate = highVolumeTrades.length > 0 ? (highVolumeWins / highVolumeTrades.length) * 100 : 0;

    const lowVolumeWins = lowVolumeTrades.filter(t => t.pnl > 0).length;
    const lowVolumeWinRate = lowVolumeTrades.length > 0 ? (lowVolumeWins / lowVolumeTrades.length) * 100 : 0;

    return {
        highVolumeWinRate,
        lowVolumeWinRate,
        medianVolume: median,
        highVolumeTrades: highVolumeTrades.length,
        lowVolumeTrades: lowVolumeTrades.length
    };
}

/**
 * 변동성(Beta) 기반 성과 분석
 */
async function analyzeVolatilityPerformance(filteredTrades) {
    const symbols = [...new Set(filteredTrades.map(t => t.symbol))];
    const overviews = await getMultipleOverviews(symbols, 5);

    // 각 거래에 Beta 정보 추가
    const tradesWithBeta = filteredTrades
        .filter(trade => overviews[trade.symbol] && overviews[trade.symbol].beta > 0)
        .map(trade => ({
            ...trade,
            beta: overviews[trade.symbol].beta
        }));

    if (tradesWithBeta.length === 0) {
        return null;
    }

    // 변동성 분류
    const highVolatility = tradesWithBeta.filter(t => t.beta > 1.5);
    const mediumVolatility = tradesWithBeta.filter(t => t.beta >= 1.0 && t.beta <= 1.5);
    const lowVolatility = tradesWithBeta.filter(t => t.beta < 1.0);

    const calculateWinRate = (trades) => {
        if (trades.length === 0) return 0;
        const wins = trades.filter(t => t.pnl > 0).length;
        return (wins / trades.length) * 100;
    };

    const calculateAvgReturn = (trades) => {
        if (trades.length === 0) return 0;
        return trades.reduce((sum, t) => sum + t.returnPct, 0) / trades.length;
    };

    return {
        highVolatilityWinRate: calculateWinRate(highVolatility),
        mediumVolatilityWinRate: calculateWinRate(mediumVolatility),
        lowVolatilityWinRate: calculateWinRate(lowVolatility),
        highVolatilityAvgReturn: calculateAvgReturn(highVolatility),
        mediumVolatilityAvgReturn: calculateAvgReturn(mediumVolatility),
        lowVolatilityAvgReturn: calculateAvgReturn(lowVolatility),
        highVolatilityCount: highVolatility.length,
        mediumVolatilityCount: mediumVolatility.length,
        lowVolatilityCount: lowVolatility.length
    };
}

/**
 * 시가총액 기반 성과 분석
 */
async function analyzeMarketCapPerformance(filteredTrades) {
    const symbols = [...new Set(filteredTrades.map(t => t.symbol))];
    const overviews = await getMultipleOverviews(symbols, 5);

    // 각 거래에 시가총액 정보 추가
    const tradesWithMarketCap = filteredTrades
        .filter(trade => overviews[trade.symbol] && overviews[trade.symbol].marketCap > 0)
        .map(trade => ({
            ...trade,
            marketCap: overviews[trade.symbol].marketCap
        }));

    if (tradesWithMarketCap.length === 0) {
        return null;
    }

    // 시가총액 분류 (단위: billion)
    const smallCap = tradesWithMarketCap.filter(t => t.marketCap < 2000000000); // < $2B
    const midCap = tradesWithMarketCap.filter(t => t.marketCap >= 2000000000 && t.marketCap < 10000000000); // $2B - $10B
    const largeCap = tradesWithMarketCap.filter(t => t.marketCap >= 10000000000); // > $10B

    const calculateStats = (trades) => {
        if (trades.length === 0) return { winRate: 0, avgPnL: 0, count: 0 };
        const wins = trades.filter(t => t.pnl > 0).length;
        const winRate = (wins / trades.length) * 100;
        const avgPnL = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length;
        return { winRate, avgPnL, count: trades.length };
    };

    return {
        smallCap: calculateStats(smallCap),
        midCap: calculateStats(midCap),
        largeCap: calculateStats(largeCap)
    };
}

// ==================== API Settings Management ====================

/**
 * API 키 설정
 */
function setAlphaVantageApiKey(apiKey) {
    alphaVantageApiKey = apiKey;
    localStorage.setItem('tradingPlatformAlphaVantageApiKey', apiKey);
    console.log('Alpha Vantage API key saved');
}

/**
 * API 키 불러오기
 */
function loadAlphaVantageApiKey() {
    const stored = localStorage.getItem('tradingPlatformAlphaVantageApiKey');
    if (stored) {
        alphaVantageApiKey = stored;
        console.log('Alpha Vantage API key loaded');
    } else {
        // Use default key
        alphaVantageApiKey = 'XLAZ5MW6NTMVPLKE';
    }
}

/**
 * API 키 가져오기
 */
function getAlphaVantageApiKey() {
    return alphaVantageApiKey;
}

// ==================== Initialization ====================

/**
 * 시장 데이터 모듈 초기화
 */
function initializeMarketDataModule() {
    loadAlphaVantageApiKey();
    loadMarketDataCache();
    loadApiCallLog();
    console.log('Market data module initialized');
}

// ==================== Export for module usage ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // API functions
        getDailyStockData,
        getIntradayStockData,
        getStockOverview,
        getGlobalQuote,
        getMultipleQuotes,

        // Analysis functions
        analyzeTradePriceContext,
        getSymbolQuoteInfo,
        getTradedSymbols,
        getSymbolTradeStats,

        // Settings
        setAlphaVantageApiKey,
        loadAlphaVantageApiKey,
        getAlphaVantageApiKey,

        // Cache management
        clearMarketDataCache,

        // Initialization
        initializeMarketDataModule
    };
}
