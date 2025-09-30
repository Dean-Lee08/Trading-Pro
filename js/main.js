// ============================================
// main.js - Main Application Logic & Initialization
// ============================================

// ============================================
// Page Navigation
// ============================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');
    
    if (pageId === 'calendar') {
        renderCalendar();
    } else if (pageId === 'analysis') {
        updateDetailedAnalytics();
    } else if (pageId === 'psychology') {
        updatePsychologyDisplay();
    }
}

function showDashboardSection(section) {
    if (section === 'trading') {
        document.querySelector('[data-lang="trading-record"]').classList.add('active');
        document.querySelector('[data-lang="position-calculator"]').classList.remove('active');
        document.getElementById('positionCalculatorSection').style.display = 'none';
        document.querySelector('.dashboard-grid').style.display = 'grid';
        document.querySelector('.trades-section').style.display = 'block';
    } else if (section === 'position-calc') {
        document.querySelector('[data-lang="trading-record"]').classList.remove('active');
        document.querySelector('[data-lang="position-calculator"]').classList.add('active');
        document.getElementById('positionCalculatorSection').style.display = 'block';
        document.querySelector('.dashboard-grid').style.display = 'none';
        document.querySelector('.trades-section').style.display = 'none';
    }
}

// ============================================
// Mobile Menu Toggle
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// ============================================
// Date Navigation & Picker
// ============================================

function updateCurrentDateDisplay() {
    const displayElement = document.getElementById('currentDateDisplay');
    if (displayElement) {
        displayElement.textContent = currentTradingDate;
    }
}

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

function clearDashboardRange() {
    dashboardStartDate = null;
    dashboardEndDate = null;
    document.getElementById('dashboardStartDate').value = '';
    document.getElementById('dashboardEndDate').value = '';
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
}

function clearAnalyticsRange() {
    analyticsStartDate = null;
    analyticsEndDate = null;
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    updateDetailedAnalytics();
}

function clearTradesRange() {
    tradesStartDate = null;
    tradesEndDate = null;
    document.getElementById('tradesStartDate').value = '';
    document.getElementById('tradesEndDate').value = '';
    updateAllTradesList();
}

// ============================================
// Trade Form Handling
// ============================================

function calculatePnL() {
    const shares = parseFloat(document.getElementById('shares').value) || 0;
    const buyPrice = parseFloat(document.getElementById('buyPrice').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
    
    if (shares > 0 && buyPrice > 0 && sellPrice > 0) {
        const pnl = (sellPrice - buyPrice) * shares;
        const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
        const amount = buyPrice * shares;
        
        document.getElementById('pnlDisplay').value = `$${pnl.toFixed(2)}`;
        document.getElementById('pnlDisplay').style.color = pnl >= 0 ? '#10b981' : '#ef4444';
        
        document.getElementById('returnPct').value = `${returnPct.toFixed(2)}%`;
        document.getElementById('returnPct').style.color = returnPct >= 0 ? '#10b981' : '#ef4444';
        
        document.getElementById('amountDisplay').value = `$${amount.toFixed(2)}`;
    } else {
        document.getElementById('pnlDisplay').value = '';
        document.getElementById('returnPct').value = '';
        document.getElementById('amountDisplay').value = '';
    }
    
    calculateHoldingTime();
}

function calculateHoldingTime() {
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    
    if (entryTime && exitTime) {
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number);
        
        let totalMinutes = (exitHours * 60 + exitMinutes) - (entryHours * 60 + entryMinutes);
        
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        let displayText = '';
        if (hours > 0) {
            displayText += `${hours}h `;
        }
        displayText += `${minutes}m`;
        
        document.getElementById('holdingTimeDisplay').value = displayText;
    } else {
        document.getElementById('holdingTimeDisplay').value = '';
    }
}

function toggleTimeEdit() {
    const entryTimeInput = document.getElementById('entryTime');
    entryTimeInput.disabled = !entryTimeInput.disabled;
    
    if (!entryTimeInput.disabled) {
        entryTimeInput.focus();
    }
}

function resetForm() {
    document.getElementById('tradeForm').reset();
    document.getElementById('pnlDisplay').value = '';
    document.getElementById('returnPct').value = '';
    document.getElementById('holdingTimeDisplay').value = '';
    document.getElementById('amountDisplay').value = '';
    
    const now = new Date();
    const estNow = getESTTradingDate(now);
    const hours = estNow.getHours().toString().padStart(2, '0');
    const minutes = estNow.getMinutes().toString().padStart(2, '0');
    document.getElementById('entryTime').value = `${hours}:${minutes}`;
}

function handleTradeSubmit(e) {
    e.preventDefault();
    
    const symbol = document.getElementById('symbol').value.trim().toUpperCase();
    const shares = parseFloat(document.getElementById('shares').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);
    const sellPrice = parseFloat(document.getElementById('sellPrice').value);
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    
    if (!symbol || !shares || !buyPrice || !sellPrice) {
        alert(currentLanguage === 'ko' ? '모든 필수 항목을 입력해주세요.' : 'Please fill in all required fields.');
        return;
    }
    
    const pnl = (sellPrice - buyPrice) * shares;
    const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
    const amount = buyPrice * shares;
    
    let holdingMinutes = 0;
    if (entryTime && exitTime) {
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number);
        holdingMinutes = (exitHours * 60 + exitMinutes) - (entryHours * 60 + entryMinutes);
        if (holdingMinutes < 0) holdingMinutes += 24 * 60;
    }
    
    const trade = {
        id: Date.now(),
        date: currentTradingDate,
        symbol: symbol,
        shares: shares,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        pnl: pnl,
        returnPct: returnPct,
        amount: amount,
        entryTime: entryTime,
        exitTime: exitTime,
        holdingMinutes: holdingMinutes
    };
    
    trades.push(trade);
    saveTrades();
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    updateAllTradesList();
    resetForm();
    
    showToast(currentLanguage === 'ko' ? '거래가 추가되었습니다' : 'Trade added successfully');
}

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

function closeEditTradeModal() {
    document.getElementById('editTradeModal').style.display = 'none';
}

function handleEditTradeSubmit(e) {
    e.preventDefault();
    
    const tradeId = parseInt(document.getElementById('editTradeId').value);
    const symbol = document.getElementById('editSymbol').value.trim().toUpperCase();
    const shares = parseFloat(document.getElementById('editShares').value);
    const buyPrice = parseFloat(document.getElementById('editBuyPrice').value);
    const sellPrice = parseFloat(document.getElementById('editSellPrice').value);
    const entryTime = document.getElementById('editEntryTime').value;
    const exitTime = document.getElementById('editExitTime').value;
    
    const tradeIndex = trades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) return;
    
    const pnl = (sellPrice - buyPrice) * shares;
    const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
    const amount = buyPrice * shares;
    
    let holdingMinutes = 0;
    if (entryTime && exitTime) {
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number);
        holdingMinutes = (exitHours * 60 + exitMinutes) - (entryHours * 60 + entryMinutes);
        if (holdingMinutes < 0) holdingMinutes += 24 * 60;
    }
    
    trades[tradeIndex] = {
        ...trades[tradeIndex],
        symbol: symbol,
        shares: shares,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        pnl: pnl,
        returnPct: returnPct,
        amount: amount,
        entryTime: entryTime,
        exitTime: exitTime,
        holdingMinutes: holdingMinutes
    };
    
    saveTrades();
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    updateAllTradesList();
    closeEditTradeModal();
    
    showToast(currentLanguage === 'ko' ? '거래가 수정되었습니다' : 'Trade updated successfully');
}

// ============================================
// Trade Deletion
// ============================================

function deleteTrade(tradeId) {
    if (confirm(currentLanguage === 'ko' ? '이 거래를 삭제하시겠습니까?' : 'Are you sure you want to delete this trade?')) {
        trades = trades.filter(trade => trade.id !== tradeId);
        saveTrades();
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        updateAllTradesList();
        
        showToast(currentLanguage === 'ko' ? '거래가 삭제되었습니다' : 'Trade deleted');
    }
}

// ============================================
// Bulk Trade Selection & Deletion
// ============================================

function toggleAllTrades() {
    const selectAll = document.getElementById('selectAllTrades').checked;
    document.querySelectorAll('#tradesTableBody input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    updateDeleteButton('tradesTableBody', 'deleteSelectedBtn');
}

function toggleAllTradesList() {
    const selectAll = document.getElementById('selectAllTradesList').checked;
    document.querySelectorAll('#allTradesTableBody input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    updateDeleteButton('allTradesTableBody', 'deleteSelectedListBtn');
}

function updateDeleteButton(tableBodyId, buttonId) {
    const selectedCount = document.querySelectorAll(`#${tableBodyId} input[type="checkbox"]:checked`).length;
    const deleteBtn = document.getElementById(buttonId);
    
    if (selectedCount > 0) {
        deleteBtn.style.display = 'block';
        const text = currentLanguage === 'ko' ? `선택 삭제 (${selectedCount})` : `Delete Selected (${selectedCount})`;
        deleteBtn.textContent = text;
    } else {
        deleteBtn.style.display = 'none';
    }
}

function deleteSelectedTrades() {
    const selectedIds = [];
    document.querySelectorAll('#tradesTableBody input[type="checkbox"]:checked').forEach(checkbox => {
        selectedIds.push(parseInt(checkbox.dataset.tradeId));
    });
    
    if (selectedIds.length === 0) return;
    
    const confirmMessage = currentLanguage === 'ko' ? 
        `${selectedIds.length}개의 거래를 삭제하시겠습니까?` : 
        `Are you sure you want to delete ${selectedIds.length} trade(s)?`;
    
    if (confirm(confirmMessage)) {
        trades = trades.filter(trade => !selectedIds.includes(trade.id));
        saveTrades();
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        document.getElementById('selectAllTrades').checked = false;
        document.getElementById('deleteSelectedBtn').style.display = 'none';
        
        showToast(currentLanguage === 'ko' ? '선택된 거래가 삭제되었습니다' : 'Selected trades deleted');
    }
}

function deleteSelectedTradesList() {
    const selectedIds = [];
    document.querySelectorAll('#allTradesTableBody input[type="checkbox"]:checked').forEach(checkbox => {
        selectedIds.push(parseInt(checkbox.dataset.tradeId));
    });
    
    if (selectedIds.length === 0) return;
    
    const confirmMessage = currentLanguage === 'ko' ? 
        `${selectedIds.length}개의 거래를 삭제하시겠습니까?` : 
        `Are you sure you want to delete ${selectedIds.length} trade(s)?`;
    
    if (confirm(confirmMessage)) {
        trades = trades.filter(trade => !selectedIds.includes(trade.id));
        saveTrades();
        updateStats();
        updateAllTradesList();
        document.getElementById('selectAllTradesList').checked = false;
        document.getElementById('deleteSelectedListBtn').style.display = 'none';
        
        showToast(currentLanguage === 'ko' ? '선택된 거래가 삭제되었습니다' : 'Selected trades deleted');
    }
}

// ============================================
// Daily Fees Management
// ============================================

function saveDailyFees() {
    const feesInput = document.getElementById('dailyFees').value;
    const fees = parseFloat(feesInput) || 0;
    
    if (fees >= 0) {
        dailyFees[currentTradingDate] = fees;
        localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        
        showToast(currentLanguage === 'ko' ? '수수료가 저장되었습니다' : 'Fees saved');
    }
}

function loadDailyFees() {
    const fees = dailyFees[currentTradingDate] || 0;
    document.getElementById('dailyFees').value = fees > 0 ? fees.toFixed(2) : '';
}

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
                savePsychologyDataToStorage();
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
            psychologyData = [];
            
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
    
    // Initialize current date - 문자열 형식으로 저장
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
    calculateHoldingTime();
    loadDailyFees();
    
    // Set up form handlers
    document.getElementById('tradeForm').addEventListener('submit', handleTradeSubmit);
    document.getElementById('editTradeForm').addEventListener('submit', handleEditTradeSubmit);
    document.getElementById('entryTime').addEventListener('change', calculateHoldingTime);
    document.getElementById('exitTime').addEventListener('change', calculateHoldingTime);
    
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
    updatePsychologyMetrics();
}
