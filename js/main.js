// js/main.js
// Main Application Initialization and Core Functions

// Page initialization
document.addEventListener('DOMContentLoaded', async function() {
    await waitForChart();
    
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
    
    currentTradingDate = getESTTradingDate(new Date());
    updateCurrentDateDisplay();
    updateLanguage();
    
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

// Data save/load functions
function saveTrades() {
    try {
        localStorage.setItem('tradingPlatformTrades', JSON.stringify(trades));
    } catch (error) {
        console.error('Error saving trades:', error);
        alert('Failed to save data. Please check browser storage.');
    }
}

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

function saveNotes() {
    try {
        localStorage.setItem('tradingPlatformNotes', JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes:', error);
    }
}

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

// Statistics update function
function updateStats() {
    const filteredTrades = getFilteredDashboardTrades();
    
    if (filteredTrades.length === 0) {
        document.getElementById('totalPL').textContent = '$0.00';
        document.getElementById('totalTrades').textContent = '0';
        document.getElementById('winRate').textContent = '0%';
        document.getElementById('winLossCount').textContent = '0W / 0L';
        document.getElementById('bestTrade').textContent = '$0.00';
        document.getElementById('worstTrade').textContent = '$0.00';
        document.getElementById('avgWin').textContent = '$0.00';
        document.getElementById('avgLoss').textContent = '$0.00';
        document.getElementById('totalVolume').textContent = '$0.00';
        document.getElementById('profitFactorSidebar').textContent = '0.00';
        return;
    }

    const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const currentDate = formatTradingDate(currentTradingDate);
    const dailyFee = dailyFees[currentDate] || 0;
    const netPL = totalPL - dailyFee;
    const wins = filteredTrades.filter(trade => trade.pnl > 0);
    const losses = filteredTrades.filter(trade => trade.pnl < 0);
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    
    const pnls = filteredTrades.map(trade => trade.pnl);
    const bestTrade = Math.max(...pnls);
    const worstTrade = Math.min(...pnls);
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0;
    const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.amount, 0);
    
    const totalWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    document.getElementById('totalPL').textContent = `$${netPL.toFixed(2)}`;
    document.getElementById('totalPL').className = `stat-value ${netPL >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('totalTrades').textContent = filteredTrades.length.toString();
    document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('winRate').className = `stat-value ${winRate >= 50 ? 'positive' : 'negative'}`;
    
    document.getElementById('winLossCount').textContent = `${wins.length}W / ${losses.length}L`;
    
    document.getElementById('bestTrade').textContent = `$${bestTrade.toFixed(2)}`;
    document.getElementById('worstTrade').textContent = `$${worstTrade.toFixed(2)}`;
    
    document.getElementById('avgWin').textContent = `$${avgWin.toFixed(2)}`;
    document.getElementById('avgLoss').textContent = `$${avgLoss.toFixed(2)}`;
    document.getElementById('totalVolume').textContent = `$${totalVolume.toFixed(2)}`;
    
    document.getElementById('profitFactorSidebar').textContent = profitFactor.toFixed(2);
    document.getElementById('profitFactorSidebar').className = `sidebar-stat-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
}

// Trade table update function
function updateTradesTable(tradesToShow, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    
    if (tradesToShow.length === 0) {
        const colspan = '11';
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colspan}">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div data-lang="no-trades">No trades recorded yet</div>
                    </div>
                </td>
            </tr>
        `;
        updateLanguage();
        return;
    }
    
    const sortedTrades = [...tradesToShow].sort((a, b) => {
        const dateTimeA = new Date(a.date + 'T' + (a.exitTime || a.entryTime || '00:00') + ':00');
        const dateTimeB = new Date(b.date + 'T' + (b.exitTime || b.entryTime || '00:00') + ':00');
        
        if (a.date !== b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        
        return dateTimeB - dateTimeA;
    });
    
    if (tableBodyId === 'tradesTableBody') {
        // 대시보드 테이블
        const currentSelectedTrades = selectedTrades || new Set();
        tableBody.innerHTML = sortedTrades.map(trade => {
            const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
            const amount = trade.amount || (shares * trade.buyPrice);
            const isSelected = currentSelectedTrades.has(trade.id);
            return `
                <tr>
                    <td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleTradeSelection(${trade.id})" style="accent-color: #3b82f6;"></td>
                    <td>${new Date(trade.date).toLocaleDateString()}</td>
                    <td><strong>${trade.symbol}</strong></td>
                    <td>${trade.buyPrice.toFixed(4)}</td>
                    <td>${trade.sellPrice.toFixed(4)}</td>
                    <td>${shares}</td>
                    <td>$${amount.toFixed(2)}</td>
                    <td>${trade.holdingTime || 'N/A'}</td>
                    <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">$${trade.pnl.toFixed(2)}</td>
                    <td class="${trade.returnPct >= 0 ? 'positive' : 'negative'}">${trade.returnPct.toFixed(2)}%</td>
                    <td>
                        <button class="action-btn" onclick="editTrade(${trade.id})" title="Edit trade">✏️</button>
                        <button class="action-btn" onclick="deleteTrade(${trade.id})" title="Delete trade">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
        updateDeleteButtonVisibility();
        updateSelectAllCheckbox();
    } else {
        // 거래 목록 페이지 테이블
        const currentSelectedTradesList = selectedTradesList || new Set();
        tableBody.innerHTML = sortedTrades.map(trade => {
            const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
            const amount = trade.amount || (shares * trade.buyPrice);
            const isSelected = currentSelectedTradesList.has(trade.id);
            return `
                <tr>
                    <td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleTradeListSelection(${trade.id})" style="accent-color: #3b82f6;"></td>
                    <td>${new Date(trade.date).toLocaleDateString()}</td>
                    <td><strong>${trade.symbol}</strong></td>
                    <td>${trade.buyPrice.toFixed(4)}</td>
                    <td>${trade.sellPrice.toFixed(4)}</td>
                    <td>${shares}</td>
                    <td>$${amount.toFixed(2)}</td>
                    <td>${trade.holdingTime || 'N/A'}</td>
                    <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">$${trade.pnl.toFixed(2)}</td>
                    <td class="${trade.returnPct >= 0 ? 'positive' : 'negative'}">${trade.returnPct.toFixed(2)}%</td>
                    <td>
                        <button class="action-btn" onclick="editTrade(${trade.id})" title="Edit trade">✏️</button>
                        <button class="action-btn" onclick="deleteTrade(${trade.id})" title="Delete trade">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
        updateDeleteListButtonVisibility();
        updateSelectAllListCheckbox();
    }
}

function updateAllTradesList() {
    const filteredTrades = getFilteredTradesList();
    updateTradesTable(filteredTrades, 'allTradesTableBody');
    const tradesText = currentLanguage === 'ko' ? '거래' : 'trades';
    document.getElementById('allTradesSummary').textContent = `${filteredTrades.length} ${tradesText}`;
    
    // Update dashboard table as well
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    const dashboardTrades = getFilteredDashboardTrades();
    document.getElementById('periodSummary').textContent = `${dashboardTrades.length} ${tradesText}`;
}

// Dashboard Section Management Functions
function showDashboardSection(section) {
    currentDashboardSection = section;
    
    // 탭 상태 업데이트
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 섹션 표시/숨기기
    const positionSection = document.getElementById('positionCalculatorSection');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const tradesSection = document.querySelector('.trades-section');
    const statsOverview = document.querySelector('.stats-overview');
    
    if (section === 'trading') {
        if (positionSection) positionSection.style.display = 'none';
        if (dashboardGrid) dashboardGrid.style.display = 'grid';
        if (tradesSection) tradesSection.style.display = 'block';
        if (statsOverview) statsOverview.style.display = 'grid';
    } else if (section === 'position-calc' || section === 'risk-calc') {
        if (positionSection) positionSection.style.display = 'block';
        if (dashboardGrid) dashboardGrid.style.display = 'none';
        if (tradesSection) tradesSection.style.display = 'none';
        if (statsOverview) statsOverview.style.display = 'none';
        
        // 적절한 탭 활성화
        setTimeout(() => {
            if (section === 'position-calc') {
                showCalculatorTab('kelly');
            } else if (section === 'risk-calc') {
                showCalculatorTab('risk');
            }
        }, 100);
    }
}

// Calculator Tab Management
function showCalculatorTab(tabName) {
    // Update tab states
    document.querySelectorAll('.position-calc-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'transparent';
        tab.style.color = '#94a3b8';
    });
    
    // Activate clicked tab
    const targetTab = document.querySelector(`[onclick="showCalculatorTab('${tabName}')"]`);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.background = '#3b82f6';
        targetTab.style.color = 'white';
    }
    
    // Show/hide content
    if (tabName === 'kelly') {
        document.getElementById('kellyCalculator').style.display = 'block';
        document.getElementById('riskCalculator').style.display = 'none';
        setTimeout(() => calculatePosition(), 100);
    } else if (tabName === 'risk') {
        document.getElementById('kellyCalculator').style.display = 'none';
        document.getElementById('riskCalculator').style.display = 'block';
        setTimeout(() => calculateRiskPosition(), 100);
    }
}

// Settings functions
function exportData() {
    const exportData = {
        trades: trades,
        notes: notes,
        dailyFees: dailyFees,
        psychologyData: psychologyData
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'trading_data.json';
    link.click();
    
    showToast(currentLanguage === 'ko' ? '데이터가 내보내졌습니다' : 'Data exported');
}

function importData() {
    document.getElementById('importFileInput').click();
}

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
                        notes: trade.notes || '',
                        shares: trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0),
                        amount: trade.amount || (trade.shares && trade.buyPrice ? trade.shares * trade.buyPrice : 0)
                    }));
                    if (importedData.notes && Array.isArray(importedData.notes)) {
                        notes = importedData.notes.map(note => ({
                            ...note,
                            category: note.category || 'general',
                            font: note.font || "'Inter', sans-serif",
                            textColor: note.textColor || '#94a3b8',
                            pinned: note.pinned || false
                        }));
                    }
                    if (importedData.dailyFees) {
                        dailyFees = importedData.dailyFees;
                    }
                    if (importedData.psychologyData) {
                        psychologyData = importedData.psychologyData;
                    }
                    saveTrades();
                    saveNotes();
                    localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
                    localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
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

function clearAllData() {
    const confirmMessage = currentLanguage === 'ko' ? 
        '모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : 
        'Are you sure you want to clear all data? This action cannot be undone.';
    
    if (confirm(confirmMessage)) {
        trades = [];
        notes = [];
        dailyFees = {};
        psychologyData = {};
        saveTrades();
        saveNotes();
        localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
        localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
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

// Trade selection functions for dashboard
function toggleTradeSelection(tradeId) {
    if (!selectedTrades) {
        selectedTrades = new Set();
    }
    
    if (selectedTrades.has(tradeId)) {
        selectedTrades.delete(tradeId);
    } else {
        selectedTrades.add(tradeId);
    }
    updateDeleteButtonVisibility();
    updateSelectAllCheckbox();
}

function toggleAllTrades() {
    if (!selectedTrades) {
        selectedTrades = new Set();
    }
    
    const selectAllCheckbox = document.getElementById('selectAllTrades');
    const isChecked = selectAllCheckbox.checked;
    
    const filteredTrades = getFilteredDashboardTrades();
    
    if (isChecked) {
        filteredTrades.forEach(trade => selectedTrades.add(trade.id));
    } else {
        filteredTrades.forEach(trade => selectedTrades.delete(trade.id));
    }
    
    updateTradesTable(filteredTrades, 'tradesTableBody');
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllTrades');
    if (!selectAllCheckbox) return;
    
    if (!selectedTrades) {
        selectedTrades = new Set();
    }
    
    const filteredTrades = getFilteredDashboardTrades();
    
    if (filteredTrades.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
        return;
    }
    
    const selectedCount = filteredTrades.filter(trade => selectedTrades.has(trade.id)).length;
    
    if (selectedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (selectedCount === filteredTrades.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

function updateDeleteButtonVisibility() {
    if (!selectedTrades) {
        selectedTrades = new Set();
    }
    
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
        if (selectedTrades.size > 0) {
            deleteBtn.style.display = 'block';
            deleteBtn.textContent = currentLanguage === 'ko' ? 
                `선택된 거래 삭제 (${selectedTrades.size})` : 
                `Delete Selected (${selectedTrades.size})`;
        } else {
            deleteBtn.style.display = 'none';
        }
    }
}

function deleteSelectedTrades() {
    if (selectedTrades.size === 0) return;
    
    const confirmMessage = currentLanguage === 'ko' ? 
        `선택된 ${selectedTrades.size}개의 거래를 삭제하시겠습니까?` : 
        `Are you sure you want to delete ${selectedTrades.size} selected trades?`;
    
    if (confirm(confirmMessage)) {
        const tradesToDelete = Array.from(selectedTrades);
        trades = trades.filter(trade => !selectedTrades.has(trade.id));
        selectedTrades.clear();
        
        saveTrades();
        updateStats();
        renderCalendar();
        updateAllTradesList();
        updateDetailedAnalytics();
        
        showToast(currentLanguage === 'ko' ? 
            `${tradesToDelete.length}개의 거래가 삭제되었습니다` : 
            `${tradesToDelete.length} trades deleted`);
    }
}

// Trade selection functions for trade list page
function toggleTradeListSelection(tradeId) {
    if (selectedTradesList.has(tradeId)) {
        selectedTradesList.delete(tradeId);
    } else {
        selectedTradesList.add(tradeId);
    }
    updateDeleteListButtonVisibility();
    updateSelectAllListCheckbox();
}

function toggleAllTradesList() {
    const selectAllCheckbox = document.getElementById('selectAllTradesList');
    const isChecked = selectAllCheckbox.checked;
    
    const filteredTrades = getFilteredTradesList();
    
    if (isChecked) {
        filteredTrades.forEach(trade => selectedTradesList.add(trade.id));
    } else {
        filteredTrades.forEach(trade => selectedTradesList.delete(trade.id));
    }
    
    updateTradesTable(filteredTrades, 'allTradesTableBody');
}

function updateSelectAllListCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllTradesList');
    const filteredTrades = getFilteredTradesList();
    
    if (filteredTrades.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
        return;
    }
    
    const selectedCount = filteredTrades.filter(trade => selectedTradesList.has(trade.id)).length;
    
    if (selectedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (selectedCount === filteredTrades.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

function updateDeleteListButtonVisibility() {
    const deleteBtn = document.getElementById('deleteSelectedListBtn');
    if (deleteBtn) {
        if (selectedTradesList.size > 0) {
            deleteBtn.style.display = 'block';
            deleteBtn.textContent = currentLanguage === 'ko' ? 
                `선택된 거래 삭제 (${selectedTradesList.size})` : 
                `Delete Selected (${selectedTradesList.size})`;
        } else {
            deleteBtn.style.display = 'none';
        }
    }
}

function deleteSelectedTradesList() {
    if (selectedTradesList.size === 0) return;
    
    const confirmMessage = currentLanguage === 'ko' ? 
        `선택된 ${selectedTradesList.size}개의 거래를 삭제하시겠습니까?` : 
        `Are you sure you want to delete ${selectedTradesList.size} selected trades?`;
    
    if (confirm(confirmMessage)) {
        const tradesToDelete = Array.from(selectedTradesList);
        trades = trades.filter(trade => !selectedTradesList.has(trade.id));
        selectedTradesList.clear();
        
        saveTrades();
        updateStats();
        renderCalendar();
        updateAllTradesList();
        updateDetailedAnalytics();
        
        showToast(currentLanguage === 'ko' ? 
            `${tradesToDelete.length}개의 거래가 삭제되었습니다` : 
            `${tradesToDelete.length} trades deleted`);
    }
}
