// Analytics section management
function showAnalyticsSection(sectionName) {
    currentAnalyticsSection = sectionName;
    
    // Update tab states
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // event.target 대신 직접 요소 찾기
    document.querySelector(`[onclick="showAnalyticsSection('${sectionName}')"]`).classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.detail-section, .chart-section').forEach(section => {
        section.classList.remove('active');
    });
    
    if (sectionName === 'detail') {
        document.getElementById('detailSection').classList.add('active');
        setTimeout(async () => await updateBasicCharts(), 100);
    } else if (sectionName === 'charts') {
        document.getElementById('chartSection').classList.add('active');
        setTimeout(async () => await updateAdvancedCharts(), 100);
    }
}

async function createBasicChart(canvasId, type, data, options = {}) {
    try {
        await waitForChart();
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.warn(`Canvas ${canvasId} not found`);
            return null;
        }

        // 기존 차트 완전히 제거
        if (basicCharts[canvasId]) {
            try {
                basicCharts[canvasId].destroy();
            } catch (e) {
                console.warn('Chart destruction warning:', e);
            }
            delete basicCharts[canvasId];
        }

        // Canvas 초기화
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e4e4e7'
                    }
                }
            },
            scales: type !== 'pie' && type !== 'doughnut' ? {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            } : {}
        };

        basicCharts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        });

        return basicCharts[canvasId];
    } catch (error) {
        console.error(`Error creating basic chart ${canvasId}:`, error);
        return null;
    }
}

async function createAdvancedChart(canvasId, type, data, options = {}) {
    try {
        await waitForChart();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if it exists
        if (advancedCharts[canvasId]) {
            advancedCharts[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e4e4e7'
                    }
                }
            },
            scales: type !== 'pie' && type !== 'doughnut' ? {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            } : {}
        };

        advancedCharts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        });

        return advancedCharts[canvasId];
    } catch (error) {
        console.error(`Error creating advanced chart ${canvasId}:`, error);
        return null;
    }
}

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
    // 먼저 일일 P&L을 집계
    const dailyPL = {};
    filteredTrades.forEach(trade => {
        if (!dailyPL[trade.date]) {
            dailyPL[trade.date] = 0;
        }
        dailyPL[trade.date] += trade.pnl;
    });

    // 날짜순으로 정렬하고 누적 계산
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

function setAnalyticsPeriod(period) {
    analyticsPeriod = period;
    document.querySelectorAll('.filter-controls .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[onclick="setAnalyticsPeriod('${period}')"]`).classList.add('active');
    updateDetailedAnalytics();
}

function getFilteredTradesForAnalytics() {
    let filteredTrades = trades;
    
    if (analyticsStartDate || analyticsEndDate) {
        filteredTrades = trades.filter(trade => {
            const tradeDate = trade.date;
            if (analyticsStartDate && tradeDate < analyticsStartDate) return false;
            if (analyticsEndDate && tradeDate > analyticsEndDate) return false;
            return true;
        });
    } else {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (analyticsPeriod) {
            case 'day':
                const todayStr = formatTradingDate(today);
                filteredTrades = trades.filter(trade => trade.date === todayStr);
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekAgoStr = formatTradingDate(weekAgo);
                filteredTrades = trades.filter(trade => trade.date >= weekAgoStr);
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                const monthAgoStr = formatTradingDate(monthAgo);
                filteredTrades = trades.filter(trade => trade.date >= monthAgoStr);
                break;
            default:
                filteredTrades = trades;
        }
    }
    
    return filteredTrades;
}

function updateDetailedAnalytics() {
    const filteredTrades = getFilteredTradesForAnalytics();
    
    if (filteredTrades.length === 0) {
        resetDetailedAnalyticsDisplay();
        return;
    }
    
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

    updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees);
    updateWinLossStatistics(filteredTrades, wins, losses, winRate);
    updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees);
    updateTimeAnalysisDetails(filteredTrades);
    updateTradingActivityDetails(filteredTrades, uniqueDatesForFees);
    updateStreakAnalysisDetails(filteredTrades);
    updateSymbolPerformanceDetails(filteredTrades);
    updateRiskManagementDetails(filteredTrades);

    if (currentAnalyticsSection === 'detail') {
        setTimeout(async () => await updateBasicCharts(), 100);
    }
}

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

function updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees) {
    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = { tradePL: 0, winDays: 0, lossDays: 0 };
        }
        dailyStats[trade.date].tradePL += trade.pnl;
    });

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

function updateTimeAnalysisDetails(filteredTrades) {
    const holdTimes = filteredTrades
        .filter(trade => trade.holdingTime)
        .map(trade => parseInt(trade.holdingTime.replace('m', '')));
    
    const avgHoldTime = holdTimes.length > 0 ? 
        holdTimes.reduce((sum, time) => sum + time, 0) / holdTimes.length : 0;
    const shortestHold = holdTimes.length > 0 ? Math.min(...holdTimes) : 0;
    const longestHold = holdTimes.length > 0 ? Math.max(...holdTimes) : 0;

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

function updateTradingActivityDetails(filteredTrades, uniqueDatesForFees) {
    const tradingDays = uniqueDatesForFees.length;
    const avgTradesPerDay = tradingDays > 0 ? filteredTrades.length / tradingDays : 0;
    
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

function updateRiskManagementDetails(filteredTrades) {
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

    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = 0;
        }
        dailyStats[trade.date] += trade.pnl;
    });

    Object.keys(dailyStats).forEach(date => {
        const fee = dailyFees[date] || 0;
        dailyStats[date] -= fee;
    });

    const dailyPLs = Object.values(dailyStats);
    const maxDailyGain = dailyPLs.length > 0 ? Math.max(...dailyPLs) : 0;
    const maxDailyLoss = dailyPLs.length > 0 && dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : 0;

    const totalReturn = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

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

function resetDetailedAnalyticsDisplay() {
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

    document.getElementById('detailBestHour').textContent = '-';
    document.getElementById('detailWorstHour').textContent = '-';
    document.getElementById('detailBestDayOfWeek').textContent = '-';
    document.getElementById('detailMostProfitableSymbol').textContent = '-';
    document.getElementById('detailLeastProfitableSymbol').textContent = '-';
    document.getElementById('detailMostTradedSymbol').textContent = '-';
    document.getElementById('detailBestSymbolWinRate').textContent = '-';
    document.getElementById('detailBestSymbolReturn').textContent = '-';
}

function toggleDetailCard(header) {
    const card = header.parentElement;
    card.classList.toggle('collapsed');
}

function clearAnalyticsRange() {
    analyticsStartDate = null;
    analyticsEndDate = null;
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    updateDetailedAnalytics();
}
