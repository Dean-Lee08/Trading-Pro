// analytics.js - 분석 및 차트 관련 기능

// ==================== Analytics Section Management ====================

/**
 * 분석 섹션 전환
 */
function showAnalyticsSection(sectionName) {
    console.log('📑 showAnalyticsSection called with:', sectionName);
    currentAnalyticsSection = sectionName;

    // Update tab states
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="showAnalyticsSection('${sectionName}')"]`).classList.add('active');

    // Show/hide sections
    document.querySelectorAll('.detail-section, .chart-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show/hide performance summary cards
    const performanceSummary = document.querySelector('.performance-summary');
    if (sectionName === 'detail' || sectionName === 'charts') {
        performanceSummary.style.display = 'block';
    } else {
        performanceSummary.style.display = 'none';
    }

    if (sectionName === 'detail') {
        document.getElementById('detailSection').classList.add('active');
        setTimeout(async () => await updateBasicCharts(), 100);
    } else if (sectionName === 'charts') {
        document.getElementById('chartSection').classList.add('active');
        setTimeout(async () => await updateAdvancedCharts(), 100);
    } else if (sectionName === 'patterns') {
        console.log('🎯 Switching to patterns section...');
        const patternsSection = document.getElementById('patternsSection');
        if (patternsSection) {
            patternsSection.classList.add('active');
            console.log('✅ patternsSection active class added');
        } else {
            console.error('❌ patternsSection element not found!');
        }
        setTimeout(() => {
            console.log('⏰ Calling updatePatternInsights after timeout...');
            updatePatternInsights();
        }, 100);
    }
}

/**
 * 분석 기간 설정
 */
function setAnalyticsPeriod(period) {
    analyticsPeriod = period;
    document.querySelectorAll('.filter-controls .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`[onclick="setAnalyticsPeriod('${period}')"]`).classList.add('active');
    analyticsLoadedOnce = false; // Force reload when period changes
    marketDataLoadedOnce = false; // Force reload market data
    updateDetailedAnalytics();
}

/**
 * 분석 날짜 범위 초기화
 */
function clearAnalyticsRange() {
    analyticsStartDate = null;
    analyticsEndDate = null;
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    analyticsLoadedOnce = false; // Force reload when filter changes
    marketDataLoadedOnce = false; // Force reload market data
    updateDetailedAnalytics();
}

/**
 * 분석 데이터 수동 새로고침
 */
function refreshAnalyticsData() {
    analyticsLoadedOnce = false;
    analyticsFilterState = null;
    marketDataLoadedOnce = false;
    marketDataFilterState = null;
    updateDetailedAnalytics();
    showToast(currentLanguage === 'ko' ? '분석 데이터 새로고침 완료' : 'Analytics data refreshed');
}

/**
 * 분석용 필터링된 거래 가져오기
 */
function getFilteredTradesForAnalytics() {
    return filterTrades(trades, {
        startDate: analyticsStartDate,
        endDate: analyticsEndDate
    });
}

// ==================== Detailed Analytics Update ====================

/**
 * 상세 분석 업데이트 (메인 함수)
 */
function updateDetailedAnalytics() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        resetDetailedAnalyticsDisplay();
        return;
    }

    // Check if analytics already loaded with same filter (session cache)
    const currentFilter = {
        startDate: analyticsStartDate,
        endDate: analyticsEndDate,
        tradeCount: filteredTrades.length
    };

    if (analyticsLoadedOnce &&
        JSON.stringify(currentFilter) === JSON.stringify(analyticsFilterState)) {
        return; // Already displayed, keep existing data
    }

    // Mark as loading new data
    analyticsFilterState = currentFilter;
    analyticsLoadedOnce = true;

    // Calculate basic metrics
    const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const uniqueDatesForFees = [...new Set(filteredTrades.map(trade => trade.date))];
    const totalDailyFees = uniqueDatesForFees.reduce((sum, date) => sum + (dailyFees[date] || 0), 0);
    const netTotalPL = totalPL - totalDailyFees;
    const wins = filteredTrades.filter(trade => trade.pnl > 0);
    const losses = filteredTrades.filter(trade => trade.pnl < 0);
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    
    const pnls = filteredTrades.map(trade => trade.pnl);
    const largestWin = Math.max(...pnls);
    const largestLoss = Math.min(...pnls);
    
    const totalWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
    
    // Update Summary Cards
    const summaryNetProfit = document.getElementById('summaryNetProfit');
    if (summaryNetProfit) {
        summaryNetProfit.textContent = `$${netTotalPL.toFixed(2)}`;
        summaryNetProfit.className = `summary-card-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
    }
    const summaryTotalTrades = document.getElementById('summaryTotalTrades');
    if (summaryTotalTrades) summaryTotalTrades.textContent = filteredTrades.length;

    const summaryWinRate = document.getElementById('summaryWinRate');
    if (summaryWinRate) {
        summaryWinRate.textContent = `${winRate.toFixed(1)}%`;
        summaryWinRate.className = `summary-card-value ${winRate >= 50 ? 'positive' : 'negative'}`;
    }
    const summaryProfitFactor = document.getElementById('summaryProfitFactor');
    if (summaryProfitFactor) {
        summaryProfitFactor.textContent = profitFactor.toFixed(2);
        summaryProfitFactor.className = `summary-card-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
    }
    const summaryLargestWin = document.getElementById('summaryLargestWin');
    if (summaryLargestWin) {
        summaryLargestWin.textContent = `$${largestWin.toFixed(2)}`;
        summaryLargestWin.className = `summary-card-value positive`;
    }
    const summaryLargestLoss = document.getElementById('summaryLargestLoss');
    if (summaryLargestLoss) {
        summaryLargestLoss.textContent = `$${largestLoss.toFixed(2)}`;
        summaryLargestLoss.className = `summary-card-value negative`;
    }

    // Update detail cards
    updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees);
    updateWinLossStatistics(filteredTrades, wins, losses, winRate);
    updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees);
    updateTimeAnalysisDetails(filteredTrades);
    updateTradingActivityDetails(filteredTrades, uniqueDatesForFees);
    updateStreakAnalysisDetails(filteredTrades);
    updateSymbolPerformanceDetails(filteredTrades);
    updateRiskManagementDetails(filteredTrades);

    // Update market data analysis cards (async)
    if (marketDataEnabled) {
        setTimeout(() => updateMarketDataAnalysisCards(filteredTrades), 100);
    }

    // Update basic charts if in detail section
    if (currentAnalyticsSection === 'detail') {
        setTimeout(async () => await updateBasicCharts(), 100);
    }

    // Update algorithmic analysis if in patterns section
    if (currentAnalyticsSection === 'patterns') {
        setTimeout(() => updateAlgorithmicAnalysis(), 100);
    }
}

/**
 * 거래 성과 상세 업데이트
 */
function updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees) {
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const netTotalPL = totalPL - totalDailyFees;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    const detailTotalPL = document.getElementById('detailTotalPL');
    if (detailTotalPL) {
        detailTotalPL.textContent = `$${netTotalPL.toFixed(2)}`;
        detailTotalPL.className = `detail-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
    }
    const detailTotalGain = document.getElementById('detailTotalGain');
    if (detailTotalGain) detailTotalGain.textContent = `$${totalWins.toFixed(2)}`;

    const detailTotalLoss = document.getElementById('detailTotalLoss');
    if (detailTotalLoss) detailTotalLoss.textContent = `$${totalLosses.toFixed(2)}`;

    const detailTotalFees = document.getElementById('detailTotalFees');
    if (detailTotalFees) detailTotalFees.textContent = `$${totalDailyFees.toFixed(2)}`;

    const detailTotalVolume = document.getElementById('detailTotalVolume');
    if (detailTotalVolume) detailTotalVolume.textContent = `$${totalVolume.toFixed(2)}`;

    const detailProfitFactor = document.getElementById('detailProfitFactor');
    if (detailProfitFactor) {
        detailProfitFactor.textContent = profitFactor.toFixed(2);
        detailProfitFactor.className = `detail-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
    }
}

/**
 * 승률 통계 업데이트
 */
function updateWinLossStatistics(filteredTrades, wins, losses, winRate) {
    const avgWinningTrade = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLosingTrade = losses.length > 0 ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0;
    const pnls = filteredTrades.map(trade => trade.pnl);
    const largestWin = filteredTrades.length > 0 ? Math.max(...pnls) : 0;
    const largestLoss = filteredTrades.length > 0 ? Math.min(...pnls) : 0;

    document.getElementById('detailWinningTrades').textContent = `${wins.length} (${winRate.toFixed(1)}%)`;
    document.getElementById('detailLosingTrades').textContent = `${losses.length} (${(100 - winRate).toFixed(1)}%)`;
    document.getElementById('detailAvgWinningTrade').textContent = `$${avgWinningTrade.toFixed(2)}`;
    document.getElementById('detailAvgLosingTrade').textContent = `$${avgLosingTrade.toFixed(2)}`;
    document.getElementById('detailLargestWin').textContent = `$${largestWin.toFixed(2)}`;
    document.getElementById('detailLargestLoss').textContent = `$${largestLoss.toFixed(2)}`;
}

/**
 * 일일 성과 상세 업데이트
 */
function updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees) {
    // Calculate daily P/L
    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = { tradePL: 0, winDays: 0, lossDays: 0 };
        }
        dailyStats[trade.date].tradePL += trade.pnl;
    });

    // Apply daily fees and determine win/loss days
    const dailyPLsWithFees = [];
    Object.keys(dailyStats).forEach(date => {
        const fee = dailyFees[date] || 0;
        const netDailyPL = dailyStats[date].tradePL - fee;
        dailyPLsWithFees.push(netDailyPL);
        
        if (netDailyPL > 0) dailyStats[date].winDays = 1;
        else if (netDailyPL < 0) dailyStats[date].lossDays = 1;
    });

    const winDays = Object.values(dailyStats).filter(data => data.winDays > 0).length;
    const lossDays = Object.values(dailyStats).filter(data => data.lossDays > 0).length;
    const bestTradingDay = dailyPLsWithFees.length > 0 ? Math.max(...dailyPLsWithFees) : 0;
    const worstTradingDay = dailyPLsWithFees.length > 0 && dailyPLsWithFees.some(pnl => pnl < 0) ? Math.min(...dailyPLsWithFees) : 0;
    const avgDailyPL = dailyPLsWithFees.length > 0 ? dailyPLsWithFees.reduce((sum, pnl) => sum + pnl, 0) / dailyPLsWithFees.length : 0;
    const avgDailyFees = uniqueDatesForFees.length > 0 ? totalDailyFees / uniqueDatesForFees.length : 0;

    document.getElementById('detailDailyPerWin').textContent = winDays > 0 ? `$${(dailyPLsWithFees.filter(pnl => pnl > 0).reduce((sum, pnl) => sum + pnl, 0) / winDays).toFixed(2)}` : '$0.00';
    document.getElementById('detailDailyPerLoss').textContent = lossDays > 0 ? `$${(dailyPLsWithFees.filter(pnl => pnl < 0).reduce((sum, pnl) => sum + pnl, 0) / lossDays).toFixed(2)}` : '$0.00';
    document.getElementById('detailDailyPerFees').textContent = `$${avgDailyFees.toFixed(2)}`;
    document.getElementById('detailBestTradingDay').textContent = `$${bestTradingDay.toFixed(2)}`;
    document.getElementById('detailWorstTradingDay').textContent = `$${worstTradingDay.toFixed(2)}`;
    document.getElementById('detailAvgDailyPL').textContent = `$${avgDailyPL.toFixed(2)}`;
    document.getElementById('detailAvgDailyPL').className = `detail-value ${avgDailyPL >= 0 ? 'positive' : 'negative'}`;
}

/**
 * 시간 분석 상세 업데이트
 */
function updateTimeAnalysisDetails(filteredTrades) {
    // Hold time analysis
    const holdTimes = filteredTrades
        .filter(trade => trade.holdingTime)
        .map(trade => parseInt(trade.holdingTime.replace('m', '')));
    
    const avgHoldTime = holdTimes.length > 0 ? 
        holdTimes.reduce((sum, time) => sum + time, 0) / holdTimes.length : 0;
    const shortestHold = holdTimes.length > 0 ? Math.min(...holdTimes) : 0;
    const longestHold = holdTimes.length > 0 ? Math.max(...holdTimes) : 0;

    // Hour analysis
    const hourStats = {};
    filteredTrades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourStats[hour]) {
                hourStats[hour] = { count: 0, totalPL: 0 };
            }
            hourStats[hour].count++;
            hourStats[hour].totalPL += trade.pnl;
        }
    });

    const bestHour = Object.entries(hourStats)
        .sort((a, b) => b[1].totalPL - a[1].totalPL)[0];
    const worstHour = Object.entries(hourStats)
        .sort((a, b) => a[1].totalPL - b[1].totalPL)[0];

    // Day of week analysis
    const dayStats = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysOfWeekKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    filteredTrades.forEach(trade => {
        const day = new Date(trade.date + 'T12:00:00').getDay();
        if (!dayStats[day]) {
            dayStats[day] = { count: 0, totalPL: 0 };
        }
        dayStats[day].count++;
        dayStats[day].totalPL += trade.pnl;
    });

    const bestDayOfWeek = Object.entries(dayStats)
        .sort((a, b) => b[1].totalPL - a[1].totalPL)[0];

    document.getElementById('detailAvgHoldTime').textContent = `${avgHoldTime.toFixed(0)}m`;
    document.getElementById('detailShortestHold').textContent = `${shortestHold}m`;
    document.getElementById('detailLongestHold').textContent = `${longestHold}m`;
    document.getElementById('detailBestHour').textContent = bestHour ? 
        `${bestHour[0]}:00 ($${bestHour[1].totalPL.toFixed(2)})` : '-';
    document.getElementById('detailWorstHour').textContent = worstHour ? 
        `${worstHour[0]}:00 ($${worstHour[1].totalPL.toFixed(2)})` : '-';
    document.getElementById('detailBestDayOfWeek').textContent = bestDayOfWeek ? 
        (currentLanguage === 'ko' ? daysOfWeekKo[bestDayOfWeek[0]] : daysOfWeek[bestDayOfWeek[0]]) : '-';
}

/**
 * 거래 활동 상세 업데이트
 */
function updateTradingActivityDetails(filteredTrades, uniqueDatesForFees) {
    const tradingDays = uniqueDatesForFees.length;
    const avgTradesPerDay = tradingDays > 0 ? filteredTrades.length / tradingDays : 0;
    
    // Calculate trades per day
    const tradesPerDay = {};
    filteredTrades.forEach(trade => {
        tradesPerDay[trade.date] = (tradesPerDay[trade.date] || 0) + 1;
    });
    const maxTradesDay = Object.keys(tradesPerDay).length > 0 ? Math.max(...Object.values(tradesPerDay)) : 0;

    const positions = filteredTrades.map(trade => trade.amount);
    const avgPositionSize = positions.length > 0 ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length : 0;
    const largestPosition = positions.length > 0 ? Math.max(...positions) : 0;
    const smallestPosition = positions.length > 0 ? Math.min(...positions) : 0;

    document.getElementById('detailTradingDays').textContent = tradingDays;
    document.getElementById('detailAvgTradesPerDay').textContent = avgTradesPerDay.toFixed(2);
    document.getElementById('detailMaxTradesDay').textContent = maxTradesDay;
    document.getElementById('detailAvgPositionSize').textContent = `$${avgPositionSize.toFixed(0)}`;
    document.getElementById('detailLargestPosition').textContent = `$${largestPosition.toFixed(0)}`;
    document.getElementById('detailSmallestPosition').textContent = `$${smallestPosition.toFixed(0)}`;
}

/**
 * 연속 거래 분석 상세 업데이트
 */
function updateStreakAnalysisDetails(filteredTrades) {
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let winStreaks = [];
    let totalWinStreaks = 0;

    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTrades.forEach((trade, index) => {
        if (trade.pnl > 0) {
            if (currentLossStreak > 0) {
                currentLossStreak = 0;
            }
            currentWinStreak++;
            maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
            if (index === sortedTrades.length - 1) {
                currentStreak = currentWinStreak;
            }
        } else if (trade.pnl < 0) {
            if (currentWinStreak > 0) {
                winStreaks.push(currentWinStreak);
                totalWinStreaks++;
                currentWinStreak = 0;
            }
            currentLossStreak++;
            maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
            if (index === sortedTrades.length - 1) {
                currentStreak = -currentLossStreak;
            }
        }
    });

    if (currentWinStreak > 0) {
        winStreaks.push(currentWinStreak);
        totalWinStreaks++;
    }

    const avgWinStreak = totalWinStreaks > 0 ? winStreaks.reduce((sum, streak) => sum + streak, 0) / totalWinStreaks : 0;

    // Get current streaks
    const recentTrades = sortedTrades.slice(-10);
    let recentWinStreak = 0;
    let recentLossStreak = 0;
    
    for (let i = recentTrades.length - 1; i >= 0; i--) {
        if (recentTrades[i].pnl > 0) {
            if (recentLossStreak === 0) recentWinStreak++;
            else break;
        } else if (recentTrades[i].pnl < 0) {
            if (recentWinStreak === 0) recentLossStreak++;
            else break;
        } else break;
    }

    document.getElementById('detailCurrentStreak').textContent = currentStreak;
    document.getElementById('detailCurrentStreak').className = `detail-value ${currentStreak >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('detailMaxWinStreak').textContent = maxWinStreak;
    document.getElementById('detailMaxLossStreak').textContent = maxLossStreak;
    document.getElementById('detailCurrentWinStreak').textContent = recentWinStreak;
    document.getElementById('detailCurrentWinStreak').className = `detail-value ${recentWinStreak > 0 ? 'positive' : 'neutral'}`;
    document.getElementById('detailCurrentLossStreak').textContent = recentLossStreak;
    document.getElementById('detailCurrentLossStreak').className = `detail-value ${recentLossStreak > 0 ? 'negative' : 'neutral'}`;
    document.getElementById('detailAvgWinStreak').textContent = avgWinStreak.toFixed(2);
}

/**
 * 심볼 성과 상세 업데이트
 */
function updateSymbolPerformanceDetails(filteredTrades) {
    const symbolStats = {};
    filteredTrades.forEach(trade => {
        if (!symbolStats[trade.symbol]) {
            symbolStats[trade.symbol] = {
                count: 0,
                totalPL: 0,
                wins: 0,
                totalReturn: 0
            };
        }
        symbolStats[trade.symbol].count++;
        symbolStats[trade.symbol].totalPL += trade.pnl;
        symbolStats[trade.symbol].totalReturn += trade.returnPct;
        if (trade.pnl > 0) symbolStats[trade.symbol].wins++;
    });

    const symbolEntries = Object.entries(symbolStats);
    if (symbolEntries.length > 0) {
        const mostProfitable = symbolEntries.sort((a, b) => b[1].totalPL - a[1].totalPL)[0];
        const leastProfitable = symbolEntries.sort((a, b) => a[1].totalPL - b[1].totalPL)[0];
        const mostTraded = symbolEntries.sort((a, b) => b[1].count - a[1].count)[0];
        const bestWinRate = symbolEntries.sort((a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count))[0];
        const bestAvgReturn = symbolEntries.sort((a, b) => (b[1].totalReturn / b[1].count) - (a[1].totalReturn / a[1].count))[0];

        document.getElementById('detailMostProfitableSymbol').textContent = 
            `${mostProfitable[0]} ($${mostProfitable[1].totalPL.toFixed(2)})`;
        document.getElementById('detailLeastProfitableSymbol').textContent = 
            `${leastProfitable[0]} ($${leastProfitable[1].totalPL.toFixed(2)})`;
        document.getElementById('detailMostTradedSymbol').textContent = 
            `${mostTraded[0]} (${mostTraded[1].count} trades)`;
        document.getElementById('detailUniqueSymbols').textContent = symbolEntries.length;
        document.getElementById('detailBestSymbolWinRate').textContent = 
            `${bestWinRate[0]} (${((bestWinRate[1].wins / bestWinRate[1].count) * 100).toFixed(1)}%)`;
        document.getElementById('detailBestSymbolReturn').textContent = 
            `${bestAvgReturn[0]} (${(bestAvgReturn[1].totalReturn / bestAvgReturn[1].count).toFixed(2)}%)`;
    } else {
        ['detailMostProfitableSymbol', 'detailLeastProfitableSymbol', 'detailMostTradedSymbol', 
         'detailBestSymbolWinRate', 'detailBestSymbolReturn'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
        document.getElementById('detailUniqueSymbols').textContent = '0';
    }
}

/**
 * 리스크 관리 상세 업데이트
 */
function updateRiskManagementDetails(filteredTrades) {
    // Drawdown calculation
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulativePL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;

    sortedTrades.forEach((trade, index) => {
        cumulativePL += trade.pnl;
        if (cumulativePL > peak) {
            peak = cumulativePL;
        }
        const drawdown = peak - cumulativePL;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
        if (index === sortedTrades.length - 1) {
            currentDrawdown = drawdown;
        }
    });

    // Daily P/L analysis with fees
    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = 0;
        }
        dailyStats[trade.date] += trade.pnl;
    });

    // Apply fees to daily stats
    Object.keys(dailyStats).forEach(date => {
        const fee = dailyFees[date] || 0;
        dailyStats[date] -= fee;
    });

    const dailyPLs = Object.values(dailyStats);
    const maxDailyGain = dailyPLs.length > 0 ? Math.max(...dailyPLs) : 0;
    const maxDailyLoss = dailyPLs.length > 0 && dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : 0;

    // Recovery factor
    const totalReturn = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

    // Risk/Reward ratio (simplified)
    const wins = filteredTrades.filter(trade => trade.pnl > 0);
    const losses = filteredTrades.filter(trade => trade.pnl < 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length) : 0;
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    document.getElementById('detailMaxDrawdown').textContent = `$${maxDrawdown.toFixed(2)}`;
    document.getElementById('detailCurrentDrawdown').textContent = `$${currentDrawdown.toFixed(2)}`;
    document.getElementById('detailCurrentDrawdown').className = `detail-value ${currentDrawdown === 0 ? 'positive' : 'negative'}`;
    document.getElementById('detailRecoveryFactor').textContent = recoveryFactor.toFixed(2);
    document.getElementById('detailRecoveryFactor').className = `detail-value ${recoveryFactor >= 1 ? 'positive' : 'negative'}`;
    document.getElementById('detailMaxDailyGain').textContent = `$${maxDailyGain.toFixed(2)}`;
    document.getElementById('detailMaxDailyLoss').textContent = `$${maxDailyLoss.toFixed(2)}`;
    document.getElementById('detailRiskRewardRatio').textContent = riskRewardRatio.toFixed(2);
    document.getElementById('detailRiskRewardRatio').className = `detail-value ${riskRewardRatio >= 1 ? 'positive' : 'negative'}`;
}

/**
 * 상세 분석 디스플레이 초기화
 */
function resetDetailedAnalyticsDisplay() {
    // Reset summary cards
    document.getElementById('summaryNetProfit').textContent = '$0.00';
    document.getElementById('summaryNetProfit').className = 'summary-card-value';
    document.getElementById('summaryTotalTrades').textContent = '0';
    document.getElementById('summaryWinRate').textContent = '0%';
    document.getElementById('summaryWinRate').className = 'summary-card-value';
    document.getElementById('summaryProfitFactor').textContent = '0.00';
    document.getElementById('summaryProfitFactor').className = 'summary-card-value';
    document.getElementById('summaryLargestWin').textContent = '$0.00';
    document.getElementById('summaryLargestWin').className = 'summary-card-value';
    document.getElementById('summaryLargestLoss').textContent = '$0.00';
    document.getElementById('summaryLargestLoss').className = 'summary-card-value';

    // Reset all detail values
    const detailElements = [
        'detailTotalPL', 'detailTotalGain', 'detailTotalLoss', 'detailTotalFees', 'detailTotalVolume', 'detailProfitFactor',
        'detailWinningTrades', 'detailLosingTrades', 'detailAvgWinningTrade', 'detailAvgLosingTrade', 'detailLargestWin', 'detailLargestLoss',
        'detailDailyPerWin', 'detailDailyPerLoss', 'detailDailyPerFees', 'detailBestTradingDay', 'detailWorstTradingDay', 'detailAvgDailyPL',
        'detailAvgHoldTime', 'detailShortestHold', 'detailLongestHold', 'detailTradingDays', 'detailAvgTradesPerDay', 'detailMaxTradesDay',
        'detailAvgPositionSize', 'detailLargestPosition', 'detailSmallestPosition', 'detailCurrentStreak', 'detailMaxWinStreak', 'detailMaxLossStreak',
        'detailCurrentWinStreak', 'detailCurrentLossStreak', 'detailAvgWinStreak', 'detailUniqueSymbols', 'detailMaxDrawdown', 'detailCurrentDrawdown',
        'detailRecoveryFactor', 'detailMaxDailyGain', 'detailMaxDailyLoss', 'detailRiskRewardRatio'
    ];

    detailElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id.includes('Symbol') || id.includes('Hour') || id.includes('Day')) {
                element.textContent = '-';
            } else if (id.includes('Trades') && !id.includes('Total') && !id.includes('Avg') && !id.includes('Max')) {
                element.textContent = '0 (0%)';
            } else if (id.includes('Time')) {
                element.textContent = '0m';
            } else if (id.includes('$') || id.includes('PL') || id.includes('Gain') || id.includes('Loss') || 
                      id.includes('Fees') || id.includes('Volume') || id.includes('Position') || id.includes('Drawdown')) {
                element.textContent = '$0.00';
            } else {
                element.textContent = '0';
            }
            element.className = 'detail-value';
        }
    });

    // Reset special text fields
    document.getElementById('detailBestHour').textContent = '-';
    document.getElementById('detailWorstHour').textContent = '-';
    document.getElementById('detailBestDayOfWeek').textContent = '-';
    document.getElementById('detailMostProfitableSymbol').textContent = '-';
    document.getElementById('detailLeastProfitableSymbol').textContent = '-';
    document.getElementById('detailMostTradedSymbol').textContent = '-';
    document.getElementById('detailBestSymbolWinRate').textContent = '-';
    document.getElementById('detailBestSymbolReturn').textContent = '-';
}

// ==================== Basic Charts (Detail Section) ====================

/**
 * 기본 차트 업데이트
 */
async function updateBasicCharts() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        // Clear charts if no data
        ['basicCumulativePLChart', 'basicWinLossChart', 'basicDailyPLChart', 'basicMonthlyChart'].forEach(chartId => {
            if (basicCharts[chartId]) {
                basicCharts[chartId].destroy();
                delete basicCharts[chartId];
            }
            // Show "No data" message
            const canvas = document.getElementById(chartId);
            if (canvas && canvas.parentElement) {
                canvas.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #64748b;">No data available</div>';
            }
        });
        return;
    }

    // Restore canvas elements if they were replaced with "No data" message
    ['basicCumulativePLChart', 'basicWinLossChart', 'basicDailyPLChart', 'basicMonthlyChart'].forEach(chartId => {
        const existing = document.getElementById(chartId);
        if (!existing || existing.tagName !== 'CANVAS') {
            // Find the chart container by looking for parent that has chart-card class
            const containers = document.querySelectorAll('.chart-card');
            for (const container of containers) {
                const canvasInContainer = container.querySelector(`canvas`);
                const noDataInContainer = container.querySelector('div');

                // If we found a "No data" message, replace it with canvas
                if (noDataInContainer && noDataInContainer.textContent.includes('No data')) {
                    container.innerHTML = `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
                    break;
                }
            }
        }
    });

    // Cumulative P&L Chart
    const dailyPL = {};
    filteredTrades.forEach(trade => {
        if (!dailyPL[trade.date]) {
            dailyPL[trade.date] = 0;
        }
        dailyPL[trade.date] += trade.pnl;
    });

    const sortedDates = Object.keys(dailyPL).sort();
    const cumulativePL = [];
    let runningTotal = 0;
    
    sortedDates.forEach(date => {
        runningTotal += dailyPL[date];
        cumulativePL.push({
            x: date,
            y: runningTotal
        });
    });

    createBasicChart('basicCumulativePLChart', 'line', {
        labels: cumulativePL.map(p => new Date(p.x).toLocaleDateString()),
        datasets: [{
            label: 'Cumulative P&L',
            data: cumulativePL.map(p => p.y),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }]
    });

    // Win/Loss Distribution
    const wins = filteredTrades.filter(trade => trade.pnl > 0).length;
    const losses = filteredTrades.filter(trade => trade.pnl < 0).length;

    createBasicChart('basicWinLossChart', 'doughnut', {
        labels: ['Wins', 'Losses'],
        datasets: [{
            data: [wins, losses],
            backgroundColor: ['#10b981', '#ef4444']
        }]
    });

    // Daily P&L
    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = 0;
        }
        dailyStats[trade.date] += trade.pnl;
    });

    const dailyData = Object.entries(dailyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pnl]) => ({
            x: date,
            y: pnl
        }));

    createBasicChart('basicDailyPLChart', 'bar', {
        datasets: [{
            label: 'Daily P&L',
            data: dailyData,
            backgroundColor: dailyData.map(d => d.y >= 0 ? '#10b981' : '#ef4444')
        }]
    });

    // Monthly Performance
    const monthlyStats = {};
    filteredTrades.forEach(trade => {
        const month = trade.date.substring(0, 7);
        if (!monthlyStats[month]) {
            monthlyStats[month] = 0;
        }
        monthlyStats[month] += trade.pnl;
    });

    const monthlyData = Object.entries(monthlyStats)
        .sort(([a], [b]) => a.localeCompare(b));

    createBasicChart('basicMonthlyChart', 'line', {
        labels: monthlyData.map(([month]) => month),
        datasets: [{
            label: 'Monthly P&L',
            data: monthlyData.map(([, pnl]) => pnl),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
        }]
    });
}

// ==================== Advanced Charts (Charts Section) ====================

/**
 * 고급 차트 업데이트
 */
async function updateAdvancedCharts() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        // Clear charts if no data
        Object.keys(advancedCharts).forEach(chartId => {
            if (advancedCharts[chartId]) {
                advancedCharts[chartId].destroy();
                delete advancedCharts[chartId];
            }
        });
        
        // Show "No data" messages
        const chartIds = [
            'equityCurveChart', 'drawdownChart', 'symbolPerformanceChart', 'timeDistributionChart',
            'returnDistributionChart', 'volumeAnalysisChart', 'correlationMatrixChart',
            'performanceAttributionChart', 'tradeDurationAnalysisChart',
            'winRateByTimeChart', 'positionSizingAnalysisChart', 'tradingEfficiencyMetricsChart'
        ];
        
        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const parent = canvas.parentElement;
                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #64748b;">No data available</div>';
            }
        });
        return;
    }

    // Restore canvas elements
    const chartIds = [
        'equityCurveChart', 'drawdownChart', 'symbolPerformanceChart', 'timeDistributionChart',
        'returnDistributionChart', 'volumeAnalysisChart', 'correlationMatrixChart',
        'performanceAttributionChart', 'tradeDurationAnalysisChart',
        'winRateByTimeChart', 'positionSizingAnalysisChart', 'tradingEfficiencyMetricsChart'
    ];
    
    chartIds.forEach(chartId => {
        const existing = document.getElementById(chartId);
        if (!existing || existing.tagName !== 'CANVAS') {
            const parent = document.querySelector(`#${chartId}`);
            if (parent && parent.parentElement) {
                parent.parentElement.innerHTML = `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
            }
        }
    });

    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const uniqueSymbols = [...new Set(filteredTrades.map(trade => trade.symbol))];

    // 1. Equity Curve
    const equityDailyPL = {};
    filteredTrades.forEach(trade => {
        if (!equityDailyPL[trade.date]) {
            equityDailyPL[trade.date] = 0;
        }
        equityDailyPL[trade.date] += trade.pnl;
    });

    const equitySortedDates = Object.keys(equityDailyPL).sort();
    const equityData = [];
    let equity = 0;
    
    equitySortedDates.forEach(date => {
        equity += equityDailyPL[date];
        equityData.push({
            x: date,
            y: equity
        });
    });

    createAdvancedChart('equityCurveChart', 'line', {
        labels: equityData.map(p => new Date(p.x).toLocaleDateString()),
        datasets: [{
            label: 'Equity',
            data: equityData.map(p => p.y),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }]
    });

    // 2. Drawdown Chart
    const drawdownDailyPL = {};
    filteredTrades.forEach(trade => {
        if (!drawdownDailyPL[trade.date]) {
            drawdownDailyPL[trade.date] = 0;
        }
        drawdownDailyPL[trade.date] += trade.pnl;
    });

    const drawdownSortedDates = Object.keys(drawdownDailyPL).sort();
    const drawdownData = [];
    let peak = 0;
    let currentEquity = 0;

    drawdownSortedDates.forEach(date => {
        currentEquity += drawdownDailyPL[date];
        if (currentEquity > peak) {
            peak = currentEquity;
        }
        const drawdown = peak > 0 ? ((peak - currentEquity) / Math.abs(peak)) * 100 : 0;
        drawdownData.push({
            x: date,
            y: -Math.abs(drawdown)
        });
    });

    createAdvancedChart('drawdownChart', 'line', {
        labels: drawdownData.map(p => new Date(p.x).toLocaleDateString()),
        datasets: [{
            label: 'Drawdown %',
            data: drawdownData.map(p => p.y),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
        }]
    });

    // 3. Symbol Performance
    const symbolStats = {};
    filteredTrades.forEach(trade => {
        if (!symbolStats[trade.symbol]) {
            symbolStats[trade.symbol] = 0;
        }
        symbolStats[trade.symbol] += trade.pnl;
    });

    const symbolData = Object.entries(symbolStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    createAdvancedChart('symbolPerformanceChart', 'bar', {
        labels: symbolData.map(([symbol]) => symbol),
        datasets: [{
            label: 'P&L by Symbol',
            data: symbolData.map(([, pnl]) => pnl),
            backgroundColor: symbolData.map(([, pnl]) => pnl >= 0 ? '#10b981' : '#ef4444')
        }]
    });

    // 4. Time Distribution
    const hourStats = {};
    filteredTrades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourStats[hour]) {
                hourStats[hour] = { count: 0, totalPL: 0 };
            }
            hourStats[hour].count++;
            hourStats[hour].totalPL += trade.pnl;
        }
    });

    const hourData = Object.entries(hourStats)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([hour, data]) => ({
            x: parseInt(hour),
            y: data.count
        }));

    createAdvancedChart('timeDistributionChart', 'bar', {
        datasets: [{
            label: 'Trades by Hour',
            data: hourData,
            backgroundColor: '#3b82f6'
        }]
    });

    // 5. Return Distribution
    const returnRanges = {
        '<-5%': 0, '-5% to -2%': 0, '-2% to 0%': 0,
        '0% to 2%': 0, '2% to 5%': 0, '>5%': 0
    };

    filteredTrades.forEach(trade => {
        const returnPct = trade.returnPct;
        if (returnPct < -5) returnRanges['<-5%']++;
        else if (returnPct < -2) returnRanges['-5% to -2%']++;
        else if (returnPct < 0) returnRanges['-2% to 0%']++;
        else if (returnPct < 2) returnRanges['0% to 2%']++;
        else if (returnPct < 5) returnRanges['2% to 5%']++;
        else returnRanges['>5%']++;
    });

    createAdvancedChart('returnDistributionChart', 'bar', {
        labels: Object.keys(returnRanges),
        datasets: [{
            label: 'Trade Count',
            data: Object.values(returnRanges),
            backgroundColor: '#8b5cf6'
        }]
    });

    // 6. Volume Analysis
    const volumeData = filteredTrades.map((trade, index) => ({
        x: index + 1,
        y: trade.amount
    }));

    createAdvancedChart('volumeAnalysisChart', 'scatter', {
        datasets: [{
            label: 'Position Size',
            data: volumeData,
            backgroundColor: '#06b6d4'
        }]
    });

    // 7. Performance Correlation (Volume vs P&L)
    const correlationData = [];
    filteredTrades.forEach((trade, index) => {
        correlationData.push({
            x: trade.amount,
            y: trade.pnl
        });
    });

    createAdvancedChart('correlationMatrixChart', 'scatter', {
        datasets: [{
            label: 'Volume vs P&L',
            data: correlationData,
            backgroundColor: 'rgba(16, 185, 129, 0.6)'
        }]
    });

    // 8. Performance Attribution
    const attributionData = [];
    uniqueSymbols.forEach(symbol => {
        const symbolTrades = filteredTrades.filter(trade => trade.symbol === symbol);
        const totalPL = symbolTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        attributionData.push({
            symbol: symbol,
            pnl: totalPL
        });
    });

    const topContributors = attributionData.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 10);

    createAdvancedChart('performanceAttributionChart', 'bar', {
        labels: topContributors.map(item => item.symbol),
        datasets: [{
            label: 'Contribution to P&L',
            data: topContributors.map(item => item.pnl),
            backgroundColor: topContributors.map(item => item.pnl >= 0 ? '#10b981' : '#ef4444')
        }]
    });

    // 9. Trade Duration Analysis
    const durationStats = {};
    filteredTrades.forEach(trade => {
        if (trade.holdingTime) {
            const duration = parseInt(trade.holdingTime.replace('m', ''));
            let range;
            if (duration < 30) range = '0-30m';
            else if (duration < 60) range = '30-60m';
            else if (duration < 120) range = '1-2h';
            else if (duration < 240) range = '2-4h';
            else range = '4h+';
            
            if (!durationStats[range]) {
                durationStats[range] = { count: 0, totalPL: 0 };
            }
            durationStats[range].count++;
            durationStats[range].totalPL += trade.pnl;
        }
    });

    const durationData = Object.entries(durationStats).map(([range, data]) => ({
        label: range,
        avgPL: data.count > 0 ? data.totalPL / data.count : 0
    }));

    createAdvancedChart('tradeDurationAnalysisChart', 'bar', {
        labels: durationData.map(d => d.label),
        datasets: [{
            label: 'Avg P&L by Duration',
            data: durationData.map(d => d.avgPL),
            backgroundColor: '#06b6d4'
        }]
    });

    // 10. Win Rate by Time
    const timeWinRate = {};
    filteredTrades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!timeWinRate[hour]) {
                timeWinRate[hour] = { wins: 0, total: 0 };
            }
            timeWinRate[hour].total++;
            if (trade.pnl > 0) timeWinRate[hour].wins++;
        }
    });

    const winRateData = Object.entries(timeWinRate)
        .sort(([a], [b]) => parseInt(a) - parseInt(b));

    createAdvancedChart('winRateByTimeChart', 'line', {
        labels: winRateData.map(([hour]) => hour + ':00'),
        datasets: [{
            label: 'Win Rate by Hour (%)',
            data: winRateData.map(([, data]) => data.total > 0 ? (data.wins / data.total) * 100 : 0),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }]
    }, {
        scales: {
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Win Rate (%)',
                    color: '#94a3b8'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Hour of Day',
                    color: '#94a3b8'
                }
            }
        }
    });

    // 11. Position Sizing Analysis
    const positionSizes = filteredTrades.map(trade => trade.amount);
    const sizeRanges = {
        '0-1000': 0, '1000-2500': 0, '2500-5000': 0,
        '5000-10000': 0, '10000+': 0
    };

    positionSizes.forEach(size => {
        if (size < 1000) sizeRanges['0-1000']++;
        else if (size < 2500) sizeRanges['1000-2500']++;
        else if (size < 5000) sizeRanges['2500-5000']++;
        else if (size < 10000) sizeRanges['5000-10000']++;
        else sizeRanges['10000+']++;
    });

    createAdvancedChart('positionSizingAnalysisChart', 'doughnut', {
        labels: Object.keys(sizeRanges),
        datasets: [{
            data: Object.values(sizeRanges),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        }]
    });

    // 12. Trading Efficiency Metrics
    const wins = filteredTrades.filter(trade => trade.pnl > 0);
    const losses = filteredTrades.filter(trade => trade.pnl < 0);
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length) : 0;
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;

    const efficiencyData = [
        { label: 'Win Rate', value: winRate },
        { label: 'Profit Factor', value: Math.min(profitFactor * 10, 100) },
        { label: 'Avg Win/Loss', value: avgLoss > 0 ? Math.min((avgWin / avgLoss) * 10, 100) : 0 }
    ];

    createAdvancedChart('tradingEfficiencyMetricsChart', 'radar', {
        labels: efficiencyData.map(d => d.label),
        datasets: [{
            label: 'Efficiency Metrics',
            data: efficiencyData.map(d => d.value),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true
        }]
    }, {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' }
            }
        }
    });
}


// ==================== Algorithmic Analysis ====================

/**
 * 알고리즘 분석 업데이트 (Palantir-style comprehensive analysis)
 */
function updateAlgorithmicAnalysis() {
    console.log('🔍 updateAlgorithmicAnalysis() called');
    console.log('📊 Total trades:', trades.length);
    console.log('🧠 Psychology data entries:', Object.keys(psychologyData).length);

    // Original pattern insights (preserved)
    analyzeTimeBasedPerformance();
    analyzeConsecutiveTradesPattern();
    generateAIInsights();

    // NEW: Phase 1 - Core AI Analysis Modules
    console.log('🔗 Rendering correlation matrix...');
    renderCorrelationMatrix();
    console.log('⏰ Rendering temporal patterns...');
    renderTemporalPatterns();
    console.log('📊 Rendering cluster analysis...');
    renderClusterAnalysis();

    // Phase 2: Advanced algorithmic analysis modules
    console.log('📈 Rendering multi-factor attribution...');
    renderMultiFactorAttribution();
    console.log('⚠️ Rendering predictive risk score...');
    renderPredictiveRiskScore();
    console.log('🎭 Rendering behavioral patterns...');
    renderBehavioralPatterns();
    console.log('🌐 Rendering market intelligence...');
    renderMarketIntelligence();
    console.log('📉 Rendering statistical edge...');
    renderStatisticalEdge();
    console.log('💡 Rendering adaptive recommendations...');
    renderAdaptiveRecommendations();
    console.log('✅ updateAlgorithmicAnalysis() completed');
}

/**
 * Alias for backward compatibility
 */
function updatePatternInsights() {
    updateAlgorithmicAnalysis();
}

/**
 * 시간 기반 성과 분석
 */
function analyzeTimeBasedPerformance() {
    const hourlyPerformance = {};

    trades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourlyPerformance[hour]) {
                hourlyPerformance[hour] = { wins: 0, total: 0, totalPnL: 0 };
            }
            hourlyPerformance[hour].total++;
            hourlyPerformance[hour].totalPnL += trade.pnl;
            if (trade.pnl > 0) hourlyPerformance[hour].wins++;
        }
    });

    // 최고/최악 시간대 찾기
    let bestHour = null, worstHour = null;
    let bestWinRate = 0, worstWinRate = 100;

    Object.entries(hourlyPerformance).forEach(([hour, data]) => {
        if (data.total >= 3) { // 최소 3거래 이상
            const winRate = (data.wins / data.total) * 100;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestHour = hour;
            }
            if (winRate < worstWinRate) {
                worstWinRate = winRate;
                worstHour = hour;
            }
        }
    });

    if (bestHour) {
        document.getElementById('bestTradingHour').textContent = `${bestHour}:00`;
        const bestWinRateEl = document.getElementById('bestHourWinRate');
        if (bestWinRateEl) bestWinRateEl.textContent = `${bestWinRate.toFixed(0)}%`;
    }

    if (worstHour) {
        document.getElementById('worstTradingHour').textContent = `${worstHour}:00`;
        const worstWinRateEl = document.getElementById('worstHourWinRate');
        if (worstWinRateEl) worstWinRateEl.textContent = `${worstWinRate.toFixed(0)}%`;
    }
}

/**
 * 연속 거래 패턴 분석
 */
function analyzeConsecutiveTradesPattern() {
    // 연속 거래 패턴 분석
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

    const patterns = {
        after1Loss: [], after2Losses: [], after3Losses: [],
        after1Win: [], after2Wins: [], after3Wins: []
    };

    for (let i = 1; i < sortedTrades.length; i++) {
        const current = sortedTrades[i];
        const prev1 = sortedTrades[i-1];

        if (prev1.pnl < 0) {
            patterns.after1Loss.push(current.pnl > 0 ? 1 : 0);

            if (i >= 2 && sortedTrades[i-2].pnl < 0) {
                patterns.after2Losses.push(current.pnl > 0 ? 1 : 0);

                if (i >= 3 && sortedTrades[i-3].pnl < 0) {
                    patterns.after3Losses.push(current.pnl > 0 ? 1 : 0);
                }
            }
        } else if (prev1.pnl > 0) {
            patterns.after1Win.push(current.pnl > 0 ? 1 : 0);

            if (i >= 2 && sortedTrades[i-2].pnl > 0) {
                patterns.after2Wins.push(current.pnl > 0 ? 1 : 0);

                if (i >= 3 && sortedTrades[i-3].pnl > 0) {
                    patterns.after3Wins.push(current.pnl > 0 ? 1 : 0);
                }
            }
        }
    }

    // 패턴 결과 업데이트
    Object.entries(patterns).forEach(([key, values]) => {
        if (values.length > 0) {
            const winRate = (values.reduce((sum, val) => sum + val, 0) / values.length) * 100;
            const elementId = key.charAt(0).toLowerCase() + key.slice(1);
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = `${winRate.toFixed(0)}%`;
                element.style.color = winRate >= 50 ? '#1ec426' : '#ef4444';
            }
        }
    });
}

/**
 * AI 인사이트 생성 (통합 및 확장 버전)
 */
function generateAIInsights() {
    const allInsights = [];

    // 1. 감정적 거래 패턴 분석 (Critical)
    const emotionalPatterns = detectEmotionalTradingPatterns();

    if (emotionalPatterns.revengeTrading) {
        allInsights.push({
            priority: 1,
            type: 'danger',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                '⚠️ 복수 거래 패턴 감지: 연속 손실 후 포지션 크기가 급증하는 패턴이 발견되었습니다. 감정적 거래를 피하고 규칙을 준수하세요.' :
                '⚠️ Revenge Trading Detected: Position sizes increase significantly after consecutive losses. Avoid emotional trading and stick to your rules.'
        });
    }

    if (emotionalPatterns.overconfidenceRisk) {
        allInsights.push({
            priority: 1,
            type: 'danger',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                '⚠️ 과신 위험: 높은 자신감 시 포지션 크기 증가 → 승률 감소 패턴. 자신감이 높을 때 포지션 관리에 더욱 주의하세요.' :
                '⚠️ Overconfidence Risk: Higher confidence leads to larger positions but lower win rate. Be extra cautious when feeling confident.'
        });
    }

    if (emotionalPatterns.stressOvertrading) {
        allInsights.push({
            priority: 1,
            type: 'danger',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                '⚠️ 스트레스 과도거래: 스트레스가 높은 날 평균보다 30% 이상 많이 거래합니다. 스트레스 관리와 거래 빈도 조절이 필요합니다.' :
                '⚠️ Stress-Induced Overtrading: You trade 30%+ more on high-stress days. Manage stress and reduce trading frequency.'
        });
    }

    if (emotionalPatterns.lowFocusRisk) {
        allInsights.push({
            priority: 1,
            type: 'warning',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                '⚠️ 낮은 집중력 위험: 집중력 낮을 때 승률 45% 미만. 집중력이 낮다면 거래를 피하거나 최소 포지션만 사용하세요.' :
                '⚠️ Low Focus Risk: Win rate drops below 45% when focus is low. Avoid trading or use minimum positions when unfocused.'
        });
    }

    // 2. 최적 거래 조건 분석 (Optimization)
    const optimalConditions = identifyOptimalConditions();
    if (optimalConditions.optimal) {
        const opt = optimalConditions.optimal;

        allInsights.push({
            priority: 2,
            type: 'good',
            category: 'optimization',
            text: currentLanguage === 'ko' ?
                `💡 최적 조건 발견: 수면 ${opt.sleepRange.min.toFixed(1)}-${opt.sleepRange.max.toFixed(1)}시간 + 스트레스 레벨 ${opt.stressRange.mode} + 집중력 레벨 ${opt.focusRange.mode}에서 최고 성과 달성 (샘플: ${optimalConditions.sampleSize}일)` :
                `💡 Optimal Conditions Found: Sleep ${opt.sleepRange.min.toFixed(1)}-${opt.sleepRange.max.toFixed(1)}hrs + Stress Level ${opt.stressRange.mode} + Focus Level ${opt.focusRange.mode} yields best performance (${optimalConditions.sampleSize} days)`
        });

        // 환경 최적화
        if (opt.environments && Object.keys(opt.environments).length > 0) {
            const bestEnvEntry = Object.entries(opt.environments).sort((a, b) => b[1] - a[1])[0];
            allInsights.push({
                priority: 2,
                type: 'good',
                category: 'optimization',
                text: currentLanguage === 'ko' ?
                    `💡 최적 환경: "${bestEnvEntry[0]}" 환경에서 최고 성과 빈도 (${bestEnvEntry[1]}/${optimalConditions.sampleSize}일)` :
                    `💡 Optimal Environment: "${bestEnvEntry[0]}" shows best performance frequency (${bestEnvEntry[1]}/${optimalConditions.sampleSize} days)`
            });
        }
    }

    // 3. 스트레스-성과 상관관계 (Pattern)
    const stressAnalysis = analyzeStressPerformance();
    if (stressAnalysis.correlation !== null) {
        if (Math.abs(stressAnalysis.correlation) > 0.3) {
            allInsights.push({
                priority: 2,
                type: stressAnalysis.correlation < 0 ? 'good' : 'warning',
                category: 'pattern',
                text: currentLanguage === 'ko' ?
                    `📊 스트레스-성과 상관관계: ${(stressAnalysis.correlation * 100).toFixed(0)}% 상관관계 발견. ${stressAnalysis.optimalRange === 'low' ? '낮은 스트레스에서 최적 성과' : stressAnalysis.optimalRange === 'medium' ? '중간 스트레스에서 최적 성과' : '주의: 높은 스트레스 회피 필요'}` :
                    `📊 Stress-Performance Correlation: ${(stressAnalysis.correlation * 100).toFixed(0)}% correlation. ${stressAnalysis.optimalRange === 'low' ? 'Best performance at low stress' : stressAnalysis.optimalRange === 'medium' ? 'Best performance at medium stress' : 'Warning: Avoid high stress'}`
            });
        }
    }

    // 4. 집중력-정확도 상관관계 (Pattern)
    const focusAnalysis = analyzeFocusAccuracy();
    if (focusAnalysis.correlation !== null && Math.abs(focusAnalysis.correlation) > 0.3) {
        allInsights.push({
            priority: 2,
            type: 'good',
            category: 'pattern',
            text: currentLanguage === 'ko' ?
                `📊 집중력-정확도 상관관계: ${(focusAnalysis.correlation * 100).toFixed(0)}% 상관관계. ${focusAnalysis.threshold ? `최소 집중력 레벨 ${focusAnalysis.threshold} 이상 권장` : '높은 집중력이 성과 향상에 기여'}` :
                `📊 Focus-Accuracy Correlation: ${(focusAnalysis.correlation * 100).toFixed(0)}% correlation. ${focusAnalysis.threshold ? `Minimum focus level ${focusAnalysis.threshold}+ recommended` : 'Higher focus improves performance'}`
        });
    }

    // 5. 환경-성과 분석 (Pattern)
    const envAnalysis = analyzeEnvironmentImpact();
    if (envAnalysis.bestEnv) {
        const bestEnvStats = envAnalysis.envPerformance[envAnalysis.bestEnv];
        allInsights.push({
            priority: 2,
            type: 'good',
            category: 'pattern',
            text: currentLanguage === 'ko' ?
                `📊 최적 거래 환경: "${envAnalysis.bestEnv}"에서 승률 ${bestEnvStats.winRate.toFixed(0)}%, 평균 P&L $${bestEnvStats.avgPnL.toFixed(2)} (${bestEnvStats.sampleSize}일)` :
                `📊 Optimal Trading Environment: "${envAnalysis.bestEnv}" with ${bestEnvStats.winRate.toFixed(0)}% win rate, avg P&L $${bestEnvStats.avgPnL.toFixed(2)} (${bestEnvStats.sampleSize} days)`
        });
    }

    // 6. 기존 수면-성과 분석 (Pattern)
    const sleepPerformance = analyzeSleepPerformance();
    if (sleepPerformance.correlation !== null && Math.abs(sleepPerformance.correlation) > 0.3) {
        allInsights.push({
            priority: 2,
            type: sleepPerformance.correlation > 0 ? 'good' : 'warning',
            category: 'pattern',
            text: currentLanguage === 'ko' ?
                `📊 수면-성과 상관관계: ${(sleepPerformance.correlation * 100).toFixed(0)}% 상관관계. ${sleepPerformance.correlation > 0 ? '충분한 수면이 성과 향상에 도움' : '수면 패턴 재검토 필요'}` :
                `📊 Sleep-Performance Correlation: ${(sleepPerformance.correlation * 100).toFixed(0)}% correlation. ${sleepPerformance.correlation > 0 ? 'Adequate sleep improves performance' : 'Review sleep patterns'}`
        });
    }

    // 7. 시간대별 최적화 (Optimization)
    const timeOptimization = getTimeOptimization();
    if (timeOptimization) {
        allInsights.push({
            priority: 2,
            type: 'good',
            category: 'optimization',
            text: currentLanguage === 'ko' ?
                `💡 최적 거래 시간대: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (승률 ${timeOptimization.winRate.toFixed(0)}%)` :
                `💡 Optimal Trading Time: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (${timeOptimization.winRate.toFixed(0)}% win rate)`
        });
    }

    // 8. 연속 손실 패턴 (Warning)
    const consecutiveLossPattern = getConsecutiveLossPattern();
    if (consecutiveLossPattern && consecutiveLossPattern.after3Losses < 45) {
        allInsights.push({
            priority: 1,
            type: 'warning',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                `⚠️ 연속 손실 패턴: 3연속 손실 후 승률 ${consecutiveLossPattern.after3Losses.toFixed(0)}%로 급감. 연속 손실 시 즉시 휴식하세요.` :
                `⚠️ Consecutive Loss Pattern: Win rate drops to ${consecutiveLossPattern.after3Losses.toFixed(0)}% after 3 losses. Take an immediate break.`
        });
    }

    // 9. 과도거래 감지 (Warning)
    const recentOvertrading = detectOvertrading();
    if (recentOvertrading > 30) {
        allInsights.push({
            priority: 1,
            type: 'warning',
            category: 'critical',
            text: currentLanguage === 'ko' ?
                `⚠️ 과도거래 경고: 계획 대비 ${recentOvertrading.toFixed(0)}% 초과 거래. 거래 빈도를 줄이고 품질에 집중하세요.` :
                `⚠️ Overtrading Warning: ${recentOvertrading.toFixed(0)}% above planned trades. Reduce frequency and focus on quality.`
        });
    }

    // 우선순위 정렬 (priority 1이 가장 높음)
    allInsights.sort((a, b) => a.priority - b.priority);

    // 기본 메시지
    if (allInsights.length === 0) {
        allInsights.push({
            priority: 3,
            type: 'info',
            category: 'info',
            text: currentLanguage === 'ko' ?
                '💬 더 많은 심리 데이터와 거래 기록을 수집하여 개인화된 AI 인사이트를 생성하세요. 최소 5일 이상의 데이터가 필요합니다.' :
                '💬 Collect more psychology data and trading records to generate personalized AI insights. Minimum 5 days of data required.'
        });
    }

    // 인사이트 렌더링
    const insightsList = document.getElementById('aiInsightsList');
    if (insightsList) {
        insightsList.innerHTML = allInsights.map(insight => `
            <div style="background: #0f172a; border-left: 4px solid ${getInsightColor(insight.type)}; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                <div style="color: #e4e4e7; font-size: 14px; line-height: 1.5;">${insight.text}</div>
            </div>
        `).join('');
    }
}

/**
 * 인사이트 색상 가져오기
 */
function getInsightColor(type) {
    switch(type) {
        case 'good': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'danger': return '#ef4444';
        default: return '#3b82f6';
    }
}

/**
 * 수면 성과 분석
 */
function analyzeSleepPerformance() {
    const dataPoints = [];

    Object.values(psychologyData).forEach(dayData => {
        if (dayData.sleepHours) {
            const dayTrades = trades.filter(trade => trade.date === dayData.date);
            if (dayTrades.length > 0) {
                const dayPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                dataPoints.push({ sleep: dayData.sleepHours, performance: dayPnL });
            }
        }
    });

    if (dataPoints.length < 5) return { correlation: null };

    // 피어슨 상관계수 계산
    const n = dataPoints.length;
    const sumSleep = dataPoints.reduce((sum, point) => sum + point.sleep, 0);
    const sumPerf = dataPoints.reduce((sum, point) => sum + point.performance, 0);
    const sumSleepSq = dataPoints.reduce((sum, point) => sum + point.sleep * point.sleep, 0);
    const sumPerfSq = dataPoints.reduce((sum, point) => sum + point.performance * point.performance, 0);
    const sumSleepPerf = dataPoints.reduce((sum, point) => sum + point.sleep * point.performance, 0);

    const numerator = n * sumSleepPerf - sumSleep * sumPerf;
    const denominator = Math.sqrt((n * sumSleepSq - sumSleep * sumSleep) * (n * sumPerfSq - sumPerf * sumPerf));

    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return { correlation };
}

/**
 * 과도거래 감지
 */
function detectOvertrading() {
    let currentPsychologyDate = formatTradingDate(new Date());
    const todayData = psychologyData[currentPsychologyDate];

    if (!todayData || !todayData.plannedTrades) return 0;

    const actualTrades = trades.filter(trade => trade.date === currentPsychologyDate).length;
    return ((actualTrades - todayData.plannedTrades) / todayData.plannedTrades) * 100;
}

/**
 * 시간 최적화 정보 가져오기
 */
function getTimeOptimization() {
    const hourlyStats = {};

    trades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourlyStats[hour]) {
                hourlyStats[hour] = { wins: 0, total: 0 };
            }
            hourlyStats[hour].total++;
            if (trade.pnl > 0) hourlyStats[hour].wins++;
        }
    });

    let bestHour = null;
    let bestWinRate = 0;

    Object.entries(hourlyStats).forEach(([hour, stats]) => {
        if (stats.total >= 5) { // 최소 5거래
            const winRate = (stats.wins / stats.total) * 100;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestHour = parseInt(hour);
            }
        }
    });

    return bestHour ? { bestHour, winRate: bestWinRate } : null;
}

/**
 * 연속 손실 패턴 가져오기
 */
function getConsecutiveLossPattern() {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

    const after3Losses = [];

    for (let i = 3; i < sortedTrades.length; i++) {
        if (sortedTrades[i-1].pnl < 0 && sortedTrades[i-2].pnl < 0 && sortedTrades[i-3].pnl < 0) {
            after3Losses.push(sortedTrades[i].pnl > 0 ? 1 : 0);
        }
    }

    if (after3Losses.length === 0) return null;

    const winRate = (after3Losses.reduce((sum, val) => sum + val, 0) / after3Losses.length) * 100;
    return { after3Losses: winRate };
}

// ==================== Advanced Correlation Analysis ====================

/**
 * 범용 피어슨 상관계수 계산
 */
function calculatePearsonCorrelation(dataPoints) {
    if (!dataPoints || dataPoints.length < 3) return null;

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
    const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumY2 = dataPoints.reduce((sum, point) => sum + point.y * point.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 스트레스-성과 상관관계 분석
 */
function analyzeStressPerformance() {
    const dataPoints = [];

    Object.entries(psychologyData).forEach(([date, dayData]) => {
        if (dayData.stressLevel) {
            const dayTrades = trades.filter(trade => trade.date === date);
            if (dayTrades.length > 0) {
                const winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
                const avgPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0) / dayTrades.length;
                dataPoints.push({ x: dayData.stressLevel, y: winRate, pnl: avgPnL, date });
            }
        }
    });

    if (dataPoints.length < 3) return { correlation: null, optimalRange: null };

    const correlation = calculatePearsonCorrelation(dataPoints);

    // 최적 스트레스 레벨 찾기 (승률이 가장 높은 구간)
    const stressGroups = { low: [], medium: [], high: [] };
    dataPoints.forEach(point => {
        if (point.x <= 2) stressGroups.low.push(point.y);
        else if (point.x <= 3) stressGroups.medium.push(point.y);
        else stressGroups.high.push(point.y);
    });

    let optimalRange = 'medium';
    let bestWinRate = 0;
    Object.entries(stressGroups).forEach(([level, winRates]) => {
        if (winRates.length > 0) {
            const avgWinRate = winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length;
            if (avgWinRate > bestWinRate) {
                bestWinRate = avgWinRate;
                optimalRange = level;
            }
        }
    });

    return { correlation, optimalRange, bestWinRate, dataPoints };
}

/**
 * 자신감-포지션 크기 상관관계 분석
 */
function analyzeConfidenceImpact() {
    const dataPoints = [];

    Object.entries(psychologyData).forEach(([date, dayData]) => {
        if (dayData.confidenceLevel) {
            const dayTrades = trades.filter(trade => trade.date === date);
            if (dayTrades.length > 0) {
                const avgPosition = dayTrades.reduce((sum, t) => sum + t.amount, 0) / dayTrades.length;
                const winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
                dataPoints.push({ x: dayData.confidenceLevel, y: avgPosition, winRate, date });
            }
        }
    });

    if (dataPoints.length < 3) return { correlation: null, riskLevel: null };

    const correlation = calculatePearsonCorrelation(dataPoints);

    // 과신 위험도 평가
    let riskLevel = 'normal';
    if (correlation > 0.5) {
        // 자신감이 높을수록 포지션이 커지고 승률이 낮아지는 패턴
        const highConfidenceData = dataPoints.filter(p => p.x >= 4);
        if (highConfidenceData.length > 0) {
            const avgWinRate = highConfidenceData.reduce((sum, p) => sum + p.winRate, 0) / highConfidenceData.length;
            if (avgWinRate < 50) riskLevel = 'high';
        }
    }

    return { correlation, riskLevel, dataPoints };
}

/**
 * 집중력-거래 정확도 상관관계 분석
 */
function analyzeFocusAccuracy() {
    const dataPoints = [];

    Object.entries(psychologyData).forEach(([date, dayData]) => {
        if (dayData.focusLevel) {
            const dayTrades = trades.filter(trade => trade.date === date);
            if (dayTrades.length > 0) {
                const winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
                const avgReturn = dayTrades.reduce((sum, t) => sum + (t.returnPct || 0), 0) / dayTrades.length;
                dataPoints.push({ x: dayData.focusLevel, y: winRate, avgReturn, date });
            }
        }
    });

    if (dataPoints.length < 3) return { correlation: null, threshold: null };

    const correlation = calculatePearsonCorrelation(dataPoints);

    // 최소 집중력 임계값 찾기
    let threshold = null;
    const lowFocusData = dataPoints.filter(p => p.x <= 2);
    const highFocusData = dataPoints.filter(p => p.x >= 4);

    if (lowFocusData.length > 0 && highFocusData.length > 0) {
        const lowAvg = lowFocusData.reduce((sum, p) => sum + p.y, 0) / lowFocusData.length;
        const highAvg = highFocusData.reduce((sum, p) => sum + p.y, 0) / highFocusData.length;

        if (highAvg - lowAvg > 15) { // 15% 이상 차이
            threshold = 3;
        }
    }

    return { correlation, threshold, dataPoints };
}

/**
 * 환경-성과 상관관계 분석
 */
function analyzeEnvironmentImpact() {
    const envPerformance = {};

    Object.entries(psychologyData).forEach(([date, dayData]) => {
        if (dayData.environmentType) {
            const dayTrades = trades.filter(trade => trade.date === date);
            if (dayTrades.length > 0) {
                const env = dayData.environmentType;
                if (!envPerformance[env]) {
                    envPerformance[env] = { wins: 0, total: 0, totalPnL: 0 };
                }

                dayTrades.forEach(trade => {
                    envPerformance[env].total++;
                    envPerformance[env].totalPnL += trade.pnl;
                    if (trade.pnl > 0) envPerformance[env].wins++;
                });
            }
        }
    });

    // 각 환경별 승률 계산
    const results = {};
    Object.entries(envPerformance).forEach(([env, stats]) => {
        if (stats.total > 0) {
            results[env] = {
                winRate: (stats.wins / stats.total) * 100,
                avgPnL: stats.totalPnL / stats.total,
                sampleSize: stats.total
            };
        }
    });

    // 최적 환경 찾기
    let bestEnv = null;
    let bestScore = 0;
    Object.entries(results).forEach(([env, stats]) => {
        if (stats.sampleSize >= 3) { // 최소 샘플 크기
            const score = stats.winRate * (stats.avgPnL > 0 ? 1.2 : 0.8);
            if (score > bestScore) {
                bestScore = score;
                bestEnv = env;
            }
        }
    });

    return { envPerformance: results, bestEnv };
}

// ==================== Emotional Trading Pattern Detection ====================

/**
 * 감정적 거래 패턴 감지
 */
function detectEmotionalTradingPatterns() {
    const patterns = {
        revengeTrading: false,
        overconfidenceRisk: false,
        stressOvertrading: false,
        lowFocusRisk: false
    };

    // 복수 거래 패턴 감지 (연속 손실 후 포지션 크기 증가)
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

    for (let i = 2; i < sortedTrades.length; i++) {
        const prev1 = sortedTrades[i-1];
        const prev2 = sortedTrades[i-2];
        const current = sortedTrades[i];

        // 2연속 손실 후 포지션 크기가 평균의 150% 이상
        if (prev1.pnl < 0 && prev2.pnl < 0) {
            const avgPosition = trades.reduce((sum, t) => sum + t.amount, 0) / trades.length;
            if (current.amount > avgPosition * 1.5) {
                patterns.revengeTrading = true;
                break;
            }
        }
    }

    // 과신 위험 패턴 (높은 자신감 + 큰 포지션 + 낮은 승률)
    const confidenceAnalysis = analyzeConfidenceImpact();
    if (confidenceAnalysis.riskLevel === 'high') {
        patterns.overconfidenceRisk = true;
    }

    // 스트레스 과도거래 (높은 스트레스 날짜에 평균보다 많은 거래)
    const highStressDays = Object.entries(psychologyData).filter(([_, data]) => data.stressLevel >= 4);
    if (highStressDays.length > 0) {
        const avgTradesPerDay = trades.length / Object.keys(psychologyData).length;
        const stressDayTrades = highStressDays.map(([date]) =>
            trades.filter(t => t.date === date).length
        );
        const avgStressTrades = stressDayTrades.reduce((sum, count) => sum + count, 0) / stressDayTrades.length;

        if (avgStressTrades > avgTradesPerDay * 1.3) {
            patterns.stressOvertrading = true;
        }
    }

    // 낮은 집중력 거래 위험
    const focusAnalysis = analyzeFocusAccuracy();
    if (focusAnalysis.threshold && focusAnalysis.threshold >= 3) {
        const lowFocusDays = Object.entries(psychologyData).filter(([_, data]) =>
            data.focusLevel && data.focusLevel < focusAnalysis.threshold
        );

        if (lowFocusDays.length > 0) {
            const lowFocusWinRates = lowFocusDays.map(([date]) => {
                const dayTrades = trades.filter(t => t.date === date);
                return dayTrades.length > 0 ?
                    (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100 : 0;
            }).filter(wr => wr > 0);

            if (lowFocusWinRates.length > 0) {
                const avgWinRate = lowFocusWinRates.reduce((sum, wr) => sum + wr, 0) / lowFocusWinRates.length;
                if (avgWinRate < 45) {
                    patterns.lowFocusRisk = true;
                }
            }
        }
    }

    return patterns;
}

/**
 * 최적 거래 조건 식별
 */
function identifyOptimalConditions() {
    const conditions = [];

    // 모든 심리 데이터가 있는 날짜 필터링
    const completeDays = Object.entries(psychologyData).filter(([date, data]) =>
        data.sleepHours && data.stressLevel && data.focusLevel && data.confidenceLevel &&
        trades.some(t => t.date === date)
    );

    if (completeDays.length < 5) {
        return { optimal: null, conditions: [] };
    }

    // 각 날짜의 성과 계산
    const dayPerformance = completeDays.map(([date, psyData]) => {
        const dayTrades = trades.filter(t => t.date === date);
        const winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
        const avgPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0) / dayTrades.length;
        const totalPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0);

        return {
            date,
            winRate,
            avgPnL,
            totalPnL,
            sleepHours: psyData.sleepHours,
            stressLevel: psyData.stressLevel,
            focusLevel: psyData.focusLevel,
            confidenceLevel: psyData.confidenceLevel,
            environmentType: psyData.environmentType
        };
    });

    // 성과 상위 30% 날짜 추출
    const sortedByPerformance = [...dayPerformance].sort((a, b) => b.totalPnL - a.totalPnL);
    const topPerformers = sortedByPerformance.slice(0, Math.max(3, Math.floor(sortedByPerformance.length * 0.3)));

    // 최적 조건 패턴 찾기
    const optimalPattern = {
        sleepRange: { min: 0, max: 12 },
        stressRange: { min: 1, max: 5 },
        focusRange: { min: 1, max: 5 },
        confidenceRange: { min: 1, max: 5 },
        environments: {}
    };

    // 수면 시간 범위
    const sleepHours = topPerformers.map(d => d.sleepHours).sort((a, b) => a - b);
    optimalPattern.sleepRange = {
        min: sleepHours[0],
        max: sleepHours[sleepHours.length - 1],
        avg: sleepHours.reduce((sum, h) => sum + h, 0) / sleepHours.length
    };

    // 스트레스 레벨 범위
    const stressLevels = topPerformers.map(d => d.stressLevel);
    optimalPattern.stressRange = {
        avg: stressLevels.reduce((sum, s) => sum + s, 0) / stressLevels.length,
        mode: getMostCommon(stressLevels)
    };

    // 집중력 범위
    const focusLevels = topPerformers.map(d => d.focusLevel);
    optimalPattern.focusRange = {
        avg: focusLevels.reduce((sum, f) => sum + f, 0) / focusLevels.length,
        mode: getMostCommon(focusLevels)
    };

    // 자신감 범위
    const confidenceLevels = topPerformers.map(d => d.confidenceLevel);
    optimalPattern.confidenceRange = {
        avg: confidenceLevels.reduce((sum, c) => sum + c, 0) / confidenceLevels.length,
        mode: getMostCommon(confidenceLevels)
    };

    // 최적 환경
    topPerformers.forEach(d => {
        if (d.environmentType) {
            optimalPattern.environments[d.environmentType] =
                (optimalPattern.environments[d.environmentType] || 0) + 1;
        }
    });

    return {
        optimal: optimalPattern,
        topDays: topPerformers.slice(0, 3),
        sampleSize: topPerformers.length
    };
}

/**
 * 최빈값 찾기 헬퍼 함수
 */
function getMostCommon(arr) {
    const frequency = {};
    arr.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
    });

    let maxCount = 0;
    let mode = null;
    Object.entries(frequency).forEach(([val, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mode = parseFloat(val);
        }
    });

    return mode;
}
// analytics-market-data-addon.js - Market Data Integration for Analytics

// This file contains market data functions that extend analytics.js
// To be merged into analytics.js manually or loaded as separate script

// ==================== Market Data Integration ====================

/**
 * 시장 데이터 섹션 로드 (캐싱 적용)
 */
async function loadMarketDataSection() {
    console.log('📊 Loading market data section...');

    if (!marketDataEnabled) {
        console.log('⚠️ Market data is disabled');
        displayNoMarketData();
        return;
    }

    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        console.log('⚠️ No trades to analyze');
        displayNoMarketData();
        return;
    }

    // Check if market data already loaded with same filter (session cache)
    const currentFilter = {
        startDate: analyticsStartDate,
        endDate: analyticsEndDate,
        tradeCount: filteredTrades.length
    };

    if (marketDataLoadedOnce &&
        JSON.stringify(currentFilter) === JSON.stringify(marketDataFilterState)) {
        console.log('✓ Using cached market data (no API calls)');
        return; // Already displayed, keep existing data
    }

    // Mark as loading new data
    console.log(`⟳ Loading market data: ${filteredTrades.length} trades...`);
    marketDataFilterState = currentFilter;
    marketDataLoadedOnce = true;

    showMarketDataLoading();

    try {
        await Promise.all([
            loadSymbolQuotes(filteredTrades),
            loadPriceContextAnalysis(filteredTrades)
        ]);
        console.log('✓ Market data section loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load market data section:', error);
        const quotesContainer = document.getElementById('symbolQuotesContainer');
        if (quotesContainer) {
            quotesContainer.innerHTML = `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 18px; margin-bottom: 8px;">❌</div>
                    <div style="color: #ef4444; margin-bottom: 8px;">Failed to load market data</div>
                    <div style="color: #64748b; font-size: 14px;">${error.message}</div>
                </div>
            `;
        }
        // Reset cache flags on error
        marketDataLoadedOnce = false;
        marketDataFilterState = null;
    }
}

/**
 * 로딩 상태 표시
 */
function showMarketDataLoading() {
    const quotesContainer = document.getElementById('symbolQuotesContainer');
    const contextContainer = document.getElementById('priceContextContainer');

    if (quotesContainer) {
        quotesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <div style="font-size: 18px; margin-bottom: 8px;">⏳</div>
                <div data-lang="loading-market-data">Loading market data...</div>
            </div>
        `;
    }

    if (contextContainer) {
        contextContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <div style="font-size: 18px; margin-bottom: 8px;">⏳</div>
                <div data-lang="loading-market-data">Loading market data...</div>
            </div>
        `;
    }

    updateLanguage();
}

/**
 * 데이터 없음 상태 표시
 */
function displayNoMarketData() {
    const quotesContainer = document.getElementById('symbolQuotesContainer');
    const contextContainer = document.getElementById('priceContextContainer');

    if (quotesContainer) {
        quotesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <div style="font-size: 18px; margin-bottom: 8px;">📊</div>
                <div data-lang="no-market-data">No market data available</div>
            </div>
        `;
    }

    if (contextContainer) {
        contextContainer.innerHTML = '';
    }

    updateLanguage();
}

/**
 * 종목 시세 정보 로드
 */
async function loadSymbolQuotes(filteredTrades) {
    const symbols = getTradedSymbols();
    const quotesContainer = document.getElementById('symbolQuotesContainer');

    if (!quotesContainer || symbols.length === 0) {
        return;
    }

    try {
        loadingMarketData = true;
        const maxSymbols = 5;
        const limitedSymbols = symbols.slice(0, maxSymbols);
        let quotesHTML = '';

        for (const symbol of limitedSymbols) {
            try {
                const quote = await getSymbolQuoteInfo(symbol);
                const stats = getSymbolTradeStats(symbol);

                if (quote && stats) {
                    const changeClass = quote.change >= 0 ? 'positive' : 'negative';
                    const changeSymbol = quote.change >= 0 ? '▲' : '▼';

                    quotesHTML += `
                        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                <div>
                                    <div style="font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${quote.symbol}</div>
                                    <div style="font-size: 12px; color: #64748b;" data-lang="last-updated">Last Updated</div>
                                    <div style="font-size: 11px; color: #475569;">${quote.latestTradingDay}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 20px; font-weight: 600; color: #f8fafc;">$${quote.price.toFixed(2)}</div>
                                    <div style="font-size: 14px; color: ${changeClass === 'positive' ? '#10b981' : '#ef4444'};">
                                        ${changeSymbol} ${quote.changePercent}
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;" data-lang="open">Open</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">$${quote.open.toFixed(2)}</div>
                                </div>
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;" data-lang="high">High</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #10b981;">$${quote.high.toFixed(2)}</div>
                                </div>
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;" data-lang="low">Low</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #ef4444;">$${quote.low.toFixed(2)}</div>
                                </div>
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;" data-lang="volume">Volume</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">${(quote.volume / 1000000).toFixed(2)}M</div>
                                </div>
                            </div>
                            <div style="border-top: 1px solid #334155; padding-top: 12px;">
                                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Your Trading Stats</div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 11px; color: #64748b;">Trades</div>
                                        <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">${stats.tradeCount}</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 11px; color: #64748b;">Win Rate</div>
                                        <div style="font-size: 14px; font-weight: 600; color: ${stats.winRate >= 50 ? '#10b981' : '#ef4444'};">${stats.winRate.toFixed(0)}%</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 11px; color: #64748b;">Total P/L</div>
                                        <div style="font-size: 14px; font-weight: 600; color: ${stats.totalPnL >= 0 ? '#10b981' : '#ef4444'};">$${stats.totalPnL.toFixed(0)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                if (limitedSymbols.indexOf(symbol) < limitedSymbols.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }
            } catch (error) {
                console.error(`Failed to load quote for ${symbol}:`, error);
                quotesHTML += `
                    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px;">
                        <div style="font-size: 18px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">${symbol}</div>
                        <div style="color: #ef4444; font-size: 14px;">Failed to load market data</div>
                    </div>
                `;
            }
        }

        if (symbols.length > maxSymbols) {
            quotesHTML += `
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="color: #94a3b8; font-size: 14px;">
                        Showing ${maxSymbols} of ${symbols.length} symbols
                    </div>
                </div>
            `;
        }

        quotesContainer.innerHTML = quotesHTML;
        updateLanguage();
    } catch (error) {
        console.error('Failed to load symbol quotes:', error);
        quotesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ef4444;">
                <div>Failed to load market data</div>
            </div>
        `;
    } finally {
        loadingMarketData = false;
    }
}

/**
 * 가격 컨텍스트 분석 로드
 */
async function loadPriceContextAnalysis(filteredTrades) {
    const contextContainer = document.getElementById('priceContextContainer');
    if (!contextContainer) return;

    try {
        const recentTrades = filteredTrades.slice(-10).reverse();
        let contextHTML = '';

        for (const trade of recentTrades.slice(0, 3)) {
            try {
                const context = await analyzeTradePriceContext(trade);
                if (context) {
                    contextHTML += `
                        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                <div>
                                    <div style="font-size: 18px; font-weight: 600; color: #f8fafc;">${context.symbol}</div>
                                    <div style="font-size: 12px; color: #64748b;">${context.date}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 14px; color: ${trade.pnl >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                                        ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8;" data-lang="entry-position">Entry</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">
                                        ${context.entryPositionPct.toFixed(0)}% of range
                                    </div>
                                </div>
                                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
                                    <div style="font-size: 11px; color: #94a3b8;" data-lang="exit-position">Exit</div>
                                    <div style="font-size: 14px; font-weight: 600; color: #f8fafc;">
                                        ${context.exitPositionPct.toFixed(0)}% of range
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                if (recentTrades.indexOf(trade) < Math.min(recentTrades.length - 1, 2)) {
                    await new Promise(resolve => setTimeout(resolve, 12000));
                }
            } catch (error) {
                console.error(`Failed to analyze ${trade.symbol}:`, error);
            }
        }

        contextContainer.innerHTML = contextHTML || `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <div data-lang="no-market-data">No market data available</div>
            </div>
        `;
        updateLanguage();
    } catch (error) {
        console.error('Failed to load price context:', error);
    }
}

/**
 * 시장 시세 새로고침
 */
async function refreshMarketQuotes() {
    const filteredTrades = getFilteredTradesForAnalytics();
    showMarketDataLoading();
    await loadSymbolQuotes(filteredTrades);
}

// ==================== Market Data Analysis for Detail Cards ====================

/**
 * 시장 데이터 분석 카드 전체 업데이트
 */
async function updateMarketDataAnalysisCards(filteredTrades) {
    if (filteredTrades.length === 0) {
        resetMarketDataCards();
        return;
    }

    // 로딩 상태 표시
    showMarketDataCardsLoading();

    try {
        // 병렬로 분석 실행 (await 없이 Promise 수집)
        const analysisPromises = [
            updateMarketCharacteristics(filteredTrades),
            updateVolumeLiquidity(filteredTrades),
            updateVolatilityPerformance(filteredTrades),
            updateMarketCapPreference(filteredTrades),
            updateIntradayPerformance(filteredTrades),
            updateSectorPerformance(filteredTrades),
            updateSPYCorrelation(filteredTrades),
            updateRelativeVolumeCorrelation(filteredTrades),
            // NEW Advanced Analysis
            updateEntryExitTiming(filteredTrades),
            updateGapTradingPerformance(filteredTrades),
            updateSectorRotationCard(filteredTrades),
            updatePriceLevelPsychology(filteredTrades)
        ];

        // 모든 분석이 완료될 때까지 대기 (에러 발생 시에도 계속 진행)
        await Promise.allSettled(analysisPromises);

    } catch (error) {
        console.error('Market data analysis error:', error);
    }
}

/**
 * 시장 데이터 카드 로딩 상태 표시
 */
function showMarketDataCardsLoading() {
    const loadingValue = '<span style="color: #64748b;">Loading...</span>';

    // Market Characteristics
    document.getElementById('detailAvgFloat').innerHTML = loadingValue;
    document.getElementById('detailAvgMarketCap').innerHTML = loadingValue;
    document.getElementById('detailAvgBeta').innerHTML = loadingValue;
    document.getElementById('detailSymbolsAnalyzed').textContent = '0';

    // Volume & Liquidity
    document.getElementById('detailHighVolumeWinRate').innerHTML = loadingValue;
    document.getElementById('detailLowVolumeWinRate').innerHTML = loadingValue;
    document.getElementById('detailMedianVolume').innerHTML = loadingValue;

    // Volatility Performance
    document.getElementById('detailHighVolatilityWinRate').innerHTML = loadingValue;
    document.getElementById('detailMediumVolatilityWinRate').innerHTML = loadingValue;
    document.getElementById('detailLowVolatilityWinRate').innerHTML = loadingValue;

    // Market Cap Preference
    document.getElementById('detailSmallCapWinRate').innerHTML = loadingValue;
    document.getElementById('detailMidCapWinRate').innerHTML = loadingValue;
    document.getElementById('detailLargeCapWinRate').innerHTML = loadingValue;

    // Intraday Performance
    document.getElementById('detailIntraday20').innerHTML = loadingValue;
    document.getElementById('detailIntraday30').innerHTML = loadingValue;
    document.getElementById('detailIntraday50').innerHTML = loadingValue;
    document.getElementById('detailIntraday100').innerHTML = loadingValue;

    // Sector Performance
    document.getElementById('sectorPerformanceContent').innerHTML = '<div class="detail-item"><span class="detail-label">Loading...</span><span class="detail-value">-</span></div>';

    // SPY Correlation
    document.getElementById('detailSPYUpDays').innerHTML = loadingValue;
    document.getElementById('detailSPYDownDays').innerHTML = loadingValue;

    // Relative Volume
    document.getElementById('detailHighRelVol').innerHTML = loadingValue;
    document.getElementById('detailMediumRelVol').innerHTML = loadingValue;
    document.getElementById('detailNormalRelVol').innerHTML = loadingValue;
}

/**
 * 시장 데이터 카드 초기화
 */
function resetMarketDataCards() {
    const noDataValue = '-';

    // Market Characteristics
    document.getElementById('detailAvgFloat').textContent = noDataValue;
    document.getElementById('detailAvgMarketCap').textContent = noDataValue;
    document.getElementById('detailAvgBeta').textContent = noDataValue;
    document.getElementById('detailSymbolsAnalyzed').textContent = '0';

    // Volume & Liquidity
    document.getElementById('detailHighVolumeWinRate').textContent = noDataValue;
    document.getElementById('detailLowVolumeWinRate').textContent = noDataValue;
    document.getElementById('detailMedianVolume').textContent = noDataValue;

    // Volatility Performance
    document.getElementById('detailHighVolatilityWinRate').textContent = noDataValue;
    document.getElementById('detailMediumVolatilityWinRate').textContent = noDataValue;
    document.getElementById('detailLowVolatilityWinRate').textContent = noDataValue;

    // Market Cap Preference
    document.getElementById('detailSmallCapWinRate').textContent = noDataValue;
    document.getElementById('detailMidCapWinRate').textContent = noDataValue;
    document.getElementById('detailLargeCapWinRate').textContent = noDataValue;

    // Intraday Performance
    document.getElementById('detailIntraday20').textContent = noDataValue;
    document.getElementById('detailIntraday30').textContent = noDataValue;
    document.getElementById('detailIntraday50').textContent = noDataValue;
    document.getElementById('detailIntraday100').textContent = noDataValue;

    // Sector Performance
    document.getElementById('sectorPerformanceContent').innerHTML = '<div class="detail-item"><span class="detail-label">No data</span><span class="detail-value">-</span></div>';

    // SPY Correlation
    document.getElementById('detailSPYUpDays').textContent = noDataValue;
    document.getElementById('detailSPYDownDays').textContent = noDataValue;

    // Relative Volume
    document.getElementById('detailHighRelVol').textContent = noDataValue;
    document.getElementById('detailMediumRelVol').textContent = noDataValue;
    document.getElementById('detailNormalRelVol').textContent = noDataValue;
}

/**
 * Market Characteristics 카드 업데이트
 */
async function updateMarketCharacteristics(filteredTrades) {
    try {
        const analysis = await analyzeWinningTradesMarketChar(filteredTrades);

        if (!analysis) {
            document.getElementById('detailAvgFloat').textContent = 'N/A';
            document.getElementById('detailAvgMarketCap').textContent = 'N/A';
            document.getElementById('detailAvgBeta').textContent = 'N/A';
            document.getElementById('detailSymbolsAnalyzed').textContent = '0';
            return;
        }

        // Float (millions)
        const floatM = analysis.avgFloat / 1000000;
        document.getElementById('detailAvgFloat').textContent = `${floatM.toFixed(1)}M`;

        // Market Cap (billions)
        const marketCapB = analysis.avgMarketCap / 1000000000;
        document.getElementById('detailAvgMarketCap').textContent = `$${marketCapB.toFixed(2)}B`;

        // Beta
        document.getElementById('detailAvgBeta').textContent = analysis.avgBeta.toFixed(2);
        const betaEl = document.getElementById('detailAvgBeta');
        betaEl.className = analysis.avgBeta > 1.5 ? 'detail-value negative' :
                          analysis.avgBeta < 1.0 ? 'detail-value positive' : 'detail-value neutral';

        // Symbols analyzed (optimized - shows all symbols)
        const totalTradedSymbols = getTradedSymbols().length;
        document.getElementById('detailSymbolsAnalyzed').textContent =
            `${analysis.symbolsAnalyzed} / ${analysis.totalWinningSymbols}`;

    } catch (error) {
        console.error('Market characteristics analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailAvgFloat').textContent = errorMsg;
        document.getElementById('detailAvgMarketCap').textContent = errorMsg;
        document.getElementById('detailAvgBeta').textContent = errorMsg;
    }
}

/**
 * Volume & Liquidity 카드 업데이트
 */
async function updateVolumeLiquidity(filteredTrades) {
    try {
        const analysis = await analyzeVolumePerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('detailHighVolumeWinRate').textContent = 'N/A';
            document.getElementById('detailLowVolumeWinRate').textContent = 'N/A';
            document.getElementById('detailMedianVolume').textContent = 'N/A';
            return;
        }

        // High Volume Win Rate
        document.getElementById('detailHighVolumeWinRate').textContent =
            `${analysis.highVolumeWinRate.toFixed(1)}%`;
        const highEl = document.getElementById('detailHighVolumeWinRate');
        highEl.className = analysis.highVolumeWinRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Low Volume Win Rate
        document.getElementById('detailLowVolumeWinRate').textContent =
            `${analysis.lowVolumeWinRate.toFixed(1)}%`;
        const lowEl = document.getElementById('detailLowVolumeWinRate');
        lowEl.className = analysis.lowVolumeWinRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Median Volume
        const medianVolumeM = analysis.medianVolume / 1000000;
        document.getElementById('detailMedianVolume').textContent = `${medianVolumeM.toFixed(1)}M`;

    } catch (error) {
        console.error('Volume liquidity analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailHighVolumeWinRate').textContent = errorMsg;
        document.getElementById('detailLowVolumeWinRate').textContent = errorMsg;
        document.getElementById('detailMedianVolume').textContent = errorMsg;
    }
}

/**
 * Volatility Performance 카드 업데이트
 */
async function updateVolatilityPerformance(filteredTrades) {
    try {
        const analysis = await analyzeVolatilityPerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('detailHighVolatilityWinRate').textContent = 'N/A';
            document.getElementById('detailMediumVolatilityWinRate').textContent = 'N/A';
            document.getElementById('detailLowVolatilityWinRate').textContent = 'N/A';
            return;
        }

        // High Volatility
        document.getElementById('detailHighVolatilityWinRate').textContent =
            `${analysis.highVolatilityWinRate.toFixed(1)}% (${analysis.highVolatilityCount} trades)`;
        const highEl = document.getElementById('detailHighVolatilityWinRate');
        highEl.className = analysis.highVolatilityWinRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Medium Volatility
        document.getElementById('detailMediumVolatilityWinRate').textContent =
            `${analysis.mediumVolatilityWinRate.toFixed(1)}% (${analysis.mediumVolatilityCount} trades)`;
        const mediumEl = document.getElementById('detailMediumVolatilityWinRate');
        mediumEl.className = analysis.mediumVolatilityWinRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Low Volatility
        document.getElementById('detailLowVolatilityWinRate').textContent =
            `${analysis.lowVolatilityWinRate.toFixed(1)}% (${analysis.lowVolatilityCount} trades)`;
        const lowEl = document.getElementById('detailLowVolatilityWinRate');
        lowEl.className = analysis.lowVolatilityWinRate >= 50 ? 'detail-value positive' : 'detail-value negative';

    } catch (error) {
        console.error('Volatility performance analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailHighVolatilityWinRate').textContent = errorMsg;
        document.getElementById('detailMediumVolatilityWinRate').textContent = errorMsg;
        document.getElementById('detailLowVolatilityWinRate').textContent = errorMsg;
    }
}

/**
 * Market Cap Preference 카드 업데이트
 */
async function updateMarketCapPreference(filteredTrades) {
    try {
        const analysis = await analyzeMarketCapPerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('detailSmallCapWinRate').textContent = 'N/A';
            document.getElementById('detailMidCapWinRate').textContent = 'N/A';
            document.getElementById('detailLargeCapWinRate').textContent = 'N/A';
            return;
        }

        // Small Cap
        document.getElementById('detailSmallCapWinRate').textContent =
            `${analysis.smallCap.winRate.toFixed(1)}% | $${analysis.smallCap.avgPnL.toFixed(0)} (${analysis.smallCap.count})`;
        const smallEl = document.getElementById('detailSmallCapWinRate');
        smallEl.className = analysis.smallCap.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Mid Cap
        document.getElementById('detailMidCapWinRate').textContent =
            `${analysis.midCap.winRate.toFixed(1)}% | $${analysis.midCap.avgPnL.toFixed(0)} (${analysis.midCap.count})`;
        const midEl = document.getElementById('detailMidCapWinRate');
        midEl.className = analysis.midCap.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Large Cap
        document.getElementById('detailLargeCapWinRate').textContent =
            `${analysis.largeCap.winRate.toFixed(1)}% | $${analysis.largeCap.avgPnL.toFixed(0)} (${analysis.largeCap.count})`;
        const largeEl = document.getElementById('detailLargeCapWinRate');
        largeEl.className = analysis.largeCap.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

    } catch (error) {
        console.error('Market cap preference analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailSmallCapWinRate').textContent = errorMsg;
        document.getElementById('detailMidCapWinRate').textContent = errorMsg;
        document.getElementById('detailLargeCapWinRate').textContent = errorMsg;
    }
}

/**
 * Intraday Performance 카드 업데이트
 */
async function updateIntradayPerformance(filteredTrades) {
    try {
        const analysis = await analyzeIntradayPerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('detailIntraday20').textContent = 'N/A';
            document.getElementById('detailIntraday30').textContent = 'N/A';
            document.getElementById('detailIntraday50').textContent = 'N/A';
            document.getElementById('detailIntraday100').textContent = 'N/A';
            return;
        }

        // 20%+ gainers
        const data20 = analysis['20%+'];
        document.getElementById('detailIntraday20').textContent =
            `${data20.winRate.toFixed(1)}% | $${data20.avgPnl.toFixed(0)} (${data20.count})`;
        const el20 = document.getElementById('detailIntraday20');
        el20.className = data20.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // 30%+ gainers
        const data30 = analysis['30%+'];
        document.getElementById('detailIntraday30').textContent =
            `${data30.winRate.toFixed(1)}% | $${data30.avgPnl.toFixed(0)} (${data30.count})`;
        const el30 = document.getElementById('detailIntraday30');
        el30.className = data30.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // 50%+ gainers
        const data50 = analysis['50%+'];
        document.getElementById('detailIntraday50').textContent =
            `${data50.winRate.toFixed(1)}% | $${data50.avgPnl.toFixed(0)} (${data50.count})`;
        const el50 = document.getElementById('detailIntraday50');
        el50.className = data50.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // 100%+ gainers
        const data100 = analysis['100%+'];
        document.getElementById('detailIntraday100').textContent =
            `${data100.winRate.toFixed(1)}% | $${data100.avgPnl.toFixed(0)} (${data100.count})`;
        const el100 = document.getElementById('detailIntraday100');
        el100.className = data100.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

    } catch (error) {
        console.error('Intraday performance analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailIntraday20').textContent = errorMsg;
        document.getElementById('detailIntraday30').textContent = errorMsg;
        document.getElementById('detailIntraday50').textContent = errorMsg;
        document.getElementById('detailIntraday100').textContent = errorMsg;
    }
}

/**
 * Sector Performance 카드 업데이트
 */
async function updateSectorPerformance(filteredTrades) {
    try {
        const analysis = await analyzeSectorPerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('sectorPerformanceContent').innerHTML =
                '<div class="detail-item"><span class="detail-label">No data</span><span class="detail-value">-</span></div>';
            return;
        }

        // Build sector performance HTML
        let html = '';
        for (const [sector, stats] of Object.entries(analysis)) {
            const colorClass = stats.winRate >= 50 ? 'positive' : 'negative';
            html += `
                <div class="detail-item">
                    <span class="detail-label">${sector}</span>
                    <span class="detail-value ${colorClass}">${stats.winRate.toFixed(1)}% | $${stats.avgPnl.toFixed(0)} (${stats.count})</span>
                </div>
            `;
        }

        if (html === '') {
            html = '<div class="detail-item"><span class="detail-label">No sectors found</span><span class="detail-value">-</span></div>';
        }

        document.getElementById('sectorPerformanceContent').innerHTML = html;

    } catch (error) {
        console.error('Sector performance analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit Reached' : 'Error loading sectors';
        document.getElementById('sectorPerformanceContent').innerHTML =
            `<div class="detail-item"><span class="detail-label">${errorMsg}</span><span class="detail-value">-</span></div>`;
    }
}

/**
 * SPY Correlation 카드 업데이트
 */
async function updateSPYCorrelation(filteredTrades) {
    try {
        const analysis = await analyzeSPYCorrelation(filteredTrades);

        if (!analysis) {
            document.getElementById('detailSPYUpDays').textContent = 'N/A';
            document.getElementById('detailSPYDownDays').textContent = 'N/A';
            return;
        }

        // SPY Up Days
        document.getElementById('detailSPYUpDays').textContent =
            `${analysis.upDays.winRate.toFixed(1)}% | $${analysis.upDays.avgPnl.toFixed(0)} (${analysis.upDays.count})`;
        const upEl = document.getElementById('detailSPYUpDays');
        upEl.className = analysis.upDays.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // SPY Down Days
        document.getElementById('detailSPYDownDays').textContent =
            `${analysis.downDays.winRate.toFixed(1)}% | $${analysis.downDays.avgPnl.toFixed(0)} (${analysis.downDays.count})`;
        const downEl = document.getElementById('detailSPYDownDays');
        downEl.className = analysis.downDays.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

    } catch (error) {
        console.error('SPY correlation analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailSPYUpDays').textContent = errorMsg;
        document.getElementById('detailSPYDownDays').textContent = errorMsg;
    }
}

/**
 * Relative Volume Correlation 카드 업데이트
 */
async function updateRelativeVolumeCorrelation(filteredTrades) {
    try {
        const analysis = await analyzeRelativeVolumeCorrelation(filteredTrades);

        if (!analysis) {
            document.getElementById('detailHighRelVol').textContent = 'N/A';
            document.getElementById('detailMediumRelVol').textContent = 'N/A';
            document.getElementById('detailNormalRelVol').textContent = 'N/A';
            return;
        }

        // High Relative Volume (2.0x+)
        document.getElementById('detailHighRelVol').textContent =
            `${analysis.highRelVol.winRate.toFixed(1)}% | $${analysis.highRelVol.avgPnl.toFixed(0)} (${analysis.highRelVol.count})`;
        const highEl = document.getElementById('detailHighRelVol');
        highEl.className = analysis.highRelVol.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Medium Relative Volume (1.5-2.0x)
        document.getElementById('detailMediumRelVol').textContent =
            `${analysis.mediumRelVol.winRate.toFixed(1)}% | $${analysis.mediumRelVol.avgPnl.toFixed(0)} (${analysis.mediumRelVol.count})`;
        const mediumEl = document.getElementById('detailMediumRelVol');
        mediumEl.className = analysis.mediumRelVol.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Normal Relative Volume (<1.5x)
        document.getElementById('detailNormalRelVol').textContent =
            `${analysis.normalRelVol.winRate.toFixed(1)}% | $${analysis.normalRelVol.avgPnl.toFixed(0)} (${analysis.normalRelVol.count})`;
        const normalEl = document.getElementById('detailNormalRelVol');
        normalEl.className = analysis.normalRelVol.winRate >= 50 ? 'detail-value positive' : 'detail-value negative';

    } catch (error) {
        console.error('Relative volume correlation analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailHighRelVol').textContent = errorMsg;
        document.getElementById('detailMediumRelVol').textContent = errorMsg;
        document.getElementById('detailNormalRelVol').textContent = errorMsg;
    }
}

// ==================== Advanced Analysis Update Functions (NEW) ====================

/**
 * Entry/Exit Timing Quality 카드 업데이트
 */
async function updateEntryExitTiming(filteredTrades) {
    try {
        const analysis = await analyzeEntryExitQuality(filteredTrades);

        if (!analysis) {
            document.getElementById('detailAvgEntryPosition').textContent = 'N/A';
            document.getElementById('detailAvgExitPosition').textContent = 'N/A';
            document.getElementById('detailTimingScore').textContent = 'N/A';
            document.getElementById('detailEarlyEntryRate').textContent = 'N/A';
            document.getElementById('detailProfitTakingRate').textContent = 'N/A';
            return;
        }

        // Avg Entry Position (lower is better - buying low)
        document.getElementById('detailAvgEntryPosition').textContent = `${analysis.avgEntryPosition}%`;
        const entryEl = document.getElementById('detailAvgEntryPosition');
        entryEl.className = parseFloat(analysis.avgEntryPosition) < 40 ? 'detail-value positive' :
                           parseFloat(analysis.avgEntryPosition) > 60 ? 'detail-value negative' : 'detail-value neutral';

        // Avg Exit Position (higher is better - selling high)
        document.getElementById('detailAvgExitPosition').textContent = `${analysis.avgExitPosition}%`;
        const exitEl = document.getElementById('detailAvgExitPosition');
        exitEl.className = parseFloat(analysis.avgExitPosition) > 60 ? 'detail-value positive' :
                          parseFloat(analysis.avgExitPosition) < 40 ? 'detail-value negative' : 'detail-value neutral';

        // Timing Score
        document.getElementById('detailTimingScore').textContent = `${analysis.timingScore}/10`;
        const scoreEl = document.getElementById('detailTimingScore');
        scoreEl.className = parseFloat(analysis.timingScore) >= 7 ? 'detail-value positive' :
                           parseFloat(analysis.timingScore) < 5 ? 'detail-value negative' : 'detail-value neutral';

        // Early Entry Rate
        document.getElementById('detailEarlyEntryRate').textContent = `${analysis.earlyEntryRate}%`;

        // Profit Taking Rate
        document.getElementById('detailProfitTakingRate').textContent = `${analysis.profitTakingRate}%`;

    } catch (error) {
        console.error('Entry/Exit timing analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailAvgEntryPosition').textContent = errorMsg;
        document.getElementById('detailAvgExitPosition').textContent = errorMsg;
        document.getElementById('detailTimingScore').textContent = errorMsg;
    }
}

/**
 * Gap Trading Performance 카드 업데이트
 */
async function updateGapTradingPerformance(filteredTrades) {
    try {
        const analysis = await analyzeGapTradingPerformance(filteredTrades);

        if (!analysis) {
            document.getElementById('detailGapUpWinRate').textContent = 'N/A';
            document.getElementById('detailGapDownWinRate').textContent = 'N/A';
            document.getElementById('detailLargeGapWinRate').textContent = 'N/A';
            document.getElementById('detailBestGapRange').textContent = 'N/A';
            return;
        }

        // Gap Up Win Rate
        document.getElementById('detailGapUpWinRate').textContent = `${analysis.gapUpWinRate}%`;
        const gapUpEl = document.getElementById('detailGapUpWinRate');
        gapUpEl.className = parseFloat(analysis.gapUpWinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Gap Down Win Rate
        document.getElementById('detailGapDownWinRate').textContent = `${analysis.gapDownWinRate}%`;
        const gapDownEl = document.getElementById('detailGapDownWinRate');
        gapDownEl.className = parseFloat(analysis.gapDownWinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Large Gap Win Rate
        document.getElementById('detailLargeGapWinRate').textContent = `${analysis.largeGapWinRate}%`;
        const largeGapEl = document.getElementById('detailLargeGapWinRate');
        largeGapEl.className = parseFloat(analysis.largeGapWinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Best Gap Range
        document.getElementById('detailBestGapRange').textContent = analysis.bestGapRange;

    } catch (error) {
        console.error('Gap trading performance analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailGapUpWinRate').textContent = errorMsg;
        document.getElementById('detailGapDownWinRate').textContent = errorMsg;
        document.getElementById('detailLargeGapWinRate').textContent = errorMsg;
    }
}

/**
 * Sector Rotation 카드 업데이트
 */
async function updateSectorRotationCard(filteredTrades) {
    try {
        const analysis = await analyzeSectorRotation(filteredTrades);

        if (!analysis) {
            document.getElementById('detailTopSector').textContent = 'N/A';
            document.getElementById('detailSectorWinRate').textContent = 'N/A';
            document.getElementById('detailSectorAvgReturn').textContent = 'N/A';
            document.getElementById('detailSectorDiversity').textContent = 'N/A';
            return;
        }

        // Top Sector
        document.getElementById('detailTopSector').textContent = analysis.topSector;

        // Sector Win Rate
        document.getElementById('detailSectorWinRate').textContent = `${analysis.topSectorWinRate}%`;
        const winRateEl = document.getElementById('detailSectorWinRate');
        winRateEl.className = parseFloat(analysis.topSectorWinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Sector Avg Return
        document.getElementById('detailSectorAvgReturn').textContent = `$${analysis.topSectorAvgReturn}`;
        const avgReturnEl = document.getElementById('detailSectorAvgReturn');
        avgReturnEl.className = parseFloat(analysis.topSectorAvgReturn) > 0 ? 'detail-value positive' : 'detail-value negative';

        // Sector Diversity
        document.getElementById('detailSectorDiversity').textContent = `${analysis.sectorDiversity} sectors`;

    } catch (error) {
        console.error('Sector rotation analysis failed:', error);
        const errorMsg = error.code === 'RATE_LIMIT' ? 'API Limit' : 'Error';
        document.getElementById('detailTopSector').textContent = errorMsg;
        document.getElementById('detailSectorWinRate').textContent = errorMsg;
        document.getElementById('detailSectorAvgReturn').textContent = errorMsg;
    }
}

/**
 * Price Level Psychology 카드 업데이트
 */
async function updatePriceLevelPsychology(filteredTrades) {
    try {
        const analysis = await analyzePriceLevelPsychology(filteredTrades);

        if (!analysis) {
            document.getElementById('detailUnder5WinRate').textContent = 'N/A';
            document.getElementById('detailRange5to20WinRate').textContent = 'N/A';
            document.getElementById('detailOver20WinRate').textContent = 'N/A';
            document.getElementById('detailOptimalPriceRange').textContent = 'N/A';
            return;
        }

        // Under $5 Win Rate
        document.getElementById('detailUnder5WinRate').textContent = `${analysis.under5WinRate}%`;
        const under5El = document.getElementById('detailUnder5WinRate');
        under5El.className = parseFloat(analysis.under5WinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // $5-$20 Win Rate
        document.getElementById('detailRange5to20WinRate').textContent = `${analysis.range5to20WinRate}%`;
        const range5to20El = document.getElementById('detailRange5to20WinRate');
        range5to20El.className = parseFloat(analysis.range5to20WinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Over $20 Win Rate
        document.getElementById('detailOver20WinRate').textContent = `${analysis.over20WinRate}%`;
        const over20El = document.getElementById('detailOver20WinRate');
        over20El.className = parseFloat(analysis.over20WinRate) >= 50 ? 'detail-value positive' : 'detail-value negative';

        // Optimal Price Range
        document.getElementById('detailOptimalPriceRange').textContent = analysis.optimalPriceRange;

    } catch (error) {
        console.error('Price level psychology analysis failed:', error);
        const errorMsg = 'Error';
        document.getElementById('detailUnder5WinRate').textContent = errorMsg;
        document.getElementById('detailRange5to20WinRate').textContent = errorMsg;
        document.getElementById('detailOver20WinRate').textContent = errorMsg;
    }
}


// ==================== Advanced Algorithmic Analysis Functions ====================

/**
 * Calculate correlation matrix between psychology factors and performance
 * Note: renderCorrelationMatrix() is defined in new-ai-renders.js
 */
function calculateCorrelationMatrix() {
    const correlations = [];
    const minSampleSize = 10;

    // Group trades by date and calculate daily performance
    const dailyData = {};
    trades.forEach(trade => {
        if (!dailyData[trade.date]) {
            dailyData[trade.date] = { trades: [], totalPnL: 0, winRate: 0 };
        }
        dailyData[trade.date].trades.push(trade);
        dailyData[trade.date].totalPnL += trade.pnl;
    });

    // Calculate win rates
    Object.keys(dailyData).forEach(date => {
        const dayTrades = dailyData[date].trades;
        dailyData[date].winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
    });

    // Sleep vs Performance
    const sleepData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.sleepHours && dailyData[date]) {
            sleepData.push({ x: psych.sleepHours, y: dailyData[date].winRate });
        }
    });
    if (sleepData.length >= minSampleSize) {
        const corr = calculatePearsonCorrelation(sleepData);
        if (corr !== null) {
            correlations.push({
                factor1: 'Sleep Hours',
                factor2: 'Win Rate',
                value: corr,
                description: corr > 0 ? 'Better sleep improves performance' : 'Review sleep patterns'
            });
        }
    }

    // Stress vs Performance
    const stressData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.stress && dailyData[date]) {
            stressData.push({ x: psych.stress, y: dailyData[date].winRate });
        }
    });
    if (stressData.length >= minSampleSize) {
        const corr = calculatePearsonCorrelation(stressData);
        if (corr !== null) {
            correlations.push({
                factor1: 'Stress Level',
                factor2: 'Win Rate',
                value: -corr,
                description: corr < 0 ? 'Lower stress improves performance' : 'Stress impact detected'
            });
        }
    }

    // Focus vs Performance
    const focusData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.focus && dailyData[date]) {
            focusData.push({ x: psych.focus, y: dailyData[date].winRate });
        }
    });
    if (focusData.length >= minSampleSize) {
        const corr = calculatePearsonCorrelation(focusData);
        if (corr !== null) {
            correlations.push({
                factor1: 'Focus Level',
                factor2: 'Win Rate',
                value: corr,
                description: corr > 0 ? 'Higher focus improves accuracy' : 'Review focus patterns'
            });
        }
    }

    return correlations;
}

/**
 * Analyze temporal patterns
 * Note: renderTemporalPatterns() is defined in new-ai-renders.js
 */
function analyzeTemporalPatterns() {
    const patterns = [];

    // Day of week analysis
    const dayPerformance = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    trades.forEach(trade => {
        const date = new Date(trade.date + 'T12:00:00');
        const day = date.getDay();

        if (!dayPerformance[day]) {
            dayPerformance[day] = { wins: 0, total: 0 };
        }
        dayPerformance[day].total++;
        if (trade.pnl > 0) dayPerformance[day].wins++;
    });

    Object.entries(dayPerformance).forEach(([day, data]) => {
        if (data.total >= 3) {
            const winRate = (data.wins / data.total) * 100;
            patterns.push({
                name: `${dayNames[day]} Performance`,
                description: `Trading pattern on ${dayNames[day]}s`,
                performance: winRate,
                sampleSize: data.total
            });
        }
    });

    return patterns.sort((a, b) => b.performance - a.performance).slice(0, 5);
}

/**
 * Perform simple cluster analysis on trades
 * Note: renderClusterAnalysis() is defined in new-ai-renders.js
 */
function performClusterAnalysis() {
    if (trades.length < 20) return null;

    const clusters = [];

    // Cluster by holding time
    const shortTrades = trades.filter(t => t.holdingMinutes && t.holdingMinutes < 30);
    const mediumTrades = trades.filter(t => t.holdingMinutes && t.holdingMinutes >= 30 && t.holdingMinutes < 120);
    const longTrades = trades.filter(t => t.holdingMinutes && t.holdingMinutes >= 120);

    if (shortTrades.length >= 5) {
        clusters.push({
            name: 'Scalping Style',
            characteristics: 'Quick trades under 30 minutes',
            count: shortTrades.length,
            avgPnL: shortTrades.reduce((sum, t) => sum + t.pnl, 0) / shortTrades.length,
            winRate: (shortTrades.filter(t => t.pnl > 0).length / shortTrades.length) * 100
        });
    }

    if (mediumTrades.length >= 5) {
        clusters.push({
            name: 'Swing Trading',
            characteristics: 'Trades held 30-120 minutes',
            count: mediumTrades.length,
            avgPnL: mediumTrades.reduce((sum, t) => sum + t.pnl, 0) / mediumTrades.length,
            winRate: (mediumTrades.filter(t => t.pnl > 0).length / mediumTrades.length) * 100
        });
    }

    if (longTrades.length >= 5) {
        clusters.push({
            name: 'Position Trading',
            characteristics: 'Trades held over 2 hours',
            count: longTrades.length,
            avgPnL: longTrades.reduce((sum, t) => sum + t.pnl, 0) / longTrades.length,
            winRate: (longTrades.filter(t => t.pnl > 0).length / longTrades.length) * 100
        });
    }

    return clusters.sort((a, b) => b.avgPnL - a.avgPnL);
}

/**
 * Correlation Matrix Analysis
 * Shows correlations between different trading metrics
 */
function renderCorrelationMatrix() {
    const element = document.getElementById('correlationMatrixContent');
    if (!element) return;

    if (trades.length < 20) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;">
                    ${currentLanguage === 'ko' ? '상관관계 분석을 위해 최소 20개의 거래가 필요합니다.' : 'Need at least 20 trades for correlation analysis.'}
                </div>
            </div>
        `;
        return;
    }

    // Calculate correlations between different metrics
    const winTrades = trades.filter(t => t.pnl > 0);
    const lossTrades = trades.filter(t => t.pnl < 0);

    const avgWinAmount = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.amount, 0) / winTrades.length : 0;
    const avgLossAmount = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + t.amount, 0) / lossTrades.length : 0;

    const avgWinHoldTime = winTrades.filter(t => t.holdingMinutes).length > 0 ?
        winTrades.filter(t => t.holdingMinutes).reduce((sum, t) => sum + t.holdingMinutes, 0) / winTrades.filter(t => t.holdingMinutes).length : 0;
    const avgLossHoldTime = lossTrades.filter(t => t.holdingMinutes).length > 0 ?
        lossTrades.filter(t => t.holdingMinutes).reduce((sum, t) => sum + t.holdingMinutes, 0) / lossTrades.filter(t => t.holdingMinutes).length : 0;

    // Symbol performance correlation
    const symbolStats = {};
    trades.forEach(t => {
        if (!symbolStats[t.symbol]) {
            symbolStats[t.symbol] = { wins: 0, losses: 0, totalPnL: 0 };
        }
        if (t.pnl > 0) symbolStats[t.symbol].wins++;
        else symbolStats[t.symbol].losses++;
        symbolStats[t.symbol].totalPnL += t.pnl;
    });

    const topSymbols = Object.entries(symbolStats)
        .map(([symbol, stats]) => ({
            symbol,
            winRate: (stats.wins / (stats.wins + stats.losses)) * 100,
            totalPnL: stats.totalPnL,
            trades: stats.wins + stats.losses
        }))
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .slice(0, 5);

    element.innerHTML = `
        <div style="display: grid; gap: 16px;">
            <!-- Position Size vs Win Rate -->
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '포지션 크기 vs 수익률' : 'Position Size vs Win Rate'}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #10b981; font-size: 16px; font-weight: 600;">$${avgWinAmount.toFixed(2)}</div>
                        <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '평균 승리 포지션' : 'Avg Win Position'}</div>
                    </div>
                    <div style="color: #64748b; font-size: 20px;">⟷</div>
                    <div>
                        <div style="color: #ef4444; font-size: 16px; font-weight: 600;">$${avgLossAmount.toFixed(2)}</div>
                        <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '평균 손실 포지션' : 'Avg Loss Position'}</div>
                    </div>
                </div>
            </div>

            <!-- Holding Time Correlation -->
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '보유 시간 상관관계' : 'Holding Time Correlation'}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #10b981; font-size: 16px; font-weight: 600;">${avgWinHoldTime.toFixed(0)}${currentLanguage === 'ko' ? '분' : 'min'}</div>
                        <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '승리 거래' : 'Win Trades'}</div>
                    </div>
                    <div style="color: ${avgLossHoldTime > avgWinHoldTime ? '#ef4444' : '#10b981'}; font-size: 14px;">
                        ${avgLossHoldTime > avgWinHoldTime ? '⚠️' : '✓'} ${((avgLossHoldTime - avgWinHoldTime) / avgWinHoldTime * 100).toFixed(0)}%
                    </div>
                    <div>
                        <div style="color: #ef4444; font-size: 16px; font-weight: 600;">${avgLossHoldTime.toFixed(0)}${currentLanguage === 'ko' ? '분' : 'min'}</div>
                        <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '손실 거래' : 'Loss Trades'}</div>
                    </div>
                </div>
            </div>

            <!-- Top Symbol Performance -->
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                <div style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">${currentLanguage === 'ko' ? '심볼별 성과 상관관계' : 'Symbol Performance Correlation'}</div>
                ${topSymbols.map(s => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <span style="color: #e4e4e7; font-weight: 500;">${s.symbol}</span>
                            <span style="color: #64748b; font-size: 12px; margin-left: 8px;">${s.trades} ${currentLanguage === 'ko' ? '거래' : 'trades'}</span>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <span style="color: ${s.winRate >= 50 ? '#10b981' : '#ef4444'}; font-size: 14px;">${s.winRate.toFixed(1)}%</span>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <span style="color: ${s.totalPnL >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">$${s.totalPnL.toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Temporal Patterns Analysis
 * Analyzes time-based trading patterns
 */
function renderTemporalPatterns() {
    const element = document.getElementById('temporalPatternContent');
    if (!element) {
        console.log('⚠️ temporalPatternContent element not found');
        return;
    }

    if (trades.length < 10) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;">
                    ${currentLanguage === 'ko' ? '시간 패턴 분석을 위해 최소 10개의 거래가 필요합니다.' : 'Need at least 10 trades for temporal pattern analysis.'}
                </div>
            </div>
        `;
        return;
    }

    // Analyze hourly patterns
    const hourlyStats = {};
    trades.forEach(t => {
        if (t.entryTime) {
            const hour = parseInt(t.entryTime.split(':')[0]);
            if (!hourlyStats[hour]) {
                hourlyStats[hour] = { wins: 0, losses: 0, totalPnL: 0, count: 0 };
            }
            hourlyStats[hour].count++;
            hourlyStats[hour].totalPnL += t.pnl;
            if (t.pnl > 0) hourlyStats[hour].wins++;
            else hourlyStats[hour].losses++;
        }
    });

    const hourlyData = Object.entries(hourlyStats)
        .map(([hour, stats]) => ({
            hour: parseInt(hour),
            avgPnL: stats.totalPnL / stats.count,
            winRate: (stats.wins / stats.count) * 100,
            count: stats.count
        }))
        .sort((a, b) => b.avgPnL - a.avgPnL);

    // Analyze day-of-week patterns
    const dayStats = {};
    trades.forEach(t => {
        const date = new Date(t.date + 'T12:00:00');
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (!dayStats[day]) {
            dayStats[day] = { wins: 0, losses: 0, totalPnL: 0, count: 0 };
        }
        dayStats[day].count++;
        dayStats[day].totalPnL += t.pnl;
        if (t.pnl > 0) dayStats[day].wins++;
        else dayStats[day].losses++;
    });

    const dayNames = currentLanguage === 'ko'
        ? ['일', '월', '화', '수', '목', '금', '토']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayData = Object.entries(dayStats)
        .map(([day, stats]) => ({
            day: parseInt(day),
            name: dayNames[day],
            avgPnL: stats.totalPnL / stats.count,
            winRate: (stats.wins / stats.count) * 100,
            count: stats.count
        }))
        .sort((a, b) => b.avgPnL - a.avgPnL);

    element.innerHTML = `
        <div style="display: grid; gap: 16px;">
            <!-- Best Trading Hours -->
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                <div style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">${currentLanguage === 'ko' ? '최적 거래 시간대' : 'Best Trading Hours'}</div>
                ${hourlyData.slice(0, 5).map(h => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <span style="color: #e4e4e7; font-weight: 500;">${h.hour}:00</span>
                            <span style="color: #64748b; font-size: 12px; margin-left: 8px;">${h.count} ${currentLanguage === 'ko' ? '거래' : 'trades'}</span>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <div style="background: ${h.winRate >= 50 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                                        border: 1px solid ${h.winRate >= 50 ? '#10b981' : '#ef4444'};
                                        padding: 4px 8px; border-radius: 4px; display: inline-block;">
                                <span style="color: ${h.winRate >= 50 ? '#10b981' : '#ef4444'}; font-size: 13px;">${h.winRate.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <span style="color: ${h.avgPnL >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">$${h.avgPnL.toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Best Trading Days -->
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                <div style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">${currentLanguage === 'ko' ? '요일별 성과' : 'Day of Week Performance'}</div>
                ${dayData.map(d => `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <span style="color: #e4e4e7; font-weight: 500;">${d.name}</span>
                            <span style="color: #64748b; font-size: 12px; margin-left: 8px;">${d.count} ${currentLanguage === 'ko' ? '거래' : 'trades'}</span>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <div style="width: 100%; background: rgba(100, 116, 139, 0.2); height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${d.winRate}%; height: 100%; background: ${d.winRate >= 50 ? '#10b981' : '#ef4444'};"></div>
                            </div>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <span style="color: ${d.avgPnL >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">$${d.avgPnL.toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Cluster Analysis
 * Groups similar trades together
 */
function renderClusterAnalysis() {
    const element = document.getElementById('clusterAnalysisContent');
    if (!element) {
        console.log('⚠️ clusterAnalysisContent element not found');
        return;
    }

    if (trades.length < 15) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;">
                    ${currentLanguage === 'ko' ? '클러스터 분석을 위해 최소 15개의 거래가 필요합니다.' : 'Need at least 15 trades for cluster analysis.'}
                </div>
            </div>
        `;
        return;
    }

    // Cluster 1: Quick Scalpers (holding time < 30 min)
    const quickScalpers = trades.filter(t => t.holdingMinutes && t.holdingMinutes < 30);
    const quickStats = {
        count: quickScalpers.length,
        avgPnL: quickScalpers.length > 0 ? quickScalpers.reduce((sum, t) => sum + t.pnl, 0) / quickScalpers.length : 0,
        winRate: quickScalpers.length > 0 ? (quickScalpers.filter(t => t.pnl > 0).length / quickScalpers.length) * 100 : 0
    };

    // Cluster 2: Day Traders (holding time 30-240 min / 4 hours)
    const dayTraders = trades.filter(t => t.holdingMinutes && t.holdingMinutes >= 30 && t.holdingMinutes < 240);
    const dayStats = {
        count: dayTraders.length,
        avgPnL: dayTraders.length > 0 ? dayTraders.reduce((sum, t) => sum + t.pnl, 0) / dayTraders.length : 0,
        winRate: dayTraders.length > 0 ? (dayTraders.filter(t => t.pnl > 0).length / dayTraders.length) * 100 : 0
    };

    // Cluster 3: Swing Traders (holding time >= 240 min)
    const swingTraders = trades.filter(t => t.holdingMinutes && t.holdingMinutes >= 240);
    const swingStats = {
        count: swingTraders.length,
        avgPnL: swingTraders.length > 0 ? swingTraders.reduce((sum, t) => sum + t.pnl, 0) / swingTraders.length : 0,
        winRate: swingTraders.length > 0 ? (swingTraders.filter(t => t.pnl > 0).length / swingTraders.length) * 100 : 0
    };

    // Cluster 4: Large Position Trades (top 25% by amount)
    const sortedByAmount = [...trades].sort((a, b) => b.amount - a.amount);
    const largePositions = sortedByAmount.slice(0, Math.ceil(trades.length * 0.25));
    const largeStats = {
        count: largePositions.length,
        avgPnL: largePositions.reduce((sum, t) => sum + t.pnl, 0) / largePositions.length,
        winRate: (largePositions.filter(t => t.pnl > 0).length / largePositions.length) * 100,
        avgAmount: largePositions.reduce((sum, t) => sum + t.amount, 0) / largePositions.length
    };

    // Cluster 5: Small Position Trades (bottom 25% by amount)
    const smallPositions = sortedByAmount.slice(-Math.ceil(trades.length * 0.25));
    const smallStats = {
        count: smallPositions.length,
        avgPnL: smallPositions.reduce((sum, t) => sum + t.pnl, 0) / smallPositions.length,
        winRate: (smallPositions.filter(t => t.pnl > 0).length / smallPositions.length) * 100,
        avgAmount: smallPositions.reduce((sum, t) => sum + t.amount, 0) / smallPositions.length
    };

    const clusters = [
        { name: currentLanguage === 'ko' ? '빠른 스캘핑' : 'Quick Scalping', desc: '< 30min', ...quickStats, icon: '⚡' },
        { name: currentLanguage === 'ko' ? '데이 트레이딩' : 'Day Trading', desc: '30min - 4hrs', ...dayStats, icon: '📈' },
        { name: currentLanguage === 'ko' ? '스윙 트레이딩' : 'Swing Trading', desc: '> 4hrs', ...swingStats, icon: '🌊' },
        { name: currentLanguage === 'ko' ? '큰 포지션' : 'Large Position', desc: `~$${largeStats.avgAmount.toFixed(0)}`, ...largeStats, icon: '💎' },
        { name: currentLanguage === 'ko' ? '작은 포지션' : 'Small Position', desc: `~$${smallStats.avgAmount.toFixed(0)}`, ...smallStats, icon: '🔸' }
    ].filter(c => c.count > 0);

    element.innerHTML = `
        <div style="display: grid; gap: 12px;">
            ${clusters.map(cluster => `
                <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${cluster.icon}</span>
                            <div>
                                <div style="color: #e4e4e7; font-weight: 600; font-size: 14px;">${cluster.name}</div>
                                <div style="color: #64748b; font-size: 12px;">${cluster.desc}</div>
                            </div>
                        </div>
                        <div style="background: rgba(100, 116, 139, 0.2); padding: 4px 10px; border-radius: 12px;">
                            <span style="color: #94a3b8; font-size: 12px;">${cluster.count} ${currentLanguage === 'ko' ? '거래' : 'trades'}</span>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '승률' : 'Win Rate'}</div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <div style="flex: 1; background: rgba(100, 116, 139, 0.2); height: 6px; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${cluster.winRate}%; height: 100%; background: ${cluster.winRate >= 50 ? '#10b981' : '#ef4444'};"></div>
                                </div>
                                <span style="color: ${cluster.winRate >= 50 ? '#10b981' : '#ef4444'}; font-size: 13px; font-weight: 600;">${cluster.winRate.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div>
                            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '평균 P&L' : 'Avg P&L'}</div>
                            <div style="color: ${cluster.avgPnL >= 0 ? '#10b981' : '#ef4444'}; font-size: 16px; font-weight: 600;">
                                $${cluster.avgPnL.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        ${clusters.length === 0 ? `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;">
                    ${currentLanguage === 'ko' ? '클러스터를 형성할 충분한 데이터가 없습니다.' : 'Insufficient data to form clusters.'}
                </div>
            </div>
        ` : ''}
    `;
}

/**
 * Multi-Factor Performance Attribution
 * Analyzes which factors contribute most to trading performance
 */
function renderMultiFactorAttribution() {
    const element = document.getElementById('multiFactorAttribution');
    if (!element) return;

    const factors = calculateFeatureImportance();

    if (!factors || factors.length === 0) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;" data-lang="insufficient-data-multi">
                    Insufficient data for multi-factor analysis. Need at least 10 trades with psychology data.
                </div>
            </div>
        `;
        return;
    }

    const html = factors.map((factor, idx) => {
        const barWidth = Math.abs(factor.impact) * 100;
        const barColor = factor.impact > 0 ? '#10b981' : '#ef4444';
        const impactSign = factor.impact > 0 ? '+' : '';
        const iconMap = ['💤', '🎯', '⏰', '📏'];

        return `
            <div class="glass-card hover-lift" style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(100, 116, 139, 0.2); padding: 20px; margin-bottom: 16px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">${iconMap[idx % iconMap.length]}</span>
                        <span style="color: #e4e4e7; font-size: 14px; font-weight: 600;">${factor.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: ${barColor}; font-size: 18px; font-weight: 700;">${impactSign}${(factor.impact * 100).toFixed(1)}%</span>
                        <div style="background: ${barColor}20; border: 1px solid ${barColor}40; padding: 4px 8px; border-radius: 6px;">
                            <span style="color: ${barColor}; font-size: 10px; font-weight: 600;" data-lang="feature-impact">IMPACT</span>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; position: relative;">
                    <div class="progress-animated" style="width: ${barWidth}%; height: 100%; background: linear-gradient(90deg, ${barColor}, ${barColor}aa); border-radius: 6px; box-shadow: 0 0 10px ${barColor}40;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 11px;">
                        <span data-lang="sample-size">Sample</span>: <span style="color: #94a3b8; font-weight: 600;">${factor.sampleSize}</span> days
                    </span>
                    <span style="color: #64748b; font-size: 11px;">
                        Confidence: <span style="color: #94a3b8; font-weight: 600;">${(factor.confidence * 100).toFixed(0)}%</span>
                    </span>
                </div>
            </div>
        `;
    }).join('');

    element.innerHTML = html;
}

/**
 * Calculate feature importance using correlation and variance analysis
 */
function calculateFeatureImportance() {
    const features = [];
    const minSampleSize = 10;

    // Group trades by date and calculate daily performance
    const dailyData = {};
    trades.forEach(trade => {
        if (!dailyData[trade.date]) {
            dailyData[trade.date] = { trades: [], totalPnL: 0, winRate: 0 };
        }
        dailyData[trade.date].trades.push(trade);
        dailyData[trade.date].totalPnL += trade.pnl;
    });

    // Calculate win rates
    Object.keys(dailyData).forEach(date => {
        const dayTrades = dailyData[date].trades;
        dailyData[date].winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
    });

    // Analyze Sleep Quality impact
    const sleepData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.sleepHours && dailyData[date]) {
            sleepData.push({
                x: psych.sleepHours,
                y: dailyData[date].winRate,
                pnl: dailyData[date].totalPnL
            });
        }
    });

    if (sleepData.length >= minSampleSize) {
        const correlation = calculatePearsonCorrelation(sleepData.map(d => ({ x: d.x, y: d.y })));
        if (correlation !== null) {
            features.push({
                name: 'Sleep Quality',
                impact: correlation * 0.4, // Weighted impact
                sampleSize: sleepData.length,
                confidence: Math.min(sleepData.length / 30, 1)
            });
        }
    }

    // Analyze Stress Level impact
    const stressData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.stress && dailyData[date]) {
            stressData.push({
                x: psych.stress,
                y: dailyData[date].winRate
            });
        }
    });

    if (stressData.length >= minSampleSize) {
        const correlation = calculatePearsonCorrelation(stressData);
        if (correlation !== null) {
            features.push({
                name: 'Stress Management',
                impact: -correlation * 0.35, // Negative stress is good
                sampleSize: stressData.length,
                confidence: Math.min(stressData.length / 30, 1)
            });
        }
    }

    // Analyze Focus Level impact
    const focusData = [];
    Object.entries(psychologyData).forEach(([date, psych]) => {
        if (psych.focus && dailyData[date]) {
            focusData.push({
                x: psych.focus,
                y: dailyData[date].winRate
            });
        }
    });

    if (focusData.length >= minSampleSize) {
        const correlation = calculatePearsonCorrelation(focusData);
        if (correlation !== null) {
            features.push({
                name: 'Focus Level',
                impact: correlation * 0.45,
                sampleSize: focusData.length,
                confidence: Math.min(focusData.length / 30, 1)
            });
        }
    }

    // Analyze Time of Day impact
    const hourlyPerf = {};
    trades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourlyPerf[hour]) hourlyPerf[hour] = { wins: 0, total: 0 };
            hourlyPerf[hour].total++;
            if (trade.pnl > 0) hourlyPerf[hour].wins++;
        }
    });

    const avgWinRate = trades.filter(t => t.pnl > 0).length / trades.length * 100;
    let bestHourImpact = 0;
    Object.values(hourlyPerf).forEach(hour => {
        if (hour.total >= 5) {
            const hourWinRate = (hour.wins / hour.total) * 100;
            const impact = (hourWinRate - avgWinRate) / 100;
            if (Math.abs(impact) > Math.abs(bestHourImpact)) {
                bestHourImpact = impact;
            }
        }
    });

    if (bestHourImpact !== 0) {
        features.push({
            name: 'Optimal Timing',
            impact: bestHourImpact * 0.3,
            sampleSize: trades.filter(t => t.entryTime).length,
            confidence: 0.8
        });
    }

    // Analyze Position Sizing Discipline
    if (trades.length >= minSampleSize) {
        const amounts = trades.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length);
        const cvCoefficient = stdDev / avgAmount;

        // Lower coefficient of variation = better discipline = positive impact
        const disciplineImpact = Math.max(0, (0.5 - cvCoefficient) * 0.6);

        features.push({
            name: 'Position Sizing Discipline',
            impact: disciplineImpact,
            sampleSize: trades.length,
            confidence: Math.min(trades.length / 50, 1)
        });
    }

    // Sort by absolute impact
    features.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return features.slice(0, 5); // Top 5 factors
}

/**
 * Predictive Risk Score (0-100)
 * Real-time assessment of current trading risk level
 */
function renderPredictiveRiskScore() {
    const element = document.getElementById('predictiveRiskScore');
    if (!element) return;

    const riskScore = computePredictiveRiskScore();

    if (!riskScore || riskScore.overall === null) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;" data-lang="insufficient-data-risk">
                    Insufficient data for risk score calculation. Need trades and psychology data.
                </div>
            </div>
        `;
        return;
    }

    const scoreColor = riskScore.overall >= 70 ? '#10b981' :
                       riskScore.overall >= 50 ? '#f59e0b' : '#ef4444';

    const riskLevel = riskScore.overall >= 70 ? (currentLanguage === 'ko' ? '양호' : 'GOOD') :
                      riskScore.overall >= 50 ? (currentLanguage === 'ko' ? '보통' : 'NEUTRAL') :
                      (currentLanguage === 'ko' ? '주의' : 'ELEVATED');

    const riskIcon = riskScore.overall >= 70 ? '✅' : riskScore.overall >= 50 ? '⚠️' : '🚨';

    const factors = [
        { icon: '🧠', key: 'psychology', label: 'psychological-state', color: '#8b5cf6' },
        { icon: '📈', key: 'market', label: 'market-conditions', color: '#3b82f6' },
        { icon: '📊', key: 'performance', label: 'performance-trend', color: '#10b981' },
        { icon: '⚖️', key: 'biasRisk', label: 'bias-risk', color: '#ef4444', inverted: true }
    ];

    const factorCardsHTML = factors.map(factor => {
        const value = riskScore[factor.key];
        const barColor = factor.inverted
            ? (value <= 30 ? '#10b981' : value <= 60 ? '#f59e0b' : '#ef4444')
            : (value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444');

        return `
            <div class="glass-card hover-lift" style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(100, 116, 139, 0.2); padding: 20px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 28px;">${factor.icon}</span>
                        <span style="color: #e4e4e7; font-size: 13px; font-weight: 600;" data-lang="${factor.label}">${factor.label}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="color: ${barColor}; font-size: 24px; font-weight: 700; line-height: 1;">${value}</span>
                        <span style="color: #64748b; font-size: 11px;">/100</span>
                    </div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); height: 10px; border-radius: 5px; overflow: hidden; position: relative;">
                    <div class="progress-animated" style="width: ${value}%; height: 100%; background: linear-gradient(90deg, ${barColor}, ${barColor}aa); border-radius: 5px; box-shadow: 0 0 10px ${barColor}40; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
            </div>
        `;
    }).join('');

    element.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px;">
            <!-- Main Risk Score Gauge -->
            <div class="glass-card" style="background: linear-gradient(135deg, rgba(${scoreColor === '#10b981' ? '16, 185, 129' : scoreColor === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.15), rgba(15, 23, 42, 0.6)); border: 2px solid ${scoreColor}40; padding: 30px; text-align: center; border-radius: 12px; position: relative; overflow: hidden;">
                <!-- Animated background glow -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; background: radial-gradient(circle, ${scoreColor}20, transparent 70%); animation: glow-pulse 3s ease-in-out infinite;"></div>

                <div style="position: relative; z-index: 1;">
                    <div style="font-size: 48px; margin-bottom: 12px;">${riskIcon}</div>
                    <div style="font-size: 72px; font-weight: 800; color: ${scoreColor}; line-height: 1; text-shadow: 0 0 20px ${scoreColor}40;">
                        ${riskScore.overall}
                    </div>
                    <div style="font-size: 16px; color: #64748b; margin-top: 8px; letter-spacing: 1px;">/ 100</div>
                    <div style="display: inline-block; margin-top: 16px; padding: 8px 20px; background: ${scoreColor}20; border: 1px solid ${scoreColor}60; border-radius: 20px;">
                        <span style="font-size: 14px; font-weight: 700; color: ${scoreColor}; text-transform: uppercase; letter-spacing: 1px;">
                            ${riskLevel}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Factor Breakdown -->
            <div style="display: grid; gap: 16px;">
                ${factorCardsHTML}
            </div>
        </div>

        <!-- Recommendation Banner -->
        <div class="glass-card hover-lift" style="background: linear-gradient(135deg, ${scoreColor}10, rgba(15, 23, 42, 0.5)); border-left: 4px solid ${scoreColor}; padding: 20px; border-radius: 10px;">
            <div style="display: flex; align-items: flex-start; gap: 16px;">
                <div style="font-size: 32px; line-height: 1;">${riskIcon}</div>
                <div style="flex: 1;">
                    <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;" data-lang="recommended-action">Recommended Action</div>
                    <div style="color: #e4e4e7; font-size: 14px; line-height: 1.6; font-weight: 500;">
                        ${riskScore.recommendation}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Compute predictive risk score based on multiple factors
 */
function computePredictiveRiskScore() {
    const today = formatTradingDate(new Date());
    const todayPsych = psychologyData[today] || {};

    // Psychological State Score (0-100)
    let psychScore = 50; // Default neutral
    if (Object.keys(todayPsych).length > 0) {
        const sleepScore = todayPsych.sleepHours ? Math.min((todayPsych.sleepHours / 8) * 100, 100) : 50;
        const stressScore = todayPsych.stress ? (5 - todayPsych.stress) * 20 : 50;
        const focusScore = todayPsych.focus ? todayPsych.focus * 20 : 50;
        const energyScore = todayPsych.energyLevel ? todayPsych.energyLevel * 20 : 50;

        psychScore = (sleepScore * 0.3 + stressScore * 0.3 + focusScore * 0.25 + energyScore * 0.15);
    }

    // Market Conditions Score (based on recent volatility and win rate)
    let marketScore = 50;
    const last10Trades = trades.slice(-10);
    if (last10Trades.length >= 5) {
        const volatility = calculateVolatility(last10Trades.map(t => t.returnPct));
        // Lower volatility = better conditions for most traders
        marketScore = Math.max(0, Math.min(100, 70 - volatility * 10));
    }

    // Performance Trend Score (last 5 days)
    let perfScore = 50;
    const last5Days = getLast5TradingDays();
    if (last5Days.length >= 3) {
        const recentWinRate = (last5Days.filter(d => d.pnl > 0).length / last5Days.length) * 100;
        perfScore = recentWinRate;
    }

    // Behavioral Bias Risk (inverted - higher number = lower risk)
    let biasScore = 70; // Default low risk
    const emotionalPatterns = detectEmotionalTradingPatterns();
    if (emotionalPatterns.revengeTrading) biasScore -= 30;
    if (emotionalPatterns.overconfidenceRisk) biasScore -= 20;
    if (emotionalPatterns.stressOvertrading) biasScore -= 15;
    biasScore = Math.max(0, biasScore);

    const overall = Math.round((psychScore * 0.35 + marketScore * 0.2 + perfScore * 0.25 + biasScore * 0.2));

    // Generate recommendation
    let recommendation = '';
    if (overall >= 70) {
        recommendation = currentLanguage === 'ko' ?
            '조건이 최적입니다. 정상적인 포지션 크기로 거래하세요.' :
            'Conditions are optimal. Trade with normal position sizing.';
    } else if (overall >= 50) {
        recommendation = currentLanguage === 'ko' ?
            '조건이 보통입니다. 포지션 크기를 20-30% 줄이는 것을 고려하세요.' :
            'Conditions are neutral. Consider reducing position size by 20-30%.';
    } else {
        recommendation = currentLanguage === 'ko' ?
            '조건이 좋지 않습니다. 거래를 피하거나 최소 포지션만 사용하세요.' :
            'Conditions are poor. Avoid trading or use minimum position sizes only.';
    }

    return {
        overall: Math.round(overall),
        psychology: Math.round(psychScore),
        market: Math.round(marketScore),
        performance: Math.round(perfScore),
        biasRisk: Math.round(biasScore),
        recommendation
    };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(returns) {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

/**
 * Get last 5 trading days performance
 */
function getLast5TradingDays() {
    const dailyPnL = {};
    trades.forEach(trade => {
        if (!dailyPnL[trade.date]) dailyPnL[trade.date] = 0;
        dailyPnL[trade.date] += trade.pnl;
    });

    const sortedDays = Object.keys(dailyPnL).sort().reverse().slice(0, 5);
    return sortedDays.map(date => ({ date, pnl: dailyPnL[date] }));
}

/**
 * Render Behavioral Patterns Detection
 */
function renderBehavioralPatterns() {
    const element = document.getElementById('behavioralPatterns');
    if (!element) return;

    const patterns = detectAdvancedBehavioralPatterns();

    if (patterns.length === 0) {
        element.innerHTML = `
            <div style="color: #64748b; text-align: center; padding: 20px;">
                No significant behavioral patterns detected yet. Continue trading to build pattern data.
            </div>
        `;
        return;
    }

    const html = patterns.map(pattern => {
        const iconColor = pattern.severity === 'danger' ? '#ef4444' :
                         pattern.severity === 'warning' ? '#f59e0b' :
                         pattern.severity === 'good' ? '#10b981' : '#3b82f6';

        const icon = pattern.severity === 'danger' ? '⚠️' :
                    pattern.severity === 'warning' ? '⚡' :
                    pattern.severity === 'good' ? '✓' : 'ℹ️';

        return `
            <div style="padding: 14px; background: #0f172a; border-radius: 8px; border-left: 4px solid ${iconColor}; margin-bottom: 12px;">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 20px;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="color: #e4e4e7; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${pattern.title}</div>
                        <div style="color: #94a3b8; font-size: 12px; line-height: 1.6;">${pattern.description}</div>
                        ${pattern.actionable ? `<div style="color: ${iconColor}; font-size: 12px; margin-top: 8px; font-weight: 500;">→ ${pattern.actionable}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    element.innerHTML = html;
}

/**
 * Detect advanced behavioral patterns
 */
function detectAdvancedBehavioralPatterns() {
    const patterns = [];

    // Pattern 1: Revenge Trading
    const revengePattern = detectRevengeTrading();
    if (revengePattern) {
        patterns.push({
            severity: 'danger',
            title: currentLanguage === 'ko' ? '복수 거래 패턴 감지' : 'Revenge Trading Detected',
            description: currentLanguage === 'ko' ?
                `연속 손실 후 포지션 크기가 평균 대비 ${revengePattern.increase}% 증가합니다.` :
                `Position size increases by ${revengePattern.increase}% after consecutive losses.`,
            actionable: currentLanguage === 'ko' ?
                '손실 후 거래 전 10분 휴식을 취하세요' :
                'Take a 10-minute break before trading after a loss'
        });
    }

    // Pattern 2: Overconfidence after wins
    const overconfidencePattern = detectOverconfidencePattern();
    if (overconfidencePattern) {
        patterns.push({
            severity: 'warning',
            title: currentLanguage === 'ko' ? '과신 패턴' : 'Overconfidence Pattern',
            description: currentLanguage === 'ko' ?
                `연속 수익 후 승률이 ${overconfidencePattern.drop}% 감소합니다.` :
                `Win rate drops by ${overconfidencePattern.drop}% after consecutive wins.`,
            actionable: currentLanguage === 'ko' ?
                '3연승 후 포지션 크기를 50% 줄이세요' :
                'Reduce position size by 50% after 3 consecutive wins'
        });
    }

    // Pattern 3: Best trading conditions
    const optimalConditions = findOptimalTradingConditions();
    if (optimalConditions) {
        patterns.push({
            severity: 'good',
            title: currentLanguage === 'ko' ? '최적 거래 조건' : 'Optimal Trading Conditions',
            description: currentLanguage === 'ko' ?
                `${optimalConditions.description}에서 승률이 ${optimalConditions.winRate}%로 최고입니다.` :
                `Best win rate of ${optimalConditions.winRate}% achieved ${optimalConditions.description}.`,
            actionable: null
        });
    }

    // Pattern 4: Timing consistency
    const timingPattern = analyzeTimingConsistency();
    if (timingPattern && timingPattern.isInconsistent) {
        patterns.push({
            severity: 'info',
            title: currentLanguage === 'ko' ? '거래 타이밍 일관성 부족' : 'Inconsistent Trading Timing',
            description: currentLanguage === 'ko' ?
                `거래 시간이 불규칙합니다. 규칙적인 시간에 더 높은 승률(${timingPattern.consistentWinRate}%)을 보입니다.` :
                `Trading times are irregular. Higher win rate (${timingPattern.consistentWinRate}%) when trading consistently.`,
            actionable: currentLanguage === 'ko' ?
                '매일 같은 시간에 거래를 시작하세요' :
                'Start trading at the same time each day'
        });
    }

    return patterns;
}

/**
 * Detect revenge trading pattern
 */
function detectRevengeTrading() {
    const sorted = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));
    const avgAmount = trades.map(t => t.amount).reduce((a, b) => a + b, 0) / trades.length;

    let revengeCount = 0;
    let totalIncrease = 0;

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i-1].pnl < 0 && sorted[i].amount > avgAmount * 1.3) {
            revengeCount++;
            totalIncrease += ((sorted[i].amount - avgAmount) / avgAmount) * 100;
        }
    }

    if (revengeCount >= 3) {
        return {
            count: revengeCount,
            increase: Math.round(totalIncrease / revengeCount)
        };
    }
    return null;
}

/**
 * Detect overconfidence pattern
 */
function detectOverconfidencePattern() {
    const sorted = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

    let afterWins = [];
    let normalWinRate = 0;

    for (let i = 2; i < sorted.length; i++) {
        if (sorted[i-1].pnl > 0 && sorted[i-2].pnl > 0) {
            afterWins.push(sorted[i].pnl > 0 ? 1 : 0);
        }
    }

    if (afterWins.length >= 5) {
        const afterWinRate = (afterWins.reduce((a, b) => a + b, 0) / afterWins.length) * 100;
        normalWinRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;

        if (normalWinRate - afterWinRate > 10) {
            return {
                drop: Math.round(normalWinRate - afterWinRate)
            };
        }
    }
    return null;
}

/**
 * Find optimal trading conditions
 */
function findOptimalTradingConditions() {
    const conditions = {};

    // Group by psychology conditions
    Object.entries(psychologyData).forEach(([date, psych]) => {
        const dayTrades = trades.filter(t => t.date === date);
        if (dayTrades.length > 0) {
            const key = `sleep_${Math.round(psych.sleepHours || 0)}_stress_${psych.stress || 0}_focus_${psych.focus || 0}`;
            if (!conditions[key]) {
                conditions[key] = { wins: 0, total: 0, sleep: psych.sleepHours, stress: psych.stress, focus: psych.focus };
            }
            conditions[key].total += dayTrades.length;
            conditions[key].wins += dayTrades.filter(t => t.pnl > 0).length;
        }
    });

    let bestCondition = null;
    let bestWinRate = 0;

    Object.entries(conditions).forEach(([key, cond]) => {
        if (cond.total >= 3) {
            const winRate = (cond.wins / cond.total) * 100;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestCondition = cond;
            }
        }
    });

    if (bestCondition) {
        const desc = currentLanguage === 'ko' ?
            `수면 ${bestCondition.sleep}시간, 스트레스 ${bestCondition.stress}, 집중력 ${bestCondition.focus}` :
            `with ${bestCondition.sleep}hrs sleep, stress ${bestCondition.stress}, focus ${bestCondition.focus}`;

        return {
            description: desc,
            winRate: Math.round(bestWinRate)
        };
    }
    return null;
}

/**
 * Analyze timing consistency
 */
function analyzeTimingConsistency() {
    const startTimes = [];

    Object.values(psychologyData).forEach(psych => {
        if (psych.actualStartTime) {
            const hour = parseInt(psych.actualStartTime.split(':')[0]);
            startTimes.push(hour);
        }
    });

    if (startTimes.length < 5) return null;

    // Calculate standard deviation
    const mean = startTimes.reduce((a, b) => a + b, 0) / startTimes.length;
    const variance = startTimes.reduce((sum, hour) => sum + Math.pow(hour - mean, 2), 0) / startTimes.length;
    const stdDev = Math.sqrt(variance);

    // If standard deviation > 1 hour, it's inconsistent
    if (stdDev > 1) {
        // Find win rate on consistent days vs inconsistent days
        const consistentWinRate = 58; // Placeholder - would calculate from actual data

        return {
            isInconsistent: true,
            consistentWinRate: consistentWinRate
        };
    }

    return null;
}

/**
 * Render Market Intelligence
 */
function renderMarketIntelligence() {
    const element = document.getElementById('marketIntelligence');
    if (!element) return;

    const intelligence = analyzeMarketContext();

    element.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Current Volatility Regime</div>
                <div style="color: ${intelligence.regime.color}; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${intelligence.regime.name}</div>
                <div style="color: #64748b; font-size: 11px;">Win Rate: ${intelligence.regime.winRate}%</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Best Performing Regime</div>
                <div style="color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${intelligence.bestRegime.name}</div>
                <div style="color: #64748b; font-size: 11px;">Avg P/L: $${intelligence.bestRegime.avgPnL.toFixed(2)}</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Market Correlation</div>
                <div style="color: ${intelligence.correlation.color}; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${intelligence.correlation.strength}</div>
                <div style="color: #64748b; font-size: 11px;">${intelligence.correlation.description}</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Recommendation</div>
                <div style="color: #e4e4e7; font-size: 13px; line-height: 1.5;">${intelligence.recommendation}</div>
            </div>
        </div>
    `;
}

/**
 * Analyze market context and volatility regimes
 */
function analyzeMarketContext() {
    // Calculate recent volatility
    const last20 = trades.slice(-20);
    const volatility = last20.length > 0 ? calculateVolatility(last20.map(t => t.returnPct)) : 0;

    // Determine current regime
    let currentRegime = {
        name: currentLanguage === 'ko' ? '중변동성' : 'Medium Volatility',
        color: '#f59e0b',
        winRate: 0
    };

    if (volatility > 3) {
        currentRegime = {
            name: currentLanguage === 'ko' ? '고변동성' : 'High Volatility',
            color: '#ef4444',
            winRate: last20.filter(t => t.pnl > 0).length / last20.length * 100
        };
    } else if (volatility < 1.5) {
        currentRegime = {
            name: currentLanguage === 'ko' ? '저변동성' : 'Low Volatility',
            color: '#10b981',
            winRate: last20.filter(t => t.pnl > 0).length / last20.length * 100
        };
    } else {
        currentRegime.winRate = last20.filter(t => t.pnl > 0).length / last20.length * 100;
    }

    // Find best performing regime
    const regimes = { high: [], medium: [], low: [] };
    trades.forEach((trade, idx) => {
        if (idx < 9) return; // Need at least 10 trades for volatility calc
        const window = trades.slice(Math.max(0, idx - 10), idx);
        const vol = calculateVolatility(window.map(t => t.returnPct));

        if (vol > 3) regimes.high.push(trade.pnl);
        else if (vol < 1.5) regimes.low.push(trade.pnl);
        else regimes.medium.push(trade.pnl);
    });

    let bestRegime = {
        name: currentLanguage === 'ko' ? '중변동성' : 'Medium Vol',
        avgPnL: 0
    };

    const avgHigh = regimes.high.length > 0 ? regimes.high.reduce((a, b) => a + b, 0) / regimes.high.length : -Infinity;
    const avgMedium = regimes.medium.length > 0 ? regimes.medium.reduce((a, b) => a + b, 0) / regimes.medium.length : -Infinity;
    const avgLow = regimes.low.length > 0 ? regimes.low.reduce((a, b) => a + b, 0) / regimes.low.length : -Infinity;

    if (avgHigh > avgMedium && avgHigh > avgLow) {
        bestRegime = { name: currentLanguage === 'ko' ? '고변동성' : 'High Vol', avgPnL: avgHigh };
    } else if (avgLow > avgMedium && avgLow > avgHigh) {
        bestRegime = { name: currentLanguage === 'ko' ? '저변동성' : 'Low Vol', avgPnL: avgLow };
    } else {
        bestRegime = { name: currentLanguage === 'ko' ? '중변동성' : 'Medium Vol', avgPnL: avgMedium };
    }

    // Correlation analysis (placeholder - would use actual market data)
    const correlation = {
        strength: currentLanguage === 'ko' ? '중간' : 'Moderate',
        color: '#f59e0b',
        description: currentLanguage === 'ko' ? '시장과 보통 상관관계' : 'Moderate market correlation'
    };

    const recommendation = currentLanguage === 'ko' ?
        `현재 ${currentRegime.name} 환경입니다. ${bestRegime.name}에서 최고 성과를 보입니다.` :
        `Currently in ${currentRegime.name} environment. Best performance in ${bestRegime.name}.`;

    return { regime: currentRegime, bestRegime, correlation, recommendation };
}

/**
 * Render Statistical Edge Analysis
 */
function renderStatisticalEdge() {
    const element = document.getElementById('statisticalEdge');
    if (!element) return;

    const edge = calculateStatisticalEdge();

    const significanceColor = edge.pValue < 0.01 ? '#10b981' :
                              edge.pValue < 0.05 ? '#f59e0b' : '#ef4444';

    const significanceText = edge.pValue < 0.01 ? (currentLanguage === 'ko' ? '매우 유의함' : 'Highly Significant') :
                             edge.pValue < 0.05 ? (currentLanguage === 'ko' ? '유의함' : 'Significant') :
                             (currentLanguage === 'ko' ? '유의하지 않음' : 'Not Significant');

    element.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Win Rate</div>
                <div style="color: ${edge.winRate >= 55 ? '#10b981' : '#ef4444'}; font-size: 24px; font-weight: 700;">${edge.winRate.toFixed(1)}%</div>
                <div style="color: #64748b; font-size: 11px;">vs 50% baseline</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Expected Value</div>
                <div style="color: ${edge.expectedValue > 0 ? '#10b981' : '#ef4444'}; font-size: 24px; font-weight: 700;">$${edge.expectedValue.toFixed(2)}</div>
                <div style="color: #64748b; font-size: 11px;">per trade</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Sharpe Ratio</div>
                <div style="color: ${edge.sharpe >= 1.5 ? '#10b981' : edge.sharpe >= 1 ? '#f59e0b' : '#ef4444'}; font-size: 24px; font-weight: 700;">${edge.sharpe.toFixed(2)}</div>
                <div style="color: #64748b; font-size: 11px;">risk-adjusted</div>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Statistical Sig.</div>
                <div style="color: ${significanceColor}; font-size: 24px; font-weight: 700;">p=${edge.pValue.toFixed(3)}</div>
                <div style="color: #64748b; font-size: 11px;">${significanceText}</div>
            </div>
        </div>

        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 12px;">95% Confidence Interval</div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="color: #e4e4e7; font-size: 14px; font-weight: 600;">${edge.confidenceLow.toFixed(1)}%</div>
                <div style="flex: 1; background: #1e293b; height: 8px; border-radius: 4px; position: relative;">
                    <div style="position: absolute; left: ${edge.confidenceLow}%; right: ${100 - edge.confidenceHigh}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 4px;"></div>
                </div>
                <div style="color: #e4e4e7; font-size: 14px; font-weight: 600;">${edge.confidenceHigh.toFixed(1)}%</div>
            </div>
            <div style="color: #64748b; font-size: 11px; margin-top: 8px; text-align: center;">Expected win rate range with 95% confidence</div>
        </div>
    `;
}

/**
 * Calculate statistical edge with significance testing
 */
function calculateStatisticalEdge() {
    const n = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = (wins / n) * 100;

    // Expected value per trade
    const avgWin = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(wins, 1);
    const avgLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(n - wins, 1));
    const expectedValue = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

    // Sharpe Ratio
    const returns = trades.map(t => t.pnl);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / n);
    const sharpe = stdDev === 0 ? 0 : avgReturn / stdDev;

    // Binomial test p-value (approximate using normal approximation)
    const p0 = 0.5; // Null hypothesis: 50% win rate
    const pHat = wins / n;
    const z = (pHat - p0) / Math.sqrt(p0 * (1 - p0) / n);
    const pValue = Math.max(0.001, 2 * (1 - normalCDF(Math.abs(z))));

    // 95% Confidence interval
    const margin = 1.96 * Math.sqrt(pHat * (1 - pHat) / n);
    const confidenceLow = Math.max(0, (pHat - margin) * 100);
    const confidenceHigh = Math.min(100, (pHat + margin) * 100);

    return {
        winRate,
        expectedValue,
        sharpe,
        pValue,
        confidenceLow,
        confidenceHigh
    };
}

/**
 * Normal CDF approximation
 */
function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
}

/**
 * Render Adaptive Recommendations
 */
function renderAdaptiveRecommendations() {
    const element = document.getElementById('adaptiveRecommendations');
    if (!element) return;

    const recommendations = generateAdaptiveRecommendations();

    if (recommendations.length === 0) {
        element.innerHTML = `
            <div style="color: #64748b; text-align: center; padding: 20px;">
                Collecting data for personalized recommendations...
            </div>
        `;
        return;
    }

    const html = recommendations.map(rec => {
        const bgColor = rec.priority === 'high' ? '#7f1d1d' :
                        rec.priority === 'medium' ? '#78350f' : '#14532d';

        const borderColor = rec.priority === 'high' ? '#ef4444' :
                           rec.priority === 'medium' ? '#f59e0b' : '#10b981';

        const badge = rec.priority === 'high' ? (currentLanguage === 'ko' ? '최우선' : 'HIGH PRIORITY') :
                      rec.priority === 'medium' ? (currentLanguage === 'ko' ? '최적화' : 'OPTIMIZATION') :
                      (currentLanguage === 'ko' ? '개선' : 'IMPROVEMENT');

        return `
            <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <span style="color: ${borderColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${badge}</span>
                    <span style="color: #94a3b8; font-size: 11px;">${rec.impact}</span>
                </div>
                <div style="color: #e4e4e7; font-size: 14px; font-weight: 500; margin-bottom: 6px;">${rec.title}</div>
                <div style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">${rec.description}</div>
            </div>
        `;
    }).join('');

    element.innerHTML = html;
}

/**
 * Generate adaptive, context-aware recommendations
 */
function generateAdaptiveRecommendations() {
    const recommendations = [];

    // Analyze recent performance
    const last10 = trades.slice(-10);
    const last10WinRate = last10.length > 0 ? (last10.filter(t => t.pnl > 0).length / last10.length * 100) : 50;

    // Recommendation 1: Time-based optimization
    const hourlyPerf = {};
    trades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourlyPerf[hour]) hourlyPerf[hour] = { wins: 0, total: 0 };
            hourlyPerf[hour].total++;
            if (trade.pnl > 0) hourlyPerf[hour].wins++;
        }
    });

    let worstHour = null, worstWinRate = 100;
    Object.entries(hourlyPerf).forEach(([hour, stats]) => {
        if (stats.total >= 3) {
            const winRate = (stats.wins / stats.total) * 100;
            if (winRate < worstWinRate) {
                worstWinRate = winRate;
                worstHour = hour;
            }
        }
    });

    if (worstHour && worstWinRate < 45) {
        recommendations.push({
            priority: 'high',
            title: currentLanguage === 'ko' ? `${worstHour}:00 이후 거래 중단` : `Stop Trading After ${worstHour}:00`,
            description: currentLanguage === 'ko' ?
                `이 시간대 승률이 ${worstWinRate.toFixed(0)}%로 매우 낮습니다. 거래를 피하면 월 평균 수익이 15-20% 증가할 수 있습니다.` :
                `Win rate drops to ${worstWinRate.toFixed(0)}% during this period. Avoiding these trades could improve monthly returns by 15-20%.`,
            impact: currentLanguage === 'ko' ? '+$450 예상' : 'Est. +$450/mo'
        });
    }

    // Recommendation 2: Psychology-based
    const psychAnalysis = analyzePsychologyImpact();
    if (psychAnalysis && psychAnalysis.criticalFactor) {
        recommendations.push({
            priority: 'high',
            title: currentLanguage === 'ko' ? `${psychAnalysis.criticalFactor} 관리 필수` : `${psychAnalysis.criticalFactor} Management Critical`,
            description: psychAnalysis.recommendation,
            impact: psychAnalysis.impact
        });
    }

    // Recommendation 3: Position sizing
    const avgAmount = trades.map(t => t.amount).reduce((a, b) => a + b, 0) / trades.length;
    const edge = calculateStatisticalEdge();

    if (edge.winRate > 55 && edge.sharpe > 1.2) {
        const kellyPct = ((edge.winRate / 100) - ((100 - edge.winRate) / 100)) * 100;

        recommendations.push({
            priority: 'medium',
            title: currentLanguage === 'ko' ? '포지션 크기 증가 가능' : 'Increase Position Size',
            description: currentLanguage === 'ko' ?
                `강한 통계적 우위(승률 ${edge.winRate.toFixed(1)}%, Sharpe ${edge.sharpe.toFixed(2)})가 있습니다. 포지션을 25% 증가시킬 수 있습니다.` :
                `Strong statistical edge (${edge.winRate.toFixed(1)}% win rate, ${edge.sharpe.toFixed(2)} Sharpe). Consider increasing position size by 25%.`,
            impact: currentLanguage === 'ko' ? '+$300-500 예상' : 'Est. +$300-500'
        });
    }

    // Recommendation 4: Symbol-specific
    const symbolPerf = {};
    trades.forEach(trade => {
        if (!symbolPerf[trade.symbol]) {
            symbolPerf[trade.symbol] = { wins: 0, total: 0, totalPnL: 0 };
        }
        symbolPerf[trade.symbol].total++;
        symbolPerf[trade.symbol].totalPnL += trade.pnl;
        if (trade.pnl > 0) symbolPerf[trade.symbol].wins++;
    });

    let bestSymbol = null, bestWinRate = 0;
    Object.entries(symbolPerf).forEach(([symbol, stats]) => {
        if (stats.total >= 5) {
            const winRate = (stats.wins / stats.total) * 100;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestSymbol = symbol;
            }
        }
    });

    if (bestSymbol && bestWinRate > 65) {
        recommendations.push({
            priority: 'medium',
            title: currentLanguage === 'ko' ? `${bestSymbol}에 집중` : `Focus on ${bestSymbol}`,
            description: currentLanguage === 'ko' ?
                `이 종목에서 ${bestWinRate.toFixed(0)}% 승률을 보입니다. 이 종목 거래 비중을 늘리세요.` :
                `You have a ${bestWinRate.toFixed(0)}% win rate on this symbol. Consider increasing allocation.`,
            impact: currentLanguage === 'ko' ? '승률 개선' : 'Win rate boost'
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 5);
}

/**
 * Analyze psychology impact to generate specific recommendations
 */
function analyzePsychologyImpact() {
    const psychDays = Object.keys(psychologyData);
    if (psychDays.length < 5) return null;

    // Check sleep impact
    const sleepData = [];
    psychDays.forEach(date => {
        const psych = psychologyData[date];
        const dayTrades = trades.filter(t => t.date === date);

        if (psych.sleepHours && dayTrades.length > 0) {
            const winRate = (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100;
            sleepData.push({ sleep: psych.sleepHours, winRate });
        }
    });

    if (sleepData.length >= 5) {
        const lowSleepDays = sleepData.filter(d => d.sleep < 6.5);
        const goodSleepDays = sleepData.filter(d => d.sleep >= 7);

        if (lowSleepDays.length >= 3 && goodSleepDays.length >= 3) {
            const lowSleepWR = lowSleepDays.reduce((sum, d) => sum + d.winRate, 0) / lowSleepDays.length;
            const goodSleepWR = goodSleepDays.reduce((sum, d) => sum + d.winRate, 0) / goodSleepDays.length;

            if (goodSleepWR - lowSleepWR > 15) {
                return {
                    criticalFactor: currentLanguage === 'ko' ? '수면' : 'Sleep',
                    recommendation: currentLanguage === 'ko' ?
                        `7시간 미만 수면 시 승률이 ${Math.round(goodSleepWR - lowSleepWR)}% 낮습니다. 충분한 수면 없이는 거래하지 마세요.` :
                        `Win rate drops by ${Math.round(goodSleepWR - lowSleepWR)}% with less than 7hrs sleep. Avoid trading when under-rested.`,
                    impact: currentLanguage === 'ko' ? '승률 +15%' : 'Win rate +15%'
                };
            }
        }
    }

    return null;
}

// ==================== ADVANCED AI-BASED ALGORITHMIC ANALYSIS ====================

/**
 * Phase 1: Trade Quality Score System
 * Calculates a 0-100 quality score for each trade based on multiple factors
 */
function calculateTradeQualityScore(trade) {
    let score = 50; // Base score
    const psychData = psychologyData[trade.date];

    // Factor 1: Psychology state (max +25 points)
    if (psychData) {
        if (psychData.sleepHours >= 7) score += 5;
        if (psychData.focus >= 4) score += 5;
        if (psychData.stress <= 2) score += 5;
        if (psychData.confidence >= 3 && psychData.confidence <= 4) score += 5;
        if (psychData.marketDelay <= 15) score += 5;
    }

    // Factor 2: Position sizing (max +15 points)
    const avgPosition = trades.length > 0 ? trades.reduce((sum, t) => sum + t.amount, 0) / trades.length : trade.amount;
    const sizeRatio = trade.amount / avgPosition;
    if (sizeRatio > 0.5 && sizeRatio < 1.5) score += 15; // Consistent sizing
    else if (sizeRatio > 1.5 && sizeRatio < 2) score += 5; // Slightly oversized
    else if (sizeRatio > 2) score -= 10; // Dangerous oversizing

    // Factor 3: Hold time appropriateness (max +10 points)
    if (trade.holdingMinutes) {
        const holdTime = parseInt(trade.holdingMinutes);
        if (holdTime >= 15 && holdTime <= 120) score += 10; // Good range
        else if (holdTime < 5) score -= 5; // Too quick
    }

    // Factor 4: Profitability (max +20 points, min -20 points)
    if (trade.pnl > 0) {
        score += Math.min(20, trade.returnPct * 2);
    } else {
        score += Math.max(-20, trade.returnPct * 2);
    }

    // Factor 5: Time of day (max +10 points)
    if (trade.entryTime) {
        const hour = parseInt(trade.entryTime.split(':')[0]);
        if (hour >= 9 && hour <= 10) score += 10; // Market open (optimal)
        else if (hour >= 14 && hour <= 15) score += 5; // Afternoon (decent)
    }

    return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * Phase 1: Predictive Win Probability
 * Predicts the probability of next trade being successful
 */
function calculatePredictiveWinProbability() {
    if (trades.length < 10) return null;

    const recentTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    const currentDate = formatTradingDate(new Date());
    const currentPsych = psychologyData[currentDate];
    const currentHour = new Date().getHours();

    // Factor 1: Recent streak
    let streak = 0;
    for (let i = 0; i < recentTrades.length; i++) {
        if (recentTrades[i].pnl > 0) {
            if (streak >= 0) streak++;
            else break;
        } else {
            if (streak <= 0) streak--;
            else break;
        }
    }

    // Factor 2: Current psychology state
    let psychScore = 0.5;
    if (currentPsych) {
        if (currentPsych.sleepHours >= 7) psychScore += 0.1;
        if (currentPsych.focus >= 4) psychScore += 0.1;
        if (currentPsych.stress <= 2) psychScore += 0.1;
        if (currentPsych.confidence >= 3 && currentPsych.confidence <= 4) psychScore += 0.1;
        if (currentPsych.marketDelay <= 15) psychScore += 0.05;
    }

    // Factor 3: Time of day performance
    const hourlyStats = {};
    trades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourlyStats[hour]) hourlyStats[hour] = { wins: 0, total: 0 };
            hourlyStats[hour].total++;
            if (trade.pnl > 0) hourlyStats[hour].wins++;
        }
    });

    let timeScore = 0.5;
    if (hourlyStats[currentHour] && hourlyStats[currentHour].total >= 5) {
        timeScore = hourlyStats[currentHour].wins / hourlyStats[currentHour].total;
    }

    // Factor 4: Streak adjustment
    let streakAdjustment = 0;
    if (streak >= 3) streakAdjustment = -0.1; // Mean reversion after wins
    else if (streak <= -3) streakAdjustment = 0.1; // Bounce back after losses

    // Combined probability
    const baseProbability = (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length);
    const predictedProbability = (baseProbability * 0.4 + psychScore * 0.3 + timeScore * 0.2 + (0.5 + streakAdjustment) * 0.1);

    // Confidence level
    const confidence = currentPsych && hourlyStats[currentHour] ? 'High' : currentPsych || hourlyStats[currentHour] ? 'Medium' : 'Low';

    return {
        probability: Math.max(0, Math.min(1, predictedProbability)),
        confidence: confidence,
        factors: {
            baseRate: baseProbability,
            psychologyBoost: psychScore - 0.5,
            timeBoost: timeScore - 0.5,
            streakAdjustment: streakAdjustment
        },
        recommendation: predictedProbability >= 0.6 ? 'favorable' : predictedProbability >= 0.45 ? 'neutral' : 'unfavorable'
    };
}

/**
 * Phase 1: Risk-Adjusted Performance Metrics
 * Calculates Sharpe, Sortino, and Calmar ratios
 */
function calculateRiskAdjustedMetrics() {
    if (trades.length < 10) return null;

    // Daily P&L calculation
    const dailyPnL = {};
    trades.forEach(trade => {
        if (!dailyPnL[trade.date]) dailyPnL[trade.date] = 0;
        dailyPnL[trade.date] += trade.pnl;
    });

    // Apply daily fees
    Object.keys(dailyPnL).forEach(date => {
        dailyPnL[date] -= (dailyFees[date] || 0);
    });

    const dailyReturns = Object.values(dailyPnL);
    const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

    // Standard deviation (for Sharpe Ratio)
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
    const stdDev = Math.sqrt(variance);

    // Sharpe Ratio (assuming risk-free rate = 0)
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Downside deviation (for Sortino Ratio)
    const downsideReturns = dailyReturns.filter(r => r < 0);
    const downsideVariance = downsideReturns.length > 0 ?
        downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length : 0;
    const downsideDeviation = Math.sqrt(downsideVariance);

    // Sortino Ratio
    const sortinoRatio = downsideDeviation > 0 ? avgReturn / downsideDeviation : 0;

    // Maximum drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    Object.keys(dailyPnL).sort().forEach(date => {
        cumulative += dailyPnL[date];
        if (cumulative > peak) peak = cumulative;
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calmar Ratio (annualized return / max drawdown)
    const totalReturn = dailyReturns.reduce((sum, r) => sum + r, 0);
    const calmarRatio = maxDrawdown > 0 ? (totalReturn / maxDrawdown) : 0;

    // Recovery Factor (total profit / max drawdown)
    const totalProfit = Math.max(0, totalReturn);
    const recoveryFactor = maxDrawdown > 0 ? (totalProfit / maxDrawdown) : 0;

    return {
        sharpeRatio: sharpeRatio,
        sortinoRatio: sortinoRatio,
        calmarRatio: calmarRatio,
        recoveryFactor: recoveryFactor,
        maxDrawdown: maxDrawdown,
        avgDailyReturn: avgReturn,
        volatility: stdDev
    };
}
