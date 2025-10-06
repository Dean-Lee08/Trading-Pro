// ==================== ADDITIONAL AI ANALYSIS FUNCTIONS ====================

/**
 * Phase 2: Behavioral Bias Detection
 * Detects cognitive biases in trading behavior
 */
function detectBehavioralBiases() {
    if (trades.length < 20) return null;

    const biases = [];

    // 1. Confirmation Bias (repetitive symbol trading with declining performance)
    const symbolStats = {};
    trades.forEach((trade, idx) => {
        if (!symbolStats[trade.symbol]) {
            symbolStats[trade.symbol] = { trades: [], totalPnL: 0 };
        }
        symbolStats[trade.symbol].trades.push({ ...trade, index: idx });
        symbolStats[trade.symbol].totalPnL += trade.pnl;
    });

    Object.entries(symbolStats).forEach(([symbol, stats]) => {
        if (stats.trades.length >= 5) {
            const firstHalf = stats.trades.slice(0, Math.floor(stats.trades.length / 2));
            const secondHalf = stats.trades.slice(Math.floor(stats.trades.length / 2));

            const firstWR = (firstHalf.filter(t => t.pnl > 0).length / firstHalf.length);
            const secondWR = (secondHalf.filter(t => t.pnl > 0).length / secondHalf.length);

            if (firstWR - secondWR > 0.3) {
                biases.push({
                    type: 'confirmation',
                    severity: 'high',
                    symbol: symbol,
                    description: currentLanguage === 'ko' ?
                        symbol + ' 반복 거래: 초기 승률 ' + (firstWR * 100).toFixed(0) + '% → 최근 승률 ' + (secondWR * 100).toFixed(0) + '%로 하락. 확증 편향 의심' :
                        symbol + ' repetition: Win rate declined from ' + (firstWR * 100).toFixed(0) + '% to ' + (secondWR * 100).toFixed(0) + '%. Possible confirmation bias'
                });
            }
        }
    });

    // 2. Loss Aversion (holding losers too long)
    const winningHoldTimes = trades.filter(t => t.pnl > 0 && t.holdingMinutes).map(t => parseInt(t.holdingMinutes));
    const losingHoldTimes = trades.filter(t => t.pnl < 0 && t.holdingMinutes).map(t => parseInt(t.holdingMinutes));

    if (winningHoldTimes.length >= 5 && losingHoldTimes.length >= 5) {
        const avgWinHold = winningHoldTimes.reduce((sum, t) => sum + t, 0) / winningHoldTimes.length;
        const avgLossHold = losingHoldTimes.reduce((sum, t) => sum + t, 0) / losingHoldTimes.length;

        if (avgLossHold > avgWinHold * 1.5) {
            biases.push({
                type: 'loss_aversion',
                severity: 'medium',
                description: currentLanguage === 'ko' ?
                    '손실 회피: 손실 거래 보유시간(' + avgLossHold.toFixed(0) + '분)이 수익 거래(' + avgWinHold.toFixed(0) + '분)보다 ' + ((avgLossHold / avgWinHold - 1) * 100).toFixed(0) + '% 더 김' :
                    'Loss aversion: Holding losers ' + ((avgLossHold / avgWinHold - 1) * 100).toFixed(0) + '% longer (' + avgLossHold.toFixed(0) + 'm vs ' + avgWinHold.toFixed(0) + 'm)'
            });
        }
    }

    // 3. Overtrading after losses (revenge trading)
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));
    let revengeTradingCount = 0;

    for (let i = 1; i < sortedTrades.length; i++) {
        const prev = sortedTrades[i - 1];
        const curr = sortedTrades[i];

        if (prev.pnl < 0 && curr.amount > prev.amount * 1.5) {
            revengeTradingCount++;
        }
    }

    if (revengeTradingCount > sortedTrades.length * 0.1) {
        biases.push({
            type: 'revenge_trading',
            severity: 'high',
            count: revengeTradingCount,
            description: currentLanguage === 'ko' ?
                '복수 거래: 손실 후 포지션 급증 ' + revengeTradingCount + '회 감지 (' + (revengeTradingCount / sortedTrades.length * 100).toFixed(0) + '%)' :
                'Revenge trading: ' + revengeTradingCount + ' instances of position surge after losses (' + (revengeTradingCount / sortedTrades.length * 100).toFixed(0) + '%)'
        });
    }

    // 4. Anchoring (fixation on certain price levels)
    const pricePoints = trades.map(t => Math.floor(t.buyPrice));
    const priceFrequency = {};
    pricePoints.forEach(price => {
        priceFrequency[price] = (priceFrequency[price] || 0) + 1;
    });

    const maxFrequency = Math.max(...Object.values(priceFrequency));
    if (maxFrequency > trades.length * 0.15) {
        const anchoredPrice = Object.keys(priceFrequency).find(price => priceFrequency[price] === maxFrequency);
        biases.push({
            type: 'anchoring',
            severity: 'low',
            price: anchoredPrice,
            description: currentLanguage === 'ko' ?
                '앵커링: $' + anchoredPrice + ' 가격대 집착 (' + maxFrequency + '회, ' + (maxFrequency / trades.length * 100).toFixed(0) + '%)' :
                'Anchoring: Fixation on $' + anchoredPrice + ' level (' + maxFrequency + ' times, ' + (maxFrequency / trades.length * 100).toFixed(0) + '%)'
        });
    }

    return biases;
}

/**
 * Phase 2: Pattern-Based Trade Suggestions
 * Suggests trades based on historical patterns matching current conditions
 */
function generatePatternBasedSuggestions() {
    if (trades.length < 30) return null;

    const currentDate = formatTradingDate(new Date());
    const currentPsych = psychologyData[currentDate];
    const currentHour = new Date().getHours();

    // Find similar past conditions
    const similarTrades = trades.filter(trade => {
        const tradePsych = psychologyData[trade.date];
        let similarity = 0;

        // Time similarity
        if (trade.entryTime) {
            const tradeHour = parseInt(trade.entryTime.split(':')[0]);
            if (Math.abs(tradeHour - currentHour) <= 1) similarity += 25;
        }

        // Psychology similarity
        if (currentPsych && tradePsych) {
            if (Math.abs(tradePsych.sleepHours - currentPsych.sleepHours) <= 1) similarity += 20;
            if (Math.abs(tradePsych.stress - currentPsych.stress) <= 1) similarity += 15;
            if (Math.abs(tradePsych.focus - currentPsych.focus) <= 1) similarity += 20;
            if (tradePsych.tradingEnvironment === currentPsych.tradingEnvironment) similarity += 20;
        }

        return similarity >= 60; // 60% similarity threshold
    });

    if (similarTrades.length < 5) return null;

    const wins = similarTrades.filter(t => t.pnl > 0);
    const winRate = (wins.length / similarTrades.length) * 100;
    const avgPnL = similarTrades.reduce((sum, t) => sum + t.pnl, 0) / similarTrades.length;

    // Symbol recommendations
    const symbolPerf = {};
    similarTrades.forEach(trade => {
        if (!symbolPerf[trade.symbol]) {
            symbolPerf[trade.symbol] = { wins: 0, total: 0, totalPnL: 0 };
        }
        symbolPerf[trade.symbol].total++;
        symbolPerf[trade.symbol].totalPnL += trade.pnl;
        if (trade.pnl > 0) symbolPerf[trade.symbol].wins++;
    });

    const topSymbols = Object.entries(symbolPerf)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => b[1].totalPnL - a[1].totalPnL)
        .slice(0, 3)
        .map(([symbol, stats]) => ({
            symbol: symbol,
            winRate: (stats.wins / stats.total) * 100,
            avgPnL: stats.totalPnL / stats.total,
            count: stats.total
        }));

    return {
        matchCount: similarTrades.length,
        similarity: 75,
        winRate: winRate,
        avgPnL: avgPnL,
        topSymbols: topSymbols,
        conditions: {
            hour: currentHour,
            psychologyState: currentPsych ? 'Available' : 'N/A'
        }
    };
}

/**
 * Phase 2: Optimal Position Sizing Advisor
 * Recommends position size based on current state
 */
function calculateOptimalPositionSize() {
    if (trades.length < 20) return null;

    const currentDate = formatTradingDate(new Date());
    const currentPsych = psychologyData[currentDate];
    const accountBalance = currentPsych && currentPsych.accountBalance ? currentPsych.accountBalance : 10000;

    // Calculate base Kelly fraction
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const winRate = wins.length / trades.length;
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 1;

    const kellyFraction = winRate - ((1 - winRate) / winLossRatio);
    const baseKelly = Math.max(0, Math.min(0.25, kellyFraction));

    // Adjust based on psychology
    let kellyMultiplier = 1.0;
    if (currentPsych) {
        if (currentPsych.stress >= 4) kellyMultiplier *= 0.5;
        else if (currentPsych.stress >= 3) kellyMultiplier *= 0.75;

        if (currentPsych.sleepHours < 6) kellyMultiplier *= 0.5;
        else if (currentPsych.sleepHours < 7) kellyMultiplier *= 0.75;

        if (currentPsych.focus <= 2) kellyMultiplier *= 0.5;
        else if (currentPsych.focus === 3) kellyMultiplier *= 0.75;

        if (currentPsych.confidence >= 5) kellyMultiplier *= 0.7;
        else if (currentPsych.confidence <= 2) kellyMultiplier *= 0.6;
    }

    // Check recent performance
    const recentTrades = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    const recentWinRate = recentTrades.filter(t => t.pnl > 0).length / recentTrades.length;
    if (recentWinRate < 0.4) kellyMultiplier *= 0.6;

    const adjustedKelly = baseKelly * kellyMultiplier;

    const recommendations = [
        {
            level: 'conservative',
            kelly: adjustedKelly * 0.5,
            size: accountBalance * adjustedKelly * 0.5,
            description: currentLanguage === 'ko' ? '보수적 (절반 Kelly)' : 'Conservative (Half Kelly)'
        },
        {
            level: 'moderate',
            kelly: adjustedKelly,
            size: accountBalance * adjustedKelly,
            description: currentLanguage === 'ko' ? '중립적 (조정된 Kelly)' : 'Moderate (Adjusted Kelly)'
        },
        {
            level: 'aggressive',
            kelly: adjustedKelly * 1.5,
            size: accountBalance * adjustedKelly * 1.5,
            description: currentLanguage === 'ko' ? '공격적 (1.5배 Kelly)' : 'Aggressive (1.5x Kelly)'
        }
    ];

    return {
        baseKelly: baseKelly,
        adjustedKelly: adjustedKelly,
        kellyMultiplier: kellyMultiplier,
        recommendations: recommendations,
        accountBalance: accountBalance,
        adjustmentReasons: {
            stress: currentPsych ? currentPsych.stress : null,
            sleep: currentPsych ? currentPsych.sleepHours : null,
            focus: currentPsych ? currentPsych.focus : null,
            recentPerformance: recentWinRate
        }
    };
}

/**
 * Phase 3: Session Performance Prediction
 * Predicts expected performance range for today's session
 */
function predictSessionPerformance() {
    const currentDate = formatTradingDate(new Date());
    const currentPsych = psychologyData[currentDate];

    if (!currentPsych || trades.length < 20) return null;

    // Find similar past sessions
    const similarSessions = Object.keys(psychologyData).filter(date => {
        const psych = psychologyData[date];
        const dayTrades = trades.filter(t => t.date === date);

        if (dayTrades.length === 0) return false;

        let similarity = 0;
        if (Math.abs(psych.sleepHours - currentPsych.sleepHours) <= 1) similarity += 25;
        if (Math.abs(psych.stress - currentPsych.stress) <= 1) similarity += 25;
        if (Math.abs(psych.focus - currentPsych.focus) <= 1) similarity += 25;
        if (psych.tradingEnvironment === currentPsych.tradingEnvironment) similarity += 25;

        return similarity >= 60;
    });

    if (similarSessions.length < 5) return null;

    const sessionResults = similarSessions.map(date => {
        const dayTrades = trades.filter(t => t.date === date);
        const totalPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0) - (dailyFees[date] || 0);
        return {
            date: date,
            pnl: totalPnL,
            tradeCount: dayTrades.length,
            winRate: (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100
        };
    });

    sessionResults.sort((a, b) => a.pnl - b.pnl);

    const avgPnL = sessionResults.reduce((sum, s) => sum + s.pnl, 0) / sessionResults.length;
    const avgTradeCount = sessionResults.reduce((sum, s) => sum + s.tradeCount, 0) / sessionResults.length;
    const avgWinRate = sessionResults.reduce((sum, s) => sum + s.winRate, 0) / sessionResults.length;

    return {
        prediction: {
            low: sessionResults[Math.floor(sessionResults.length * 0.25)].pnl,
            expected: avgPnL,
            high: sessionResults[Math.floor(sessionResults.length * 0.75)].pnl,
            expectedTrades: Math.round(avgTradeCount),
            expectedWinRate: avgWinRate
        },
        confidence: sessionResults.length >= 10 ? 'High' : sessionResults.length >= 5 ? 'Medium' : 'Low',
        basedOnSessions: sessionResults.length,
        warnings: generateSessionWarnings(currentPsych, sessionResults)
    };
}

/**
 * Generate warnings for session prediction
 */
function generateSessionWarnings(psychData, historicalSessions) {
    const warnings = [];

    if (psychData.sleepHours < 6.5) {
        warnings.push(currentLanguage === 'ko' ?
            '⚠️ 수면 부족: 성과 저하 가능성' :
            '⚠️ Sleep deprivation: Performance may suffer');
    }

    if (psychData.stress >= 4) {
        warnings.push(currentLanguage === 'ko' ?
            '⚠️ 높은 스트레스: 포지션 축소 권장' :
            '⚠️ High stress: Consider reducing position sizes');
    }

    if (psychData.focus <= 2) {
        warnings.push(currentLanguage === 'ko' ?
            '⚠️ 낮은 집중력: 거래 빈도 제한 권장' :
            '⚠️ Low focus: Limit trade frequency');
    }

    if (psychData.marketDelay > 30) {
        warnings.push(currentLanguage === 'ko' ?
            '⚠️ 시작 지연: 첫 거래 신중히 진행' :
            '⚠️ Late start: Proceed cautiously with first trades');
    }

    return warnings;
}

/**
 * Phase 3: Monte Carlo Simulation
 * Simulates future performance based on historical distribution
 */
function runMonteCarloSimulation(simulations, days) {
    simulations = simulations || 1000;
    days = days || 30;

    if (trades.length < 30) return null;

    const currentDate = formatTradingDate(new Date());
    const currentPsych = psychologyData[currentDate];
    const startingBalance = currentPsych && currentPsych.accountBalance ? currentPsych.accountBalance : 10000;

    // Get daily P&L distribution
    const dailyPnL = {};
    trades.forEach(trade => {
        if (!dailyPnL[trade.date]) dailyPnL[trade.date] = 0;
        dailyPnL[trade.date] += trade.pnl;
    });

    Object.keys(dailyPnL).forEach(date => {
        dailyPnL[date] -= (dailyFees[date] || 0);
    });

    const dailyReturns = Object.values(dailyPnL);
    const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length);

    // Run simulations
    const outcomes = [];
    for (let sim = 0; sim < simulations; sim++) {
        let balance = startingBalance;

        for (let day = 0; day < days; day++) {
            const randomReturn = avgReturn + (Math.random() - 0.5) * stdDev * 2;
            balance += randomReturn;
        }

        outcomes.push({
            finalBalance: balance,
            profit: balance - startingBalance,
            returnPct: ((balance - startingBalance) / startingBalance) * 100
        });
    }

    // Sort outcomes
    outcomes.sort((a, b) => a.finalBalance - b.finalBalance);

    return {
        startingBalance: startingBalance,
        simulations: simulations,
        days: days,
        worst5th: outcomes[Math.floor(simulations * 0.05)].finalBalance,
        worst25th: outcomes[Math.floor(simulations * 0.25)].finalBalance,
        median: outcomes[Math.floor(simulations * 0.5)].finalBalance,
        best75th: outcomes[Math.floor(simulations * 0.75)].finalBalance,
        best95th: outcomes[Math.floor(simulations * 0.95)].finalBalance,
        averageOutcome: outcomes.reduce((sum, o) => sum + o.finalBalance, 0) / simulations,
        probabilityOfProfit: (outcomes.filter(o => o.finalBalance > startingBalance).length / simulations) * 100
    };
}
