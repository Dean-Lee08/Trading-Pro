// ==================== NEW AI ANALYSIS RENDER FUNCTIONS ====================

/**
 * Render Multivariate Correlation Matrix
 * Displays correlation analysis between psychological and performance variables
 */
function renderCorrelationMatrix() {
    const container = document.getElementById('correlationMatrixContent');
    if (!container) return;

    const analysis = analyzeMultivariateCorrelations();

    if (!analysis || analysis.correlations.length === 0) {
        container.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">${
                    currentLanguage === 'ko' ?
                    '다변량 상관관계 분석을 위한 데이터가 부족합니다.' :
                    'Insufficient data for multivariate correlation analysis.'
                }</div>
                <div style="color: #64748b; font-size: 12px;">${
                    currentLanguage === 'ko' ?
                    '최소 20개 거래와 10일의 심리 데이터가 필요합니다.' :
                    'Need at least 20 trades and 10 days of psychology data.'
                }</div>
            </div>
        `;
        return;
    }

    // Build correlation cards HTML
    const correlationCardsHTML = analysis.correlations.map((corr, idx) => {
        const absCorr = Math.abs(corr.correlation);
        const strengthColor = absCorr > 0.5 ? '#10b981' : absCorr > 0.3 ? '#f59e0b' : '#64748b';
        const corrColor = corr.correlation > 0 ? '#10b981' : '#ef4444';
        const corrSign = corr.correlation > 0 ? '+' : '';

        return `
            <div class="glass-card hover-lift" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.03)); border: 1px solid rgba(139, 92, 246, 0.2); padding: 24px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.05;">🔗</div>

                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                    <h4 style="color: #f8fafc; font-size: 15px; font-weight: 600; margin: 0;">${corr.name}</h4>
                    <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 4px 10px; border-radius: 6px;">
                        <span style="color: ${strengthColor}; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;">${corr.strength.toUpperCase()}</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="flex: 1;">
                        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${
                            currentLanguage === 'ko' ? '상관계수' : 'Correlation Coefficient'
                        }</div>
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <span style="color: ${corrColor}; font-size: 28px; font-weight: 700;">${corrSign}${(corr.correlation * 100).toFixed(1)}</span>
                            <span style="color: #64748b; font-size: 14px;">%</span>
                        </div>
                    </div>
                    <div style="width: 80px; height: 80px;">
                        <div style="width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(${corrColor} ${Math.abs(corr.correlation) * 100}%, rgba(100, 116, 139, 0.2) 0); display: flex; align-items: center; justify-content: center;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 20px;">${corr.correlation > 0 ? '📈' : '📉'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.5); border-left: 3px solid ${corrColor}; padding: 12px 14px; border-radius: 0 8px 8px 0;">
                    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">${corr.insight}</div>
                </div>
            </div>
        `;
    }).join('');

    // Data quality badge
    const qualityColor = analysis.dataQuality === 'High' ? '#10b981' : analysis.dataQuality === 'Medium' ? '#f59e0b' : '#64748b';
    const qualityText = currentLanguage === 'ko' ?
        (analysis.dataQuality === 'High' ? '높음' : analysis.dataQuality === 'Medium' ? '중간' : '낮음') :
        analysis.dataQuality;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.2);">
            <div style="color: #94a3b8; font-size: 13px;">
                <span style="color: #f8fafc; font-weight: 600;">${analysis.sampleSize}</span> ${
                    currentLanguage === 'ko' ? '일 분석됨' : 'days analyzed'
                }
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #94a3b8; font-size: 12px;">${currentLanguage === 'ko' ? '데이터 품질:' : 'Data Quality:'}</span>
                <span style="color: ${qualityColor}; font-size: 12px; font-weight: 600;">${qualityText}</span>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            ${correlationCardsHTML}
        </div>
    `;
}

/**
 * Render Temporal Patterns
 * Displays time-based trading patterns
 */
function renderTemporalPatterns() {
    const container = document.getElementById('temporalPatternContent');
    if (!container) return;

    const analysis = detectTemporalPatterns();

    if (!analysis || analysis.patterns.length === 0) {
        container.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">${
                    currentLanguage === 'ko' ?
                    '시계열 패턴 분석을 위한 데이터가 부족합니다.' :
                    'Insufficient data for temporal pattern analysis.'
                }</div>
                <div style="color: #64748b; font-size: 12px;">${
                    currentLanguage === 'ko' ?
                    '최소 30개 거래가 필요합니다.' :
                    'Need at least 30 trades.'
                }</div>
            </div>
        `;
        return;
    }

    let patternsHTML = '';

    // Weekday Performance Pattern
    const weekdayPattern = analysis.patterns.find(p => p.type === 'weekday_performance');
    if (weekdayPattern) {
        const bestColor = weekdayPattern.bestDayWinRate >= 60 ? '#10b981' : '#3b82f6';
        const worstColor = weekdayPattern.worstDayWinRate < 40 ? '#ef4444' : '#f59e0b';

        patternsHTML += `
            <div class="glass-card" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(8, 145, 178, 0.03)); border: 1px solid rgba(6, 182, 212, 0.2); padding: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                    <div style="font-size: 32px;">📅</div>
                    <div>
                        <h4 style="color: #f8fafc; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${
                            currentLanguage === 'ko' ? '요일별 성과 패턴' : 'Weekday Performance Pattern'
                        }</h4>
                        <div style="color: #64748b; font-size: 12px;">${
                            currentLanguage === 'ko' ? '최적 거래 요일 분석' : 'Optimal trading days analysis'
                        }</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; border-radius: 8px;">
                        <div style="color: #6ee7b7; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">${
                            currentLanguage === 'ko' ? '최고 성과일' : 'Best Day'
                        }</div>
                        <div style="color: ${bestColor}; font-size: 24px; font-weight: 700; margin-bottom: 4px;">${weekdayPattern.bestDay}</div>
                        <div style="color: #94a3b8; font-size: 12px;">
                            $${weekdayPattern.bestDayAvgPnL.toFixed(2)} • ${weekdayPattern.bestDayWinRate.toFixed(0)}%
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 8px;">
                        <div style="color: #fca5a5; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">${
                            currentLanguage === 'ko' ? '최저 성과일' : 'Worst Day'
                        }</div>
                        <div style="color: ${worstColor}; font-size: 24px; font-weight: 700; margin-bottom: 4px;">${weekdayPattern.worstDay}</div>
                        <div style="color: #94a3b8; font-size: 12px;">
                            $${weekdayPattern.worstDayAvgPnL.toFixed(2)} • ${weekdayPattern.worstDayWinRate.toFixed(0)}%
                        </div>
                    </div>
                </div>

                <div style="background: rgba(6, 182, 212, 0.1); border-left: 3px solid #06b6d4; padding: 12px 14px; border-radius: 0 8px 8px 0;">
                    <div style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">${weekdayPattern.insight}</div>
                </div>
            </div>
        `;
    }

    // Consecutive Day Fatigue Pattern
    const fatiguePattern = analysis.patterns.find(p => p.type === 'consecutive_day_fatigue');
    if (fatiguePattern && fatiguePattern.detected) {
        patternsHTML += `
            <div class="glass-card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.04)); border: 1px solid rgba(245, 158, 11, 0.3); padding: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="font-size: 32px;">⚠️</div>
                    <div style="flex: 1;">
                        <h4 style="color: #fbbf24; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${
                            currentLanguage === 'ko' ? '연속 거래일 피로도 감지' : 'Consecutive Day Fatigue Detected'
                        }</h4>
                    </div>
                    <div style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); padding: 6px 12px; border-radius: 6px;">
                        <span style="color: #fbbf24; font-size: 11px; font-weight: 600;">⚠️ ${
                            currentLanguage === 'ko' ? '주의' : 'WARNING'
                        }</span>
                    </div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: 0 8px 8px 0;">
                    <div style="color: #fcd34d; font-size: 13px; line-height: 1.5; font-weight: 500;">${fatiguePattern.insight}</div>
                </div>
            </div>
        `;
    }

    // Summary stats
    const summaryHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.2);">
            <div style="color: #94a3b8; font-size: 13px;">
                <span style="color: #f8fafc; font-weight: 600;">${analysis.totalTradingDays}</span> ${
                    currentLanguage === 'ko' ? '거래일' : 'trading days'
                }
            </div>
            <div style="color: #94a3b8; font-size: 13px;">
                ${currentLanguage === 'ko' ? '일평균' : 'Avg per day'}: <span style="color: #f8fafc; font-weight: 600;">${analysis.avgTradesPerDay.toFixed(1)}</span> ${
                    currentLanguage === 'ko' ? '거래' : 'trades'
                }
            </div>
        </div>
    `;

    container.innerHTML = summaryHTML + (patternsHTML || `
        <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 20px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
            <div style="color: #64748b; font-size: 14px;">${
                currentLanguage === 'ko' ? '특별한 패턴이 감지되지 않았습니다.' : 'No significant patterns detected.'
            }</div>
        </div>
    `);
}

/**
 * Render Cluster Analysis
 * Displays trade clustering by holding time
 */
function renderClusterAnalysis() {
    const container = document.getElementById('clusterAnalysisContent');
    if (!container) return;

    const analysis = performTradeClustering();

    if (!analysis) {
        container.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.5); text-align: center; padding: 30px; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.2);">
                <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">${
                    currentLanguage === 'ko' ?
                    '군집 분석을 위한 데이터가 부족합니다.' :
                    'Insufficient data for cluster analysis.'
                }</div>
                <div style="color: #64748b; font-size: 12px;">${
                    currentLanguage === 'ko' ?
                    '보유시간 정보가 있는 거래가 최소 20개 필요합니다.' :
                    'Need at least 20 trades with holding time data.'
                }</div>
            </div>
        `;
        return;
    }

    // Create cluster cards
    const clusterCardsHTML = analysis.clusters.map((cluster, idx) => {
        const isOptimal = cluster.name === analysis.optimalCluster;
        const borderColor = isOptimal ? '#10b981' : 'rgba(100, 116, 139, 0.3)';
        const glowColor = isOptimal ? 'rgba(16, 185, 129, 0.2)' : 'transparent';
        const iconMap = ['⚡', '📊', '🎯'];
        const colorMap = ['#3b82f6', '#f59e0b', '#10b981'];

        return `
            <div class="glass-card hover-lift" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.02)); border: 2px solid ${borderColor}; padding: 24px; position: relative; overflow: hidden; box-shadow: 0 0 30px ${glowColor};">
                ${isOptimal ? `
                    <div style="position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #10b981, #059669); padding: 6px 12px; border-radius: 20px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                        <span style="color: white; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">⭐ ${
                            currentLanguage === 'ko' ? '최적' : 'OPTIMAL'
                        }</span>
                    </div>
                ` : ''}

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                    <div style="font-size: 36px;">${iconMap[idx]}</div>
                    <div style="flex: 1;">
                        <h4 style="color: #f8fafc; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${cluster.name}</h4>
                        <div style="color: #64748b; font-size: 12px;">${cluster.tradeCount} ${
                            currentLanguage === 'ko' ? '거래' : 'trades'
                        } • ${cluster.avgHoldTime.toFixed(0)} ${currentLanguage === 'ko' ? '분 평균' : 'min avg'}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div style="background: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${
                            currentLanguage === 'ko' ? '평균 손익' : 'Avg P&L'
                        }</div>
                        <div style="color: ${cluster.avgPnL >= 0 ? '#10b981' : '#ef4444'}; font-size: 20px; font-weight: 700;">
                            ${cluster.avgPnL >= 0 ? '+' : ''}$${cluster.avgPnL.toFixed(2)}
                        </div>
                    </div>
                    <div style="background: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">${
                            currentLanguage === 'ko' ? '승률' : 'Win Rate'
                        }</div>
                        <div style="color: ${cluster.winRate >= 50 ? '#10b981' : '#ef4444'}; font-size: 20px; font-weight: 700;">
                            ${cluster.winRate.toFixed(0)}%
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border-left: 3px solid ${colorMap[idx]};">
                    <span style="color: #94a3b8; font-size: 12px;">${
                        currentLanguage === 'ko' ? 'Profit Factor' : 'Profit Factor'
                    }</span>
                    <span style="color: ${cluster.profitFactor >= 1.5 ? '#10b981' : cluster.profitFactor >= 1 ? '#f59e0b' : '#ef4444'}; font-size: 14px; font-weight: 600;">
                        ${cluster.profitFactor.toFixed(2)}x
                    </span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); border: 1px solid rgba(16, 185, 129, 0.3); padding: 16px 20px; border-radius: 10px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">🎯</div>
                <div style="flex: 1; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
                    <strong style="color: #10b981;">${currentLanguage === 'ko' ? '추천:' : 'Recommendation:'}</strong> ${analysis.recommendation}
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            ${clusterCardsHTML}
        </div>
    `;
}
