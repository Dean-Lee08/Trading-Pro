// utils.js - 유틸리티 함수 모음

// ==================== Date & Time Utilities ====================

/**
 * EST 거래 날짜 가져오기
 */
function getESTTradingDate(date = new Date()) {
    return new Date(date);
}

/**
 * 저장용 날짜 포맷 (YYYY-MM-DD)
 */
function formatTradingDate(date) {
    // 이미 문자열 형식(YYYY-MM-DD)인 경우 그대로 반환
    if (typeof date === 'string') {
        // 유효한 날짜 형식인지 확인
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        // 문자열이지만 날짜 형식이 아닌 경우 Date 객체로 변환 시도
        date = new Date(date);
    }
    
    // Date 객체가 아닌 경우 현재 날짜 사용
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        date = new Date();
    }
    
    // Date 객체를 YYYY-MM-DD 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 현재 날짜 표시 업데이트
 */
function updateCurrentDateDisplay() {
    // currentTradingDate를 Date 객체로 변환
    let displayDate;
    if (typeof currentTradingDate === 'string') {
        displayDate = new Date(currentTradingDate + 'T12:00:00');
    } else if (currentTradingDate instanceof Date) {
        displayDate = currentTradingDate;
    } else {
        displayDate = new Date();
    }
    
    const dateStr = displayDate.toLocaleDateString(
        currentLanguage === 'ko' ? 'ko-KR' : 'en-US',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
    );
    
    const displayElement = document.getElementById('currentDateDisplay');
    if (displayElement) {
        displayElement.textContent = dateStr;
    }
}

// calculateHoldingTime is defined in trading.js

/**
 * 표준 편차 계산
 */
function calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
}

// ==================== UI Utilities ====================

/**
 * 토스트 알림 표시
 */
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * 사이드바 토글 (모바일)
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// showPage is defined in main.js

/**
 * 상세 카드 접기/펼치기
 */
function toggleDetailCard(header) {
    const card = header.parentElement;
    card.classList.toggle('collapsed');
}

// ==================== Language Utilities ====================

/**
 * 언어 업데이트
 */
function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLanguage][key];
            } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

/**
 * 설정에서 언어 변경
 */
function changeLanguageFromSettings() {
    const select = document.getElementById('settingsLanguageSelect');
    currentLanguage = select.value;
    updateLanguage();
    updateStats();
    updateDetailedAnalytics();
    localStorage.setItem('tradingPlatformLanguage', currentLanguage);
}

// ==================== Storage Utilities ====================

/**
 * 거래 데이터 저장
 */
function saveTrades() {
    try {
        const dataStr = JSON.stringify(trades);
        localStorage.setItem('tradingPlatformTrades', dataStr);
    } catch (error) {
        console.error('Error saving trades:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please export your data and clear old entries.');
        } else {
            alert('Failed to save data. Please check browser storage permissions.');
        }
    }
}

/**
 * 거래 데이터 불러오기
 */
function loadTrades() {
    try {
        const saved = localStorage.getItem('tradingPlatformTrades');
        if (saved) {
            trades = JSON.parse(saved);
            // Ensure all trades have notes property and shares property
            trades = trades.map(trade => ({
                ...trade,
                notes: trade.notes || '',
                shares: trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0),
                amount: trade.amount || (trade.shares && trade.buyPrice ? trade.shares * trade.buyPrice : 0)
            }));
        } else {
            trades = [];
        }
    } catch (error) {
        console.error('Error loading trades:', error);
        trades = [];
        alert('Failed to load saved data.');
    }
}

/**
 * 노트 데이터 저장
 */
function saveNotes() {
    try {
        const dataStr = JSON.stringify(notes);
        localStorage.setItem('tradingPlatformNotes', dataStr);
    } catch (error) {
        console.error('Error saving notes:', error);
        if (error.name === 'QuotaExceededError') {
            showToast('Storage quota exceeded');
        } else {
            showToast('Failed to save notes');
        }
    }
}

/**
 * 노트 데이터 불러오기
 */
function loadNotes() {
    try {
        const saved = localStorage.getItem('tradingPlatformNotes');
        if (saved) {
            notes = JSON.parse(saved);
            notes = notes.map(note => ({
                ...note,
                category: note.category || 'general',
                textColor: note.textColor || '#94a3b8',
                font: note.font || "'Inter', sans-serif",
                pinned: note.pinned || false
            }));
        } else {
            notes = [];
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        notes = [];
    }
}

// ==================== Chart Utilities ====================

/**
 * Chart.js 로딩 대기
 */
function waitForChart() {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') {
            resolve();
        } else {
            const checkChart = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    clearInterval(checkChart);
                    resolve();
                }
            }, 100);
        }
    });
}

/**
 * 차트 생성 통합 함수
 */
async function createChart(canvasId, type, data, options = {}, chartStore = basicCharts) {
    try {
        await waitForChart();
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element not found: ${canvasId}`);
            return null;
        }

        // 기존 차트가 있다면 완전히 제거
        if (chartStore[canvasId]) {
            try {
                chartStore[canvasId].destroy();
            } catch (error) {
                console.error(`Error destroying chart ${canvasId}:`, error);
            }
            delete chartStore[canvasId];
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

        chartStore[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        });

        return chartStore[canvasId];
    } catch (error) {
        console.error(`Error creating chart ${canvasId}:`, error);
        return null;
    }
}

/**
 * 기본 차트 생성
 */
async function createBasicChart(canvasId, type, data, options = {}) {
    return createChart(canvasId, type, data, options, basicCharts);
}

/**
 * 고급 차트 생성
 */
async function createAdvancedChart(canvasId, type, data, options = {}) {
    return createChart(canvasId, type, data, options, advancedCharts);
}

/**
 * 모든 차트 정리
 */
function destroyAllCharts() {
    // 기본 차트 정리
    Object.keys(basicCharts).forEach(key => {
        try {
            if (basicCharts[key]) {
                basicCharts[key].destroy();
            }
        } catch (error) {
            console.error(`Error destroying basic chart ${key}:`, error);
        }
    });
    basicCharts = {};

    // 고급 차트 정리
    Object.keys(advancedCharts).forEach(key => {
        try {
            if (advancedCharts[key]) {
                advancedCharts[key].destroy();
            }
        } catch (error) {
            console.error(`Error destroying advanced chart ${key}:`, error);
        }
    });
    advancedCharts = {};
}

// ==================== Element Update Utilities ====================

// ==================== Data Filtering Utilities ====================

/**
 * 범용 거래 필터링 함수
 * @param {Array} trades - 필터링할 거래 배열
 * @param {Object} options - 필터 옵션
 * @param {string} options.startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} options.endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {string} options.specificDate - 특정 날짜 (YYYY-MM-DD)
 * @returns {Array} 필터링된 거래 배열
 */
function filterTrades(allTrades, options = {}) {
    const { startDate, endDate, specificDate } = options;

    if (specificDate) {
        return allTrades.filter(trade => trade.date === specificDate);
    }

    if (startDate || endDate) {
        return allTrades.filter(trade => {
            const tradeDate = trade.date;
            if (startDate && tradeDate < startDate) return false;
            if (endDate && tradeDate > endDate) return false;
            return true;
        });
    }

    return allTrades;
}

// ==================== Data Export/Import Utilities ====================

// exportData, importData, handleFileImport, clearAllData 함수는 main.js에 정의되어 있습니다.
