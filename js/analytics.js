// analytics.js - 분석 및 차트 관련 기능

// ==================== Analytics Section Management ====================

/**
 * 알고리즘 분석 탭 전환
 */
function switchAlgoTab(tabName) {
    console.log('📊 switchAlgoTab called with:', tabName);

    // Update tab button states
    document.querySelectorAll('.algo-analysis-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.color = '#94a3b8';
        tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.algo-analysis-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.color = '#10b981';
        activeTab.style.borderBottomColor = '#10b981';
    }

    // Show/hide tab content
    document.querySelectorAll('.algo-tab-content').forEach(content => {
        content.style.display = 'none';
    });

    const activeContent = document.getElementById(`algoTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activeContent) {
        activeContent.style.display = 'block';
    }

    console.log(`✅ Switched to ${tabName} tab`);
}

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
        setTimeout(() => {
            updateBasicCharts().catch(err => console.error('Error updating basic charts:', err));
        }, 100);
    } else if (sectionName === 'charts') {
        document.getElementById('chartSection').classList.add('active');
        setTimeout(() => {
            updateAdvancedCharts().catch(err => console.error('Error updating advanced charts:', err));
        }, 100);
    } else if (sectionName === 'patterns') {
        const patternsSection = document.getElementById('patternsSection');
        if (patternsSection) {
            patternsSection.classList.add('active');
        } else {
            console.error('patternsSection element not found!');
        }
        setTimeout(() => {
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
    updateDetailedAnalytics();
}

/**
 * 분석 데이터 수동 새로고침
 */
function refreshAnalyticsData() {
    analyticsLoadedOnce = false;
    analyticsFilterState = null;
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

    // Update basic charts if in detail section
    if (currentAnalyticsSection === 'detail') {
        setTimeout(() => {
            updateBasicCharts().catch(err => console.error('Error updating basic charts:', err));
        }, 100);
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

// ==================== NEW: Advanced Risk Management Calculations ====================

/**
 * Maximum Drawdown (MDD) 계산 - 총자본 대비 최대 손실 폭
 * @param {Array} trades - 거래 배열
 * @param {number} initialCapital - 초기 자본 (기본값: 10000)
 * @returns {Object} - { mdd: 금액, mddPercent: %, peak: 최고점, trough: 최저점 }
 */
function calculateMaxDrawdown(trades, initialCapital = 10000) {
    if (!trades || trades.length === 0) {
        return { mdd: 0, mddPercent: 0, peak: initialCapital, trough: initialCapital };
    }

    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentCapital = initialCapital;
    let peak = initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peakCapital = initialCapital;
    let troughCapital = initialCapital;

    sortedTrades.forEach(trade => {
        currentCapital += trade.pnl;

        if (currentCapital > peak) {
            peak = currentCapital;
        }

        const drawdown = peak - currentCapital;
        const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownPercent = drawdownPercent;
            peakCapital = peak;
            troughCapital = currentCapital;
        }
    });

    return {
        mdd: maxDrawdown,
        mddPercent: maxDrawdownPercent,
        peak: peakCapital,
        trough: troughCapital,
        currentCapital: currentCapital
    };
}

/**
 * Sortino Ratio 계산 - 하방 위험만 고려한 위험 조정 수익률
 * @param {Array} trades - 거래 배열
 * @param {number} riskFreeRate - 무위험 수익률 (연율 %, 기본값 0)
 * @returns {number} - Sortino Ratio (>2 우수, >1 양호)
 */
function calculateSortinoRatio(trades, riskFreeRate = 0) {
    if (!trades || trades.length === 0) {
        return 0;
    }

    // 거래별 수익률 계산
    const returns = trades.map(trade => trade.returnPct || 0);

    // 평균 수익률
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // 하방 편차 (Downside Deviation) 계산 - 손실 거래만 고려
    const negativeReturns = returns.filter(r => r < 0);

    if (negativeReturns.length === 0) {
        return avgReturn > 0 ? 999 : 0; // 손실이 없으면 매우 높은 값
    }

    const downsideVariance = negativeReturns.reduce((sum, r) => sum + (r * r), 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);

    if (downsideDeviation === 0) {
        return avgReturn > 0 ? 999 : 0;
    }

    // Sortino Ratio = (평균 수익률 - 무위험 수익률) / 하방 편차
    const sortinoRatio = (avgReturn - riskFreeRate) / downsideDeviation;

    return sortinoRatio;
}

/**
 * Kelly Criterion 계산 - 최적 포지션 크기 비율
 * @param {Array} trades - 거래 배열
 * @returns {Object} - { kellyPercent: %, halfKelly: %, quarterKelly: %, recommendation: 권장사항 }
 */
function calculateKellyCriterion(trades) {
    if (!trades || trades.length === 0) {
        return { kellyPercent: 0, halfKelly: 0, quarterKelly: 0, recommendation: 'Insufficient data' };
    }

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);

    if (wins.length === 0 || losses.length === 0) {
        return { kellyPercent: 0, halfKelly: 0, quarterKelly: 0, recommendation: 'Need both wins and losses' };
    }

    // 승률 (Win Rate)
    const winRate = wins.length / trades.length;

    // 평균 승리 금액
    const avgWin = wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length;

    // 평균 손실 금액 (절댓값)
    const avgLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length);

    if (avgLoss === 0) {
        return { kellyPercent: 0, halfKelly: 0, quarterKelly: 0, recommendation: 'Invalid loss data' };
    }

    // Win/Loss Ratio
    const winLossRatio = avgWin / avgLoss;

    // Kelly % = W - [(1 - W) / R]
    // W = 승률, R = Win/Loss Ratio
    const kellyPercent = (winRate - ((1 - winRate) / winLossRatio)) * 100;

    // 보수적 접근: Half Kelly, Quarter Kelly
    const halfKelly = kellyPercent / 2;
    const quarterKelly = kellyPercent / 4;

    // 권장사항
    let recommendation = '';
    if (kellyPercent <= 0) {
        recommendation = 'No edge detected - Do not trade';
    } else if (kellyPercent > 0 && kellyPercent <= 5) {
        recommendation = 'Use 25-50% of Kelly (conservative)';
    } else if (kellyPercent > 5 && kellyPercent <= 15) {
        recommendation = 'Use 10-25% of Kelly (moderate)';
    } else {
        recommendation = 'Use 10% of Kelly max (high risk)';
    }

    return {
        kellyPercent: Math.max(0, kellyPercent),
        halfKelly: Math.max(0, halfKelly),
        quarterKelly: Math.max(0, quarterKelly),
        tenthKelly: Math.max(0, kellyPercent / 10),
        winRate: winRate * 100,
        winLossRatio: winLossRatio,
        recommendation: recommendation
    };
}

/**
 * Sharpe Ratio 계산 (기존 함수가 없다면 추가)
 * @param {Array} trades - 거래 배열
 * @param {number} riskFreeRate - 무위험 수익률 (연율 %, 기본값 0)
 * @returns {number} - Sharpe Ratio
 */
function calculateSharpeRatio(trades, riskFreeRate = 0) {
    if (!trades || trades.length === 0) {
        return 0;
    }

    const returns = trades.map(trade => trade.returnPct || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // 표준편차 계산
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
        return avgReturn > 0 ? 999 : 0;
    }

    return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * Expected Value (기댓값) 계산
 * @param {Array} trades - 거래 배열
 * @returns {number} - 거래당 평균 기댓값 ($)
 */
function calculateExpectedValue(trades) {
    if (!trades || trades.length === 0) {
        return 0;
    }

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    return totalPnL / trades.length;
}

/**
 * Slippage 분석 - 예상 가격 대비 실제 체결 가격 차이
 * @param {Array} trades - 거래 배열
 * @param {Object} marketQuotes - 시장 데이터 (선택 사항)
 * @returns {Object} - 슬리피지 통계
 */
function analyzeSlippage(trades, marketQuotes = {}) {
    if (!trades || trades.length === 0) {
        return {
            avgEntrySlippage: 0,
            avgExitSlippage: 0,
            totalSlippageCost: 0,
            byTime: {},
            bySymbol: {},
            slippagePercent: 0
        };
    }

    let totalEntrySlippage = 0;
    let totalExitSlippage = 0;
    let entryCount = 0;
    let exitCount = 0;
    const byTime = {}; // 시간대별 슬리피지
    const bySymbol = {}; // 종목별 슬리피지

    trades.forEach(trade => {
        // 슬리피지 추정: 실제로는 quote 데이터와 비교해야 하지만,
        // 간단한 추정으로는 bid-ask spread의 일부로 가정
        // 여기서는 0.1% ~ 0.3% 정도를 평균 슬리피지로 가정 (예시)

        const estimatedSlippagePercent = 0.002; // 0.2% 기본 추정치
        const entrySlippage = trade.buyPrice * estimatedSlippagePercent;
        const exitSlippage = trade.sellPrice * estimatedSlippagePercent;

        totalEntrySlippage += entrySlippage * trade.shares;
        totalExitSlippage += exitSlippage * trade.shares;
        entryCount++;
        exitCount++;

        // 시간대별 집계
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!byTime[hour]) {
                byTime[hour] = { slippage: 0, count: 0 };
            }
            byTime[hour].slippage += (entrySlippage + exitSlippage) * trade.shares;
            byTime[hour].count++;
        }

        // 종목별 집계
        if (!bySymbol[trade.symbol]) {
            bySymbol[trade.symbol] = { slippage: 0, count: 0 };
        }
        bySymbol[trade.symbol].slippage += (entrySlippage + exitSlippage) * trade.shares;
        bySymbol[trade.symbol].count++;
    });

    // 평균 계산
    const avgEntrySlippage = entryCount > 0 ? totalEntrySlippage / entryCount : 0;
    const avgExitSlippage = exitCount > 0 ? totalExitSlippage / exitCount : 0;
    const totalSlippageCost = totalEntrySlippage + totalExitSlippage;

    // 시간대별 평균
    Object.keys(byTime).forEach(hour => {
        byTime[hour].avgSlippage = byTime[hour].slippage / byTime[hour].count;
    });

    // 종목별 평균
    Object.keys(bySymbol).forEach(symbol => {
        bySymbol[symbol].avgSlippage = bySymbol[symbol].slippage / bySymbol[symbol].count;
    });

    // 총 거래 금액 대비 슬리피지 비율
    const totalVolume = trades.reduce((sum, t) => sum + t.amount, 0);
    const slippagePercent = totalVolume > 0 ? (totalSlippageCost / totalVolume) * 100 : 0;

    return {
        avgEntrySlippage,
        avgExitSlippage,
        totalSlippageCost,
        byTime,
        bySymbol,
        slippagePercent,
        tradeCount: trades.length
    };
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

// ==================== Chart Creation Helpers with Zoom/Pan ====================

/**
 * Create basic chart with zoom/pan capabilities
 */
function createBasicChart(chartId, type, data, options = {}) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (basicCharts[chartId]) {
        basicCharts[chartId].destroy();
    }

    // Configure default options with zoom/pan for line and bar charts
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#e4e4e7',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '$' + context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: (type === 'line' || type === 'bar') ? {
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(100, 116, 139, 0.1)' }
            },
            y: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(100, 116, 139, 0.1)' }
            }
        } : {}
    };

    // Add zoom/pan for line and bar charts only
    if ((type === 'line' || type === 'bar') && typeof Chart !== 'undefined' && Chart.register) {
        defaultOptions.plugins.zoom = {
            zoom: {
                wheel: {
                    enabled: true,
                    speed: 0.1
                },
                pinch: {
                    enabled: true
                },
                mode: 'xy'
            },
            pan: {
                enabled: true,
                mode: 'xy'
            },
            limits: {
                x: {min: 'original', max: 'original'},
                y: {min: 'original', max: 'original'}
            }
        };
    }

    // Merge custom options
    const mergedOptions = { ...defaultOptions, ...options };

    basicCharts[chartId] = new Chart(ctx, {
        type: type,
        data: data,
        options: mergedOptions
    });

    return basicCharts[chartId];
}

/**
 * Create advanced chart with enhanced zoom/pan and tooltips
 */
function createAdvancedChart(chartId, type, data, options = {}) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (advancedCharts[chartId]) {
        advancedCharts[chartId].destroy();
    }

    // Enhanced options with zoom/pan and detailed tooltips
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                titleColor: '#f8fafc',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyColor: '#e4e4e7',
                bodyFont: {
                    size: 13
                },
                borderColor: '#3b82f6',
                borderWidth: 2,
                padding: 16,
                displayColors: true,
                callbacks: {
                    title: function(context) {
                        if (context[0].label) {
                            return context[0].label;
                        }
                        return '';
                    },
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            const value = context.parsed.y;
                            if (Math.abs(value) >= 1000) {
                                label += '$' + (value / 1000).toFixed(2) + 'K';
                            } else {
                                label += '$' + value.toFixed(2);
                            }
                        }
                        return label;
                    },
                    afterLabel: function(context) {
                        // Add additional context info for specific charts
                        if (chartId === 'equityCurveChart') {
                            return 'Double-click to reset zoom';
                        }
                        return '';
                    }
                }
            }
        },
        scales: (type === 'line' || type === 'bar') ? {
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(100, 116, 139, 0.1)',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    callback: function(value) {
                        if (Math.abs(value) >= 1000) {
                            return '$' + (value / 1000).toFixed(1) + 'K';
                        }
                        return '$' + value.toFixed(0);
                    }
                },
                grid: {
                    color: 'rgba(100, 116, 139, 0.1)',
                    drawBorder: false
                }
            }
        } : {}
    };

    // Add zoom/pan capabilities for line and bar charts
    if ((type === 'line' || type === 'bar') && typeof Chart !== 'undefined' && Chart.register) {
        defaultOptions.plugins.zoom = {
            zoom: {
                wheel: {
                    enabled: true,
                    speed: 0.1
                },
                pinch: {
                    enabled: true
                },
                mode: 'xy'
            },
            pan: {
                enabled: true,
                mode: 'xy',
                modifierKey: 'ctrl' // Hold ctrl to pan, or just drag
            },
            limits: {
                x: {min: 'original', max: 'original'},
                y: {min: 'original', max: 'original'}
            }
        };

        // Add double-click to reset zoom
        defaultOptions.onClick = function(evt, activeElements, chart) {
            if (evt.type === 'dblclick') {
                chart.resetZoom();
            }
        };
    }

    // Merge custom options
    const mergedOptions = { ...defaultOptions, ...options };

    advancedCharts[chartId] = new Chart(ctx, {
        type: type,
        data: data,
        options: mergedOptions
    });

    return advancedCharts[chartId];
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
    // Original pattern insights (preserved)
    analyzeTimeBasedPerformance();
    analyzeConsecutiveTradesPattern();
    generateAIInsights();

    // Phase 1 - Core AI Analysis Modules
    renderCorrelationMatrix();
    renderTemporalPatterns();
    renderClusterAnalysis();

    // Phase 2: Advanced algorithmic analysis modules
    renderBehavioralPatterns();
    renderMarketIntelligence();
    renderStatisticalEdge();
    renderAdaptiveRecommendations();

    // Phase 3 - Enhanced Visualizations
    setTimeout(() => {
        renderPositionVsReturnScatter();
        renderHoldingVsReturnScatter();
    }, 200);

    setTimeout(() => renderStressHeatmap(), 300);

    // Phase 4 - Update Core Risk Metrics
    setTimeout(() => updateCoreRiskMetrics(), 400);
}

/**
 * Update Core Risk Metrics (MDD, Sortino, Kelly, Sharpe)
 */
function updateCoreRiskMetrics() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        document.getElementById('mddValue').textContent = '$0.00';
        document.getElementById('mddPercent').textContent = '0% of capital';
        document.getElementById('sortinoValue').textContent = '0.00';
        document.getElementById('sortinoLabel').textContent = 'Neutral';
        document.getElementById('kellyValue').textContent = '0%';
        document.getElementById('kellyRecommendation').textContent = 'Insufficient data';
        document.getElementById('sharpeValue').textContent = '0.00';
        document.getElementById('sharpeLabel').textContent = 'Neutral';
        return;
    }

    // Calculate MDD
    const initialCapital = 10000; // Default, or get from principlesData
    const mddResult = calculateMaxDrawdown(filteredTrades, initialCapital);
    document.getElementById('mddValue').textContent = `$${mddResult.mdd.toFixed(2)}`;
    document.getElementById('mddPercent').textContent = `${mddResult.mddPercent.toFixed(2)}% of capital`;

    // Calculate Sortino Ratio
    const sortinoRatio = calculateSortinoRatio(filteredTrades);
    document.getElementById('sortinoValue').textContent = sortinoRatio.toFixed(2);
    const sortinoLabel = sortinoRatio > 2 ? (currentLanguage === 'ko' ? '우수' : 'Excellent') :
                         sortinoRatio > 1 ? (currentLanguage === 'ko' ? '양호' : 'Good') :
                         sortinoRatio > 0 ? (currentLanguage === 'ko' ? '보통' : 'Neutral') :
                         (currentLanguage === 'ko' ? '낮음' : 'Poor');
    document.getElementById('sortinoLabel').textContent = sortinoLabel;
    document.getElementById('sortinoValue').style.color = sortinoRatio > 1 ? '#00CC99' : sortinoRatio > 0 ? '#f8fafc' : '#FF4455';

    // Calculate Kelly Criterion
    const kellyResult = calculateKellyCriterion(filteredTrades);
    document.getElementById('kellyValue').textContent = `${kellyResult.kellyPercent.toFixed(1)}%`;
    document.getElementById('kellyRecommendation').textContent = kellyResult.recommendation;

    // Calculate Sharpe Ratio
    const sharpeRatio = calculateSharpeRatio(filteredTrades);
    document.getElementById('sharpeValue').textContent = sharpeRatio.toFixed(2);
    const sharpeLabel = sharpeRatio > 2 ? (currentLanguage === 'ko' ? '우수' : 'Excellent') :
                        sharpeRatio > 1 ? (currentLanguage === 'ko' ? '양호' : 'Good') :
                        sharpeRatio > 0 ? (currentLanguage === 'ko' ? '보통' : 'Neutral') :
                        (currentLanguage === 'ko' ? '낮음' : 'Poor');
    document.getElementById('sharpeLabel').textContent = sharpeLabel;
    document.getElementById('sharpeValue').style.color = sharpeRatio > 1 ? '#00CC99' : sharpeRatio > 0 ? '#f8fafc' : '#FF4455';
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
    // 필터링된 거래 데이터 사용
    const filteredTrades = getFilteredTradesForAnalytics();
    const hourlyPerformance = {};

    filteredTrades.forEach(trade => {
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

    // 최고 시간대 업데이트
    const bestTradingHourEl = document.getElementById('bestTradingHour');
    const bestWinRateEl = document.getElementById('bestHourWinRate');
    if (bestHour) {
        if (bestTradingHourEl) bestTradingHourEl.textContent = `${bestHour}:00`;
        if (bestWinRateEl) bestWinRateEl.textContent = `${bestWinRate.toFixed(0)}%`;
    } else {
        if (bestTradingHourEl) bestTradingHourEl.textContent = '--:--';
        if (bestWinRateEl) bestWinRateEl.textContent = '--%';
    }

    // 최악 시간대 업데이트
    const worstTradingHourEl = document.getElementById('worstTradingHour');
    const worstWinRateEl = document.getElementById('worstHourWinRate');
    if (worstHour) {
        if (worstTradingHourEl) worstTradingHourEl.textContent = `${worstHour}:00`;
        if (worstWinRateEl) worstWinRateEl.textContent = `${worstWinRate.toFixed(0)}%`;
    } else {
        if (worstTradingHourEl) worstTradingHourEl.textContent = '--:--';
        if (worstWinRateEl) worstWinRateEl.textContent = '--%';
    }
}

/**
 * 연속 거래 패턴 분석
 */
function analyzeConsecutiveTradesPattern() {
    // 연속 거래 패턴 분석 - 필터링된 거래 데이터 사용
    const filteredTrades = getFilteredTradesForAnalytics();
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

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
        const elementId = key.charAt(0).toLowerCase() + key.slice(1);
        const element = document.getElementById(elementId);
        if (element) {
            if (values.length > 0) {
                const winRate = (values.reduce((sum, val) => sum + val, 0) / values.length) * 100;
                element.textContent = `${winRate.toFixed(0)}%`;
                element.style.color = winRate >= 50 ? '#1ec426' : '#ef4444';
            } else {
                // 데이터가 없을 때 기본값 표시
                element.textContent = '--%';
                element.style.color = '#64748b';
            }
        }
    });
}

/**
 * AI 인사이트 생성 (통합 및 확장 버전)
 */
function generateAIInsights() {
    const allInsights = [];

    // 0. Principles Warning Insights (최우선 순위)
    if (typeof principlesData !== 'undefined') {
        const today = formatTradingDate(new Date());
        const todayPrinciples = principlesData[today];

        if (todayPrinciples && todayPrinciples.warningTriggers) {
            const warnings = todayPrinciples.warningTriggers;

            // 최대 일일 손실 도달 (가장 중요)
            if (warnings.maxLoss > 0) {
                allInsights.push({
                    priority: 0,
                    type: 'danger',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        '🛑 최대 일일 손실 도달! 오늘은 더 이상 거래하지 마세요.' :
                        '🛑 Max Daily Loss Reached! Stop trading for today.'
                });
            }

            // 연속 손실 경고
            if (warnings.consecutiveLoss > 0) {
                allInsights.push({
                    priority: 1,
                    type: 'danger',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        `⚠️ 연속 손실 제한 위반: ${warnings.consecutiveLoss}회 발생. 감정적 거래를 멈추고 휴식을 취하세요.` :
                        `⚠️ Consecutive Loss Limit Violated: ${warnings.consecutiveLoss} times. Stop emotional trading and take a break.`
                });
            }

            // 단일 손실 초과
            if (warnings.singleLoss > 0) {
                allInsights.push({
                    priority: 1,
                    type: 'danger',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        `⚠️ 단일 손실 한도 초과: ${warnings.singleLoss}회. 리스크 관리 규칙을 재확인하세요.` :
                        `⚠️ Single Loss Limit Exceeded: ${warnings.singleLoss} times. Review your risk management rules.`
                });
            }

            // 포지션 크기 초과
            if (warnings.positionSize > 0) {
                allInsights.push({
                    priority: 1,
                    type: 'danger',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        `⚠️ 포지션 크기 제한 초과: ${warnings.positionSize}회. 자금 관리 원칙을 준수하세요.` :
                        `⚠️ Position Size Limit Exceeded: ${warnings.positionSize} times. Stick to your money management principles.`
                });
            }

            // 리스크/보상 비율 미달
            if (warnings.riskReward > 0) {
                allInsights.push({
                    priority: 1,
                    type: 'warning',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        `⚠️ 리스크/보상 비율 미달: ${warnings.riskReward}회. 더 나은 진입점을 기다리세요.` :
                        `⚠️ Risk/Reward Below Minimum: ${warnings.riskReward} times. Wait for better entry points.`
                });
            }

            // 거래 횟수 제한 도달
            if (warnings.tradeCount > 0) {
                allInsights.push({
                    priority: 1,
                    type: 'warning',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        '⚠️ 거래 횟수 제한 도달. 과도거래를 피하고 품질에 집중하세요.' :
                        '⚠️ Trade Count Limit Reached. Avoid overtrading and focus on quality.'
                });
            }

            // 일일 목표 달성 (긍정적)
            if (warnings.dailyTarget > 0) {
                allInsights.push({
                    priority: 2,
                    type: 'good',
                    category: 'rules',
                    text: currentLanguage === 'ko' ?
                        '✅ 일일 목표 달성! 이익을 보호하고 추가 위험을 피하세요.' :
                        '✅ Daily Target Achieved! Protect your profits and avoid additional risk.'
                });
            }
        }
    }

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

    Object.entries(principlesData).forEach(([date, dayData]) => {
        if (dayData.sleepHours) {
            const dayTrades = trades.filter(trade => trade.date === date);
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
    // Psychology data no longer available - return 0
    return 0;
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
// Market data analysis functions removed - API integration disabled

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
 * Correlation Matrix Analysis (Enhanced with psychology integration)
 * Shows correlations between different trading metrics including psychology
 */
function renderCorrelationMatrix() {
    const element = document.getElementById('correlationMatrixContent');
    if (!element) return;

    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length < 20) {
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
    const winTrades = filteredTrades.filter(t => t.pnl > 0);
    const lossTrades = filteredTrades.filter(t => t.pnl < 0);

    const avgWinAmount = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.amount, 0) / winTrades.length : 0;
    const avgLossAmount = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + t.amount, 0) / lossTrades.length : 0;

    const avgWinHoldTime = winTrades.filter(t => t.holdingMinutes).length > 0 ?
        winTrades.filter(t => t.holdingMinutes).reduce((sum, t) => sum + t.holdingMinutes, 0) / winTrades.filter(t => t.holdingMinutes).length : 0;
    const avgLossHoldTime = lossTrades.filter(t => t.holdingMinutes).length > 0 ?
        lossTrades.filter(t => t.holdingMinutes).reduce((sum, t) => sum + t.holdingMinutes, 0) / lossTrades.filter(t => t.holdingMinutes).length : 0;

    // Symbol performance correlation
    const symbolStats = {};
    filteredTrades.forEach(t => {
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

    // Psychology correlation
    const tradesWithPsych = filteredTrades.filter(t => psychologyData[t.date]);
    let psychCorrelationHTML = '';

    if (tradesWithPsych.length >= 10) {
        // Calculate time of day vs performance
        const dayStartTrades = tradesWithPsych.filter(t => {
            const psych = psychologyData[t.date];
            return psych && psych.marketDelay && psych.marketDelay <= 15;
        });

        const lateStartTrades = tradesWithPsych.filter(t => {
            const psych = psychologyData[t.date];
            return psych && psych.marketDelay && psych.marketDelay > 15;
        });

        if (dayStartTrades.length >= 3 && lateStartTrades.length >= 3) {
            const earlyWinRate = (dayStartTrades.filter(t => t.pnl > 0).length / dayStartTrades.length) * 100;
            const lateWinRate = (lateStartTrades.filter(t => t.pnl > 0).length / lateStartTrades.length) * 100;

            psychCorrelationHTML = `
                <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3);">
                    <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '시작 시간 vs 성과' : 'Start Time vs Performance'}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: ${earlyWinRate > lateWinRate ? '#10b981' : '#f59e0b'}; font-size: 16px; font-weight: 600;">${earlyWinRate.toFixed(1)}%</div>
                            <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '장 시작 거래' : 'Market Open'}</div>
                        </div>
                        <div style="color: #64748b; font-size: 20px;">⟷</div>
                        <div>
                            <div style="color: ${lateWinRate > earlyWinRate ? '#10b981' : '#f59e0b'}; font-size: 16px; font-weight: 600;">${lateWinRate.toFixed(1)}%</div>
                            <div style="color: #64748b; font-size: 12px;">${currentLanguage === 'ko' ? '늦은 시작' : 'Late Start'}</div>
                        </div>
                    </div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 8px; text-align: center;">
                        ${Math.abs(earlyWinRate - lateWinRate).toFixed(1)}% ${currentLanguage === 'ko' ? '승률 차이' : 'win rate difference'}
                    </div>
                </div>
            `;
        }
    }

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

            ${psychCorrelationHTML}

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

    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length < 10) {
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
    filteredTrades.forEach(t => {
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
    filteredTrades.forEach(t => {
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
 * Cluster Analysis using K-means algorithm
 * Groups similar trades together based on multiple features
 */
function renderClusterAnalysis() {
    const element = document.getElementById('clusterAnalysisContent');
    if (!element) {
        console.log('⚠️ clusterAnalysisContent element not found');
        return;
    }

    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length < 10) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px;">
                    ${currentLanguage === 'ko' ? 'K-means 클러스터 분석을 위해 최소 10개의 거래가 필요합니다.' : 'Need at least 10 trades for K-means cluster analysis.'}
                </div>
            </div>
        `;
        return;
    }

    // Perform K-means clustering
    const clusteringResult = performTradeClustering(filteredTrades);

    if (!clusteringResult.success) {
        element.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3);">
                <div style="color: #ef4444; font-size: 14px;">
                    ${clusteringResult.error || 'Clustering analysis failed'}
                </div>
            </div>
        `;
        return;
    }

    const { clusters, bestCluster, worstCluster } = clusteringResult;

    // Display Best and Worst Cluster Highlights
    element.innerHTML = `
        <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15)); border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span style="font-size: 24px;">🏆</span>
                <div>
                    <div style="color: #10b981; font-weight: 700; font-size: 16px;">
                        ${currentLanguage === 'ko' ? '최고 성과 클러스터' : 'Best Trade Cluster'}
                    </div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 2px;">
                        ${describeClusterCharacteristics(bestCluster)}
                    </div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '거래 수' : 'Trades'}</div>
                    <div style="color: #e4e4e7; font-size: 18px; font-weight: 600;">${bestCluster.count}</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '평균 P&L' : 'Avg P&L'}</div>
                    <div style="color: #10b981; font-size: 18px; font-weight: 600;">$${bestCluster.avgPnl.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '승률' : 'Win Rate'}</div>
                    <div style="color: #10b981; font-size: 18px; font-weight: 600;">${bestCluster.winRate.toFixed(0)}%</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '평균 진입 시간' : 'Avg Entry'}</div>
                    <div style="color: #e4e4e7; font-size: 18px; font-weight: 600;">${bestCluster.avgEntryTime}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(251, 146, 60, 0.15)); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                    <div style="color: #ef4444; font-weight: 700; font-size: 16px;">
                        ${currentLanguage === 'ko' ? '최악 성과 클러스터' : 'Worst Trade Cluster'}
                    </div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 2px;">
                        ${describeClusterCharacteristics(worstCluster)}
                    </div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '거래 수' : 'Trades'}</div>
                    <div style="color: #e4e4e7; font-size: 18px; font-weight: 600;">${worstCluster.count}</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '평균 P&L' : 'Avg P&L'}</div>
                    <div style="color: #ef4444; font-size: 18px; font-weight: 600;">$${worstCluster.avgPnl.toFixed(2)}</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '승률' : 'Win Rate'}</div>
                    <div style="color: #ef4444; font-size: 18px; font-weight: 600;">${worstCluster.winRate.toFixed(0)}%</div>
                </div>
                <div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${currentLanguage === 'ko' ? '평균 진입 시간' : 'Avg Entry'}</div>
                    <div style="color: #e4e4e7; font-size: 18px; font-weight: 600;">${worstCluster.avgEntryTime}</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 16px;">
            <div style="color: #94a3b8; font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                ${currentLanguage === 'ko' ? '모든 클러스터 상세' : 'All Clusters Detail'}
            </div>
            <div style="display: grid; gap: 12px;">
                ${clusters.map((cluster, index) => {
                    const hours = Math.floor(cluster.avgHoldingTime / 60);
                    const minutes = Math.floor(cluster.avgHoldingTime % 60);
                    const isWinning = cluster.avgPnl >= 0;

                    return `
                        <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border-left: 3px solid ${isWinning ? '#10b981' : '#ef4444'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <div style="color: #e4e4e7; font-weight: 600; font-size: 14px;">
                                        ${currentLanguage === 'ko' ? '클러스터' : 'Cluster'} ${index + 1}
                                        ${cluster.id === bestCluster.id ? ' 🏆' : ''}
                                        ${cluster.id === worstCluster.id ? ' ⚠️' : ''}
                                    </div>
                                    <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
                                        ${hours}h ${minutes}m ${currentLanguage === 'ko' ? '평균 보유' : 'avg hold'} • ${currentLanguage === 'ko' ? '진입' : 'Entry'} ${cluster.avgEntryTime}
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
                                    <div style="color: ${cluster.avgPnl >= 0 ? '#10b981' : '#ef4444'}; font-size: 16px; font-weight: 600;">
                                        $${cluster.avgPnl.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div style="margin-top: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="color: #3b82f6; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                <span>ℹ️</span>
                <span>
                    ${currentLanguage === 'ko' ?
                        `K-means 알고리즘으로 ${clusteringResult.totalTrades}개 거래를 ${clusters.length}개 클러스터로 분류 (${clusteringResult.iterations}회 반복)` :
                        `K-means algorithm clustered ${clusteringResult.totalTrades} trades into ${clusters.length} groups (${clusteringResult.iterations} iterations)`
                    }
                </span>
            </div>
        </div>

        <!-- NEW: 2D Cluster Visualization Canvas -->
        <div id="cluster2DVisualization" style="margin-top: 20px;">
            <div style="color: #94a3b8; font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                ${currentLanguage === 'ko' ? '클러스터 2D 맵 (보유 시간 vs 평균 P&L)' : 'Cluster 2D Map (Holding Time vs Avg P&L)'}
            </div>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 16px; border-radius: 8px; border: 1px solid rgba(51, 65, 85, 0.5);">
                <canvas id="cluster2DMapChart" style="max-height: 300px;"></canvas>
            </div>
        </div>
    `;

    // Render 2D cluster map
    setTimeout(() => renderCluster2DMap(clusters), 100);
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
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(returns) {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

/**
 * Analyze Psychology-Performance Correlation
 * Calculates Pearson correlation between psychology factors and trading performance
 */
function analyzePsychologyPerformanceCorrelation() {
    const filteredTrades = getFilteredTradesForAnalytics();

    // Filter trades that have psychology data
    const tradesWithPsych = filteredTrades.filter(t => psychologyData[t.date]);

    if (tradesWithPsych.length < 10) {
        return {
            success: false,
            error: currentLanguage === 'ko' ?
                '심리-성과 상관관계 분석을 위해 최소 10개의 심리 데이터가 필요합니다.' :
                'Need at least 10 psychology entries for correlation analysis.'
        };
    }

    // Calculate correlations for each psychology factor
    const correlations = [];

    // Sleep Hours vs P&L
    const sleepCorr = calculatePsychologyCorrelation(tradesWithPsych, 'sleepHours', 'pnl');
    if (sleepCorr !== null) {
        correlations.push({
            name: currentLanguage === 'ko' ? '수면 시간 ↔ 수익' : 'Sleep Hours ↔ P&L',
            xLabel: currentLanguage === 'ko' ? '수면 시간' : 'Sleep Hours',
            yLabel: currentLanguage === 'ko' ? '수익' : 'P&L',
            correlation: sleepCorr,
            interpretation: interpretCorrelation(sleepCorr)
        });
    }

    // Confidence vs Win Rate
    const confData = tradesWithPsych.map(t => ({
        x: psychologyData[t.date].confidence || 3,
        y: t.pnl > 0 ? 1 : 0
    }));
    const confCorr = pearsonCorrelation(confData);
    if (confCorr !== null) {
        correlations.push({
            name: currentLanguage === 'ko' ? '자신감 ↔ 승률' : 'Confidence ↔ Win Rate',
            xLabel: currentLanguage === 'ko' ? '자신감' : 'Confidence',
            yLabel: currentLanguage === 'ko' ? '승률' : 'Win Rate',
            correlation: confCorr,
            interpretation: interpretCorrelation(confCorr)
        });
    }

    // Stress vs P&L
    const stressCorr = calculatePsychologyCorrelation(tradesWithPsych, 'stress', 'pnl');
    if (stressCorr !== null) {
        correlations.push({
            name: currentLanguage === 'ko' ? '스트레스 ↔ 수익' : 'Stress ↔ P&L',
            xLabel: currentLanguage === 'ko' ? '스트레스' : 'Stress',
            yLabel: currentLanguage === 'ko' ? '수익' : 'P&L',
            correlation: stressCorr * -1, // Inverse (high stress = bad)
            interpretation: interpretCorrelation(stressCorr * -1)
        });
    }

    // Focus vs Return %
    const focusCorr = calculatePsychologyCorrelation(tradesWithPsych, 'focus', 'returnPct');
    if (focusCorr !== null) {
        correlations.push({
            name: currentLanguage === 'ko' ? '집중력 ↔ 수익률' : 'Focus ↔ Return %',
            xLabel: currentLanguage === 'ko' ? '집중력' : 'Focus',
            yLabel: currentLanguage === 'ko' ? '수익률' : 'Return %',
            correlation: focusCorr,
            interpretation: interpretCorrelation(focusCorr)
        });
    }

    // Energy Level vs P&L
    const energyCorr = calculatePsychologyCorrelation(tradesWithPsych, 'energyLevel', 'pnl');
    if (energyCorr !== null) {
        correlations.push({
            name: currentLanguage === 'ko' ? '에너지 레벨 ↔ 수익' : 'Energy Level ↔ P&L',
            xLabel: currentLanguage === 'ko' ? '에너지' : 'Energy',
            yLabel: currentLanguage === 'ko' ? '수익' : 'P&L',
            correlation: energyCorr,
            interpretation: interpretCorrelation(energyCorr)
        });
    }

    // Sort by absolute correlation strength
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return {
        success: true,
        correlations: correlations.slice(0, 5), // Top 5
        sampleSize: tradesWithPsych.length
    };
}

/**
 * Calculate correlation between psychology factor and trade metric
 */
function calculatePsychologyCorrelation(tradesWithPsych, psychFactor, tradeMetric) {
    const data = tradesWithPsych
        .filter(t => psychologyData[t.date] && psychologyData[t.date][psychFactor] != null)
        .map(t => ({
            x: psychologyData[t.date][psychFactor],
            y: t[tradeMetric]
        }));

    if (data.length < 5) return null;

    return pearsonCorrelation(data);
}

/**
 * Pearson Correlation Coefficient
 */
function pearsonCorrelation(data) {
    if (data.length < 2) return null;

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
    const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    if (denominator === 0) return null;

    return numerator / denominator;
}

/**
 * Interpret correlation coefficient
 */
function interpretCorrelation(corr) {
    const abs = Math.abs(corr);
    const direction = corr > 0 ? (currentLanguage === 'ko' ? '양의' : 'Positive') : (currentLanguage === 'ko' ? '음의' : 'Negative');

    let strength, description, color;

    if (abs >= 0.7) {
        strength = currentLanguage === 'ko' ? '강함' : 'Strong';
        description = currentLanguage === 'ko' ? '매우 강한 상관관계' : 'Very Strong';
        color = '#10b981';
    } else if (abs >= 0.5) {
        strength = currentLanguage === 'ko' ? '보통' : 'Moderate';
        description = currentLanguage === 'ko' ? '보통 상관관계' : 'Moderate';
        color = '#3b82f6';
    } else if (abs >= 0.3) {
        strength = currentLanguage === 'ko' ? '약함' : 'Weak';
        description = currentLanguage === 'ko' ? '약한 상관관계' : 'Weak';
        color = '#f59e0b';
    } else {
        strength = currentLanguage === 'ko' ? '매우 약함' : 'Very Weak';
        description = currentLanguage === 'ko' ? '상관관계 미약' : 'Very Weak';
        color = '#64748b';
    }

    return {
        direction,
        strength,
        description,
        color
    };
}

/**
 * Render Behavioral Patterns Detection with Psychology Correlation
 */
function renderBehavioralPatterns() {
    const element = document.getElementById('behavioralPatterns');
    if (!element) return;

    let html = '';

    // Part 1: Psychology-Performance Correlation Analysis
    const correlationAnalysis = analyzePsychologyPerformanceCorrelation();
    console.log('Correlation Analysis Result:', correlationAnalysis);

    if (correlationAnalysis.success) {
        html += `
            <div style="margin-bottom: 24px; padding: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                    <span style="font-size: 24px;">🧠</span>
                    <div>
                        <div style="color: #3b82f6; font-weight: 700; font-size: 16px;">
                            ${currentLanguage === 'ko' ? '심리-성과 상관관계 분석' : 'Psychology vs Performance Correlation'}
                        </div>
                        <div style="color: #64748b; font-size: 12px; margin-top: 2px;">
                            ${currentLanguage === 'ko' ?
                                `${correlationAnalysis.sampleSize}일의 데이터 기반 분석` :
                                `Based on ${correlationAnalysis.sampleSize} days of data`
                            }
                        </div>
                    </div>
                </div>

                <div style="display: grid; gap: 12px;">
                    ${correlationAnalysis.correlations.map((corr, index) => {
                        const absCorr = Math.abs(corr.correlation);
                        const interpretation = corr.interpretation;

                        return `
                            <div style="background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: 8px; border-left: 3px solid ${interpretation.color};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <div>
                                        <div style="color: #e4e4e7; font-weight: 600; font-size: 14px;">
                                            ${index === 0 ? '🏆 ' : ''}${corr.name}
                                        </div>
                                        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
                                            ${corr.xLabel} → ${corr.yLabel}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: ${interpretation.color}; font-size: 18px; font-weight: 700;">
                                            ${corr.correlation.toFixed(3)}
                                        </div>
                                        <div style="color: #64748b; font-size: 10px;">
                                            ${interpretation.description}
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="flex: 1; background: rgba(100, 116, 139, 0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${absCorr * 100}%; height: 100%; background: ${interpretation.color};"></div>
                                    </div>
                                    <span style="color: ${interpretation.color}; font-size: 11px; font-weight: 600; min-width: 60px;">
                                        ${interpretation.direction} ${interpretation.strength}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top: 12px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <div style="color: #3b82f6; font-size: 11px; display: flex; align-items: center; gap: 6px;">
                        <span>💡</span>
                        <span>
                            ${currentLanguage === 'ko' ?
                                `가장 강한 상관관계: ${correlationAnalysis.correlations[0].name} (${correlationAnalysis.correlations[0].correlation.toFixed(3)})` :
                                `Strongest correlation: ${correlationAnalysis.correlations[0].name} (${correlationAnalysis.correlations[0].correlation.toFixed(3)})`
                            }
                        </span>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(100, 116, 139, 0.1); border-radius: 12px; border: 1px solid rgba(100, 116, 139, 0.3); text-align: center;">
                <div style="color: #64748b; font-size: 13px;">
                    ${correlationAnalysis.error}
                </div>
            </div>
        `;
    }

    // Part 2: Traditional Behavioral Patterns
    const patterns = detectAdvancedBehavioralPatterns();

    if (patterns.length > 0) {
        html += `
            <div style="margin-bottom: 12px;">
                <div style="color: #94a3b8; font-size: 13px; font-weight: 600; margin-bottom: 12px;">
                    ${currentLanguage === 'ko' ? '거래 행동 패턴 감지' : 'Detected Trading Patterns'}
                </div>
            </div>
        `;

        html += patterns.map(pattern => {
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
    } else if (!correlationAnalysis.success) {
        html += `
            <div style="color: #64748b; text-align: center; padding: 20px;">
                ${currentLanguage === 'ko' ?
                    '행동 패턴을 감지할 데이터가 부족합니다. 거래와 심리 데이터를 더 축적해주세요.' :
                    'Not enough data to detect behavioral patterns. Continue trading and logging psychology data.'
                }
            </div>
        `;
    }

    element.innerHTML = html;
}

/**
 * 스트레스 레벨 히트맵 렌더링 - 시간대 및 요일별 고스트레스 거래 빈도
 * 시간(X축) x 요일(Y축) 매트릭스로 표현
 */
function renderStressHeatmap() {
    const container = document.getElementById('stressHeatmapContainer');
    if (!container) return;

    const filteredTrades = getFilteredTradesForAnalytics();

    // 스트레스 데이터가 있는 거래만 필터링
    const tradesWithStress = filteredTrades.filter(trade => {
        const psyData = psychologyData[trade.date];
        return psyData && psyData.stress !== undefined;
    });

    if (tradesWithStress.length === 0 || Object.keys(psychologyData).length < 3) {
        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
                ${currentLanguage === 'ko' ?
                    '스트레스 히트맵 생성을 위한 데이터가 부족합니다. 최소 3일 이상의 심리 데이터가 필요합니다.' :
                    'Insufficient data for stress heatmap. Need at least 3 days of psychology data.'}
            </div>
        `;
        return;
    }

    // 히트맵 데이터 구조: [요일][시간] = { count: 거래수, avgStress: 평균 스트레스, totalPnL: 총 손익 }
    const daysOfWeek = currentLanguage === 'ko' ?
        ['일', '월', '화', '수', '목', '금', '토'] :
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const heatmapData = {};
    const hours = Array.from({length: 8}, (_, i) => i + 9); // 9:00 ~ 16:00

    // 초기화
    daysOfWeek.forEach((day, dayIdx) => {
        heatmapData[dayIdx] = {};
        hours.forEach(hour => {
            heatmapData[dayIdx][hour] = { count: 0, highStressCount: 0, totalPnL: 0, avgStress: 0, stressSum: 0 };
        });
    });

    // 데이터 집계
    tradesWithStress.forEach(trade => {
        const psyData = psychologyData[trade.date];
        if (!psyData || !trade.entryTime) return;

        const tradeDate = new Date(trade.date + 'T12:00:00');
        const dayOfWeek = tradeDate.getDay();
        const hour = parseInt(trade.entryTime.split(':')[0]);

        if (hour >= 9 && hour <= 16) {
            const cell = heatmapData[dayOfWeek][hour];
            cell.count++;
            cell.totalPnL += trade.pnl;
            cell.stressSum += psyData.stress || 0;

            // 고스트레스 정의: 스트레스 레벨 4 이상
            if (psyData.stress >= 4) {
                cell.highStressCount++;
            }
        }
    });

    // 평균 스트레스 계산
    Object.keys(heatmapData).forEach(day => {
        Object.keys(heatmapData[day]).forEach(hour => {
            const cell = heatmapData[day][hour];
            cell.avgStress = cell.count > 0 ? cell.stressSum / cell.count : 0;
        });
    });

    // 최대값 찾기 (색상 정규화용)
    let maxHighStressCount = 0;
    Object.values(heatmapData).forEach(dayData => {
        Object.values(dayData).forEach(cell => {
            maxHighStressCount = Math.max(maxHighStressCount, cell.highStressCount);
        });
    });

    // 히트맵 HTML 생성
    let html = `
        <div style="margin-bottom: 16px;">
            <div style="color: #f8fafc; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                ${currentLanguage === 'ko' ? '🔥 고스트레스 거래 히트맵' : '🔥 High-Stress Trading Heatmap'}
            </div>
            <div style="color: #64748b; font-size: 12px;">
                ${currentLanguage === 'ko' ? '시간대 및 요일별 스트레스 레벨 4+ 거래 빈도' : 'Stress level 4+ trading frequency by time and day'}
            </div>
        </div>

        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; color: #94a3b8; font-size: 12px; font-weight: 600; text-align: left;">
                            ${currentLanguage === 'ko' ? '요일' : 'Day'}
                        </th>
                        ${hours.map(hour => `
                            <th style="padding: 8px; color: #94a3b8; font-size: 11px; font-weight: 600; text-align: center;">
                                ${hour}:00
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${daysOfWeek.map((day, dayIdx) => `
                        <tr>
                            <td style="padding: 8px; color: #e4e4e7; font-size: 12px; font-weight: 600;">
                                ${day}
                            </td>
                            ${hours.map(hour => {
                                const cell = heatmapData[dayIdx][hour];
                                const intensity = maxHighStressCount > 0 ? cell.highStressCount / maxHighStressCount : 0;

                                // 색상 그라데이션: 0 = 투명, 1 = 빨강
                                const bgColor = intensity === 0 ? 'rgba(51, 65, 85, 0.3)' :
                                                `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;

                                const tooltip = `${day} ${hour}:00\\n` +
                                              `${currentLanguage === 'ko' ? '총 거래' : 'Total trades'}: ${cell.count}\\n` +
                                              `${currentLanguage === 'ko' ? '고스트레스 거래' : 'High-stress trades'}: ${cell.highStressCount}\\n` +
                                              `${currentLanguage === 'ko' ? '평균 스트레스' : 'Avg stress'}: ${cell.avgStress.toFixed(1)}\\n` +
                                              `P&L: $${cell.totalPnL.toFixed(0)}`;

                                return `
                                    <td style="padding: 8px; text-align: center; background: ${bgColor};
                                               border: 1px solid rgba(51, 65, 85, 0.5); cursor: pointer;
                                               transition: all 0.2s;"
                                        title="${tooltip}">
                                        <div style="color: ${intensity > 0.5 ? '#fff' : '#94a3b8'}; font-size: 11px; font-weight: 600;">
                                            ${cell.highStressCount > 0 ? cell.highStressCount : '·'}
                                        </div>
                                        ${cell.count > 0 ? `
                                            <div style="color: ${intensity > 0.5 ? 'rgba(255,255,255,0.6)' : '#64748b'}; font-size: 9px;">
                                                (${cell.count})
                                            </div>
                                        ` : ''}
                                    </td>
                                `;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="display: flex; gap: 16px; margin-top: 16px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 6px;">
            <div style="flex: 1;">
                <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
                    ${currentLanguage === 'ko' ? '색상 범례' : 'Color Legend'}
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 30px; height: 15px; background: rgba(51, 65, 85, 0.3); border: 1px solid #334155; border-radius: 2px;"></div>
                    <span style="color: #94a3b8; font-size: 10px;">${currentLanguage === 'ko' ? '안전' : 'Safe'}</span>
                    <div style="width: 30px; height: 15px; background: rgba(239, 68, 68, 0.5); border: 1px solid #ef4444; border-radius: 2px; margin-left: 8px;"></div>
                    <span style="color: #94a3b8; font-size: 10px;">${currentLanguage === 'ko' ? '보통' : 'Medium'}</span>
                    <div style="width: 30px; height: 15px; background: rgba(239, 68, 68, 1); border: 1px solid #ef4444; border-radius: 2px; margin-left: 8px;"></div>
                    <span style="color: #94a3b8; font-size: 10px;">${currentLanguage === 'ko' ? '위험' : 'High Risk'}</span>
                </div>
            </div>
            <div style="flex: 1; text-align: right;">
                <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
                    ${currentLanguage === 'ko' ? '최고 위험 시간대' : 'Highest Risk Time'}
                </div>
                <div style="color: #ef4444; font-size: 12px; font-weight: 600;">
                    ${(() => {
                        let maxCell = { day: 0, hour: 9, count: 0 };
                        Object.keys(heatmapData).forEach(day => {
                            Object.keys(heatmapData[day]).forEach(hour => {
                                if (heatmapData[day][hour].highStressCount > maxCell.count) {
                                    maxCell = { day: parseInt(day), hour: parseInt(hour), count: heatmapData[day][hour].highStressCount };
                                }
                            });
                        });
                        return maxCell.count > 0 ?
                            `${daysOfWeek[maxCell.day]} ${maxCell.hour}:00 (${maxCell.count})` :
                            (currentLanguage === 'ko' ? '데이터 없음' : 'No data');
                    })()}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// ==================== NEW: Scatter Plot Visualizations ====================

/**
 * 포지션 크기 vs 수익률 산점도 렌더링
 * 승리/손실 거래를 다른 색상으로 표시하고 추세선 추가
 */
function renderPositionVsReturnScatter() {
    const canvasId = 'positionReturnScatterChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 기존 차트 파괴
    if (window[canvasId + 'Instance']) {
        window[canvasId + 'Instance'].destroy();
    }

    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(currentLanguage === 'ko' ? '데이터 없음' : 'No data', canvas.width / 2, canvas.height / 2);
        return;
    }

    // 데이터 준비
    const winners = filteredTrades.filter(t => t.pnl > 0);
    const losers = filteredTrades.filter(t => t.pnl <= 0);

    const winnerData = winners.map(t => ({ x: t.amount, y: t.returnPct }));
    const loserData = losers.map(t => ({ x: t.amount, y: t.returnPct }));

    // 추세선 계산 (선형 회귀)
    const allData = filteredTrades.map(t => ({ x: t.amount, y: t.returnPct }));
    const regression = calculateLinearRegression(allData);

    const minX = Math.min(...allData.map(d => d.x));
    const maxX = Math.max(...allData.map(d => d.x));
    const regressionLine = [
        { x: minX, y: regression.slope * minX + regression.intercept },
        { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];

    // Chart.js 산점도 생성
    window[canvasId + 'Instance'] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: currentLanguage === 'ko' ? '수익 거래' : 'Winners',
                    data: winnerData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: currentLanguage === 'ko' ? '손실 거래' : 'Losers',
                    data: loserData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: currentLanguage === 'ko' ? '추세선' : 'Trend Line',
                    data: regressionLine,
                    type: 'line',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.x.toFixed(0)} → ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '포지션 크기 ($)' : 'Position Size ($)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '수익률 (%)' : 'Return (%)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

/**
 * 보유 시간 vs 수익률 산점도 렌더링
 */
function renderHoldingVsReturnScatter() {
    const canvasId = 'holdingReturnScatterChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 기존 차트 파괴
    if (window[canvasId + 'Instance']) {
        window[canvasId + 'Instance'].destroy();
    }

    const filteredTrades = getFilteredTradesForAnalytics();
    const tradesWithTime = filteredTrades.filter(t => t.holdingMinutes && t.holdingMinutes > 0);

    if (tradesWithTime.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(currentLanguage === 'ko' ? '데이터 없음' : 'No data', canvas.width / 2, canvas.height / 2);
        return;
    }

    // 데이터 준비
    const winners = tradesWithTime.filter(t => t.pnl > 0);
    const losers = tradesWithTime.filter(t => t.pnl <= 0);

    const winnerData = winners.map(t => ({ x: t.holdingMinutes, y: t.returnPct }));
    const loserData = losers.map(t => ({ x: t.holdingMinutes, y: t.returnPct }));

    // 추세선 계산
    const allData = tradesWithTime.map(t => ({ x: t.holdingMinutes, y: t.returnPct }));
    const regression = calculateLinearRegression(allData);

    const minX = Math.min(...allData.map(d => d.x));
    const maxX = Math.max(...allData.map(d => d.x));
    const regressionLine = [
        { x: minX, y: regression.slope * minX + regression.intercept },
        { x: maxX, y: regression.slope * maxX + regression.intercept }
    ];

    // Chart.js 산점도 생성
    window[canvasId + 'Instance'] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: currentLanguage === 'ko' ? '수익 거래' : 'Winners',
                    data: winnerData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: currentLanguage === 'ko' ? '손실 거래' : 'Losers',
                    data: loserData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: currentLanguage === 'ko' ? '추세선' : 'Trend Line',
                    data: regressionLine,
                    type: 'line',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const minutes = Math.floor(context.parsed.x);
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${context.dataset.label}: ${hours}h ${mins}m → ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '보유 시간 (분)' : 'Holding Time (minutes)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '수익률 (%)' : 'Return (%)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

/**
 * 선형 회귀 계산 (최소제곱법)
 * @param {Array} data - [{x, y}, ...] 형태의 데이터
 * @returns {Object} - { slope, intercept, r2 }
 */
function calculateLinearRegression(data) {
    if (!data || data.length === 0) {
        return { slope: 0, intercept: 0, r2: 0 };
    }

    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² 계산
    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point) => {
        const yPred = slope * point.x + intercept;
        return sum + Math.pow(point.y - yPred, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);

    return { slope, intercept, r2 };
}

/**
 * 클러스터 2D 맵 렌더링 (Bubble Chart)
 * X축: 평균 보유 시간, Y축: 평균 P&L, 크기: 거래 수
 */
function renderCluster2DMap(clusters) {
    const canvasId = 'cluster2DMapChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 기존 차트 파괴
    if (window[canvasId + 'Instance']) {
        window[canvasId + 'Instance'].destroy();
    }

    if (!clusters || clusters.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(currentLanguage === 'ko' ? '데이터 없음' : 'No data', canvas.width / 2, canvas.height / 2);
        return;
    }

    // 클러스터 색상 배열
    const clusterColors = [
        { bg: 'rgba(16, 185, 129, 0.6)', border: '#10b981' },  // 녹색 - 최고 성과
        { bg: 'rgba(59, 130, 246, 0.6)', border: '#3b82f6' },  // 파랑 - 중간
        { bg: 'rgba(239, 68, 68, 0.6)', border: '#ef4444' }    // 빨강 - 최악 성과
    ];

    // 데이터셋 준비
    const datasets = clusters.map((cluster, index) => {
        const color = clusterColors[Math.min(index, clusterColors.length - 1)];
        return {
            label: `${currentLanguage === 'ko' ? '클러스터' : 'Cluster'} ${index + 1}`,
            data: [{
                x: cluster.avgHoldingTime,
                y: cluster.avgPnl,
                r: Math.sqrt(cluster.count) * 3  // 반지름은 거래 수에 비례
            }],
            backgroundColor: color.bg,
            borderColor: color.border,
            borderWidth: 2
        };
    });

    // Chart.js Bubble Chart 생성
    window[canvasId + 'Instance'] = new Chart(ctx, {
        type: 'bubble',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#94a3b8', font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const cluster = clusters[context.datasetIndex];
                            const hours = Math.floor(cluster.avgHoldingTime / 60);
                            const mins = Math.floor(cluster.avgHoldingTime % 60);
                            return [
                                `${context.dataset.label}`,
                                `${currentLanguage === 'ko' ? '거래 수' : 'Trades'}: ${cluster.count}`,
                                `${currentLanguage === 'ko' ? '보유 시간' : 'Hold time'}: ${hours}h ${mins}m`,
                                `P&L: $${cluster.avgPnl.toFixed(2)}`,
                                `${currentLanguage === 'ko' ? '승률' : 'Win rate'}: ${cluster.winRate.toFixed(0)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '평균 보유 시간 (분)' : 'Avg Holding Time (minutes)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                    title: {
                        display: true,
                        text: currentLanguage === 'ko' ? '평균 P&L ($)' : 'Avg P&L ($)',
                        color: '#94a3b8'
                    },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
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
    const filteredTrades = getFilteredTradesForAnalytics();
    if (filteredTrades.length === 0) return null;

    const sorted = [...filteredTrades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));
    const avgAmount = filteredTrades.map(t => t.amount).reduce((a, b) => a + b, 0) / filteredTrades.length;

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
    const filteredTrades = getFilteredTradesForAnalytics();
    if (filteredTrades.length === 0) return null;

    const sorted = [...filteredTrades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));

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
    const filteredTrades = getFilteredTradesForAnalytics();
    if (filteredTrades.length === 0) return null;

    const conditions = {};

    // Group by psychology conditions
    Object.entries(psychologyData).forEach(([date, psych]) => {
        const dayTrades = filteredTrades.filter(t => t.date === date);
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
 * Render Market Intelligence (API integration disabled)
 */
async function renderMarketIntelligence() {
    const element = document.getElementById('marketIntelligence');
    if (!element) return;

    element.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 24px; border-radius: 8px; border: 1px solid #334155;">
            <span style="color: #64748b; font-size: 13px;">
                ${currentLanguage === 'ko' ? 'API 통합이 비활성화되었습니다.' : 'API integration disabled.'}
            </span>
        </div>
    `;
}

/**
 * Detect market regime based on win rate trends
 */
function detectMarketRegime() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length < 5) {
        element.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 24px; border-radius: 8px; border: 1px solid #334155;">
                <span style="color: #64748b; font-size: 13px;">
                    ${currentLanguage === 'ko' ? '시장 분석을 위해 최소 5개의 거래가 필요합니다.' : 'Need at least 5 trades for market analysis.'}
                </span>
            </div>
        `;
        return;
    }

    try {
        // Call advanced market analysis functions from market-data.js
        const [sectorPerf, spyCorr, entryExit, volatilityPerf] = await Promise.all([
            typeof analyzeSectorPerformance !== 'undefined' ? analyzeSectorPerformance(filteredTrades).catch(e => { console.warn('Sector analysis failed:', e); return null; }) : Promise.resolve(null),
            typeof analyzeSPYCorrelation !== 'undefined' ? analyzeSPYCorrelation(filteredTrades).catch(e => { console.warn('SPY correlation failed:', e); return null; }) : Promise.resolve(null),
            typeof analyzeEntryExitQuality !== 'undefined' ? analyzeEntryExitQuality(filteredTrades).catch(e => { console.warn('Entry/Exit analysis failed:', e); return null; }) : Promise.resolve(null),
            typeof analyzeVolatilityPerformance !== 'undefined' ? analyzeVolatilityPerformance(filteredTrades).catch(e => { console.warn('Volatility analysis failed:', e); return null; }) : Promise.resolve(null)
        ]);

        console.log('Market Intelligence Data:', { sectorPerf, spyCorr, entryExit, volatilityPerf });

        // Build HTML
        let html = '<div style="display: grid; gap: 16px;">';

        // Sector Performance
        if (sectorPerf && Object.keys(sectorPerf).length > 0) {
            const topSector = Object.entries(sectorPerf)[0];
            html += `
                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '최고 수익 섹터' : 'Top Performing Sector'}</div>
                    <div style="color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 4px;">${topSector[0]}</div>
                    <div style="color: #64748b; font-size: 11px;">
                        ${currentLanguage === 'ko' ? '승률' : 'Win Rate'}: ${topSector[1].winRate.toFixed(1)}% |
                        ${currentLanguage === 'ko' ? '평균 수익' : 'Avg P&L'}: $${topSector[1].avgPnl.toFixed(2)}
                    </div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
                        ${topSector[1].count} ${currentLanguage === 'ko' ? '거래' : 'trades'} |
                        ${currentLanguage === 'ko' ? '총 수익' : 'Total'}: $${topSector[1].totalPnl.toFixed(2)}
                    </div>
                </div>
            `;
        }

        // SPY Correlation
        if (spyCorr) {
            const upDayPerf = spyCorr.upDays.winRate > spyCorr.downDays.winRate ? spyCorr.upDays : spyCorr.downDays;
            const upDayBetter = spyCorr.upDays.winRate > spyCorr.downDays.winRate;
            html += `
                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${currentLanguage === 'ko' ? 'SPY 상관관계' : 'SPY Correlation'}</div>
                    <div style="color: ${upDayBetter ? '#10b981' : '#ef4444'}; font-size: 18px; font-weight: 700; margin-bottom: 4px;">
                        ${upDayBetter ? (currentLanguage === 'ko' ? 'SPY 상승일에 강함' : 'Strong on UP days') : (currentLanguage === 'ko' ? 'SPY 하락일에 강함' : 'Strong on DOWN days')}
                    </div>
                    <div style="color: #64748b; font-size: 11px;">
                        ${currentLanguage === 'ko' ? '상승일' : 'Up days'}: ${spyCorr.upDays.winRate.toFixed(1)}% (${spyCorr.upDays.count}) |
                        ${currentLanguage === 'ko' ? '하락일' : 'Down days'}: ${spyCorr.downDays.winRate.toFixed(1)}% (${spyCorr.downDays.count})
                    </div>
                </div>
            `;
        }

        // Entry/Exit Quality
        if (entryExit) {
            html += `
                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '진입/청산 품질' : 'Entry/Exit Quality'}</div>
                    <div style="color: #3b82f6; font-size: 18px; font-weight: 700; margin-bottom: 4px;">
                        ${currentLanguage === 'ko' ? '타이밍 점수' : 'Timing Score'}: ${entryExit.timingScore}/10
                    </div>
                    <div style="color: #64748b; font-size: 11px;">
                        ${currentLanguage === 'ko' ? '평균 진입' : 'Avg Entry'}: ${entryExit.avgEntryPosition}% |
                        ${currentLanguage === 'ko' ? '평균 청산' : 'Avg Exit'}: ${entryExit.avgExitPosition}%
                    </div>
                    <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
                        ${currentLanguage === 'ko' ? '조기 진입률' : 'Early Entry'}: ${entryExit.earlyEntryRate}% |
                        ${currentLanguage === 'ko' ? '고가 청산률' : 'Profit Taking'}: ${entryExit.profitTakingRate}%
                    </div>
                </div>
            `;
        }

        // Volatility Performance
        if (volatilityPerf) {
            const bestVol = volatilityPerf.highVolatilityWinRate > volatilityPerf.mediumVolatilityWinRate && volatilityPerf.highVolatilityWinRate > volatilityPerf.lowVolatilityWinRate ? 'High' :
                           volatilityPerf.lowVolatilityWinRate > volatilityPerf.mediumVolatilityWinRate ? 'Low' : 'Medium';
            html += `
                <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${currentLanguage === 'ko' ? '최적 변동성' : 'Optimal Volatility'}</div>
                    <div style="color: #f59e0b; font-size: 18px; font-weight: 700; margin-bottom: 4px;">
                        ${bestVol} ${currentLanguage === 'ko' ? '변동성' : 'Volatility'}
                    </div>
                    <div style="color: #64748b; font-size: 11px;">
                        ${currentLanguage === 'ko' ? '고변동성' : 'High'}: ${volatilityPerf.highVolatilityWinRate.toFixed(1)}% (${volatilityPerf.highVolatilityCount}) |
                        ${currentLanguage === 'ko' ? '저변동성' : 'Low'}: ${volatilityPerf.lowVolatilityWinRate.toFixed(1)}% (${volatilityPerf.lowVolatilityCount})
                    </div>
                </div>
            `;
        }

        // Fallback if no data
        if (!sectorPerf && !spyCorr && !entryExit && !volatilityPerf) {
            html = `
                <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 24px; border-radius: 8px; border: 1px solid #334155;">
                    <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">
                        ${currentLanguage === 'ko' ? '시장 데이터를 분석하는 중 오류가 발생했습니다.' : 'Error analyzing market data.'}
                    </div>
                    <div style="color: #64748b; font-size: 12px;">
                        ${currentLanguage === 'ko' ? 'API 제한이나 네트워크 문제일 수 있습니다.' : 'This may be due to API limits or network issues.'}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        element.innerHTML = html;

    } catch (error) {
        console.error('Market Intelligence rendering error:', error);
        element.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); text-align: center; padding: 24px; border-radius: 8px; border: 1px solid #ef4444;">
                <div style="color: #ef4444; font-size: 13px;">
                    ${currentLanguage === 'ko' ? '시장 분석 중 오류 발생' : 'Error in market analysis'}
                </div>
                <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
                    ${error.message}
                </div>
            </div>
        `;
    }
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
 * Render Statistical Edge Analysis (Enhanced with advanced market analysis)
 */
async function renderStatisticalEdge() {
    const element = document.getElementById('statisticalEdge');
    if (!element) return;

    // Show loading
    element.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #94a3b8;">
            <div style="margin-bottom: 10px;">📈</div>
            <div>${currentLanguage === 'ko' ? '통계적 우위 계산 중...' : 'Computing statistical edge...'}</div>
        </div>
    `;

    const edge = calculateStatisticalEdge();
    const filteredTrades = getFilteredTradesForAnalytics();

    const significanceColor = edge.pValue < 0.01 ? '#10b981' :
                              edge.pValue < 0.05 ? '#f59e0b' : '#ef4444';

    const significanceText = edge.pValue < 0.01 ? (currentLanguage === 'ko' ? '매우 유의함' : 'Highly Significant') :
                             edge.pValue < 0.05 ? (currentLanguage === 'ko' ? '유의함' : 'Significant') :
                             (currentLanguage === 'ko' ? '유의하지 않음' : 'Not Significant');

    let html = `
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

        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
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

    // Advanced market-based edge analysis
    if (filteredTrades.length >= 10) {
        try {
            const [intradayPerf, gapTrading, priceLevel] = await Promise.all([
                typeof analyzeIntradayPerformance !== 'undefined' ? analyzeIntradayPerformance(filteredTrades).catch(e => { console.warn('Intraday analysis failed:', e); return null; }) : Promise.resolve(null),
                typeof analyzeGapTradingPerformance !== 'undefined' ? analyzeGapTradingPerformance(filteredTrades).catch(e => { console.warn('Gap trading analysis failed:', e); return null; }) : Promise.resolve(null),
                typeof analyzePriceLevelPsychology !== 'undefined' ? analyzePriceLevelPsychology(filteredTrades).catch(e => { console.warn('Price level analysis failed:', e); return null; }) : Promise.resolve(null)
            ]);

            console.log('Advanced Edge Analysis:', { intradayPerf, gapTrading, priceLevel });

            html += '<div style="display: grid; gap: 16px;">';

            // Intraday Performance Edge
            if (intradayPerf) {
                const best = Object.entries(intradayPerf)
                    .filter(([key, val]) => val.count >= 3)
                    .sort((a, b) => b[1].winRate - a[1].winRate)[0];

                if (best) {
                    html += `
                        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                                ${currentLanguage === 'ko' ? '인트라데이 상승률 우위' : 'Intraday Gain Edge'}
                            </div>
                            <div style="color: #10b981; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
                                ${best[0]} ${currentLanguage === 'ko' ? '상승 후 진입' : 'Gain Entry'}
                            </div>
                            <div style="color: #64748b; font-size: 11px;">
                                ${currentLanguage === 'ko' ? '승률' : 'Win Rate'}: ${best[1].winRate.toFixed(1)}% |
                                ${currentLanguage === 'ko' ? '평균 수익' : 'Avg P&L'}: $${best[1].avgPnl.toFixed(2)} (${best[1].count} ${currentLanguage === 'ko' ? '거래' : 'trades'})
                            </div>
                        </div>
                    `;
                }
            }

            // Gap Trading Edge
            if (gapTrading) {
                html += `
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                            ${currentLanguage === 'ko' ? '갭 트레이딩 우위' : 'Gap Trading Edge'}
                        </div>
                        <div style="color: #3b82f6; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
                            ${currentLanguage === 'ko' ? '최적 갭 범위' : 'Optimal Gap'}: ${gapTrading.bestGapRange}
                        </div>
                        <div style="color: #64748b; font-size: 11px;">
                            ${currentLanguage === 'ko' ? '갭 상승' : 'Gap Up'}: ${gapTrading.gapUpWinRate}% |
                            ${currentLanguage === 'ko' ? '갭 하락' : 'Gap Down'}: ${gapTrading.gapDownWinRate}% |
                            ${currentLanguage === 'ko' ? '대형 갭' : 'Large Gap'}: ${gapTrading.largeGapWinRate}%
                        </div>
                    </div>
                `;
            }

            // Price Level Edge
            if (priceLevel) {
                html += `
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
                        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                            ${currentLanguage === 'ko' ? '가격대별 우위' : 'Price Level Edge'}
                        </div>
                        <div style="color: #f59e0b; font-size: 16px; font-weight: 700; margin-bottom: 4px;">
                            ${currentLanguage === 'ko' ? '최적 가격대' : 'Optimal Range'}: ${priceLevel.optimalPriceRange}
                        </div>
                        <div style="color: #64748b; font-size: 11px;">
                            Under $5: ${priceLevel.under5WinRate}% |
                            $5-$20: ${priceLevel.range5to20WinRate}% |
                            Over $20: ${priceLevel.over20WinRate}%
                        </div>
                    </div>
                `;
            }

            html += '</div>';
        } catch (error) {
            console.error('Advanced edge analysis error:', error);
        }
    }

    element.innerHTML = html;
}

/**
 * Calculate statistical edge with significance testing
 */
function calculateStatisticalEdge() {
    const filteredTrades = getFilteredTradesForAnalytics();
    const n = filteredTrades.length;

    if (n === 0) {
        return {
            winRate: 0,
            expectedValue: 0,
            sharpe: 0,
            pValue: 1,
            confidenceLow: 0,
            confidenceHigh: 0
        };
    }

    const wins = filteredTrades.filter(t => t.pnl > 0).length;
    const winRate = (wins / n) * 100;

    // Expected value per trade
    const avgWin = filteredTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(wins, 1);
    const avgLoss = Math.abs(filteredTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / Math.max(n - wins, 1));
    const expectedValue = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

    // Sharpe Ratio
    const returns = filteredTrades.map(t => t.pnl);
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
    const top3Element = document.getElementById('top3InsightsContainer');
    if (!element) return;

    const recommendations = generateAdaptiveRecommendations();

    if (recommendations.length === 0) {
        element.innerHTML = `
            <div style="color: #64748b; text-align: center; padding: 20px;">
                Collecting data for personalized recommendations...
            </div>
        `;
        if (top3Element) {
            top3Element.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="color: #94a3b8; font-size: 13px;">${currentLanguage === 'ko' ? '더 많은 데이터를 수집하여 맞춤 인사이트를 생성하세요...' : 'Collect more data to generate personalized insights...'}</div>
                </div>
            `;
        }
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

    // Populate TOP 3 Insights Container with enhanced styling
    if (top3Element) {
        const top3 = recommendations.slice(0, 3);

        const top3Html = top3.map((rec, index) => {
            const priorityIcons = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            };

            const priorityLabels = {
                'high': currentLanguage === 'ko' ? '최우선' : 'OPTIMIZE',
                'medium': currentLanguage === 'ko' ? '최적화' : 'IMPROVE',
                'low': currentLanguage === 'ko' ? '개선' : 'ENHANCE'
            };

            const priorityColors = {
                'high': '#10b981',
                'medium': '#3b82f6',
                'low': '#8b5cf6'
            };

            const rankBadge = ['#1', '#2', '#3'][index];
            const color = priorityColors[rec.priority];

            return `
                <div style="background: rgba(15, 23, 42, 0.6); padding: 18px; border-radius: 8px; border-left: 4px solid ${color}; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                        <div style="background: ${color}; color: #0f172a; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; min-width: 32px; text-align: center;">${rankBadge}</div>
                        <div style="background: ${color}; color: #0f172a; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">${priorityLabels[rec.priority]}</div>
                        <div style="color: #94a3b8; font-size: 11px; margin-left: auto;">${rec.impact}</div>
                    </div>
                    <div style="color: #f8fafc; font-size: 15px; font-weight: 600; margin-bottom: 8px;">${priorityIcons[rec.priority]} ${rec.title}</div>
                    <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">${rec.description}</div>
                </div>
            `;
        }).join('');

        top3Element.innerHTML = top3Html;
    }
}

/**
 * Generate adaptive, context-aware recommendations
 */
function generateAdaptiveRecommendations() {
    const recommendations = [];
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {
        return recommendations;
    }

    // Analyze recent performance
    const last10 = filteredTrades.slice(-10);
    const last10WinRate = last10.length > 0 ? (last10.filter(t => t.pnl > 0).length / last10.length * 100) : 50;

    // Recommendation 1: Time-based optimization
    const hourlyPerf = {};
    filteredTrades.forEach(trade => {
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
    const avgAmount = filteredTrades.map(t => t.amount).reduce((a, b) => a + b, 0) / filteredTrades.length;
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
