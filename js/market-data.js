// market-data.js - Twelve Data API 통합 및 시장 데이터 관리

// ==================== Twelve Data API Configuration ====================

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';
const API_RATE_LIMIT = {
    callsPerMinute: 8,
    callsPerDay: 800
};

// ==================== Market Data State ====================

let twelveDataApiKey = '66cd99ab4cd046dda3ef8af62af9b06d'; // Default API key
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
function getCachedData(cacheKey, cacheType = 'quote') {
    if (marketDataCache[cacheKey]) {
        const cached = marketDataCache[cacheKey];
        const now = Date.now();
        const cacheAge = now - cached.timestamp;

        // Cache duration based on data type
        let maxAge;
        if (cacheType === 'overview') {
            maxAge = 24 * 60 * 60 * 1000; // 24 hours for overview data
        } else if (cacheType === 'intraday') {
            maxAge = 60 * 60 * 1000; // 1 hour for intraday data
        } else {
            maxAge = 5 * 60 * 1000; // 5 minutes for quote/daily data
        }

        if (cacheAge < maxAge) {
            console.log(`Using cached data for: ${cacheKey} (${cacheType}, age: ${Math.floor(cacheAge/1000)}s)`);
            return cached.data;
        } else {
            console.log(`Cache expired for: ${cacheKey} (age: ${Math.floor(cacheAge/1000)}s, max: ${Math.floor(maxAge/1000)}s)`);
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

// ==================== Twelve Data API Functions ====================

/**
 * Twelve Data API 호출 (공통 함수)
 */
async function callTwelveDataAPI(endpoint, params = {}) {
    if (!twelveDataApiKey) {
        const error = new Error('Twelve Data API key not set');
        error.code = 'NO_API_KEY';
        throw error;
    }

    if (!canMakeApiCall()) {
        const error = new Error('API rate limit exceeded. Please wait before making more requests.');
        error.code = 'RATE_LIMIT';
        throw error;
    }

    const url = new URL(`${TWELVE_DATA_BASE_URL}${endpoint}`);
    url.searchParams.append('apikey', twelveDataApiKey);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    console.log('Calling Twelve Data API:', url.toString().replace(twelveDataApiKey, 'API_KEY'));

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            error.code = 'HTTP_ERROR';
            throw error;
        }

        const data = await response.json();

        // Check for API error messages
        if (data.status === 'error' || data.code === 400 || data.code === 401 || data.code === 404) {
            const error = new Error(data.message || 'API Error');
            error.code = 'API_ERROR';
            throw error;
        }

        logApiCall();
        return data;
    } catch (error) {
        console.error('Twelve Data API error:', error);
        throw error;
    }
}

/**
 * 일일 시세 데이터 가져오기 (TIME_SERIES)
 */
async function getDailyStockData(symbol, outputsize = 'compact') {
    const cacheKey = `daily_${symbol}_${outputsize}`;
    const cached = getCachedData(cacheKey, 'quote');

    if (cached) {
        return cached;
    }

    const params = {
        symbol: symbol,
        interval: '1day',
        outputsize: outputsize === 'full' ? '5000' : '100' // Twelve Data uses numeric outputsize
    };

    const data = await callTwelveDataAPI('/time_series', params);

    if (data.values) {
        // Convert Twelve Data format to Alpha Vantage-like format for compatibility
        const converted = {
            'Meta Data': {
                'Information': 'Daily Time Series',
                'Symbol': symbol
            },
            'Time Series (Daily)': {}
        };

        data.values.forEach(item => {
            converted['Time Series (Daily)'][item.datetime] = {
                '1. open': item.open,
                '2. high': item.high,
                '3. low': item.low,
                '4. close': item.close,
                '5. volume': item.volume
            };
        });

        setCachedData(cacheKey, converted);
        return converted;
    } else {
        throw new Error(`Failed to fetch daily data for ${symbol}`);
    }
}

/**
 * 인트라데이 시세 데이터 가져오기 (TIME_SERIES)
 */
async function getIntradayStockData(symbol, interval = '5min', outputsize = 'compact') {
    const cacheKey = `intraday_${symbol}_${interval}_${outputsize}`;
    const cached = getCachedData(cacheKey, 'intraday');

    if (cached) {
        return cached;
    }

    const params = {
        symbol: symbol,
        interval: interval, // '1min', '5min', '15min', '30min', '1h'
        outputsize: outputsize === 'full' ? '5000' : '100'
    };

    const data = await callTwelveDataAPI('/time_series', params);

    if (data.values) {
        // Convert Twelve Data format to Alpha Vantage-like format for compatibility
        const converted = {
            'Meta Data': {
                'Information': `Intraday (${interval}) Time Series`,
                'Symbol': symbol,
                'Interval': interval
            },
            [`Time Series (${interval})`]: {}
        };

        data.values.forEach(item => {
            converted[`Time Series (${interval})`][item.datetime] = {
                '1. open': item.open,
                '2. high': item.high,
                '3. low': item.low,
                '4. close': item.close,
                '5. volume': item.volume
            };
        });

        setCachedData(cacheKey, converted);
        return converted;
    } else {
        throw new Error(`Failed to fetch intraday data for ${symbol}`);
    }
}

/**
 * 기본 Overview 데이터 생성 (폴백용)
 */
function createDefaultOverview(symbol) {
    return {
        Symbol: symbol,
        Name: symbol,
        Description: '',
        Sector: 'Unknown',
        Industry: 'Unknown',
        MarketCapitalization: '0',
        SharesOutstanding: '0',
        SharesFloat: '0',
        '52WeekHigh': '0',
        '52WeekLow': '0',
        Beta: '0',
        PERatio: '0',
        EPS: '0'
    };
}

/**
 * 종목 개요 정보 가져오기 (PROFILE & STATISTICS)
 */
async function getStockOverview(symbol) {
    const cacheKey = `overview_${symbol}`;
    const cached = getCachedData(cacheKey, 'overview');

    if (cached) {
        return cached;
    }

    const params = {
        symbol: symbol
    };

    try {
        // Twelve Data uses /profile endpoint
        const profileData = await callTwelveDataAPI('/profile', params);

        // Check if profile data is valid
        if (!profileData || !profileData.symbol) {
            console.warn(`⚠️ Profile not available for ${symbol}, using defaults`);
            const defaultData = createDefaultOverview(symbol);
            setCachedData(cacheKey, defaultData);
            return defaultData;
        }

        // Convert Twelve Data format to Alpha Vantage-like format for compatibility
        const converted = {
            Symbol: profileData.symbol || symbol,
            Name: profileData.name || symbol,
            Description: profileData.description || '',
            Sector: profileData.sector || 'Unknown',
            Industry: profileData.industry || 'Unknown',
            MarketCapitalization: profileData.market_cap || '0',
            SharesOutstanding: profileData.shares_outstanding || '0',
            SharesFloat: profileData.shares_float || '0',
            '52WeekHigh': (profileData.fifty_two_week && profileData.fifty_two_week.high) || '0',
            '52WeekLow': (profileData.fifty_two_week && profileData.fifty_two_week.low) || '0',
            Beta: profileData.beta || '0',
            PERatio: profileData.pe_ratio || '0',
            EPS: profileData.eps || '0'
        };

        setCachedData(cacheKey, converted);
        return converted;
    } catch (error) {
        console.warn(`⚠️ Failed to fetch profile for ${symbol}:`, error.message);
        const defaultData = createDefaultOverview(symbol);
        setCachedData(cacheKey, defaultData);
        return defaultData;
    }
}

/**
 * 글로벌 시세 데이터 가져오기 (QUOTE)
 */
async function getGlobalQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = getCachedData(cacheKey, 'quote');

    if (cached) {
        return cached;
    }

    const params = {
        symbol: symbol
    };

    const data = await callTwelveDataAPI('/quote', params);

    // Convert Twelve Data format to Alpha Vantage-like format for compatibility
    const converted = {
        'Global Quote': {
            '01. symbol': data.symbol,
            '02. open': data.open,
            '03. high': data.high,
            '04. low': data.low,
            '05. price': data.close,
            '06. volume': data.volume,
            '07. latest trading day': data.datetime ? data.datetime.split(' ')[0] : '',
            '08. previous close': data.previous_close,
            '09. change': data.change,
            '10. change percent': data.percent_change
        }
    };

    setCachedData(cacheKey, converted);
    return converted;
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
function setTwelveDataApiKey(apiKey) {
    twelveDataApiKey = apiKey;
    localStorage.setItem('tradingPlatformTwelveDataApiKey', apiKey);
    console.log('Twelve Data API key saved');
}

/**
 * API 키 불러오기
 */
function loadTwelveDataApiKey() {
    const stored = localStorage.getItem('tradingPlatformTwelveDataApiKey');
    if (stored) {
        twelveDataApiKey = stored;
        console.log('Twelve Data API key loaded');
    } else {
        // Use default key
        twelveDataApiKey = '66cd99ab4cd046dda3ef8af62af9b06d';
    }
}

/**
 * API 키 가져오기
 */
function getTwelveDataApiKey() {
    return twelveDataApiKey;
}

/**
 * Intraday Performance 분석 (진입 시점 기준 상승률)
 * Daily 데이터의 open price 대비 진입가 비교
 */
async function analyzeIntradayPerformance(filteredTrades) {
    try {
        const ranges = [
            { min: 20, label: '20%+' },
            { min: 30, label: '30%+' },
            { min: 50, label: '50%+' },
            { min: 100, label: '100%+' }
        ];

        const results = {};
        for (const range of ranges) {
            results[range.label] = { wins: 0, losses: 0, totalPnl: 0, count: 0 };
        }

        const symbols = [...new Set(filteredTrades.map(t => t.symbol))].slice(0, 5);

        // Fetch all daily data first
        const dailyDataCache = {};
        for (const symbol of symbols) {
            try {
                const dailyData = await getDailyStockData(symbol, 'compact');
                dailyDataCache[symbol] = dailyData['Time Series (Daily)'];
                if (Object.keys(dailyDataCache).length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }
            } catch (error) {
                console.error(`Failed to fetch daily data for ${symbol}:`, error);
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        }

        // Analyze trades
        for (const trade of filteredTrades) {
            if (!symbols.includes(trade.symbol)) continue;

            const timeSeries = dailyDataCache[trade.symbol];
            if (!timeSeries || !timeSeries[trade.date]) continue;

            const dayData = timeSeries[trade.date];
            const openPrice = parseFloat(dayData['1. open']);

            if (!openPrice || openPrice === 0) continue;

            // Calculate gain from open to entry price
            const gainPct = ((trade.buyPrice - openPrice) / openPrice) * 100;

            // Categorize by gain percentage
            for (const range of ranges) {
                if (gainPct >= range.min) {
                    results[range.label].count++;
                    results[range.label].totalPnl += trade.pnl;
                    if (trade.pnl > 0) {
                        results[range.label].wins++;
                    } else {
                        results[range.label].losses++;
                    }
                }
            }
        }

        // Calculate win rates
        const analysis = {};
        for (const range of ranges) {
            const data = results[range.label];
            const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
            const avgPnl = data.count > 0 ? data.totalPnl / data.count : 0;

            analysis[range.label] = {
                winRate,
                avgPnl,
                count: data.count,
                wins: data.wins,
                losses: data.losses
            };
        }

        return analysis;
    } catch (error) {
        console.error('Intraday performance analysis failed:', error);
        return null;
    }
}

/**
 * 섹터별 퍼포먼스 분석
 */
async function analyzeSectorPerformance(filteredTrades) {
    try {
        const symbols = [...new Set(filteredTrades.map(t => t.symbol))];
        const overviews = await getMultipleOverviews(symbols, 5);

        const sectorStats = {};

        for (const trade of filteredTrades) {
            const overview = overviews[trade.symbol];
            if (!overview || !overview.sector) continue;

            const sector = overview.sector;

            if (!sectorStats[sector]) {
                sectorStats[sector] = {
                    wins: 0,
                    losses: 0,
                    totalPnl: 0,
                    count: 0
                };
            }

            sectorStats[sector].count++;
            sectorStats[sector].totalPnl += trade.pnl;

            if (trade.pnl > 0) {
                sectorStats[sector].wins++;
            } else {
                sectorStats[sector].losses++;
            }
        }

        // Calculate win rates and average P&L
        const sectorAnalysis = {};
        for (const [sector, stats] of Object.entries(sectorStats)) {
            sectorAnalysis[sector] = {
                winRate: (stats.wins / stats.count) * 100,
                avgPnl: stats.totalPnl / stats.count,
                count: stats.count,
                totalPnl: stats.totalPnl
            };
        }

        // Sort by total P&L
        const sortedSectors = Object.entries(sectorAnalysis)
            .sort((a, b) => b[1].totalPnl - a[1].totalPnl);

        return Object.fromEntries(sortedSectors);
    } catch (error) {
        console.error('Sector performance analysis failed:', error);
        return null;
    }
}

/**
 * SPY 방향성 상관관계 분석
 */
async function analyzeSPYCorrelation(filteredTrades) {
    try {
        // Get SPY daily data
        const spyData = await getDailyStockData('SPY', 'full');
        const spyTimeSeries = spyData['Time Series (Daily)'];

        if (!spyTimeSeries) {
            throw new Error('Failed to fetch SPY data');
        }

        const upDays = { wins: 0, losses: 0, totalPnl: 0, count: 0 };
        const downDays = { wins: 0, losses: 0, totalPnl: 0, count: 0 };

        for (const trade of filteredTrades) {
            const spyDayData = spyTimeSeries[trade.date];
            if (!spyDayData) continue;

            const spyOpen = parseFloat(spyDayData['1. open']);
            const spyClose = parseFloat(spyDayData['4. close']);
            const spyDirection = spyClose > spyOpen ? 'up' : 'down';

            const targetStats = spyDirection === 'up' ? upDays : downDays;
            targetStats.count++;
            targetStats.totalPnl += trade.pnl;

            if (trade.pnl > 0) {
                targetStats.wins++;
            } else {
                targetStats.losses++;
            }
        }

        return {
            upDays: {
                winRate: upDays.count > 0 ? (upDays.wins / upDays.count) * 100 : 0,
                avgPnl: upDays.count > 0 ? upDays.totalPnl / upDays.count : 0,
                count: upDays.count,
                totalPnl: upDays.totalPnl
            },
            downDays: {
                winRate: downDays.count > 0 ? (downDays.wins / downDays.count) * 100 : 0,
                avgPnl: downDays.count > 0 ? downDays.totalPnl / downDays.count : 0,
                count: downDays.count,
                totalPnl: downDays.totalPnl
            }
        };
    } catch (error) {
        console.error('SPY correlation analysis failed:', error);
        return null;
    }
}

/**
 * Relative Volume 상관관계 분석
 */
async function analyzeRelativeVolumeCorrelation(filteredTrades) {
    try {
        const symbols = [...new Set(filteredTrades.map(t => t.symbol))].slice(0, 5);
        const tradesWithRelVol = [];

        for (const trade of filteredTrades) {
            if (!symbols.includes(trade.symbol)) continue;

            try {
                const dailyData = await getDailyStockData(trade.symbol, 'full');
                const timeSeries = dailyData['Time Series (Daily)'];

                if (!timeSeries || !timeSeries[trade.date]) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                    continue;
                }

                // Calculate average volume for last 20 days
                const dates = Object.keys(timeSeries).sort().reverse();
                const tradeDateIndex = dates.indexOf(trade.date);

                if (tradeDateIndex === -1) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                    continue;
                }

                const last20Days = dates.slice(tradeDateIndex + 1, tradeDateIndex + 21);
                let totalVolume = 0;
                let validDays = 0;

                for (const date of last20Days) {
                    const volume = parseInt(timeSeries[date]['5. volume']);
                    if (!isNaN(volume)) {
                        totalVolume += volume;
                        validDays++;
                    }
                }

                if (validDays === 0) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                    continue;
                }

                const avgVolume = totalVolume / validDays;
                const tradeVolume = parseInt(timeSeries[trade.date]['5. volume']);
                const relativeVolume = tradeVolume / avgVolume;

                tradesWithRelVol.push({ ...trade, relativeVolume });
                await new Promise(resolve => setTimeout(resolve, 12000));
            } catch (error) {
                console.error(`Failed to analyze relative volume for ${trade.symbol}:`, error);
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        }

        if (tradesWithRelVol.length === 0) {
            return null;
        }

        // Categorize by relative volume
        const highRelVol = tradesWithRelVol.filter(t => t.relativeVolume >= 2.0); // 2x+ avg volume
        const mediumRelVol = tradesWithRelVol.filter(t => t.relativeVolume >= 1.5 && t.relativeVolume < 2.0);
        const normalRelVol = tradesWithRelVol.filter(t => t.relativeVolume < 1.5);

        const calculateStats = (trades) => {
            const wins = trades.filter(t => t.pnl > 0).length;
            const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
            return {
                winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
                avgPnl: trades.length > 0 ? totalPnl / trades.length : 0,
                count: trades.length
            };
        };

        return {
            highRelVol: calculateStats(highRelVol),
            mediumRelVol: calculateStats(mediumRelVol),
            normalRelVol: calculateStats(normalRelVol)
        };
    } catch (error) {
        console.error('Relative volume correlation analysis failed:', error);
        return null;
    }
}

// ==================== Initialization ====================

/**
 * 시장 데이터 모듈 초기화
 */
function initializeMarketDataModule() {
    loadTwelveDataApiKey();
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
        setTwelveDataApiKey,
        loadTwelveDataApiKey,
        getTwelveDataApiKey,

        // Cache management
        clearMarketDataCache,

        // Initialization
        initializeMarketDataModule
    };
}
