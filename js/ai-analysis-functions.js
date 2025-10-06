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

/**
 * Phase 3: Multivariate Correlation Analysis
 * Analyzes interactions between multiple psychological and performance variables
 */
function analyzeMultivariateCorrelations() {
    // Check cache first
    const cacheKey = `correlations_${trades.length}_${Object.keys(psychologyData).length}`;
    const cached = analysisCache.get(cacheKey);
    if (cached) return cached;

    if (trades.length < 20 || Object.keys(psychologyData).length < 10) return null;

    // Group trades by date and calculate daily metrics
    const dailyMetrics = {};
    Object.keys(psychologyData).forEach(date => {
        const dayTrades = trades.filter(t => t.date === date);
        if (dayTrades.length > 0) {
            const psych = psychologyData[date];
            dailyMetrics[date] = {
                psych: psych,
                trades: dayTrades,
                totalPnL: dayTrades.reduce((sum, t) => sum + t.pnl, 0),
                winRate: (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) * 100,
                avgReturnPct: dayTrades.reduce((sum, t) => sum + (t.returnPct || 0), 0) / dayTrades.length
            };
        }
    });

    const dataPoints = Object.values(dailyMetrics);
    if (dataPoints.length < 10) return null;

    // Calculate correlations
    const correlations = [];

    // 1. Sleep-Caffeine Interaction
    const sleepCaffeineData = dataPoints.filter(d => d.psych.sleepHours && d.psych.caffeineIntake != null);
    if (sleepCaffeineData.length >= 10) {
        // Calculate interaction score: low sleep + high caffeine is concerning
        const interactions = sleepCaffeineData.map(d => ({
            interaction: d.psych.sleepHours * (200 - d.psych.caffeineIntake) / 200, // Normalized score
            winRate: d.winRate
        }));
        const corr = calculatePearsonCorrelation(interactions.map(i => ({ x: i.interaction, y: i.winRate })));
        if (corr !== null) {
            correlations.push({
                name: currentLanguage === 'ko' ? '수면-카페인 상호작용' : 'Sleep-Caffeine Interaction',
                correlation: corr,
                strength: Math.abs(corr) > 0.5 ? 'Strong' : Math.abs(corr) > 0.3 ? 'Moderate' : 'Weak',
                insight: corr > 0 ?
                    (currentLanguage === 'ko' ? '충분한 수면과 적절한 카페인 섭취가 성과 향상과 상관관계' : 'Adequate sleep with moderate caffeine correlates with better performance') :
                    (currentLanguage === 'ko' ? '부족한 수면에 과도한 카페인이 성과 저하와 상관관계' : 'Poor sleep with excessive caffeine correlates with worse performance')
            });
        }
    }

    // 2. Stress-Confidence Combination
    const stressConfData = dataPoints.filter(d => d.psych.stress && d.psych.confidence);
    if (stressConfData.length >= 10) {
        // Optimal zone: low stress + moderate-high confidence
        const combinations = stressConfData.map(d => ({
            combo: d.psych.confidence / d.psych.stress, // Higher is better
            pnl: d.totalPnL
        }));
        const corr = calculatePearsonCorrelation(combinations.map(c => ({ x: c.combo, y: c.pnl })));
        if (corr !== null) {
            correlations.push({
                name: currentLanguage === 'ko' ? '스트레스-자신감 조합' : 'Stress-Confidence Balance',
                correlation: corr,
                strength: Math.abs(corr) > 0.5 ? 'Strong' : Math.abs(corr) > 0.3 ? 'Moderate' : 'Weak',
                insight: corr > 0 ?
                    (currentLanguage === 'ko' ? '낮은 스트레스와 높은 자신감이 수익과 양의 상관관계' : 'Low stress with high confidence shows positive correlation with profit') :
                    (currentLanguage === 'ko' ? '높은 스트레스가 과신과 결합되면 손실 위험' : 'High stress combined with overconfidence increases loss risk')
            });
        }
    }

    // 3. Environment-Focus Correlation
    const envFocusData = dataPoints.filter(d => d.psych.focus);
    if (envFocusData.length >= 10) {
        const homeData = envFocusData.filter(d => d.psych.tradingEnvironment === 'home');
        const officeData = envFocusData.filter(d => d.psych.tradingEnvironment === 'office');

        if (homeData.length >= 5 && officeData.length >= 5) {
            const homeAvgFocus = homeData.reduce((sum, d) => sum + d.psych.focus, 0) / homeData.length;
            const officeAvgFocus = officeData.reduce((sum, d) => sum + d.psych.focus, 0) / officeData.length;
            const homeAvgWR = homeData.reduce((sum, d) => sum + d.winRate, 0) / homeData.length;
            const officeAvgWR = officeData.reduce((sum, d) => sum + d.winRate, 0) / officeData.length;

            correlations.push({
                name: currentLanguage === 'ko' ? '환경-집중도 상관관계' : 'Environment-Focus Correlation',
                correlation: (homeAvgWR - officeAvgWR) / 100, // Normalized difference
                strength: 'Comparative',
                insight: homeAvgWR > officeAvgWR ?
                    (currentLanguage === 'ko' ? `재택(집중도 ${homeAvgFocus.toFixed(1)}, 승률 ${homeAvgWR.toFixed(0)}%)이 사무실보다 효과적` : `Home trading (focus ${homeAvgFocus.toFixed(1)}, WR ${homeAvgWR.toFixed(0)}%) more effective than office`) :
                    (currentLanguage === 'ko' ? `사무실(집중도 ${officeAvgFocus.toFixed(1)}, 승률 ${officeAvgWR.toFixed(0)}%)이 재택보다 효과적` : `Office trading (focus ${officeAvgFocus.toFixed(1)}, WR ${officeAvgWR.toFixed(0)}%) more effective than home`)
            });
        }
    }

    const result = {
        correlations: correlations,
        sampleSize: dataPoints.length,
        dataQuality: dataPoints.length >= 30 ? 'High' : dataPoints.length >= 20 ? 'Medium' : 'Low'
    };

    // Cache the result
    analysisCache.set(cacheKey, result);
    return result;
}

/**
 * Phase 3: Temporal Pattern Recognition
 * Detects time-based patterns in trading performance
 */
function detectTemporalPatterns() {
    // Check cache first
    const cacheKey = `temporal_${trades.length}`;
    const cached = analysisCache.get(cacheKey);
    if (cached) return cached;

    if (trades.length < 30) return null;

    const patterns = [];

    // Group trades by day of week
    const dayOfWeekStats = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    trades.forEach(trade => {
        const date = new Date(trade.date + 'T12:00:00');
        const dayOfWeek = date.getDay();
        if (!dayOfWeekStats[dayOfWeek]) {
            dayOfWeekStats[dayOfWeek] = { trades: [], totalPnL: 0, wins: 0 };
        }
        dayOfWeekStats[dayOfWeek].trades.push(trade);
        dayOfWeekStats[dayOfWeek].totalPnL += trade.pnl;
        if (trade.pnl > 0) dayOfWeekStats[dayOfWeek].wins++;
    });

    // Find best and worst days
    const dayPerformance = Object.keys(dayOfWeekStats).map(day => ({
        day: parseInt(day),
        name: currentLanguage === 'ko' ? dayNamesKo[day] : dayNames[day],
        avgPnL: dayOfWeekStats[day].totalPnL / dayOfWeekStats[day].trades.length,
        winRate: (dayOfWeekStats[day].wins / dayOfWeekStats[day].trades.length) * 100,
        tradeCount: dayOfWeekStats[day].trades.length
    })).filter(d => d.tradeCount >= 3); // Minimum 3 trades per day

    if (dayPerformance.length > 0) {
        dayPerformance.sort((a, b) => b.avgPnL - a.avgPnL);
        const bestDay = dayPerformance[0];
        const worstDay = dayPerformance[dayPerformance.length - 1];

        patterns.push({
            type: 'weekday_performance',
            bestDay: bestDay.name,
            bestDayAvgPnL: bestDay.avgPnL,
            bestDayWinRate: bestDay.winRate,
            worstDay: worstDay.name,
            worstDayAvgPnL: worstDay.avgPnL,
            worstDayWinRate: worstDay.winRate,
            insight: currentLanguage === 'ko' ?
                `${bestDay.name}(평균 $${bestDay.avgPnL.toFixed(2)}, 승률 ${bestDay.winRate.toFixed(0)}%)이 최고 실적. ${worstDay.name} 거래 피할 것을 권장` :
                `Best performance on ${bestDay.name} (avg $${bestDay.avgPnL.toFixed(2)}, WR ${bestDay.winRate.toFixed(0)}%). Consider avoiding ${worstDay.name} trades`
        });
    }

    // Consecutive trading day fatigue analysis
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const tradingDates = [...new Set(sortedTrades.map(t => t.date))].sort();

    let consecutiveGroups = [];
    let currentGroup = [tradingDates[0]];

    for (let i = 1; i < tradingDates.length; i++) {
        const prevDate = new Date(tradingDates[i - 1]);
        const currDate = new Date(tradingDates[i]);
        const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 1) {
            currentGroup.push(tradingDates[i]);
        } else {
            if (currentGroup.length >= 3) consecutiveGroups.push([...currentGroup]);
            currentGroup = [tradingDates[i]];
        }
    }
    if (currentGroup.length >= 3) consecutiveGroups.push(currentGroup);

    if (consecutiveGroups.length > 0) {
        // Analyze performance decline over consecutive days
        let fatigueDetected = false;
        consecutiveGroups.forEach(group => {
            if (group.length >= 5) {
                const firstDayPnL = trades.filter(t => t.date === group[0]).reduce((sum, t) => sum + t.pnl, 0);
                const lastDayPnL = trades.filter(t => t.date === group[group.length - 1]).reduce((sum, t) => sum + t.pnl, 0);
                const midDayPnL = trades.filter(t => t.date === group[Math.floor(group.length / 2)]).reduce((sum, t) => sum + t.pnl, 0);

                if (firstDayPnL > midDayPnL && midDayPnL > lastDayPnL) {
                    fatigueDetected = true;
                }
            }
        });

        if (fatigueDetected) {
            patterns.push({
                type: 'consecutive_day_fatigue',
                detected: true,
                insight: currentLanguage === 'ko' ?
                    '연속 거래일에서 성과 하락 패턴 감지. 5일 이상 연속 거래 후 휴식 권장' :
                    'Performance decline detected in consecutive trading days. Consider breaks after 5+ consecutive days'
            });
        }
    }

    const result = {
        patterns: patterns,
        totalTradingDays: tradingDates.length,
        avgTradesPerDay: trades.length / tradingDates.length
    };

    // Cache the result
    analysisCache.set(cacheKey, result);
    return result;
}

/**
 * Phase 3: Trade Clustering Analysis
 * Groups trades into clusters based on holding time and characteristics
 */
function performTradeClustering() {
    const validTrades = trades.filter(t => t.holdingMinutes && t.holdingMinutes > 0);
    if (validTrades.length < 20) return null;

    // Define clusters based on holding time
    const scalpingTrades = validTrades.filter(t => parseInt(t.holdingMinutes) >= 5 && parseInt(t.holdingMinutes) < 30);
    const swingTrades = validTrades.filter(t => parseInt(t.holdingMinutes) >= 30 && parseInt(t.holdingMinutes) < 120);
    const positionTrades = validTrades.filter(t => parseInt(t.holdingMinutes) >= 120);

    const analyzeCluster = (clusterTrades, name, nameKo) => {
        if (clusterTrades.length === 0) return null;

        const wins = clusterTrades.filter(t => t.pnl > 0);
        const losses = clusterTrades.filter(t => t.pnl < 0);
        const totalPnL = clusterTrades.reduce((sum, t) => sum + t.pnl, 0);
        const avgPnL = totalPnL / clusterTrades.length;
        const winRate = (wins.length / clusterTrades.length) * 100;
        const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
        const profitFactor = losses.length > 0 ? (wins.reduce((sum, t) => sum + t.pnl, 0) / Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))) : 999;

        return {
            name: currentLanguage === 'ko' ? nameKo : name,
            tradeCount: clusterTrades.length,
            totalPnL: totalPnL,
            avgPnL: avgPnL,
            winRate: winRate,
            avgWin: avgWin,
            avgLoss: avgLoss,
            profitFactor: profitFactor,
            avgHoldTime: clusterTrades.reduce((sum, t) => sum + parseInt(t.holdingMinutes), 0) / clusterTrades.length
        };
    };

    const clusters = [
        analyzeCluster(scalpingTrades, 'Quick Scalping (5-30 min)', '빠른 스캘핑 (5-30분)'),
        analyzeCluster(swingTrades, 'Swing Trades (30-120 min)', '스윙 트레이드 (30-120분)'),
        analyzeCluster(positionTrades, 'Position Trades (120+ min)', '포지션 트레이드 (120분+)')
    ].filter(c => c !== null);

    // Find optimal cluster
    const optimalCluster = clusters.reduce((best, curr) =>
        curr.avgPnL > best.avgPnL ? curr : best
    );

    return {
        clusters: clusters,
        optimalCluster: optimalCluster.name,
        optimalMetrics: {
            avgPnL: optimalCluster.avgPnL,
            winRate: optimalCluster.winRate,
            profitFactor: optimalCluster.profitFactor
        },
        recommendation: currentLanguage === 'ko' ?
            `${optimalCluster.name} 스타일에 집중 (평균 손익 $${optimalCluster.avgPnL.toFixed(2)}, 승률 ${optimalCluster.winRate.toFixed(0)}%)` :
            `Focus on ${optimalCluster.name} style (avg P&L $${optimalCluster.avgPnL.toFixed(2)}, WR ${optimalCluster.winRate.toFixed(0)}%)`
    };
}
