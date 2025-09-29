/* ======================
   섹션/입력 관련
   ====================== */
function showPsychologySection(section) {
    try {
        // 탭 활성화 관리 (event가 존재하면 클릭으로 들어온 경우에도 동작)
        document.querySelectorAll('.psychology-tab').forEach(tab => tab.classList.remove('active'));
        if (typeof event !== 'undefined' && event && event.target) {
            event.target.classList.add('active');
        } else {
            const tabToActivate = document.querySelector(`.psychology-tab[data-section="${section}"]`);
            if (tabToActivate) tabToActivate.classList.add('active');
        }

        // 섹션 표시/숨기기
        document.querySelectorAll('.psychology-section').forEach(sec => sec.classList.remove('active'));

        let targetSectionId;
        switch (section) {
            case 'input': targetSectionId = 'psychologyInputSection'; break;
            case 'metrics': targetSectionId = 'psychologyMetricsSection'; break;
            case 'bias-analysis': targetSectionId = 'psychologyBiasSection'; break;
            case 'patterns': targetSectionId = 'psychologyPatternsSection'; break;
            default: targetSectionId = 'psychologyInputSection';
        }

        const targetSection = _el(targetSectionId);
        if (targetSection) targetSection.classList.add('active');

        // 섹션별 업데이트
        if (section === 'metrics') updatePsychologyMetrics();
        else if (section === 'bias-analysis') updateBiasAnalysis();
        else if (section === 'patterns') updatePatternInsights();
        else if (section === 'input') {
            setTimeout(() => updateVisualCards(), 100);
        }
    } catch (err) {
        console.error('showPsychologySection error:', err);
    }
}

/* ======================
   저장/불러오기/초기화
   ====================== */
function loadPsychologyData() {
    try {
        const saved = localStorage.getItem('tradingPlatformPsychologyData');
        if (saved) psychologyData = JSON.parse(saved);
        else psychologyData = {};
    } catch (err) {
        console.error('Error loading psychology data:', err);
        psychologyData = {};
    }

    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];

    if (todayData) {
        const safeUpdate = (id, value) => {
            const el = _el(id);
            if (el) el.value = value;
        };

        safeUpdate('sleepHours', todayData.sleepHours || '');
        safeUpdate('startTime', todayData.startTime || '09:30');
        safeUpdate('endTime', todayData.endTime || '');
        safeUpdate('environmentType', todayData.environmentType || 'home');
        safeUpdate('accountBalance', todayData.accountBalance || '');
        safeUpdate('dailyTarget', todayData.dailyTarget || '');
        safeUpdate('maxDailyLoss', todayData.maxDailyLoss || '');
        safeUpdate('stressLevel', todayData.stressLevel || 3);
        safeUpdate('confidenceLevel', todayData.confidenceLevel || 3);
        safeUpdate('focusLevel', todayData.focusLevel || 3);

        setTimeout(() => updateVisualCards(), 200);
    } else {
        setTimeout(() => createPsychologyChart(), 200);
    }
}

function savePsychologyData() {
    try {
        const currentDate = formatTradingDate(currentTradingDate);
        if (!psychologyData) psychologyData = {};

        // 안전하게 입력값 읽기
        const read = id => {
            const el = _el(id);
            if (!el) return null;
            if (el.type === 'number') return parseFloat(el.value) || 0;
            return el.value;
        };

        const sleepHours = parseFloat(read('sleepHours')) || 0;
        const startTime = read('startTime') || '';
        const endTime = read('endTime') || '';
        const environmentType = read('environmentType') || 'home';
        const accountBalance = parseFloat(read('accountBalance')) || 0;
        const dailyTarget = parseFloat(read('dailyTarget')) || 0;
        const maxDailyLoss = parseFloat(read('maxDailyLoss')) || 0;
        const stressLevel = parseInt(read('stressLevel')) || 3;
        const confidenceLevel = parseInt(read('confidenceLevel')) || 3;
        const focusLevel = parseInt(read('focusLevel')) || 3;
        const plannedTrades = parseInt(read('plannedTrades')) || 0;
        const predictedWinRate = parseFloat(read('predictedWinRate')) || 0;

        psychologyData[currentDate] = {
            date: currentDate,
            sleepHours,
            startTime,
            endTime,
            environmentType,
            accountBalance,
            dailyTarget,
            maxDailyLoss,
            stressLevel,
            confidenceLevel,
            focusLevel,
            plannedTrades,
            predictedWinRate
        };

        localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
        showToast(currentLanguage === 'ko' ? '심리 데이터가 저장되었습니다' : 'Psychology data saved');
        updatePsychologyMetrics();
    } catch (err) {
        console.error('savePsychologyData error:', err);
        alert(currentLanguage === 'ko' ? '저장 중 오류가 발생했습니다' : 'Save error');
    }
}

function resetPsychologyData() {
    if (!confirm(currentLanguage === 'ko' ? '심리 데이터를 초기화 하시겠습니까?' : 'Reset psychology data?')) return;
    const currentDate = formatTradingDate(currentTradingDate);
    if (psychologyData && psychologyData[currentDate]) {
        delete psychologyData[currentDate];
        localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
    }
    loadPsychologyData();
    updatePsychologyMetrics();
    showToast(currentLanguage === 'ko' ? '심리 데이터 초기화 완료' : 'Psychology data reset');
}

/* ======================
   핵심 지표 계산 / 업데이트
   ====================== */
function calculateDailyScore() {
    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];

    if (!todayData) {
        alert(currentLanguage === 'ko' ? '먼저 심리 데이터를 입력해주세요.' : 'Please input psychology data first.');
        return;
    }

    const sleepFactor = calculateSleepFactor(todayData.sleepHours);
    const stressFactor = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
    const disciplineFactor = calculateDisciplineFactor();
    const consistencyFactor = calculateConsistencyFactor();

    const totalScore = sleepFactor + stressFactor + disciplineFactor + consistencyFactor;

    updateMetricCard('sleepFactorCard', 'sleepFactorScore', 'sleepFactorStatus', sleepFactor, 25);
    updateMetricCard('stressFactorCard', 'stressFactorScore', 'stressFactorStatus', stressFactor, 25);
    updateMetricCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', disciplineFactor, 25);
    updateMetricCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistencyFactor, 25);
    updateMetricCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', totalScore, 100);

    showToast(currentLanguage === 'ko' ? '일일 심리 점수가 계산되었습니다' : 'Daily psychology score calculated');
}

function updatePsychologyMetrics() {
    try {
        // sleep/stress/emotional/risk 카드 업데이트
        updateVisualCards();

        // 규율, 일관성 점수 업데이트 (거래 기반 계산)
        const discipline = calculateDisciplineFactor();
        const consistency = calculateConsistencyFactor();

        updateMetricCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', discipline, 25);
        updateMetricCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistency, 25);

        // 총합(0-100)
        const currentDate = formatTradingDate(currentTradingDate);
        const today = psychologyData[currentDate] || {};
        const sleepFactor = calculateSleepFactor(today.sleepHours || 0);
        const stressFactor = calculateStressFactor(today.sleepHours || 0, today.stressLevel || 3, today.focusLevel || 3);
        const dailyScore = sleepFactor + stressFactor + discipline + consistency;
        updateMetricCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', dailyScore, 100);

        // 인사이트 생성
        if (_el('psychologyInsightsList')) generatePsychologyInsights();
    } catch (err) {
        console.error('updatePsychologyMetrics error:', err);
    }
}

/* ---------- 세부 산식(심리 요인들) ---------- */

function calculateSleepFactor(sleepHours) {
    if (!sleepHours || sleepHours <= 0) return 0;
    // 0-25점
    if (sleepHours >= 8) return 25;
    if (sleepHours >= 7) return 22;
    if (sleepHours >= 6) return 17;
    if (sleepHours >= 5) return 10;
    return 5;
}

function calculateStressFactor(sleepHours = 0, stressLevel = 3, focusLevel = 3) {
    // stressLevel: 1(낮음)~5(높음), focusLevel: 1~5
    // 0-25점 기준으로 계산
    let base = 25;
    // 수면이 부족하면 스트레스 영향 가중
    if (sleepHours && sleepHours < 6) base -= 6;
    // stressLevel이 높으면 감점
    base -= (stressLevel - 3) * 3;
    // 집중력이 낮으면 감점
    base -= (3 - focusLevel) * 2;
    return Math.max(0, Math.min(25, base));
}

function calculateDisciplineFactor() {
    // 거래내용 기반 규율 지표 (0-25)
    // 예: 손절 실행률, 계획 대비 실제 거래수, 포지션 관리 등
    try {
        if (!trades || trades.length === 0) return 10;

        // 손절 실행률: 최근 50거래에서 stop-loss 관련 로직이 있다 가정(데이터에 stop info가 없다면 간단히 사용)
        const recent = trades.slice(-50);
        const executedStopCount = recent.filter(t => t.stopExecuted).length || 0;
        const stopModifications = recent.filter(t => t.stopModified).length || 0;

        // 계획 대비 거래수: 오늘 계획 대비 초과거래 여부 -> 감점
        const overtrading = detectOvertrading();
        let score = 15;
        score += Math.min(5, executedStopCount * 0.1 * 5); // 대략적 보정
        score -= Math.min(8, Math.abs(overtrading) * 0.05);

        // 포지션 사이즈 편차가 크면 감점
        const sizes = recent.map(t => t.amount || 0).filter(v => v > 0);
        if (sizes.length > 0) {
            const avg = sizes.reduce((a,b) => a+b,0) / sizes.length;
            const std = calculateStandardDeviation(sizes);
            const rel = std / (avg || 1);
            if (rel > 0.4) score -= 3;
            else if (rel > 0.25) score -= 1;
        }

        return Math.max(0, Math.min(25, score));
    } catch (err) {
        console.error('calculateDisciplineFactor error:', err);
        return 10;
    }
}

function calculateConsistencyFactor() {
    // 일관성: 승률/보유시간/포지션 일관성 등으로 산정 (0-25)
    try {
        if (!trades || trades.length === 0) return 10;
        const recent = trades.slice(-60);
        const wins = recent.filter(t => t.pnl > 0).length;
        const wlRate = (wins / recent.length) * 100;
        let score = 10;
        if (wlRate >= 60) score = 20;
        else if (wlRate >= 50) score = 15;
        else if (wlRate >= 40) score = 12;
        else score = 8;

        // 연속 패배 발생 시 페널티
        const consecLoss = (() => {
            let cur = 0, max = 0;
            for (let t of recent) {
                if (t.pnl < 0) { cur++; if (cur > max) max = cur; }
                else cur = 0;
            }
            return max;
        })();
        if (consecLoss >= 3) score -= 3;
        if (consecLoss >= 5) score -= 5;

        return Math.max(0, Math.min(25, score));
    } catch (err) {
        console.error('calculateConsistencyFactor error:', err);
        return 10;
    }
}

function calculateStandardDeviation(arr) {
    if (!arr || arr.length === 0) return 0;
    const mean = arr.reduce((a,b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length);
}

/* ======================
   카드/시각화 업데이트
   ====================== */
function updateMetricCard(cardId, valueId, statusId, value, maxValue) {
    const card = _el(cardId);
    const valueElement = _el(valueId);
    const statusElement = _el(statusId);
    if (!valueElement || !statusElement) return;

    valueElement.textContent = Math.round(value);
    const percentage = (value / maxValue) * 100;
    let status = '', cardClass = '';

    if (percentage >= 80) { status = currentLanguage === 'ko' ? '최적' : 'Optimal'; cardClass = 'good'; }
    else if (percentage >= 60) { status = currentLanguage === 'ko' ? '양호' : 'Good'; cardClass = 'good'; }
    else if (percentage >= 40) { status = currentLanguage === 'ko' ? '보통' : 'Fair'; cardClass = 'warning'; }
    else if (percentage >= 20) { status = currentLanguage === 'ko' ? '주의' : 'Poor'; cardClass = 'warning'; }
    else { status = currentLanguage === 'ko' ? '위험' : 'Critical'; cardClass = 'danger'; }

    statusElement.textContent = status;
    if (card) {
        card.className = `psychology-metric-card ${cardClass}`;
        card.style.borderColor = cardClass === 'good' ? '#10b981' : cardClass === 'warning' ? '#f59e0b' : '#ef4444';
    }
}

function updateVisualCards() {
    updateSleepCard();
    updateEnvironmentCard();
    updateEmotionalCard();
    updateRiskCard();
    // 갱신 후 차트도 업데이트
    createPsychologyChart();
}

function updateSleepCard() {
    const sleep = parseFloat(_el('sleepHours')?.value) || 0;
    if (_el('sleepHoursDisplay')) _el('sleepHoursDisplay').textContent = `${sleep}h`;
}

function updateEnvironmentCard() {
    const env = _el('environmentType')?.value || 'home';
    if (_el('environmentDisplay')) _el('environmentDisplay').textContent = env;
}

function updateEmotionalCard() {
    const stress = parseInt(_el('stressLevel')?.value) || 3;
    const confidence = parseInt(_el('confidenceLevel')?.value) || 3;
    const focus = parseInt(_el('focusLevel')?.value) || 3;

    if (_el('stressDisplay')) _el('stressDisplay').textContent = stress;
    if (_el('confidenceDisplay')) _el('confidenceDisplay').textContent = confidence;
    if (_el('focusDisplay')) _el('focusDisplay').textContent = focus;

    const stressScore = (6 - stress) * 20;
    const confidenceScore = confidence * 20;
    const focusScore = focus * 20;
    const avg = (stressScore + confidenceScore + focusScore) / 3;

    let status = 'Balanced';
    if (avg >= 80) status = 'Excellent readiness';
    else if (avg >= 60) status = 'Good readiness';
    else if (avg >= 40) status = 'Fair readiness';
    else status = 'Poor readiness';

    if (_el('emotionalStatus')) _el('emotionalStatus').textContent = status;
}

function updateRiskCard() {
    const balance = parseFloat(_el('accountBalance')?.value) || 0;
    const target = parseFloat(_el('dailyTarget')?.value) || 0;
    const maxLoss = parseFloat(_el('maxDailyLoss')?.value) || 0;

    if (! _el('targetRiskPercent')) return;

    if (balance > 0) {
        const targetPercent = (target / balance * 100);
        const lossPercent = (maxLoss / balance * 100);
        _el('targetRiskPercent').textContent = `${targetPercent.toFixed(1)}%`;
        _el('maxLossRiskPercent').textContent = `${lossPercent.toFixed(1)}%`;
        _el('targetRiskBar').style.width = `${Math.min(targetPercent * 10, 100)}%`;
        _el('maxLossRiskBar').style.width = `${Math.min(lossPercent * 10, 100)}%`;

        let status = 'Conservative';
        if (targetPercent > 5 || lossPercent > 10) status = 'High risk';
        else if (targetPercent > 3 || lossPercent > 5) status = 'Moderate risk';
        else if (targetPercent > 1 || lossPercent > 2) status = 'Low risk';
        _el('riskStatus').textContent = status;
    } else {
        _el('targetRiskPercent').textContent = '0%';
        _el('maxLossRiskPercent').textContent = '0%';
        _el('targetRiskBar').style.width = '0%';
        _el('maxLossRiskBar').style.width = '0%';
        _el('riskStatus').textContent = 'No data';
    }
}

/* ======================
   편향 분석 (Bias analysis)
   ====================== */
function updateBiasAnalysis() {
    calculateOverconfidenceBias();
    calculateLossAversionBias();
    calculateAnchoringBias();
    calculateOverallBiasRisk();
}

function calculateOverconfidenceBias() {
    const recentTrades = trades.slice(-50);
    if (recentTrades.length === 0) return;

    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];

    if (todayData && todayData.predictedWinRate) {
        const actualWinRate = (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100;
        const calibrationError = Math.abs(todayData.predictedWinRate - actualWinRate);
        if (_el('calibrationError')) _el('calibrationError').textContent = `${calibrationError.toFixed(1)}%`;
        if (_el('calibrationErrorBar')) {
            _el('calibrationErrorBar').style.width = `${Math.min(calibrationError * 5, 100)}%`;
            _el('calibrationErrorBar').style.backgroundColor = calibrationError > 20 ? '#ef4444' : calibrationError > 10 ? '#f59e0b' : '#10b981';
        }
    }

    if (todayData && todayData.plannedTrades) {
        const actualTrades = recentTrades.filter(t => t.date === currentDate).length;
        const overtradingIndex = ((actualTrades - todayData.plannedTrades) / Math.max(1, todayData.plannedTrades)) * 100;
        if (_el('overtradingIndex')) _el('overtradingIndex').textContent = `${overtradingIndex.toFixed(0)}%`;
        if (_el('overtradingBar')) {
            _el('overtradingBar').style.width = `${Math.min(Math.abs(overtradingIndex), 100)}%`;
            _el('overtradingBar').style.backgroundColor = Math.abs(overtradingIndex) > 50 ? '#ef4444' : '#f59e0b';
        }
    }

    const positionSizes = recentTrades.map(trade => trade.amount || 0).filter(v => v > 0);
    if (positionSizes.length > 0) {
        const avgPosition = positionSizes.reduce((a,b) => a+b,0) / positionSizes.length;
        const deviation = calculateStandardDeviation(positionSizes) / (avgPosition || 1);
        if (_el('positionDeviation')) _el('positionDeviation').textContent = deviation.toFixed(2);
        if (_el('positionDeviationBar')) {
            _el('positionDeviationBar').style.width = `${Math.min(deviation * 200, 100)}%`;
            _el('positionDeviationBar').style.backgroundColor = deviation > 0.3 ? '#ef4444' : '#3b82f6';
        }
    }
}

function calculateLossAversionBias() {
    const recentTrades = trades.slice(-50);
    if (recentTrades.length === 0) return;

    const winningTrades = recentTrades.filter(t => t.pnl > 0);
    const losingTrades = recentTrades.filter(t => t.pnl < 0);

    const winningHoldTimes = winningTrades.filter(t => t.holdingTime).map(t => parseInt((t.holdingTime||'0').replace('m','')) || 0);
    const losingHoldTimes = losingTrades.filter(t => t.holdingTime).map(t => parseInt((t.holdingTime||'0').replace('m','')) || 0);

    if (winningHoldTimes.length > 0 && losingHoldTimes.length > 0) {
        const avgWinHold = winningHoldTimes.reduce((a,b) => a+b,0) / winningHoldTimes.length;
        const avgLoseHold = losingHoldTimes.reduce((a,b) => a+b,0) / losingHoldTimes.length;
        const dispositionRatio = avgLoseHold / (avgWinHold || 1);
        if (_el('dispositionRatio')) _el('dispositionRatio').textContent = dispositionRatio.toFixed(2);
        if (_el('dispositionRatioBar')) {
            _el('dispositionRatioBar').style.width = `${Math.min(dispositionRatio * 50, 100)}%`;
            _el('dispositionRatioBar').style.backgroundColor = dispositionRatio > 1.5 ? '#ef4444' : '#3b82f6';
        }
    }
}

function calculateAnchoringBias() {
    // 진입가 의존도, 라운드 넘버 편향 등을 단순히 계산
    const recentTrades = trades.slice(-100);
    if (recentTrades.length === 0) return;

    // round number bias: 진입가나 청산가가 0 또는 5 단위인지 체크
    const roundHits = recentTrades.filter(t => {
        const p = t.buyPrice || 0;
        return Math.abs(p - Math.round(p / 5) * 5) < 0.001;
    }).length;
    const roundBias = (roundHits / recentTrades.length) * 100;
    if (_el('roundNumberBias')) _el('roundNumberBias').textContent = roundBias.toFixed(1);
    if (_el('roundNumberBiasBar')) {
        _el('roundNumberBiasBar').style.width = `${Math.min(roundBias, 100)}%`;
        _el('roundNumberBiasBar').style.backgroundColor = roundBias > 30 ? '#ef4444' : '#3b82f6';
    }

    // 최근 고점/저점 앵커 감지(간단)
    const recentHighAnchors = recentTrades.slice(-20).filter(t => t.buyPrice && t.buyPrice > 0).length;
    if (_el('recentHighAnchor')) _el('recentHighAnchor').textContent = recentHighAnchors;
}

function calculateOverallBiasRisk() {
    let overconfidenceScore = 0, lossAversionScore = 0, anchoringScore = 0;

    const calibrationErrorText = _el('calibrationError')?.textContent || '0';
    const calibrationError = parseFloat(calibrationErrorText) || 0;
    const overtradingIndexText = _el('overtradingIndex')?.textContent?.replace('%','') || '0';
    const overtradingIndex = Math.abs(parseFloat(overtradingIndexText)) || 0;
    const positionDeviation = parseFloat(_el('positionDeviation')?.textContent) || 0;

    overconfidenceScore = Math.min(100, (calibrationError * 2) + (overtradingIndex * 0.5) + (positionDeviation * 100));

    const dispositionRatio = parseFloat(_el('dispositionRatio')?.textContent) || 1;
    lossAversionScore = Math.min(100, Math.max(0, (dispositionRatio - 1) * 50));

    const roundNumberBias = parseFloat(_el('roundNumberBias')?.textContent) || 0;
    anchoringScore = Math.min(100, roundNumberBias * 1.5);

    const overallScore = (overconfidenceScore + lossAversionScore + anchoringScore) / 3;

    let riskLevel = '', riskColor = '#10b981';
    if (overallScore < 20) { riskLevel = currentLanguage === 'ko' ? '낮음' : 'Low'; riskColor = '#10b981'; }
    else if (overallScore < 50) { riskLevel = currentLanguage === 'ko' ? '보통' : 'Medium'; riskColor = '#f59e0b'; }
    else { riskLevel = currentLanguage === 'ko' ? '높음' : 'High'; riskColor = '#ef4444'; }

    if (_el('overallBiasRisk')) { _el('overallBiasRisk').textContent = riskLevel; _el('overallBiasRisk').style.color = riskColor; }
    if (_el('overallBiasScore')) _el('overallBiasScore').textContent = `Score: ${overallScore.toFixed(0)}/100`;

    let actionNeeded = '', actionDetails = '';
    if (overallScore > 70) { actionNeeded = currentLanguage === 'ko' ? '즉시 조치' : 'Immediate Action'; actionDetails = currentLanguage === 'ko' ? '편향 위험 높음' : 'High bias risk'; }
    else if (overallScore > 40) { actionNeeded = currentLanguage === 'ko' ? '주의 필요' : 'Caution Needed'; actionDetails = currentLanguage === 'ko' ? '일부 편향 감지' : 'Some bias detected'; }
    else { actionNeeded = currentLanguage === 'ko' ? '없음' : 'None'; actionDetails = currentLanguage === 'ko' ? '모든 지표 정상' : 'All metrics normal'; }

    if (_el('actionNeeded')) { _el('actionNeeded').textContent = actionNeeded; _el('actionNeeded').style.color = overallScore > 70 ? '#ef4444' : overallScore > 40 ? '#f59e0b' : '#10b981'; }
    if (_el('actionDetails')) _el('actionDetails').textContent = actionDetails;
}

/* ======================
   패턴 분석 / 인사이트
   ====================== */
function updatePatternInsights() {
    try {
        const sleepPerf = analyzeSleepPerformance();
        if (_el('sleepPerformanceCorrelation')) _el('sleepPerformanceCorrelation').textContent = sleepPerf.correlation !== null ? sleepPerf.correlation.toFixed(2) : 'N/A';

        const overtr = detectOvertrading();
        if (_el('overtradingSummary')) _el('overtradingSummary').textContent = `${overtr.toFixed(1)}%`;

        const timeOpt = getTimeOptimization();
        if (timeOpt && _el('bestHour')) _el('bestHour').textContent = `${timeOpt.bestHour} (${timeOpt.winRate.toFixed(1)}%)`; 
        else if (_el('bestHour')) _el('bestHour').textContent = 'N/A';

        const consec = getConsecutiveLossPattern();
        if (_el('after3LossesWinRate')) _el('after3LossesWinRate').textContent = consec ? `${consec.after3Losses.toFixed(1)}%` : 'N/A';

        // 렌더 인사이트 (간단 버전)
        generatePsychologyInsights();
    } catch (err) {
        console.error('updatePatternInsights error:', err);
    }
}

function analyzeSleepPerformance() {
    const dataPoints = [];
    Object.values(psychologyData || {}).forEach(dayData => {
        if (dayData.sleepHours) {
            const dayTrades = trades.filter(tr => tr.date === dayData.date);
            if (dayTrades.length > 0) {
                const dayPnL = dayTrades.reduce((s, t) => s + (t.pnl || 0), 0);
                dataPoints.push({ sleep: dayData.sleepHours, performance: dayPnL });
            }
        }
    });

    if (dataPoints.length < 5) return { correlation: null };

    const n = dataPoints.length;
    const sumSleep = dataPoints.reduce((s, p) => s + p.sleep, 0);
    const sumPerf = dataPoints.reduce((s, p) => s + p.performance, 0);
    const sumSleepSq = dataPoints.reduce((s, p) => s + p.sleep * p.sleep, 0);
    const sumPerfSq = dataPoints.reduce((s, p) => s + p.performance * p.performance, 0);
    const sumSleepPerf = dataPoints.reduce((s, p) => s + p.sleep * p.performance, 0);

    const numerator = n * sumSleepPerf - sumSleep * sumPerf;
    const denominator = Math.sqrt((n * sumSleepSq - sumSleep * sumSleep) * (n * sumPerfSq - sumPerf * sumPerf));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return { correlation };
}

function detectOvertrading() {
    const today = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[today];
    if (!todayData || !todayData.plannedTrades) return 0;
    const actualTrades = trades.filter(tr => tr.date === today).length;
    return ((actualTrades - todayData.plannedTrades) / Math.max(1, todayData.plannedTrades)) * 100;
}

function getTimeOptimization() {
    const hourlyStats = {};
    trades.forEach(tr => {
        if (tr.entryTime) {
            const hour = parseInt(tr.entryTime.split(':')[0]);
            if (!hourlyStats[hour]) hourlyStats[hour] = { wins: 0, total: 0 };
            hourlyStats[hour].total++;
            if (tr.pnl > 0) hourlyStats[hour].wins++;
        }
    });

    let bestHour = null, bestWinRate = 0;
    Object.entries(hourlyStats).forEach(([hour, stats]) => {
        if (stats.total >= 5) {
            const winRate = (stats.wins / stats.total) * 100;
            if (winRate > bestWinRate) { bestWinRate = winRate; bestHour = parseInt(hour); }
        }
    });

    return bestHour ? { bestHour, winRate: bestWinRate } : null;
}

function getConsecutiveLossPattern() {
    const sorted = [...trades].sort((a,b) => new Date(a.date + ' ' + (a.entryTime||'00:00')) - new Date(b.date + ' ' + (b.entryTime||'00:00')));
    const after3 = [];
    for (let i = 3; i < sorted.length; i++) {
        if (sorted[i-1].pnl < 0 && sorted[i-2].pnl < 0 && sorted[i-3].pnl < 0) after3.push(sorted[i].pnl > 0 ? 1 : 0);
    }
    if (after3.length === 0) return null;
    const winRate = (after3.reduce((s,v) => s + v, 0) / after3.length) * 100;
    return { after3Losses: winRate };
}

/* 간단 인사이트 렌더러 */
function getInsightColor(type) {
    switch(type) {
        case 'good': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'danger': return '#ef4444';
        default: return '#3b82f6';
    }
}

function generatePsychologyInsights() {
    const insights = [];
    const currentDate = formatTradingDate(currentTradingDate);
    const today = psychologyData[currentDate] || {};

    // 예시 규칙형 인사이트
    if (today.sleepHours && today.sleepHours < 6) {
        insights.push({ type: 'warning', text: currentLanguage === 'ko' ? '수면 부족: 주의하세요. 수면이 6시간 미만입니다.' : 'Low sleep: be careful.' });
    }
    const overtr = detectOvertrading();
    if (Math.abs(overtr) > 30) insights.push({ type: 'danger', text: currentLanguage === 'ko' ? '계획 대비 과다거래 위험' : 'Overtrading risk' });

    const timeOpt = getTimeOptimization();
    if (timeOpt) insights.push({ type: 'good', text: currentLanguage === 'ko' ? `성공 확률이 높은 시간대: ${timeOpt.bestHour}시, 승률 ${timeOpt.winRate.toFixed(1)}%` : `Best hour: ${timeOpt.bestHour}, winrate ${timeOpt.winRate.toFixed(1)}%` });

    if (insights.length === 0) {
        insights.push({ type: 'good', text: currentLanguage === 'ko' ? '심리적 준비 상태 양호. 계획대로 거래하세요.' : 'Psychological readiness fair.' });
    }

    const listEl = _el('psychologyInsightsList');
    if (listEl) {
        listEl.innerHTML = insights.map(i => `<div class="psychology-insight-item ${i.type === 'danger' ? 'danger' : i.type === 'warning' ? 'warning' : ''}"><div class="psychology-insight-text">${i.text}</div></div>`).join('');
    }
}

/* ======================
   심리 차트 생성
   ====================== */
async function createPsychologyChart() {
    try {
        await waitForChart();

        const ctx = _el('psychologyPerformanceChart');
        if (!ctx) { console.warn('psychology chart canvas not found'); return; }

        if (window.psychologyChart && typeof window.psychologyChart.destroy === 'function') {
            try { window.psychologyChart.destroy(); window.psychologyChart = null; } catch(e){ console.warn('chart destroy err', e); }
        }

        const chartData = preparePsychologyChartData();
        if (!chartData || (chartData.sleepData.length === 0 && chartData.stressData.length === 0 && chartData.focusData.length === 0)) {
            const parent = ctx.parentElement;
            if (parent) parent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;color:#64748b;font-size:14px;">${currentLanguage === 'ko' ? '심리 데이터와 거래 기록을 수집하여 차트를 생성하세요' : 'Collect psychology data and trading records to generate chart'}</div>`;
            return;
        }

        const chartConfig = {
            type: 'scatter',
            data: { datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'point' },
                plugins: {
                    legend: { position: 'top', labels: { color: '#e4e4e7', usePointStyle: true, padding: 20 } },
                    tooltip: {
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        titleColor: '#e4e4e7', bodyColor: '#e4e4e7',
                        borderColor: '#334155', borderWidth: 1,
                        callbacks: {
                            title: ctx => ctx[0].dataset.label,
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const d = context.raw || {};
                                return `${label}: x=${d.x}, y=${d.y} (${d.date || ''})`;
                            }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: currentLanguage === 'ko' ? 'Factor' : 'Factor' }, ticks: { color: '#cbd5e1' } },
                    y: { title: { display: true, text: currentLanguage === 'ko' ? 'Win Rate (%)' : 'Win Rate (%)' }, ticks: { color: '#cbd5e1' } }
                }
            }
        };

        if (chartData.sleepData.length > 0) {
            chartConfig.data.datasets.push({
                label: currentLanguage === 'ko' ? '수면 vs 성과' : 'Sleep vs Performance',
                data: chartData.sleepData,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        }
        if (chartData.stressData.length > 0) {
            chartConfig.data.datasets.push({
                label: currentLanguage === 'ko' ? '스트레스 vs 성과' : 'Stress vs Performance',
                data: chartData.stressData,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        }
        if (chartData.focusData.length > 0) {
            chartConfig.data.datasets.push({
                label: currentLanguage === 'ko' ? '집중력 vs 성과' : 'Focus vs Performance',
                data: chartData.focusData,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
            });
        }

        window.psychologyChart = new Chart(ctx, chartConfig);
    } catch (err) {
        console.error('createPsychologyChart error:', err);
        const ctx = _el('psychologyPerformanceChart');
        if (ctx && ctx.parentElement) ctx.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;color:#ef4444;font-size:14px;">${currentLanguage === 'ko' ? '차트 생성 중 오류가 발생했습니다' : 'Error creating chart'}</div>`;
    }
}

function preparePsychologyChartData() {
    try {
        const sleepData = [], stressData = [], focusData = [];
        if (!psychologyData || typeof psychologyData !== 'object') return { sleepData, stressData, focusData };

        Object.entries(psychologyData).forEach(([date, psy]) => {
            if (!psy || typeof psy !== 'object') return;
            const dayTrades = trades.filter(t => t && t.date === date);
            if (dayTrades.length === 0) return;
            const winRate = dayTrades.length > 0 ? (dayTrades.filter(t => t.pnl > 0).length / dayTrades.length * 100) : 0;

            if (psy.sleepHours && typeof psy.sleepHours === 'number' && psy.sleepHours > 0) {
                sleepData.push({ x: psy.sleepHours, y: winRate, date });
            }
            if (psy.stressLevel && typeof psy.stressLevel === 'number') {
                stressData.push({ x: psy.stressLevel, y: winRate, date });
            }
            if (psy.focusLevel && typeof psy.focusLevel === 'number') {
                focusData.push({ x: psy.focusLevel, y: winRate, date });
            }
        });

        return { sleepData, stressData, focusData };
    } catch (err) {
        console.error('preparePsychologyChartData error:', err);
        return { sleepData: [], stressData: [], focusData: [] };
    }
}

// psychology.js 파일 맨 아래에 추가
function updateSliderDisplay(sliderId, displayId) {
    const slider = _el(sliderId);
    const display = _el(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
}

function updateTargetPercentages() {
    const balance = parseFloat(_el('accountBalance')?.value) || 0;
    const target = parseFloat(_el('dailyTarget')?.value) || 0;
    const maxLoss = parseFloat(_el('maxDailyLoss')?.value) || 0;
    
    if (balance > 0) {
        const targetPercent = _el('dailyTargetPercent');
        const lossPercent = _el('maxLossPercent');
        
        if (targetPercent) targetPercent.textContent = `${(target / balance * 100).toFixed(1)}%`;
        if (lossPercent) lossPercent.textContent = `${(maxLoss / balance * 100).toFixed(1)}%`;
    }
}
