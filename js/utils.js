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

/**
 * 보유 시간 계산
 */
function calculateHoldingTime() {
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    const holdingTimeDisplay = document.getElementById('holdingTimeDisplay');
    
    if (!holdingTimeDisplay) return;
    
    if (entryTime && exitTime) {
        try {
            const [entryHour, entryMin] = entryTime.split(':').map(Number);
            const [exitHour, exitMin] = exitTime.split(':').map(Number);
            
            let entryMinutes = entryHour * 60 + entryMin;
            let exitMinutes = exitHour * 60 + exitMin;
            
            if (exitMinutes < entryMinutes) {
                exitMinutes += 24 * 60;
            }
            
            const diffMinutes = exitMinutes - entryMinutes;
            
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            
            if (hours > 0) {
                holdingTimeDisplay.value = `${hours}h ${minutes}m`;
            } else {
                holdingTimeDisplay.value = `${minutes}m`;
            }
        } catch (error) {
            console.error('Error calculating holding time:', error);
            holdingTimeDisplay.value = '';
        }
    } else {
        holdingTimeDisplay.value = '';
    }
}

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

/**
 * 페이지 전환
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    
    if (pageId === 'analysis') {
        updateDetailedAnalytics();
        if (currentAnalyticsSection === 'detail') {
            setTimeout(updateBasicCharts, 100);
        } else {
            setTimeout(updateAdvancedCharts, 100);
        }
    }
    
    if (pageId === 'notes') {
        renderAllNotesSections();
    }

    if (pageId === 'psychology') {
        setTimeout(() => {
            loadPsychologyData();
        }, 100);
    }
    
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

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
        localStorage.setItem('tradingPlatformTrades', JSON.stringify(trades));
    } catch (error) {
        console.error('Error saving trades:', error);
        alert('Failed to save data. Please check browser storage.');
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
        localStorage.setItem('tradingPlatformNotes', JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes:', error);
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
 * 기본 차트 생성
 */
async function createBasicChart(canvasId, type, data, options = {}) {
    try {
        await waitForChart();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // 기존 차트가 있다면 완전히 제거
        if (basicCharts[canvasId]) {
            basicCharts[canvasId].destroy();
            delete basicCharts[canvasId];
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

/**
 * 고급 차트 생성
 */
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

// ==================== Element Update Utilities ====================


// ==================== Data Export/Import Utilities ====================

/**
 * 데이터 내보내기
 */
function exportData() {
    const exportData = {
        trades: trades,
        notes: notes,
        dailyFees: dailyFees
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'trading_data.json';
    link.click();
    
    showToast(currentLanguage === 'ko' ? '데이터가 내보내졌습니다' : 'Data exported');
}

/**
 * 데이터 가져오기
 */
function importData() {
    document.getElementById('importFileInput').click();
}

/**
 * 파일 가져오기 처리
 */
function handleFileImport() {
    const file = document.getElementById('importFileInput').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.trades && Array.isArray(importedData.trades)) {
                    trades = importedData.trades.map(trade => ({
                        ...trade,
                        notes: trade.notes || ''
                    }));
                    if (importedData.notes && Array.isArray(importedData.notes)) {
                        notes = importedData.notes.map(note => ({
                            ...note,
                            category: note.category || 'general',
                            font: note.font || "'Source Code Pro', monospace"
                        }));
                    }
                    if (importedData.dailyFees) {
                        dailyFees = importedData.dailyFees;
                    }
                    saveTrades();
                    saveNotes();
                    localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
                    updateStats();
                    renderCalendar();
                    renderAllNotesSections();
                    updateAllTradesList();
                    updateDetailedAnalytics();
                    loadDailyFees();
                    showToast(currentLanguage === 'ko' ? '데이터가 가져와졌습니다' : 'Data imported');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                alert(currentLanguage === 'ko' ? '잘못된 파일 형식' : 'Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

/**
 * 모든 데이터 삭제
 */
function clearAllData() {
    const confirmMessage = currentLanguage === 'ko' ? 
        '모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : 
        'Are you sure you want to clear all data? This action cannot be undone.';
    
    if (confirm(confirmMessage)) {
        trades = [];
        notes = [];
        dailyFees = {};
        saveTrades();
        saveNotes();
        localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
        updateStats();
        renderCalendar();
        renderAllNotesSections();
        updateAllTradesList();
        updateDetailedAnalytics();
        clearCalendarRange();
        loadDailyFees();
        showToast(currentLanguage === 'ko' ? '모든 데이터가 삭제됨' : 'All data cleared');
    }
}
