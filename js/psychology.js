// Psychology Section Management
function showPsychologySection(section) {
    try {
        // 탭 상태 업데이트
        document.querySelectorAll('.psychology-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // 섹션 표시/숨기기
        document.querySelectorAll('.psychology-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        // 섹션 ID 매핑
        let targetSectionId;
        switch(section) {
            case 'input':
                targetSectionId = 'psychologyInputSection';
                break;
            case 'metrics':
                targetSectionId = 'psychologyMetricsSection';
                break;
            case 'bias-analysis':
                targetSectionId = 'psychologyBiasSection';
                break;
            case 'patterns':
                targetSectionId = 'psychologyPatternsSection';
                break;
            default:
                targetSectionId = 'psychologyInputSection';
        }
        
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 해당 섹션의 데이터 업데이트
        if (section === 'metrics') {
            updatePsychologyMetrics();
        } else if (section === 'bias-analysis') {
            updateBiasAnalysis();
        } else if (section === 'patterns') {
            updatePatternInsights();
        }

        if (section === 'input') {
            setTimeout(() => {
                updateVisualCards();
            }, 100);
        }
    } catch (error) {
        console.error('Error showing psychology section:', error);
    }
}

// Psychology Data Management
function savePsychologyData() {
    try {
        const currentDate = formatTradingDate(currentTradingDate);
        
        // 안전한 요소 접근을 위한 헬퍼 함수
        const getElementValue = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
                return defaultValue;
            }
            const value = parseFloat(element.value);
            return isNaN(value) ? defaultValue : value;
        };
        
        const getElementStringValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
                return defaultValue;
            }
            return element.value || defaultValue;
        };
        
        const data = {
            date: currentDate,
            timestamp: new Date().toISOString(),
            
            // Biological data
            sleepHours: getElementValue('sleepHours'),
            
            // Time & environment
            startTime: getElementStringValue('startTime', '09:30'),
            endTime: getElementStringValue('endTime'),
            environmentType: getElementStringValue('environmentType', 'home'),
            
            // Economic pressure
            accountBalance: getElementValue('accountBalance'),
            dailyTarget: getElementValue('dailyTarget'),
            maxDailyLoss: getElementValue('maxDailyLoss'),
            
            // Emotional state
            stressLevel: getElementValue('stressLevel', 3),
            confidenceLevel: getElementValue('confidenceLevel', 3),
            focusLevel: getElementValue('focusLevel', 3)
        };
        
        psychologyData[currentDate] = data;
        
        try {
            localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
        } catch (storageError) {
            console.error('Failed to save to localStorage:', storageError);
            alert(currentLanguage === 'ko' ? '데이터 저장 실패. 브라우저 저장 공간을 확인하세요.' : 'Failed to save data. Please check browser storage.');
            return;
        }
        
        updatePsychologyMetrics();
        generatePsychologyInsights();
        showToast(currentLanguage === 'ko' ? '심리 데이터가 저장되었습니다' : 'Psychology data saved');
    } catch (error) {
        console.error('Error saving psychology data:', error);
        alert(currentLanguage === 'ko' ? '데이터 저장 중 오류가 발생했습니다.' : 'Error occurred while saving data.');
    }
}

function resetPsychologyData() {
    const confirmMessage = currentLanguage === 'ko' ? 
        '심리 데이터를 초기화하시겠습니까?' : 
        'Are you sure you want to reset psychology data?';
    
    if (confirm(confirmMessage)) {
        // 모든 입력 필드 초기화
        document.getElementById('sleepHours').value = '';
        document.getElementById('startTime').value = '09:30';
        document.getElementById('endTime').value = '';
        document.getElementById('environmentType').value = 'home';
        document.getElementById('accountBalance').value = '';
        document.getElementById('dailyTarget').value = '';
        document.getElementById('maxDailyLoss').value = '';
        document.getElementById('stressLevel').value = '3';
        document.getElementById('confidenceLevel').value = '3';
        document.getElementById('focusLevel').value = '3';
        
        showToast(currentLanguage === 'ko' ? '심리 데이터가 초기화되었습니다' : 'Psychology data has been reset');
    }
}

function loadPsychologyData() {
    try {
        const saved = localStorage.getItem('tradingPlatformPsychologyData');
        if (saved) {
            psychologyData = JSON.parse(saved);
        } else {
            psychologyData = {};
        }
    } catch (error) {
        console.error('Error loading psychology data:', error);
        psychologyData = {};
    }

    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];

    if (todayData) {
        // 안전한 요소 업데이트
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        };

        updateElement('sleepHours', todayData.sleepHours || '');
        updateElement('startTime', todayData.startTime || '09:30');
        updateElement('endTime', todayData.endTime || '');
        updateElement('environmentType', todayData.environmentType || 'home');
        updateElement('accountBalance', todayData.accountBalance || '');
        updateElement('dailyTarget', todayData.dailyTarget || '');
        updateElement('maxDailyLoss', todayData.maxDailyLoss || '');
        updateElement('stressLevel', todayData.stressLevel || 3);
        updateElement('confidenceLevel', todayData.confidenceLevel || 3);
        updateElement('focusLevel', todayData.focusLevel || 3);

        // 차트 업데이트는 약간의 딜레이 후 실행
        setTimeout(() => {
            updateVisualCards();
        }, 200);
    } else {
        // 기본값으로 차트 생성
        setTimeout(() => {
            createPsychologyChart();
        }, 200);
    }
}

// Psychology Metrics Update
function updatePsychologyMetrics() {
    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];
    
    if (!todayData) {
        resetPsychologyMetrics();
        // generatePsychologyInsights 호출 전 요소 존재 확인
        if (document.getElementById('psychologyInsightsList')) {
            generatePsychologyInsights();
        }
        return;
    }
    
    // Calculate Sleep Factor (0-25 points)
    const sleepFactor = calculateSleepFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
    updateMetricCard('sleepFactorCard', 'sleepFactorScore', 'sleepFactorStatus', sleepFactor, 25);
    
    // Calculate Stress Factor (0-25 points)
    const stressFactor = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
    updateMetricCard('stressFactorCard', 'stressFactorScore', 'stressFactorStatus', stressFactor, 25);
    
    // Calculate Discipline Factor (0-25 points)
    const disciplineFactor = calculateDisciplineFactor();
    updateMetricCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', disciplineFactor, 25);
    
    // Calculate Consistency Factor (0-25 points)
    const consistencyFactor = calculateConsistencyFactor();
    updateMetricCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistencyFactor, 25);
    
    // Calculate Daily Psychology Score (0-100)
    const dailyScore = sleepFactor + stressFactor + disciplineFactor + consistencyFactor;
    updateMetricCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', dailyScore, 100);

    // generatePsychologyInsights 호출 전 요소 존재 확인
    if (document.getElementById('psychologyInsightsList')) {
        generatePsychologyInsights();
    }
}

function resetPsychologyMetrics() {
    // Reset all metric cards to default
    const metricCards = [
        { cardId: 'sleepFactorCard', scoreId: 'sleepFactorScore', statusId: 'sleepFactorStatus' },
        { cardId: 'stressFactorCard', scoreId: 'stressFactorScore', statusId: 'stressFactorStatus' },
        { cardId: 'disciplineFactorCard', scoreId: 'disciplineFactorScore', statusId: 'disciplineFactorStatus' },
        { cardId: 'consistencyFactorCard', scoreId: 'consistencyFactorScore', statusId: 'consistencyFactorStatus' },
        { cardId: 'totalScoreCard', scoreId: 'totalPsychScore', statusId: 'totalScoreStatus' }
    ];
    
    metricCards.forEach(({ cardId, scoreId, statusId }) => {
        const scoreElement = document.getElementById(scoreId);
        const statusElement = document.getElementById(statusId);
        
        if (scoreElement) scoreElement.textContent = '0/25';
        if (statusElement) statusElement.textContent = 'No data';
        
        const card = document.getElementById(cardId);
        if (card) {
            card.className = 'psychology-metric-card';
        }
    });
}

function updateMetricCard(cardId, valueId, statusId, value, maxValue) {
    const card = document.getElementById(cardId);
    const valueElement = document.getElementById(valueId);
    const statusElement = document.getElementById(statusId);
    
    if (!valueElement || !statusElement) return;
    
    valueElement.textContent = Math.round(value);
    
    const percentage = (value / maxValue) * 100;
    let status, cardClass;
    
    if (percentage >= 80) {
        status = currentLanguage === 'ko' ? '최적' : 'Optimal';
        cardClass = 'good';
    } else if (percentage >= 60) {
        status = currentLanguage === 'ko' ? '양호' : 'Good';
        cardClass = 'good';
    } else if (percentage >= 40) {
        status = currentLanguage === 'ko' ? '보통' : 'Fair';
        cardClass = 'warning';
    } else if (percentage >= 20) {
        status = currentLanguage === 'ko' ? '주의' : 'Poor';
        cardClass = 'warning';
    } else {
        status = currentLanguage === 'ko' ? '위험' : 'Critical';
        cardClass = 'danger';
    }
    
    statusElement.textContent = status;
    if (card) {
        card.className = `psychology-metric-card ${cardClass}`;
    }
}

// Psychology Factor Calculations
function calculateSleepFactor(sleepHours) {
    if (!sleepHours) return 0;
    
    // 7-8시간이 최적
    if (sleepHours >= 7 && sleepHours <= 8) {
        return 25;
    } else if (sleepHours >= 6 && sleepHours < 7) {
        return 20;
    } else if (sleepHours >= 5 && sleepHours < 6) {
        return 15;
    } else if (sleepHours > 8 && sleepHours <= 9) {
        return 20;
    } else if (sleepHours > 9) {
        return 15;
    } else {
        return 5; // 5시간 미만
    }
}

function calculateStressFactor(sleepHours, stressLevel, focusLevel) {
    let baseScore = 25;
    
    // 수면 부족 시 스트레스 증가
    if (sleepHours < 6) {
        baseScore -= 8;
    } else if (sleepHours < 7) {
        baseScore -= 4;
    }
    
    // 스트레스 레벨 페널티
    baseScore -= (stressLevel - 3) * 4;
    
    // 집중력 조정
    if (focusLevel <= 2) {
        baseScore -= 5; // 낮은 집중력
    } else if (focusLevel >= 4) {
        baseScore += 3; // 높은 집중력
    }
    
    return Math.max(0, Math.min(25, baseScore));
}

function calculateDisciplineFactor() {
    // 최근 30거래의 규율 준수도 분석
    const recentTrades = trades.slice(-30);
    if (recentTrades.length === 0) return 15; // 기본값
    
    // 손절매 실행률 가정 (실제로는 거래 데이터에서 계산)
    let disciplineScore = 25;
    
    // 포지션 크기 일관성 검사
    const positionSizes = recentTrades.map(trade => trade.amount);
    const avgPosition = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
    const deviation = Math.sqrt(positionSizes.reduce((sum, size) => sum + Math.pow(size - avgPosition, 2), 0) / positionSizes.length) / avgPosition;
    
    if (deviation > 0.5) disciplineScore -= 10;
    else if (deviation > 0.3) disciplineScore -= 5;
    
    return Math.max(0, Math.min(25, disciplineScore));
}

function calculateConsistencyFactor() {
    const recentTrades = trades.slice(-20);
    if (recentTrades.length === 0) return 15; // 기본값
    
    let consistencyScore = 25;
    
    // 거래 시간 일관성
    const tradeTimes = recentTrades.filter(trade => trade.entryTime).map(trade => {
        const [hour] = trade.entryTime.split(':').map(Number);
        return hour;
    });
    
    if (tradeTimes.length > 0) {
        const timeDeviation = calculateStandardDeviation(tradeTimes);
        if (timeDeviation > 3) consistencyScore -= 8;
        else if (timeDeviation > 2) consistencyScore -= 4;
    }
    
    return Math.max(0, Math.min(25, consistencyScore));
}

function calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
}

function calculateDailyScore() {
    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];
    
    if (!todayData) {
        alert(currentLanguage === 'ko' ? '먼저 심리 데이터를 입력해주세요.' : 'Please input psychology data first.');
        return;
    }
    
    // 수면 요인 계산 (25점 만점)
    const sleepFactor = calculateSleepFactor(todayData.sleepHours);
    
    // 스트레스 요인 계산 (25점 만점)
    const stressFactor = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
    
    // 규율 요인 계산 (25점 만점) - 거래 데이터 기반
    const disciplineFactor = calculateDisciplineFactor();
    
    // 일관성 요인 계산 (25점 만점) - 거래 데이터 기반
    const consistencyFactor = calculateConsistencyFactor();
    
    // 총점 계산
    const totalScore = sleepFactor + stressFactor + disciplineFactor + consistencyFactor;
    
    // UI 업데이트
    updateScoreCard('sleepFactorCard', 'sleepFactorScore', 'sleepFactorStatus', sleepFactor, 25);
    updateScoreCard('stressFactorCard', 'stressFactorScore', 'stressFactorStatus', stressFactor, 25);
    updateScoreCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', disciplineFactor, 25);
    updateScoreCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistencyFactor, 25);
    updateScoreCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', totalScore, 100);
    
    showToast(currentLanguage === 'ko' ? '일일 심리 점수가 계산되었습니다' : 'Daily psychology score calculated');
}

function updateScoreCard(cardId, scoreId, statusId, score, maxScore) {
    const card = document.getElementById(cardId);
    const scoreElement = document.getElementById(scoreId);
    const statusElement = document.getElementById(statusId);
    
    if (scoreElement) {
        scoreElement.textContent = `${Math.round(score)}/${maxScore}`;
    }
    
    const percentage = (score / maxScore) * 100;
    let status, cardClass;
    
    if (percentage >= 90) {
        status = currentLanguage === 'ko' ? '최적' : 'Optimal';
        cardClass = 'good';
    } else if (percentage >= 75) {
        status = currentLanguage === 'ko' ? '우수' : 'Excellent';
        cardClass = 'good';
    } else if (percentage >= 60) {
        status = currentLanguage === 'ko' ? '양호' : 'Good';
        cardClass = 'good';
    } else if (percentage >= 40) {
        status = currentLanguage === 'ko' ? '보통' : 'Fair';
        cardClass = 'warning';
    } else if (percentage >= 20) {
        status = currentLanguage === 'ko' ? '주의' : 'Poor';
        cardClass = 'warning';
    } else {
        status = currentLanguage === 'ko' ? '위험' : 'Critical';
        cardClass = 'danger';
    }
    
    if (statusElement) {
        statusElement.textContent = status;
    }
    
    if (card) {
        card.className = `psychology-metric-card ${cardClass}`;
        card.style.borderColor = cardClass === 'good' ? '#10b981' : 
                                cardClass === 'warning' ? '#f59e0b' : '#ef4444';
    }
}

// Visual Cards Update
function updateSliderDisplay(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
    // updateVisualCards 호출 전 DOM 준비 확인
    setTimeout(() => {
        if (document.getElementById('sleepHoursDisplay')) {
            updateVisualCards();
        }
    }, 50);
}

function updateTargetPercentages() {
    const balanceEl = document.getElementById('accountBalance');
    const targetEl = document.getElementById('dailyTarget');
    const maxLossEl = document.getElementById('maxDailyLoss');
    
    const balance = balanceEl ? parseFloat(balanceEl.value) || 0 : 0;
    const target = targetEl ? parseFloat(targetEl.value) || 0 : 0;
    const maxLoss = maxLossEl ? parseFloat(maxLossEl.value) || 0 : 0;
    
    const targetPercentEl = document.getElementById('dailyTargetPercent');
    const lossPercentEl = document.getElementById('maxLossPercent');
    
    if (balance > 0) {
        const targetPercent = (target / balance * 100).toFixed(1);
        const lossPercent = (maxLoss / balance * 100).toFixed(1);
        
        if (targetPercentEl) targetPercentEl.textContent = `${targetPercent}%`;
        if (lossPercentEl) lossPercentEl.textContent = `${lossPercent}%`;
    } else {
        if (targetPercentEl) targetPercentEl.textContent = '0%';
        if (lossPercentEl) lossPercentEl.textContent = '0%';
    }
    updateVisualCards();
}

function updateVisualCards() {
    try {
        // 필수 DOM 요소들의 존재 여부 확인
        const requiredElements = [
            'sleepHoursDisplay',
            'sleepQualityBar',
            'sleepStatus',
            'environmentScore',
            'environmentTypeDisplay',
            'environmentStatus',
            'stressDisplay',
            'confidenceDisplay',
            'focusDisplay',
            'emotionalStatus'
        ];
        
        // 모든 필수 요소가 존재하는지 확인
        const allElementsExist = requiredElements.every(id => {
            const exists = document.getElementById(id) !== null;
            if (!exists) {
                console.warn(`Required element not found: ${id}`);
            }
            return exists;
        });
        
        if (!allElementsExist) {
            console.warn('Some psychology visual card elements are not ready');
            return;
        }
        
        // 각 카드 업데이트를 개별적으로 try-catch
        try {
            updateSleepCard();
        } catch (error) {
            console.error('Error updating sleep card:', error);
        }
        
        try {
            updateEnvironmentCard();
        } catch (error) {
            console.error('Error updating environment card:', error);
        }
        
        try {
            updateEmotionalCard();
        } catch (error) {
            console.error('Error updating emotional card:', error);
        }
        
        try {
            updateRiskCard();
        } catch (error) {
            console.error('Error updating risk card:', error);
        }
        
        // 차트 생성은 약간의 딜레이 후
        setTimeout(() => {
            try {
                createPsychologyChart();
            } catch (error) {
                console.error('Error creating psychology chart:', error);
            }
        }, 100);
    } catch (error) {
        console.error('Error in updateVisualCards:', error);
    }
}

function updateSleepCard() {
    try {
        const sleepHoursEl = document.getElementById('sleepHours');
        const sleepHours = sleepHoursEl ? parseFloat(sleepHoursEl.value) || 0 : 0;
        
        const sleepHoursDisplayEl = document.getElementById('sleepHoursDisplay');
        if (sleepHoursDisplayEl) {
            sleepHoursDisplayEl.textContent = sleepHours;
        }
        
        let quality = 0;
        let status = 'No data';
        
        if (sleepHours > 0) {
            if (sleepHours >= 7 && sleepHours <= 8) {
                quality = 100;
                status = currentLanguage === 'ko' ? '최적 수면 범위' : 'Optimal sleep range';
            } else if (sleepHours >= 6 && sleepHours < 7) {
                quality = 75;
                status = currentLanguage === 'ko' ? '적절한 수면' : 'Adequate sleep';
            } else if (sleepHours >= 5 && sleepHours < 6) {
                quality = 50;
                status = currentLanguage === 'ko' ? '최적치 이하' : 'Below optimal';
            } else if (sleepHours < 5) {
                quality = 25;
                status = currentLanguage === 'ko' ? '수면 부족' : 'Sleep deprived';
            } else if (sleepHours > 8) {
                quality = 60;
                status = currentLanguage === 'ko' ? '과수면 감지' : 'Oversleep detected';
            }
        }
        
        const sleepQualityBarEl = document.getElementById('sleepQualityBar');
        if (sleepQualityBarEl) {
            sleepQualityBarEl.style.width = `${quality}%`;
        }
        
        const sleepStatusEl = document.getElementById('sleepStatus');
        if (sleepStatusEl) {
            sleepStatusEl.textContent = status;
        }
    } catch (error) {
        console.error('Error updating sleep card:', error);
    }
}

function updateEnvironmentCard() {
    const envType = document.getElementById('environmentType').value;
    const focusLevel = parseInt(document.getElementById('focusLevel').value) || 3;
    
    const envScores = {
        'home': 85,
        'office': 70,
        'cafe': 50,
        'hotel': 40
    };
    
    const baseScore = envScores[envType] || 50;
    const focusAdjustment = (focusLevel - 3) * 10;
    const totalScore = Math.max(0, Math.min(100, baseScore + focusAdjustment));
    
    document.getElementById('environmentScore').textContent = Math.round(totalScore);
    document.getElementById('environmentTypeDisplay').textContent = envType.charAt(0).toUpperCase() + envType.slice(1);
    
    const circle = document.getElementById('environmentCircle');
    if (circle) {
        const circumference = 157;
        const offset = circumference - (totalScore / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    let status = 'Good';
    if (totalScore >= 80) status = 'Excellent';
    else if (totalScore >= 60) status = 'Good';
    else if (totalScore >= 40) status = 'Fair';
    else status = 'Poor';
    
    document.getElementById('environmentStatus').textContent = status;
}

function updateEmotionalCard() {
    const stress = parseInt(document.getElementById('stressLevel').value) || 3;
    const confidence = parseInt(document.getElementById('confidenceLevel').value) || 3;
    const focus = parseInt(document.getElementById('focusLevel').value) || 3;
    
    document.getElementById('stressDisplay').textContent = stress;
    document.getElementById('confidenceDisplay').textContent = confidence;
    document.getElementById('focusDisplay').textContent = focus;
    
    const stressScore = (6 - stress) * 20;
    const confidenceScore = confidence * 20;
    const focusScore = focus * 20;
    const averageScore = (stressScore + confidenceScore + focusScore) / 3;
    
    let status = 'Balanced';
    if (averageScore >= 80) status = 'Excellent readiness';
    else if (averageScore >= 60) status = 'Good readiness';
    else if (averageScore >= 40) status = 'Fair readiness';
    else status = 'Poor readiness';
    
    document.getElementById('emotionalStatus').textContent = status;
}

function updateRiskCard() {
    const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
    const target = parseFloat(document.getElementById('dailyTarget').value) || 0;
    const maxLoss = parseFloat(document.getElementById('maxDailyLoss').value) || 0;
    
    if (balance > 0) {
        const targetPercent = (target / balance * 100);
        const lossPercent = (maxLoss / balance * 100);
        
        document.getElementById('targetRiskPercent').textContent = `${targetPercent.toFixed(1)}%`;
        document.getElementById('maxLossRiskPercent').textContent = `${lossPercent.toFixed(1)}%`;
        
        document.getElementById('targetRiskBar').style.width = `${Math.min(targetPercent * 10, 100)}%`;
        document.getElementById('maxLossRiskBar').style.width = `${Math.min(lossPercent * 10, 100)}%`;
        
        let status = 'Conservative';
        if (targetPercent > 5 || lossPercent > 10) status = 'High risk';
        else if (targetPercent > 3 || lossPercent > 5) status = 'Moderate risk';
        else if (targetPercent > 1 || lossPercent > 2) status = 'Low risk';
        
        document.getElementById('riskStatus').textContent = status;
    } else {
        document.getElementById('targetRiskPercent').textContent = '0%';
        document.getElementById('maxLossRiskPercent').textContent = '0%';
        document.getElementById('targetRiskBar').style.width = '0%';
        document.getElementById('maxLossRiskBar').style.width = '0%';
        document.getElementById('riskStatus').textContent = 'No data';
    }
}

// Psychology Chart Creation
async function createPsychologyChart() {
    try {
        await waitForChart();
        
        const ctx = document.getElementById('psychologyPerformanceChart');
        if (!ctx) {
            console.warn('Psychology chart canvas not found');
            return;
        }
        
        // 기존 차트가 있다면 안전하게 제거
        if (typeof window.psychologyChart !== 'undefined' && window.psychologyChart && typeof window.psychologyChart.destroy === 'function') {
            try {
                window.psychologyChart.destroy();
                window.psychologyChart = null;
            } catch (error) {
                console.warn('Chart destruction error:', error);
            }
        }
        
        const chartData = preparePsychologyChartData();
        
        // 데이터가 없으면 기본 메시지 표시
        if (!chartData || (chartData.sleepData.length === 0 && chartData.stressData.length === 0 && chartData.focusData.length === 0)) {
            const parent = ctx.parentElement;
            if (parent) {
                parent.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #64748b; font-size: 14px;">
                        ${currentLanguage === 'ko' ? '심리 데이터와 거래 기록을 수집하여 차트를 생성하세요' : 'Collect psychology data and trading records to generate chart'}
                    </div>
                `;
            }
            return;
        }
        
        // 차트 설정
        const chartConfig = {
            type: 'scatter',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'point'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e4e4e7',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e4e4e7',
                        bodyColor: '#e4e4e7',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            title: function(context) {
                                return context[0].dataset.label;
                            },
                            label: function(context) {
                                const factor = context.dataset.label.includes('Sleep') ? 'hours' : 'level';
                                return `${context.dataset.label}: ${context.parsed.x} ${factor}, ${context.parsed.y.toFixed(1)}% win rate`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: currentLanguage === 'ko' ? '심리 요인' : 'Psychology Factor',
                            color: '#94a3b8'
                        },
                        ticks: { 
                            color: '#94a3b8',
                            stepSize: 1
                        },
                        grid: { 
                            color: '#334155',
                            drawBorder: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: currentLanguage === 'ko' ? '승률 (%)' : 'Win Rate (%)',
                            color: '#94a3b8'
                        },
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: '#334155',
                            drawBorder: false
                        }
                    }
                }
            }
        };
        
        // 데이터셋 추가
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
        
        // 차트 생성
        window.psychologyChart = new Chart(ctx, chartConfig);
        
    } catch (error) {
        console.error('Error creating psychology chart:', error);
        const ctx = document.getElementById('psychologyPerformanceChart');
        if (ctx && ctx.parentElement) {
            ctx.parentElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #ef4444; font-size: 14px;">
                    ${currentLanguage === 'ko' ? '차트 생성 중 오류가 발생했습니다' : 'Error creating chart'}
                </div>
            `;
        }
    }
}

function preparePsychologyChartData() {
    try {
        const sleepData = [];
        const stressData = [];
        const focusData = [];
        
        if (!psychologyData || typeof psychologyData !== 'object') {
            return { sleepData, stressData, focusData };
        }
        
        Object.entries(psychologyData).forEach(([date, psyData]) => {
            if (!psyData || typeof psyData !== 'object') return;
            
            const dayTrades = trades.filter(trade => trade && trade.date === date);
            if (dayTrades.length === 0) return;
            
            // 일일 승률 계산
            const winningTrades = dayTrades.filter(trade => trade.pnl > 0);
            const winRate = dayTrades.length > 0 ? (winningTrades.length / dayTrades.length * 100) : 0;
            
            // 수면 데이터
            if (psyData.sleepHours && typeof psyData.sleepHours === 'number' && psyData.sleepHours > 0) {
                sleepData.push({ 
                    x: psyData.sleepHours, 
                    y: winRate,
                    date: date 
                });
            }
            
            // 스트레스 데이터
            if (psyData.stressLevel && typeof psyData.stressLevel === 'number') {
                stressData.push({ 
                    x: psyData.stressLevel, 
                    y: winRate,
                    date: date 
                });
            }
            
            // 집중력 데이터
            if (psyData.focusLevel && typeof psyData.focusLevel === 'number') {
                focusData.push({ 
                    x: psyData.focusLevel, 
                    y: winRate,
                    date: date 
                });
            }
        });
        
        return { sleepData, stressData, focusData };
        
    } catch (error) {
        console.error('Error preparing psychology chart data:', error);
        return { sleepData: [], stressData: [], focusData: [] };
    }
}

// Bias Analysis
function updateBiasAnalysis() {
    // 과신 편향 분석
    calculateOverconfidenceBias();
    
    // 손실 회피 분석
    calculateLossAversionBias();
    
    // 앵커링 편향 분석
    calculateAnchoringBias();

    // 전체 편향 위험도 계산
    calculateOverallBiasRisk();
}

function calculateOverconfidenceBias() {
    const recentTrades = trades.slice(-50);
    if (recentTrades.length === 0) return;
    
    // 캘리브레이션 에러 계산 (예측 대비 실제)
    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];
    
    if (todayData && todayData.predictedWinRate) {
        const actualWinRate = (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100;
        const calibrationError = Math.abs(todayData.predictedWinRate - actualWinRate);
        
        document.getElementById('calibrationError').textContent = `${calibrationError.toFixed(1)}%`;
        document.getElementById('calibrationErrorBar').style.width = `${Math.min(calibrationError * 5, 100)}%`;
        document.getElementById('calibrationErrorBar').style.backgroundColor = calibrationError > 20 ? '#ef4444' : calibrationError > 10 ? '#f59e0b' : '#10b981';
    }
    
    // 과도거래 지수
    if (todayData && todayData.plannedTrades) {
        const actualTrades = recentTrades.filter(t => t.date === currentDate).length;
        const overtradingIndex = ((actualTrades - todayData.plannedTrades) / todayData.plannedTrades) * 100;
        
        document.getElementById('overtradingIndex').textContent = `${overtradingIndex.toFixed(0)}%`;
        document.getElementById('overtradingBar').style.width = `${Math.min(Math.abs(overtradingIndex), 100)}%`;
        document.getElementById('overtradingBar').style.backgroundColor = Math.abs(overtradingIndex) > 50 ? '#ef4444' : '#f59e0b';
    }
    
    // 포지션 크기 편차
    const positionSizes = recentTrades.map(trade => trade.amount);
    if (positionSizes.length > 0) {
        const avgPosition = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
        const deviation = calculateStandardDeviation(positionSizes) / avgPosition;
        
        document.getElementById('positionDeviation').textContent = deviation.toFixed(2);
        document.getElementById('positionDeviationBar').style.width = `${Math.min(deviation * 200, 100)}%`;
        document.getElementById('positionDeviationBar').style.backgroundColor = deviation > 0.3 ? '#ef4444' : '#3b82f6';
    }
}

function calculateLossAversionBias() {
    const recentTrades = trades.slice(-50);
    if (recentTrades.length === 0) return;
    
    const winningTrades = recentTrades.filter(t => t.pnl > 0);
    const losingTrades = recentTrades.filter(t => t.pnl < 0);
    
    // 처분 효과 비율 (손실 거래 보유 시간 / 수익 거래 보유 시간)
    const winningHoldTimes = winningTrades.filter(t => t.holdingTime).map(t => parseInt(t.holdingTime.replace('m', '')));
    const losingHoldTimes = losingTrades.filter(t => t.holdingTime).map(t => parseInt(t.holdingTime.replace('m', '')));
    
    if (winningHoldTimes.length > 0 && losingHoldTimes.length > 0) {
        const avgWinHold = winningHoldTimes.reduce((sum, time) => sum + time, 0) / winningHoldTimes.length;
        const avgLossHold = losingHoldTimes.reduce((sum, time) => sum + time, 0) / losingHoldTimes.length;
        const dispositionRatio = avgLossHold / avgWinHold;
        
        document.getElementById('dispositionRatio').textContent = dispositionRatio.toFixed(2);
        document.getElementById('dispositionBar').style.width = `${Math.min(dispositionRatio * 25, 100)}%`;
        document.getElementById('dispositionBar').style.backgroundColor = dispositionRatio > 2.0 ? '#ef4444' : '#10b981';
    }
}

function calculateAnchoringBias() {
    // 앵커링 편향 분석 (간단한 버전)
    const recentTrades = trades.slice(-30);
    if (recentTrades.length === 0) return;
    
    // 라운드 넘버 의존도 (단순화된 계산)
    const roundNumberTrades = recentTrades.filter(trade => {
        const buyPrice = trade.buyPrice;
        const sellPrice = trade.sellPrice;
        return (buyPrice % 1 === 0) || (sellPrice % 1 === 0);
    });
    
    const roundNumberBias = (roundNumberTrades.length / recentTrades.length) * 100;
    
    document.getElementById('roundNumberBias').textContent = `${roundNumberBias.toFixed(0)}%`;
    document.getElementById('roundNumberBar').style.width = `${roundNumberBias}%`;
    document.getElementById('roundNumberBar').style.backgroundColor = roundNumberBias > 40 ? '#ef4444' : '#f59e0b';
}

function calculateOverallBiasRisk() {
    // 각 편향의 위험도를 0-100 점수로 변환
    let overconfidenceScore = 0;
    let lossAversionScore = 0;
    let anchoringScore = 0;
    
    // 과신 편향 점수 계산
    const calibrationError = parseFloat(document.getElementById('calibrationError').textContent) || 0;
    const overtradingIndex = Math.abs(parseFloat(document.getElementById('overtradingIndex').textContent)) || 0;
    const positionDeviation = parseFloat(document.getElementById('positionDeviation').textContent) || 0;
    
    overconfidenceScore = Math.min(100, (calibrationError * 2) + (overtradingIndex * 0.5) + (positionDeviation * 100));
    
    // 손실 회피 점수 계산
    const dispositionRatio = parseFloat(document.getElementById('dispositionRatio').textContent) || 1;
    lossAversionScore = Math.min(100, Math.max(0, (dispositionRatio - 1) * 50));
    
    // 앵커링 점수 계산
    const roundNumberBias = parseFloat(document.getElementById('roundNumberBias').textContent) || 0;
    anchoringScore = Math.min(100, roundNumberBias * 1.5);
    
    // 전체 점수 계산
    const overallScore = (overconfidenceScore + lossAversionScore + anchoringScore) / 3;
    
    // 위험도 레벨 결정
    let riskLevel, riskColor;
    if (overallScore < 20) {
        riskLevel = currentLanguage === 'ko' ? '낮음' : 'Low';
        riskColor = '#10b981';
    } else if (overallScore < 50) {
        riskLevel = currentLanguage === 'ko' ? '보통' : 'Medium';
        riskColor = '#f59e0b';
    } else {
        riskLevel = currentLanguage === 'ko' ? '높음' : 'High';
        riskColor = '#ef4444';
    }
    
    // UI 업데이트
    document.getElementById('overallBiasRisk').textContent = riskLevel;
    document.getElementById('overallBiasRisk').style.color = riskColor;
    document.getElementById('overallBiasScore').textContent = `Score: ${overallScore.toFixed(0)}/100`;
    
    // 조치 필요 여부
    let actionNeeded, actionDetails;
    if (overallScore > 70) {
        actionNeeded = currentLanguage === 'ko' ? '즉시 조치' : 'Immediate Action';
        actionDetails = currentLanguage === 'ko' ? '편향 위험 높음' : 'High bias risk';
    } else if (overallScore > 40) {
        actionNeeded = currentLanguage === 'ko' ? '주의 필요' : 'Caution Needed';
        actionDetails = currentLanguage === 'ko' ? '일부 편향 감지' : 'Some bias detected';
    } else {
        actionNeeded = currentLanguage === 'ko' ? '없음' : 'None';
        actionDetails = currentLanguage === 'ko' ? '모든 지표 정상' : 'All metrics normal';
    }
    
    document.getElementById('actionNeeded').textContent = actionNeeded;
    document.getElementById('actionNeeded').style.color = overallScore > 70 ? '#ef4444' : overallScore > 40 ? '#f59e0b' : '#10b981';
    document.getElementById('actionDetails').textContent = actionDetails;
}

// Pattern Insights
function updatePatternInsights() {
    analyzeTimeBasedPerformance();
    analyzeConsecutiveTradesPattern();
    generateAIInsights();
}

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

function generatePsychologyInsights() {
    const insights = [];
    const currentDate = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[currentDate];
    
    // 수면과 성과 상관관계 분석
    const sleepPerformance = analyzeSleepPerformance();
    if (sleepPerformance.correlation !== null) {
        if (sleepPerformance.correlation > 0.3) {
            insights.push({
                type: 'good',
                text: currentLanguage === 'ko' ? 
                    `수면 시간과 거래 성과 간 강한 양의 상관관계 발견 (${(sleepPerformance.correlation * 100).toFixed(0)}%). 충분한 수면이 성과 향상에 도움됩니다.` :
                    `Strong positive correlation found between sleep and trading performance (${(sleepPerformance.correlation * 100).toFixed(0)}%). Adequate sleep helps improve performance.`
            });
        } else if (sleepPerformance.correlation < -0.3) {
            insights.push({
                type: 'warning',
                text: currentLanguage === 'ko' ? 
                    `수면 시간과 거래 성과 간 음의 상관관계 발견. 과도한 수면이나 수면 패턴을 재검토해보세요.` :
                    `Negative correlation found between sleep and trading performance. Consider reviewing your sleep patterns.`
            });
        }
    }
    
    // 과도거래 패턴 감지
    const recentOvertrading = detectOvertrading();
    if (recentOvertrading > 30) {
        insights.push({
            type: 'warning',
            text: currentLanguage === 'ko' ? 
                `최근 계획 대비 ${recentOvertrading.toFixed(0)}% 과도거래 감지. 거래 빈도를 줄이고 품질에 집중하세요.` :
                `Recent overtrading detected: ${recentOvertrading.toFixed(0)}% above planned trades. Focus on quality over quantity.`
        });
    }
    
    // 시간대별 최적화 제안
    const timeOptimization = getTimeOptimization();
    if (timeOptimization) {
        insights.push({
            type: 'good',
            text: currentLanguage === 'ko' ? 
                `최적 거래 시간대: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (승률 ${timeOptimization.winRate.toFixed(0)}%)` :
                `Optimal trading time: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (${timeOptimization.winRate.toFixed(0)}% win rate)`
        });
    }
    
    // 연속 손실 후 주의사항
    const consecutiveLossPattern = getConsecutiveLossPattern();
    if (consecutiveLossPattern && consecutiveLossPattern.after3Losses < 40) {
        insights.push({
            type: 'danger',
            text: currentLanguage === 'ko' ? 
                `3연속 손실 후 승률이 ${consecutiveLossPattern.after3Losses.toFixed(0)}%로 급감. 연속 손실 시 거래 중단을 고려하세요.` :
                `Win rate drops to ${consecutiveLossPattern.after3Losses.toFixed(0)}% after 3 consecutive losses. Consider taking a break.`
        });
    }
    
    // 기본 메시지
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            text: currentLanguage === 'ko' ? 
                '더 많은 심리 데이터와 거래 기록을 수집하여 개인화된 인사이트를 생성하세요.' :
                'Collect more psychology data and trading records to generate personalized insights.'
        });
    }
    
    // 인사이트 렌더링
    const insightsList = document.getElementById('aiInsightsList');
    if (insightsList) {
        insightsList.innerHTML = insights.map(insight => `
            <div style="background: #0f172a; border-left: 4px solid ${getInsightColor(insight.type)}; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                <div style="color: #e4e4e7; font-size: 14px; line-height: 1.5;">${insight.text}</div>
            </div>
        `).join('');
    }
}

function generateAIInsights() {
    generatePsychologyInsights();
}

// Helper Functions for Insights
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

function detectOvertrading() {
    const today = formatTradingDate(currentTradingDate);
    const todayData = psychologyData[today];
    
    if (!todayData || !todayData.plannedTrades) return 0;
    
    const actualTrades = trades.filter(trade => trade.date === today).length;
    return ((actualTrades - todayData.plannedTrades) / todayData.plannedTrades) * 100;
}

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

function getInsightColor(type) {
    switch(type) {
        case 'good': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'danger': return '#ef4444';
        default: return '#3b82f6';
    }
}

function safeUpdateElement(id, value, className = null) {
    const element = document.getElementById(id);
    if (element) {
        if (typeof value === 'string' || typeof value === 'number') {
            element.textContent = value;
        }
        if (className) {
            element.className = className;
        }
    }
}
