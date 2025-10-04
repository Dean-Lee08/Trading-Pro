// analytics.js - 분석 및 차트 관련 기능

// ==================== Analytics Section Management ====================

/**
 * 분석 섹션 전환
 */
function showAnalyticsSection(sectionName) {
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
        document.getElementById('patternsSection').classList.add('active');
        setTimeout(() => updatePatternInsights(), 100);
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
    updateDetailedAnalytics();
}

/**
 * 분석용 필터링된 거래 가져오기
 */
function getFilteredTradesForAnalytics() {
    // Apply custom date range if set
    if (analyticsStartDate || analyticsEndDate) {
        return trades.filter(trade => {
            const tradeDate = trade.date;
            if (analyticsStartDate && tradeDate < analyticsStartDate) return false;
            if (analyticsEndDate && tradeDate > analyticsEndDate) return false;
            return true;
        });
    }

    // Return all trades if no filter is set (default "All Time")
    return trades;
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
    document.getElementById('summaryNetProfit').textContent = `$${netTotalPL.toFixed(2)}`;
    document.getElementById('summaryNetProfit').className = `summary-card-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('summaryTotalTrades').textContent = filteredTrades.length;
    document.getElementById('summaryWinRate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('summaryWinRate').className = `summary-card-value ${winRate >= 50 ? 'positive' : 'negative'}`;
    document.getElementById('summaryProfitFactor').textContent = profitFactor.toFixed(2);
    document.getElementById('summaryProfitFactor').className = `summary-card-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
    document.getElementById('summaryLargestWin').textContent = `$${largestWin.toFixed(2)}`;
    document.getElementById('summaryLargestWin').className = `summary-card-value positive`;
    document.getElementById('summaryLargestLoss').textContent = `$${largestLoss.toFixed(2)}`;
    document.getElementById('summaryLargestLoss').className = `summary-card-value negative`;

    // Update detail cards
    updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees);
    updateWinLossStatistics(filteredTrades, wins, losses, winRate);
    updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees);
    updateTimeAnalysisDetails(filteredTrades);
    updateTradingActivityDetails(filteredTrades, uniqueDatesForFees);
    updateStreakAnalysisDetails(filteredTrades);
    updateSymbolPerformanceDetails(filteredTrades);
    updateRiskManagementDetails(filteredTrades);

    // Update basic charts if in detail section
    if (currentAnalyticsSection === 'detail') {
        setTimeout(async () => await updateBasicCharts(), 100);
    }
}

/**
 * 거래 성과 상세 업데이트
 */
function updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees) {
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const netTotalPL = totalPL - totalDailyFees;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    document.getElementById('detailTotalPL').textContent = `$${netTotalPL.toFixed(2)}`;
    document.getElementById('detailTotalPL').className = `detail-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('detailTotalGain').textContent = `$${totalWins.toFixed(2)}`;
    document.getElementById('detailTotalLoss').textContent = `$${totalLosses.toFixed(2)}`;
    document.getElementById('detailTotalFees').textContent = `$${totalDailyFees.toFixed(2)}`;
    document.getElementById('detailTotalVolume').textContent = `$${totalVolume.toFixed(2)}`;
    document.getElementById('detailProfitFactor').textContent = profitFactor.toFixed(2);
    document.getElementById('detailProfitFactor').className = `detail-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
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
        const day = new Date(trade.date).getDay();
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
            if (canvas) {
                const parent = canvas.parentElement;
                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #64748b;">No data available</div>';
            }
        });
        return;
    }

    // Restore canvas elements if they were replaced with "No data" message
    ['basicCumulativePLChart', 'basicWinLossChart', 'basicDailyPLChart', 'basicMonthlyChart'].forEach(chartId => {
        const existing = document.getElementById(chartId);
        if (!existing || existing.tagName !== 'CANVAS') {
            const parent = document.querySelector(`#${chartId}`);
            if (parent && parent.parentElement) {
                parent.parentElement.innerHTML = `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
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


// ==================== Pattern Insights ====================

/**
 * 패턴 인사이트 업데이트
 */
function updatePatternInsights() {
    analyzeTimeBasedPerformance();
    analyzeConsecutiveTradesPattern();
    generateAIInsights();
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
        document.getElementById('bestHourPerformance').textContent = `Win Rate: ${bestWinRate.toFixed(0)}%`;
    }

    if (worstHour) {
        document.getElementById('worstTradingHour').textContent = `${worstHour}:00`;
        document.getElementById('worstHourPerformance').textContent = `Win Rate: ${worstWinRate.toFixed(0)}%`;
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
                element.style.color = winRate >= 50 ? '#10b981' : '#ef4444';
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
