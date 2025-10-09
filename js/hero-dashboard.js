// ==================== HERO DASHBOARD UPDATES ====================

/**
 * Update Hero Dashboard Metrics
 */
function updateHeroDashboard() {
    // Check if hero dashboard elements exist
    if (!document.getElementById('heroQualityScore')) {
        console.log('ℹ️ Hero Dashboard elements not found - skipping update');
        return;
    }

    if (trades.length < 5) {
        setHeroDefaults();
        return;
    }

    // 1. Update Quality Score
    updateHeroQualityScore();

    // 2. Update Win Probability
    updateHeroWinProbability();

    // 3. Update Performance Forecast
    updateHeroPerformanceForecast();
}

/**
 * Set default hero dashboard values
 */
function setHeroDefaults() {
    const setElementContent = (id, content, property = 'textContent') => {
        const el = document.getElementById(id);
        if (el) el[property] = content;
    };

    setElementContent('heroQualityScore', '--');
    setElementContent('heroQualityTrend', '<span class="trend-icon">▲</span><span class="trend-value">Collect more data</span>', 'innerHTML');
    const gaugeEl = document.getElementById('heroQualityGauge');
    if (gaugeEl) gaugeEl.style.width = '0%';

    setElementContent('heroWinProbability', '--');
    setElementContent('heroRecommendation', '<span class="rec-icon">🟡</span><span class="rec-text">Insufficient data</span>', 'innerHTML');
    setElementContent('heroConfidence', '--');

    setElementContent('heroForecastValue', '$--');
    setElementContent('heroForecastTrend', '<span class="trend-icon">▲</span><span class="trend-value">--% vs avg</span>', 'innerHTML');
}

/**
 * Update Hero Quality Score
 */
function updateHeroQualityScore() {
    // Calculate average quality score
    const scoredTrades = trades.map(trade => ({
        ...trade,
        qualityScore: calculateTradeQualityScore(trade)
    }));

    const avgQuality = scoredTrades.reduce((sum, t) => sum + t.qualityScore, 0) / scoredTrades.length;
    const recent10 = scoredTrades.slice(-10);
    const recentAvg = recent10.reduce((sum, t) => sum + t.qualityScore, 0) / recent10.length;
    const trend = recentAvg - avgQuality;

    // Update UI
    const qualityScoreEl = document.getElementById('heroQualityScore');
    const qualityTrendEl = document.getElementById('heroQualityTrend');
    const qualityGaugeEl = document.getElementById('heroQualityGauge');

    if (!qualityScoreEl || !qualityTrendEl || !qualityGaugeEl) return;

    // Animate number
    animateValue(qualityScoreEl, 0, Math.round(recentAvg), 1000);

    // Update trend
    const trendIcon = trend >= 0 ? '▲' : '▼';
    const trendClass = trend >= 0 ? 'positive' : 'negative';
    qualityTrendEl.className = 'metric-trend ' + trendClass;
    qualityTrendEl.innerHTML = '<span class="trend-icon">' + trendIcon + '</span><span class="trend-value">' + Math.abs(trend).toFixed(0) + ' from avg</span>';

    // Update gauge
    setTimeout(() => {
        qualityGaugeEl.style.width = recentAvg + '%';
    }, 200);
}

/**
 * Update Hero Win Probability
 */
function updateHeroWinProbability() {
    const prediction = calculatePredictiveWinProbability();

    const winProbEl = document.getElementById('heroWinProbability');
    if (!winProbEl) return;

    if (!prediction) {
        winProbEl.textContent = '--';
        return;
    }

    const probability = Math.round(prediction.probability * 100);

    // Update probability
    animateValue(winProbEl, 0, probability, 1000);

    // Update signal light
    const signalLight = document.getElementById('heroSignalLight');
    if (signalLight) {
        signalLight.className = 'signal-light';
        if (prediction.recommendation === 'favorable') {
            signalLight.classList.add('green');
        } else if (prediction.recommendation === 'unfavorable') {
            signalLight.classList.add('red');
        }
    }

    // Update recommendation badge
    const recBadge = document.getElementById('heroRecommendation');
    if (recBadge) {
        let recIcon = '🟡';
        let recText = 'Neutral';
        let recClass = '';

        if (prediction.recommendation === 'favorable') {
            recIcon = '🟢';
            recText = currentLanguage === 'ko' ? '유리함' : 'Favorable';
            recClass = 'favorable';
        } else if (prediction.recommendation === 'unfavorable') {
            recIcon = '🔴';
            recText = currentLanguage === 'ko' ? '불리함' : 'Unfavorable';
            recClass = 'unfavorable';
        }

        recBadge.className = 'recommendation-badge ' + recClass;
        recBadge.innerHTML = '<span class="rec-icon">' + recIcon + '</span><span class="rec-text">' + recText + '</span>';
    }

    // Update confidence
    const confidenceEl = document.getElementById('heroConfidence');
    if (confidenceEl) {
        confidenceEl.textContent = prediction.confidence;
    }
}

/**
 * Update Hero Performance Forecast
 */
function updateHeroPerformanceForecast() {
    const sessionPrediction = predictSessionPerformance();

    const forecastValueEl = document.getElementById('heroForecastValue');
    const forecastTrendEl = document.getElementById('heroForecastTrend');

    if (!forecastValueEl || !forecastTrendEl) return;

    if (!sessionPrediction) {
        // Fallback to simple average
        const recentTrades = [...trades].slice(-20);
        if (recentTrades.length > 0) {
            const avgPnL = recentTrades.reduce((sum, t) => sum + t.pnl, 0) / recentTrades.length;
            forecastValueEl.textContent = '$' + avgPnL.toFixed(0);
        } else {
            forecastValueEl.textContent = '$--';
        }
        forecastTrendEl.innerHTML = '<span class="trend-icon">▲</span><span class="trend-value">Based on avg</span>';
        drawHeroSparkline();
        return;
    }

    const forecast = sessionPrediction.prediction.expected;
    const allPnL = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length;
    const trendPct = ((forecast - allPnL) / Math.abs(allPnL)) * 100;

    // Update value
    forecastValueEl.textContent = '$' + forecast.toFixed(0);

    // Update trend
    const trendIcon = trendPct >= 0 ? '▲' : '▼';
    const trendClass = trendPct >= 0 ? 'positive' : 'negative';
    forecastTrendEl.className = 'metric-trend ' + trendClass;
    forecastTrendEl.innerHTML = '<span class="trend-icon">' + trendIcon + '</span><span class="trend-value">' + Math.abs(trendPct).toFixed(0) + '% vs avg</span>';

    // Draw sparkline
    drawHeroSparkline();
}

/**
 * Draw sparkline chart for recent performance
 */
function drawHeroSparkline() {
    const canvas = document.getElementById('heroSparkline');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get last 10 days data
    const dailyPnL = {};
    trades.forEach(trade => {
        if (!dailyPnL[trade.date]) dailyPnL[trade.date] = 0;
        dailyPnL[trade.date] += trade.pnl;
    });

    const sortedDates = Object.keys(dailyPnL).sort();
    const last10Dates = sortedDates.slice(-10);
    const values = last10Dates.map(date => dailyPnL[date]);

    if (values.length < 2) return;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    values.forEach((value, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 10) - 5;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    values.forEach((value, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 10) - 5;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = value >= 0 ? '#10b981' : '#ef4444';
        ctx.fill();
    });
}

/**
 * Animate number counter
 */
function animateValue(element, start, end, duration) {
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

/**
 * Trigger full analysis
 */
function triggerAnalysis() {
    updateAlgorithmicAnalysis();
    updateHeroDashboard();
    showToast(currentLanguage === 'ko' ? '분석 완료!' : 'Analysis complete!');
}

/**
 * Show prediction details
 */
function showPredictionDetails() {
    // Scroll to predictive risk score section
    const section = document.getElementById('predictiveRiskScore');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        section.style.animation = 'highlight-flash 1s ease';
        setTimeout(() => {
            section.style.animation = '';
        }, 1000);
    }
}

/**
 * Export analysis report
 */
function exportAnalysisReport() {
    const report = {
        generated: new Date().toISOString(),
        quality: {
            score: document.getElementById('heroQualityScore').textContent,
            trend: document.getElementById('heroQualityTrend').textContent
        },
        prediction: {
            probability: document.getElementById('heroWinProbability').textContent,
            recommendation: document.getElementById('heroRecommendation').textContent,
            confidence: document.getElementById('heroConfidence').textContent
        },
        forecast: {
            value: document.getElementById('heroForecastValue').textContent,
            trend: document.getElementById('heroForecastTrend').textContent
        }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trading-analysis-' + formatTradingDate(new Date()) + '.json';
    link.click();
    URL.revokeObjectURL(url);

    showToast(currentLanguage === 'ko' ? '리포트 내보내기 완료!' : 'Report exported!');
}

// Add highlight flash animation
if (!document.getElementById('hero-animations-style')) {
    const style = document.createElement('style');
    style.id = 'hero-animations-style';
    style.textContent = `
    @keyframes highlight-flash {
        0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
    }
    `;
    document.head.appendChild(style);
}
