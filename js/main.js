// ============================================
// main.js - Main Application Logic & Initialization
// ============================================

// ============================================
// Page Navigation
// ============================================

function showPage(pageId, clickedElement) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(pageId).classList.add('active');

    // 클릭된 요소를 찾아서 active 클래스 추가
    if (clickedElement) {
        clickedElement.classList.add('active');
    } else {
        // onclick에서 호출된 경우 pageId로 해당 버튼 찾기
        const navButton = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`);
        if (navButton) {
            navButton.classList.add('active');
        }
    }

    if (pageId === 'calendar') {
        renderCalendar();
    } else if (pageId === 'analysis') {
        updateDetailedAnalytics();
    } else if (pageId === 'psychology') {
        updatePsychologyDisplay();
    }
}

function showDashboardSection(section) {
    // 탭 상태 업데이트
    if (section === 'trading') {
        document.querySelector('[data-lang="trading-record"]').classList.add('active');
        document.querySelector('[data-lang="position-calculator"]').classList.remove('active');
        document.getElementById('positionCalculatorSection').style.display = 'none';
        document.querySelector('.dashboard-grid').style.display = 'grid';
        document.querySelector('.trades-section').style.display = 'block';
        
        // 거래 기록에서는 성과 카드와 날짜 요소들 표시
        const statsOverview = document.querySelector('.stats-overview');
        const dateRangeSelector = document.querySelector('.date-range-selector');
        const dateNavigation = document.querySelector('.date-navigation');
        
        if (statsOverview) statsOverview.style.display = 'grid';
        if (dateRangeSelector) dateRangeSelector.style.display = 'flex';
        if (dateNavigation) dateNavigation.style.display = 'flex';
        
    } else if (section === 'position-calc') {
        document.querySelector('[data-lang="trading-record"]').classList.remove('active');
        document.querySelector('[data-lang="position-calculator"]').classList.add('active');
        document.getElementById('positionCalculatorSection').style.display = 'block';
        document.querySelector('.dashboard-grid').style.display = 'none';
        document.querySelector('.trades-section').style.display = 'none';
        
        // 포지션 계산기에서는 성과 카드와 날짜 요소들 숨기기
        const statsOverview = document.querySelector('.stats-overview');
        const dateRangeSelector = document.querySelector('.date-range-selector');
        const dateNavigation = document.querySelector('.date-navigation');
        
        if (statsOverview) statsOverview.style.display = 'none';
        if (dateRangeSelector) dateRangeSelector.style.display = 'none';
        if (dateNavigation) dateNavigation.style.display = 'none';
    }
}

// ============================================
// Mobile Menu Toggle
// ============================================

// toggleSidebar is defined in utils.js

// ============================================
// Date Navigation & Picker
// ============================================

// updateCurrentDateDisplay is defined in utils.js

function changeTradingDate(days) {
    // currentTradingDate가 Date 객체인지 확인
    let date;
    if (typeof currentTradingDate === 'string') {
        date = new Date(currentTradingDate + 'T12:00:00');
    } else if (currentTradingDate instanceof Date) {
        date = new Date(currentTradingDate);
    } else {
        date = new Date();
    }
    
    date.setDate(date.getDate() + days);
    currentTradingDate = formatTradingDate(date);
    
    updateCurrentDateDisplay();
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    loadDailyFees();
}

function openDatePicker() {
    document.getElementById('datePickerInput').value = currentTradingDate;
    document.getElementById('datePickerModal').style.display = 'flex';
}

function closeDatePicker() {
    document.getElementById('datePickerModal').style.display = 'none';
}

function applySelectedDate() {
    const selectedDate = document.getElementById('datePickerInput').value;
    if (selectedDate) {
        currentTradingDate = selectedDate;
        updateCurrentDateDisplay();
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        loadDailyFees();
    }
    closeDatePicker();
}

// ============================================
// Date Range Clearing Functions
// ============================================

// clearDashboardRange is defined in trading.js
// clearAnalyticsRange is defined in analytics.js
// clearTradesRange is defined in trading.js

// ============================================
// Trade Form Handling
// ============================================

// calculatePnL and calculateHoldingTime are defined in trading.js

function toggleTimeEdit() {
    const entryTimeInput = document.getElementById('entryTime');
    entryTimeInput.disabled = !entryTimeInput.disabled;
    
    if (!entryTimeInput.disabled) {
        entryTimeInput.focus();
    }
}

// resetForm is defined in trading.js

// handleTradeSubmit is defined in trading.js

// ============================================
// Trade Edit Modal
// ============================================

function openEditTradeModal(tradeId) {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editSymbol').value = trade.symbol;
    document.getElementById('editShares').value = trade.shares;
    document.getElementById('editBuyPrice').value = trade.buyPrice;
    document.getElementById('editSellPrice').value = trade.sellPrice;
    document.getElementById('editEntryTime').value = trade.entryTime || '';
    document.getElementById('editExitTime').value = trade.exitTime || '';
    
    document.getElementById('editTradeModal').style.display = 'flex';
}

// closeEditTradeModal is defined in trading.js
// handleEditTradeSubmit is defined in trading.js

// ============================================
// Trade Deletion
// ============================================

// deleteTrade is defined in trading.js

// ============================================
// Bulk Trade Selection & Deletion
// ============================================

// Trade selection functions are defined in trading.js
// toggleAllTrades, toggleAllTradesList, deleteSelectedTrades, deleteSelectedTradesList

// ============================================
// Daily Fees Management
// ============================================

// saveDailyFees is defined in trading.js
// loadDailyFees is defined in trading.js

// ============================================
// Data Management (Export/Import/Clear)
// ============================================

function exportData() {
    const data = {
        trades: trades,
        dailyFees: dailyFees,
        notes: notes,
        psychologyData: psychologyData,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trading-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast(currentLanguage === 'ko' ? '데이터가 내보내기되었습니다' : 'Data exported successfully');
}

function importData() {
    document.getElementById('importFileInput').click();
}

function handleFileImport() {
    const file = document.getElementById('importFileInput').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.trades) {
                trades = data.trades;
                saveTrades();
            }
            
            if (data.dailyFees) {
                dailyFees = data.dailyFees;
                localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
            }
            
            if (data.notes) {
                notes = data.notes;
                saveNotes();
            }
            
            if (data.psychologyData) {
                psychologyData = data.psychologyData;
                localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
            }
            
            updateStats();
            updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
            updateAllTradesList();
            renderAllNotesSections();
            renderCalendar();
            updateDetailedAnalytics();
            loadDailyFees();
            
            showToast(currentLanguage === 'ko' ? '데이터가 가져오기되었습니다' : 'Data imported successfully');
        } catch (error) {
            alert(currentLanguage === 'ko' ? '파일을 읽는 중 오류가 발생했습니다.' : 'Error reading file. Please check the file format.');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
}

function clearAllData() {
    const confirmMessage = currentLanguage === 'ko' ? 
        '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : 
        'Are you sure you want to clear all data? This action cannot be undone.';
    
    if (confirm(confirmMessage)) {
        const doubleConfirm = currentLanguage === 'ko' ? 
            '다시 한 번 확인합니다. 모든 거래, 노트, 심리 데이터가 삭제됩니다.' : 
            'Please confirm again. All trades, notes, and psychology data will be deleted.';
        
        if (confirm(doubleConfirm)) {
            trades = [];
            dailyFees = {};
            notes = [];
            psychologyData = {};

            localStorage.removeItem('tradingPlatformTrades');
            localStorage.removeItem('tradingPlatformDailyFees');
            localStorage.removeItem('tradingPlatformNotes');
            localStorage.removeItem('tradingPlatformPsychologyData');
            
            updateStats();
            updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
            updateAllTradesList();
            renderAllNotesSections();
            renderCalendar();
            updateDetailedAnalytics();
            document.getElementById('dailyFees').value = '';
            
            showToast(currentLanguage === 'ko' ? '모든 데이터가 삭제되었습니다' : 'All data cleared');
        }
    }
}

// ============================================
// Settings Management
// ============================================

function changeLanguageFromSettings() {
    const newLanguage = document.getElementById('settingsLanguageSelect').value;
    currentLanguage = newLanguage;
    localStorage.setItem('tradingPlatformLanguage', currentLanguage);
    updateLanguage();

    // 모든 페이지 다시 렌더링
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    updateAllTradesList();
    renderAllNotesSections();
    renderCalendar();
    updateDetailedAnalytics();

    showToast(currentLanguage === 'ko' ? '언어가 변경되었습니다' : 'Language changed');
}

/**
 * Alpha Vantage API 키 저장
 */
function saveAlphaVantageApiKey() {
    const apiKeyInput = document.getElementById('alphaVantageApiKeyInput');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert(currentLanguage === 'ko' ? 'API 키를 입력해주세요.' : 'Please enter an API key.');
        return;
    }

    setAlphaVantageApiKey(apiKey);
    showToast(currentLanguage === 'ko' ? 'API 키가 저장되었습니다' : 'API key saved');
}

/**
 * Alpha Vantage API 키 설정 페이지에 로드
 */
function loadAlphaVantageApiKeyToSettings() {
    const apiKeyInput = document.getElementById('alphaVantageApiKeyInput');
    if (apiKeyInput) {
        const currentKey = getAlphaVantageApiKey();
        if (currentKey) {
            apiKeyInput.value = currentKey;
        }
    }
}

/**
 * 시장 데이터 캐시 클리어
 */
function clearMarketCache() {
    const confirmMessage = currentLanguage === 'ko' ?
        '시장 데이터 캐시를 삭제하시겠습니까?' :
        'Are you sure you want to clear market data cache?';

    if (confirm(confirmMessage)) {
        clearMarketDataCache();
        showToast(currentLanguage === 'ko' ? '캐시가 삭제되었습니다' : 'Cache cleared');
    }
}

// ============================================
// Application Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await waitForChart();
    
    // Load saved language
    const savedLanguage = localStorage.getItem('tradingPlatformLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById('settingsLanguageSelect').value = currentLanguage;
    }
    
    // Load daily fees
    const savedFees = localStorage.getItem('tradingPlatformDailyFees');
    if (savedFees) {
        dailyFees = JSON.parse(savedFees);
    }

    // Initialize market data module
    initializeMarketDataModule();
    loadAlphaVantageApiKeyToSettings();

    // Initialize current date
    const now = new Date();
    currentTradingDate = formatTradingDate(now);
    updateCurrentDateDisplay();
    updateLanguage();

    // Load all data
    loadTrades();
    loadNotes();
    loadPsychologyData();
    updateStats();
    renderCalendar();
    renderAllNotesSections();
    updateAllTradesList();
    updateDetailedAnalytics();
    loadDailyFees();
    
    // Set up form handlers
    document.getElementById('tradeForm').addEventListener('submit', handleTradeSubmit);
    document.getElementById('editTradeForm').addEventListener('submit', handleEditTradeSubmit);
    
    // 시간 변경 이벤트 리스너
    const entryTimeInput = document.getElementById('entryTime');
    const exitTimeInput = document.getElementById('exitTime');
    
    if (entryTimeInput) {
        entryTimeInput.addEventListener('change', calculateHoldingTime);
    }
    
    if (exitTimeInput) {
        exitTimeInput.addEventListener('change', calculateHoldingTime);
    }
    
    // Dashboard date range listeners
    document.getElementById('dashboardStartDate').addEventListener('change', function() {
        dashboardStartDate = this.value;
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    });
    
    document.getElementById('dashboardEndDate').addEventListener('change', function() {
        dashboardEndDate = this.value;
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    });

    // Analytics date range listeners
    document.getElementById('analyticsStartDate').addEventListener('change', function() {
        analyticsStartDate = this.value;
        updateDetailedAnalytics();
    });
    
    document.getElementById('analyticsEndDate').addEventListener('change', function() {
        analyticsEndDate = this.value;
        updateDetailedAnalytics();
    });

    // Trades page date range listeners
    document.getElementById('tradesStartDate').addEventListener('change', function() {
        tradesStartDate = this.value;
        updateAllTradesList();
    });
    
    document.getElementById('tradesEndDate').addEventListener('change', function() {
        tradesEndDate = this.value;
        updateAllTradesList();
    });
    
    // Modal click outside to close
    document.getElementById('datePickerModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDatePicker();
        }
    });

    document.getElementById('editTradeModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditTradeModal();
        }
    });

    document.getElementById('monthDetailsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeMonthDetails();
        }
    });

    document.getElementById('weekDetailsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeWeekDetails();
        }
    });
});

/**
 * 심리 화면 표시 업데이트
 */
function updatePsychologyDisplay() {
    loadPsychologyData();
    updateVisualCards();
}
