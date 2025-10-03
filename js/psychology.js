// psychology.js - 심리 분석 관련 기능

// 전역 변수 초기화
if (typeof window.psychologyChart === 'undefined') {
    window.psychologyChart = null;
}

// ==================== Psychology Date Navigation ====================

/**
 * 심리 날짜 업데이트
 */
function updatePsychologyDateDisplay() {
    const dateText = document.getElementById('psychologyDateText');
    if (!dateText) return;

    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    // YYYY-MM-DD 형식 그대로 표시
    dateText.textContent = currentPsychologyDate;
}

/**
 * 이전 날짜로 이동
 */
function previousPsychologyDay() {
    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    const date = new Date(currentPsychologyDate + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    currentPsychologyDate = formatTradingDate(date);

    updatePsychologyDateDisplay();
    loadPsychologyData();
}

/**
 * 다음 날짜로 이동
 */
function nextPsychologyDay() {
    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    const date = new Date(currentPsychologyDate + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    currentPsychologyDate = formatTradingDate(date);

    updatePsychologyDateDisplay();
    loadPsychologyData();
}

/**
 * 심리 날짜 선택 모달 표시
 */
function showPsychologyDatePicker() {
    const modal = document.getElementById('datePickerModal');
    const dateInput = document.getElementById('selectedDate');

    if (!modal || !dateInput) return;

    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    dateInput.value = currentPsychologyDate;
    modal.style.display = 'flex';

    // 모달 확인 버튼에 이벤트 추가
    const confirmButton = modal.querySelector('.date-picker-button');
    if (confirmButton) {
        confirmButton.onclick = function() {
            currentPsychologyDate = dateInput.value;
            modal.style.display = 'none';
            updatePsychologyDateDisplay();
            loadPsychologyData();
        };
    }
}

// ==================== Psychology Section Management ====================

/**
 * 심리 섹션 전환
 */
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

        // 현재는 input 섹션만 존재
        const targetSection = document.getElementById('psychologyInputSection');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // 데이터 업데이트
        setTimeout(() => {
            updateVisualCards();
            createPsychologyChart();
        }, 100);
    } catch (error) {
        console.error('Error showing psychology section:', error);
    }
}

// ==================== Psychology Data Management ====================

/**
 * 심리 데이터 저장
 */
function savePsychologyData() {
    // currentPsychologyDate 초기화
    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    const data = {
        date: currentPsychologyDate,
        timestamp: new Date().toISOString(),
        
        // Biological data
        sleepHours: parseFloat(document.getElementById('sleepHours').value) || 0,
        
        // Time & environment
        startTime: document.getElementById('startTime').value || '09:30',
        endTime: document.getElementById('endTime').value || '',
        environmentType: document.getElementById('environmentType').value || 'home',
        
        // Economic pressure
        accountBalance: parseFloat(document.getElementById('accountBalance').value) || 0,
        dailyTarget: parseFloat(document.getElementById('dailyTarget').value) || 0,
        maxDailyLoss: parseFloat(document.getElementById('maxDailyLoss').value) || 0,
        
        // Emotional state
        stressLevel: parseInt(document.getElementById('stressLevel').value) || 3,
        confidenceLevel: parseInt(document.getElementById('confidenceLevel').value) || 3,
        focusLevel: parseInt(document.getElementById('focusLevel').value) || 3
    };
    
    psychologyData[currentPsychologyDate] = data;
    localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
    
    generatePsychologyInsights();
    
    // 차트 업데이트
    setTimeout(() => {
        createPsychologyChart();
    }, 100);
    
    showToast(currentLanguage === 'ko' ? '심리 데이터가 저장되었습니다' : 'Psychology data saved');
}

/**
 * 심리 데이터 초기화
 */
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

/**
 * 심리 데이터 불러오기
 */
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

    // currentPsychologyDate 초기화
    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }

    // 날짜 표시 업데이트
    updatePsychologyDateDisplay();

    const todayData = psychologyData[currentPsychologyDate];

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
            createPsychologyChart();
        }, 200);
    } else {
        // 기본값으로 차트 생성
        setTimeout(() => {
            createPsychologyChart();
        }, 200);
    }
}

// ==================== Visual Cards Update ====================

/**
 * 슬라이더 디스플레이 업데이트
 */
function updateSliderDisplay(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
    }
    updateVisualCards();
}

/**
 * 목표 비율 업데이트
 */
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

/**
 * 모든 비주얼 카드 업데이트
 */
function updateVisualCards() {
    try {
        updateSleepCard();
        updateEnvironmentCard();
        updateEmotionalCard();
        updateRiskCard();
        
        // 차트 업데이트 (딜레이를 주어 DOM 업데이트 후 실행)
        setTimeout(() => {
            createPsychologyChart();
        }, 100);
    } catch (error) {
        console.error('Error updating visual cards:', error);
    }
}

/**
 * 수면 카드 업데이트
 */
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

/**
 * 환경 카드 업데이트
 */
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

/**
 * 감정 상태 카드 업데이트
 */
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

/**
 * 리스크 카드 업데이트
 */
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

// ==================== Psychology Chart ====================

/**
 * 심리 성과 차트 생성
 */
async function createPsychologyChart() {
    try {
        // Chart.js 라이브러리 로딩 확인
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library not loaded');
            setTimeout(() => createPsychologyChart(), 500);
            return;
        }
        
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
        console.log('Psychology chart data prepared:', chartData);
        
        // 데이터가 없으면 기본 메시지 표시
        if (!chartData || (chartData.sleepData.length === 0 && chartData.stressData.length === 0 && chartData.focusData.length === 0)) {
            const parent = ctx.parentElement;
            if (parent) {
                // 캔버스를 복원하고 메시지 표시
                parent.innerHTML = `
                    <canvas id="psychologyPerformanceChart" style="max-width: 100%; max-height: 100%; display: none;"></canvas>
                    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #64748b; font-size: 14px; text-align: center;">
                        <div>
                            <div style="margin-bottom: 12px; font-size: 16px;">📊</div>
                            <div>${currentLanguage === 'ko' ? '심리 데이터와 거래 기록을 수집하여 차트를 생성하세요' : 'Collect psychology data and trading records to generate chart'}</div>
                            <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">${currentLanguage === 'ko' ? '최소 3일의 데이터가 필요합니다' : 'Minimum 3 days of data required'}</div>
                        </div>
                    </div>
                `;
            }
            return;
        }
        
        // 캔버스가 숨겨져 있다면 다시 표시
        if (ctx.style.display === 'none') {
            ctx.style.display = 'block';
            // 메시지 div가 있다면 제거
            const messageDiv = ctx.parentElement.querySelector('div[style*="justify-content: center"]');
            if (messageDiv) {
                messageDiv.remove();
            }
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
        try {
            window.psychologyChart = new Chart(ctx, chartConfig);
            console.log('Psychology chart created successfully');
        } catch (chartError) {
            console.error('Chart creation error:', chartError);
            throw chartError;
        }
        
    } catch (error) {
        console.error('Error creating psychology chart:', error);
        const ctx = document.getElementById('psychologyPerformanceChart');
        if (ctx && ctx.parentElement) {
            ctx.parentElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #ef4444; font-size: 14px; text-align: center;">
                    <div>
                        <div style="margin-bottom: 12px; font-size: 16px;">⚠️</div>
                        <div>${currentLanguage === 'ko' ? '차트 생성 중 오류가 발생했습니다' : 'Error creating chart'}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">${error.message || 'Unknown error'}</div>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * 심리 차트 데이터 준비
 */
function preparePsychologyChartData() {
    try {
        const sleepData = [];
        const stressData = [];
        const focusData = [];
        
        console.log('Psychology data:', psychologyData);
        console.log('Trades data:', trades);
        
        if (!psychologyData || typeof psychologyData !== 'object') {
            console.warn('No psychology data available');
            return { sleepData, stressData, focusData };
        }
        
        if (!trades || !Array.isArray(trades)) {
            console.warn('No trades data available');
            return { sleepData, stressData, focusData };
        }
        
        Object.entries(psychologyData).forEach(([date, psyData]) => {
            if (!psyData || typeof psyData !== 'object') {
                console.warn(`Invalid psychology data for date ${date}:`, psyData);
                return;
            }
            
            const dayTrades = trades.filter(trade => trade && trade.date === date);
            console.log(`Trades for ${date}:`, dayTrades);
            
            if (dayTrades.length === 0) {
                console.log(`No trades found for date ${date}`);
                return;
            }
            
            // 일일 승률 계산
            const winningTrades = dayTrades.filter(trade => trade.pnl > 0);
            const winRate = dayTrades.length > 0 ? (winningTrades.length / dayTrades.length * 100) : 0;
            
            console.log(`Win rate for ${date}: ${winRate}% (${winningTrades.length}/${dayTrades.length})`);
            
            // 수면 데이터
            if (psyData.sleepHours && typeof psyData.sleepHours === 'number' && psyData.sleepHours > 0) {
                sleepData.push({ 
                    x: psyData.sleepHours, 
                    y: winRate,
                    date: date 
                });
            }
            
            // 스트레스 데이터 (1-5 스케일)
            if (psyData.stressLevel && typeof psyData.stressLevel === 'number' && psyData.stressLevel >= 1 && psyData.stressLevel <= 5) {
                stressData.push({ 
                    x: psyData.stressLevel, 
                    y: winRate,
                    date: date 
                });
            }
            
            // 집중력 데이터 (1-5 스케일)
            if (psyData.focusLevel && typeof psyData.focusLevel === 'number' && psyData.focusLevel >= 1 && psyData.focusLevel <= 5) {
                focusData.push({ 
                    x: psyData.focusLevel, 
                    y: winRate,
                    date: date 
                });
            }
        });
        
        console.log('Prepared chart data:', { sleepData, stressData, focusData });
        return { sleepData, stressData, focusData };
        
    } catch (error) {
        console.error('Error preparing psychology chart data:', error);
        return { sleepData: [], stressData: [], focusData: [] };
    }
}

// ==================== Psychology Scoring Functions ====================

/**
 * 수면 요인 계산
 */
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

/**
 * 스트레스 요인 계산
 */
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

/**
 * 규율 요인 계산
 */
function calculateDisciplineFactor() {
    // 최근 30거래의 규율 준수도 분석
    const recentTrades = trades.slice(-30);
    if (recentTrades.length === 0) return 15; // 기본값
    
    let disciplineScore = 25;
    
    // 포지션 크기 일관성 검사
    const positionSizes = recentTrades.map(trade => trade.amount);
    const avgPosition = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
    const deviation = Math.sqrt(positionSizes.reduce((sum, size) => sum + Math.pow(size - avgPosition, 2), 0) / positionSizes.length) / avgPosition;
    
    if (deviation > 0.5) disciplineScore -= 10;
    else if (deviation > 0.3) disciplineScore -= 5;
    
    return Math.max(0, Math.min(25, disciplineScore));
}

/**
 * 일관성 요인 계산
 */
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

// ==================== Psychology Insights ====================

/**
 * 심리 인사이트 생성
 */
function generatePsychologyInsights() {
    if (!currentPsychologyDate) {
        currentPsychologyDate = formatTradingDate(new Date());
    }
    const todayData = psychologyData[currentPsychologyDate];
   const insightsList = document.getElementById('psychologyInsightsList');
    
    // 요소가 존재하지 않는 경우 처리
    if (!insightsList) {
        console.warn('psychologyInsightsList element not found');
        return;
    }
    
    if (!todayData) {
        insightsList.innerHTML = `
            <div class="psychology-insight-item">
                <div class="psychology-insight-text">${currentLanguage === 'ko' ? 
                    '심리 데이터가 없습니다. 오늘의 데이터를 입력하여 인사이트를 받아보세요.' : 
                    'No psychology data available. Fill in today\'s data to get insights.'}</div>
            </div>
        `;
        return;
    }
    
    const insights = [];
    
    // Sleep insights
    if (todayData.sleepHours < 6) {
        insights.push({
            type: 'danger',
            text: currentLanguage === 'ko' ? 
                `수면 부족 경고: ${todayData.sleepHours}시간 수면은 거래 성과에 부정적 영향을 줄 수 있습니다. 7-8시간 수면을 권장합니다.` :
                `Sleep Warning: ${todayData.sleepHours} hours of sleep may negatively impact trading performance. 7-8 hours recommended.`
        });
    } else if (todayData.sleepHours >= 7 && todayData.sleepHours <= 8) {
        insights.push({
            type: 'good',
            text: currentLanguage === 'ko' ? 
                '수면 상태 양호: 충분한 수면으로 최적의 거래 준비가 되었습니다.' :
                'Sleep Status Good: Adequate sleep prepares you for optimal trading.'
        });
    }
    
    // Stress and focus insights
    if (todayData.stressLevel >= 4 && todayData.focusLevel <= 2) {
        insights.push({
            type: 'danger',
            text: currentLanguage === 'ko' ? 
                '고스트레스 + 저집중 상태: 감정적 의사결정 위험이 높습니다. 포지션 크기를 줄이고 휴식을 고려하세요.' :
                'High Stress + Low Focus: High risk of emotional decisions. Consider reducing position size and taking breaks.'
        });
    }
    
    // Environment insights
    if (todayData.environmentType === 'cafe' || todayData.environmentType === 'home-noisy') {
        insights.push({
            type: 'warning',
            text: currentLanguage === 'ko' ? 
                '거래 환경 주의: 소음이 있는 환경은 집중력을 저해할 수 있습니다. 조용한 환경을 찾아보세요.' :
                'Trading Environment Warning: Noisy environments may impair focus. Consider finding a quieter space.'
        });
    }
    
    // Focus and confidence insights
    if (todayData.focusLevel <= 2 && todayData.confidenceLevel <= 2) {
        insights.push({
            type: 'danger',
            text: currentLanguage === 'ko' ? 
                '집중력 및 자신감 부족: 오늘은 거래를 피하거나 매우 작은 포지션만 고려하세요.' :
                'Low Focus & Confidence: Consider avoiding trading today or using very small positions only.'
        });
    }
    
    // Good condition insights
    const sleepScore = calculateSleepFactor(todayData.sleepHours);
    const stressScore = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
    const totalConditionScore = sleepScore + stressScore;
    
    if (totalConditionScore >= 40) {
        insights.push({
            type: 'good',
            text: currentLanguage === 'ko' ? 
                '양호한 거래 조건: 심리적 요인이 양호합니다. 계획된 전략을 자신 있게 실행하세요.' :
                'Good Trading Conditions: Psychological factors are favorable. Execute your planned strategy with confidence.'
        });
    }
    
    // Default insight if no specific insights
    if (insights.length === 0) {
        insights.push({
            type: 'good',
            text: currentLanguage === 'ko' ? 
                '심리적 준비 상태 보통: 특별한 주의사항은 없습니다. 계획된 거래 전략을 따르세요.' :
                'Psychological Readiness Fair: No specific warnings. Follow your planned trading strategy.'
        });
    }
    
    // Render insights
    insightsList.innerHTML = insights.map(insight => `
        <div class="psychology-insight-item ${insight.type === 'danger' ? 'danger' : insight.type === 'warning' ? 'warning' : ''}">
            <div class="psychology-insight-text">${insight.text}</div>
        </div>
    `).join('');
}
