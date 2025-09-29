/* AUTO-GENERATED: extracted from original 4.html
   filename: js/psychology.js
*/

// Psychology functions

        // Psychology functions
        function savePsychologyData() {
            const currentDate = formatTradingDate(currentTradingDate);

// generatePsychologyInsights 호출 전 요소 존재 확인
                // generatePsychologyInsights 호출 전 요소 존재 확인
                if (document.getElementById('psychologyInsightsList')) {
                    generatePsychologyInsights();
                }
                return;
            }

// Calculate Daily Psychology Score (0-100)
            
            // Calculate Daily Psychology Score (0-100)
            const dailyScore = sleepFactor + stressFactor + disciplineFactor + consistencyFactor;
            updateMetricCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', dailyScore, 100);

// generatePsychologyInsights 호출 전 요소 존재 확인

            // generatePsychologyInsights 호출 전 요소 존재 확인
            if (document.getElementById('psychologyInsightsList')) {
                generatePsychologyInsights();
            }
        }

        function calculateSleepQualityFactor(sleepHours, sleepQuality) {
            if (!sleepHours) return 0;
            
            let baseScore = Math.min(sleepHours >= 7 ? 20 : (sleepHours * 20 / 7), 20);
            let qualityBonus = (sleepQuality - 3) * 1.25;
            
            return Math.max(0, Math.min(25, baseScore + qualityBonus));
        }

        function calculatePressureIndex(pressureLevel, accountBalance, dailyTarget) {
            let baseScore = 25;

// Enhanced Psychology System Functions

        // Enhanced Psychology System Functions
        function showPsychologySection(section) {
            try {

// Enhanced Psychology System Functions with Visual Cards

        // Enhanced Psychology System Functions with Visual Cards
        function updateSliderDisplay(sliderId, displayId) {
            const slider = document.getElementById(sliderId);
            const display = document.getElementById(displayId);
            if (slider && display) {
                display.textContent = slider.value;
            }
            updateVisualCards();
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
                updateSleepCard();
                updateEnvironmentCard();
                updateEmotionalCard();
                updateRiskCard();

// 기존 loadPsychologyData 함수 업데이트
        
        // 기존 loadPsychologyData 함수 업데이트
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


function updatePsychologyMetrics() {
            const currentDate = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[currentDate];
            
            if (!todayData) {
                resetPsychologyData();

// Calculate Sleep Factor (0-25 points)
            
            // Calculate Sleep Factor (0-25 points)
            const sleepFactor = calculateSleepFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
            updateMetricCard('sleepFactorCard', 'sleepFactor', 'sleepFactorStatus', sleepFactor, 25);

// Calculate Stress Factor (0-25 points)
            
            // Calculate Stress Factor (0-25 points)
            const stressFactor = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);
            updateMetricCard('stressFactorCard', 'stressFactorScore', 'stressFactorStatus', stressFactor, 25);

// Calculate Discipline Factor (0-25 points)
            
            // Calculate Discipline Factor (0-25 points)
            const disciplineFactor = calculateDisciplineFactor();
            updateMetricCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', disciplineFactor, 25);

// Calculate Consistency Factor (0-25 points)
            
            // Calculate Consistency Factor (0-25 points)
            const consistencyFactor = calculateConsistencyFactor();
            updateMetricCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistencyFactor, 25);

// Pressure penalty
            
            // Pressure penalty
            baseScore -= (pressureLevel - 3) * 5;

// Target vs balance ratio check
            
            // Target vs balance ratio check
            if (accountBalance && dailyTarget) {
                const targetRatio = dailyTarget / accountBalance;
                if (targetRatio > 0.05) { // More than 5% daily target
                    baseScore -= 8;
                } else if (targetRatio > 0.03) { // More than 3% daily target
                    baseScore -= 4;
                }
            }
            
            return Math.max(0, Math.min(25, baseScore));
        }

        function calculateEmotionalReadiness(mood, confidence) {
            let baseScore = 15;

// Mood adjustment (-6 to +6)
            
            // Mood adjustment (-6 to +6)
            baseScore += (mood - 3) * 3;

// Confidence adjustment (-4 to +4)
            
            // Confidence adjustment (-4 to +4)
            baseScore += (confidence - 3) * 2;
            
            return Math.max(0, Math.min(25, baseScore));
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

        function calculateStressFactor(sleepHours, stressLevel, focusLevel) {
            let baseScore = 25;

// 수면 부족 시 스트레스 증가
            
            // 수면 부족 시 스트레스 증가
            if (sleepHours < 6) {
                baseScore -= 8;
            } else if (sleepHours < 7) {
                baseScore -= 4;
            }

// 스트레스 레벨 페널티
            
            // 스트레스 레벨 페널티
            baseScore -= (stressLevel - 3) * 4;

// 집중력 조정
            
            // 집중력 조정
            if (focusLevel <= 2) {
                baseScore -= 5; // 낮은 집중력
            } else if (focusLevel >= 4) {
                baseScore += 3; // 높은 집중력
            }
            
            return Math.max(0, Math.min(25, baseScore));
        }

        function generatePsychologyInsights() {
            const currentDate = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[currentDate];
            const insightsList = document.getElementById('psychologyInsightsList');

// 요소가 존재하지 않는 경우 처리
            
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
            
            // Render insights
            insightsList.innerHTML = insights.map(insight => `
                <div class="psychology-insight-item ${insight.type === 'danger' ? 'danger' : insight.type === 'warning' ? 'warning' : ''}">
                    <div class="psychology-insight-text">${insight.text}</div>
                </div>
            `).join('');
        }

// 탭 상태 업데이트
                // 탭 상태 업데이트
                document.querySelectorAll('.psychology-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                event.target.classList.add('active');

// 섹션 표시/숨기기
                
                // 섹션 표시/숨기기
                document.querySelectorAll('.psychology-section').forEach(sec => {
                    sec.classList.remove('active');
                });

// 섹션 ID 매핑
                
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
            }

function resetPsychologyData() {
            const confirmMessage = currentLanguage === 'ko' ? 
                '심리 데이터를 초기화하시겠습니까?' : 
                'Are you sure you want to reset psychology data?';
            
            if (confirm(confirmMessage)) {

// 모든 입력 필드 초기화
                // 모든 입력 필드 초기화
                document.getElementById('sleepHours').value = '';
                document.getElementById('startTime').value = '09:30';
                document.getElementById('endTime').value = '';
                document.getElementById('environmentType').value = 'home-quiet';
                document.getElementById('accountBalance').value = '';
                document.getElementById('dailyTarget').value = '';
                document.getElementById('maxDailyLoss').value = '';
                document.getElementById('stressLevel').value = '3';
                document.getElementById('confidenceLevel').value = '3';
                document.getElementById('focusLevel').value = '3';
                
                showToast(currentLanguage === 'ko' ? '심리 데이터가 초기화되었습니다' : 'Psychology data has been reset');
            }
        }

function calculateSleepFactor(sleepHours) {
            if (!sleepHours) return 0;

// 7-8시간이 최적
            
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

function calculateDisciplineFactor() {

// 최근 30거래의 규율 준수도 분석
            // 최근 30거래의 규율 준수도 분석
            const recentTrades = trades.slice(-30);
            if (recentTrades.length === 0) return 15; // 기본값

// 손절매 실행률 가정 (실제로는 거래 데이터에서 계산)
            
            // 손절매 실행률 가정 (실제로는 거래 데이터에서 계산)
            let disciplineScore = 25;

// 포지션 크기 일관성 검사
            
            // 포지션 크기 일관성 검사
            const positionSizes = recentTrades.map(trade => trade.amount);
            const avgPosition = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
            const deviation = Math.sqrt(positionSizes.reduce((sum, size) => sum + Math.pow(size - avgPosition, 2), 0) / positionSizes.length) / avgPosition;
            
            if (deviation > 0.5) disciplineScore -= 10;
            else if (deviation > 0.3) disciplineScore -= 5;
            
            return Math.max(0, Math.min(25, disciplineScore));
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
