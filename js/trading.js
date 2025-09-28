// Trading Functions

// Time related functions
function toggleTimeEdit() {
    timeEditMode = !timeEditMode;
    const entryTime = document.getElementById('entryTime');
    const exitTime = document.getElementById('exitTime');
    const editBtn = document.querySelector('.time-edit-btn');
    
    if (timeEditMode) {
        entryTime.removeAttribute('readonly');
        exitTime.removeAttribute('readonly');
        editBtn.textContent = translations[currentLanguage]['auto'] || 'Auto';
        editBtn.classList.add('active');
    } else {
        entryTime.setAttribute('readonly', true);
        exitTime.setAttribute('readonly', true);
        editBtn.textContent = translations[currentLanguage]['edit'] || 'Edit';
        editBtn.classList.remove('active');
        
        const now = new Date();
        const currentTime = now.toTimeString().substr(0, 5);
        if (document.getElementById('buyPrice').value) {
            entryTime.value = currentTime;
        }
        if (document.getElementById('sellPrice').value) {
            exitTime.value = currentTime;
        }
        calculateHoldingTime();
    }
}

function calculateHoldingTime() {
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    
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
            document.getElementById('holdingTimeDisplay').value = `${diffMinutes}m`;
        } catch (error) {
            document.getElementById('holdingTimeDisplay').value = '0m';
        }
    }
}

// Trade calculation functions
function calculatePnL() {
    const shares = parseFloat(document.getElementById('shares').value) || 0;
    const buyPrice = parseFloat(document.getElementById('buyPrice').value) || 0;
    const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
    
    // Always calculate and display amount if shares and buyPrice are available
    if (shares && buyPrice) {
        const amount = shares * buyPrice;
        document.getElementById('amountDisplay').value = `$${amount.toFixed(2)}`;
    } else {
        document.getElementById('amountDisplay').value = '';
    }
    
    if (shares && buyPrice && sellPrice) {
        const pnl = shares * (sellPrice - buyPrice);
        const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
        
        document.getElementById('pnlDisplay').value = `${pnl.toFixed(2)}`;
        document.getElementById('returnPct').value = `${returnPct.toFixed(2)}%`;
        
        const pnlInput = document.getElementById('pnlDisplay');
        const returnInput = document.getElementById('returnPct');
        
        if (pnl > 0) {
            pnlInput.style.color = '#10b981';
            returnInput.style.color = '#10b981';
        } else if (pnl < 0) {
            pnlInput.style.color = '#ef4444';
            returnInput.style.color = '#ef4444';
        } else {
            pnlInput.style.color = '#e4e4e7';
            returnInput.style.color = '#e4e4e7';
        }
    }
    
    if (!timeEditMode) {
        const now = new Date();
        const currentTime = now.toTimeString().substr(0, 5);
        
        if (buyPrice && !document.getElementById('entryTime').value) {
            document.getElementById('entryTime').value = currentTime;
            calculateHoldingTime();
        }
        if (sellPrice && document.getElementById('entryTime').value) {
            document.getElementById('exitTime').value = currentTime;
            calculateHoldingTime();
        }
    }
}

function handleTradeSubmit(event) {
    event.preventDefault();
    
    const tradingDateString = formatTradingDate(currentTradingDate);
    const shares = parseFloat(document.getElementById('shares').value);
    const buyPrice = parseFloat(document.getElementById('buyPrice').value);
    
    const formData = {
        id: Date.now(),
        symbol: document.getElementById('symbol').value.toUpperCase(),
        shares: shares,
        amount: shares * buyPrice,
        buyPrice: buyPrice,
        sellPrice: parseFloat(document.getElementById('sellPrice').value),
        date: tradingDateString,
        entryTime: document.getElementById('entryTime').value,
        exitTime: document.getElementById('exitTime').value,
        holdingTime: document.getElementById('holdingTimeDisplay').value,
        notes: ''
    };
    
    formData.pnl = formData.shares * (formData.sellPrice - formData.buyPrice);
    formData.returnPct = ((formData.sellPrice - formData.buyPrice) / formData.buyPrice) * 100;
    
    trades.push(formData);
    saveTrades();
    updateStats();
    renderCalendar();
    updateAllTradesList();
    updateDetailedAnalytics();
    resetForm();
    
    showToast(`${formData.symbol} saved`);
}

function resetForm() {
    document.getElementById('tradeForm').reset();
    
    document.getElementById('entryTime').value = '';
    document.getElementById('exitTime').value = '';
    document.getElementById('pnlDisplay').value = '';
    document.getElementById('returnPct').value = '';
    document.getElementById('holdingTimeDisplay').value = '';
    document.getElementById('amountDisplay').value = '';
    
    if (timeEditMode) {
        toggleTimeEdit();
    }
}

function deleteTrade(tradeId) {
    if (confirm('Are you sure you want to delete this trade?')) {
        const tradeToDelete = trades.find(trade => trade.id === tradeId);
        trades = trades.filter(trade => trade.id !== tradeId);
        saveTrades();
        updateStats();
        renderCalendar();
        updateAllTradesList();
        updateDetailedAnalytics();
        
        if (tradeToDelete) {
            showToast(`${tradeToDelete.symbol} deleted`);
        }
    }
}

function editTrade(tradeId) {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    
    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editSymbol').value = trade.symbol;
    const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
    document.getElementById('editShares').value = shares;
    document.getElementById('editBuyPrice').value = trade.buyPrice;
    document.getElementById('editSellPrice').value = trade.sellPrice;
    document.getElementById('editEntryTime').value = trade.entryTime || '';
    document.getElementById('editExitTime').value = trade.exitTime || '';
    
    document.getElementById('editTradeModal').style.display = 'flex';
}

function closeEditTradeModal() {
    document.getElementById('editTradeModal').style.display = 'none';
}

function handleEditTradeSubmit(event) {
    event.preventDefault();
    
    const tradeId = parseInt(document.getElementById('editTradeId').value);
    const tradeIndex = trades.findIndex(t => t.id === tradeId);
    
    if (tradeIndex === -1) return;
    
    const shares = parseFloat(document.getElementById('editShares').value);
    const buyPrice = parseFloat(document.getElementById('editBuyPrice').value);
    
    const updatedTrade = {
        ...trades[tradeIndex],
        symbol: document.getElementById('editSymbol').value.toUpperCase(),
        shares: shares,
        amount: shares * buyPrice,
        buyPrice: buyPrice,
        sellPrice: parseFloat(document.getElementById('editSellPrice').value),
        entryTime: document.getElementById('editEntryTime').value,
        exitTime: document.getElementById('editExitTime').value,
        notes: trades[tradeIndex].notes || ''
    };
    
    // Recalculate P&L and return percentage
    updatedTrade.pnl = updatedTrade.shares * (updatedTrade.sellPrice - updatedTrade.buyPrice);
    updatedTrade.returnPct = ((updatedTrade.sellPrice - updatedTrade.buyPrice) / updatedTrade.buyPrice) * 100;
    
    // Calculate holding time
    if (updatedTrade.entryTime && updatedTrade.exitTime) {
        const [entryHour, entryMin] = updatedTrade.entryTime.split(':').map(Number);
        const [exitHour, exitMin] = updatedTrade.exitTime.split(':').map(Number);
        
        let entryMinutes = entryHour * 60 + entryMin;
        let exitMinutes = exitHour * 60 + exitMin;
        
        if (exitMinutes < entryMinutes) {
            exitMinutes += 24 * 60;
        }
        
        const diffMinutes = exitMinutes - entryMinutes;
        updatedTrade.holdingTime = `${diffMinutes}m`;
    }
    
    trades[tradeIndex] = updatedTrade;
    saveTrades();
    updateStats();
    renderCalendar();
    updateAllTradesList();
    updateDetailedAnalytics();
    closeEditTradeModal();
    
    showToast(`${updatedTrade.symbol} updated`);
}

// Position Calculator Functions
function calculatePosition() {
    const balance = parseFloat(document.getElementById('calcAccountBalance')?.value) || 0;
    const winRate = parseFloat(document.getElementById('calcWinRate')?.value) / 100 || 0;
    const avgWin = parseFloat(document.getElementById('calcAvgWin')?.value) || 0;
    const avgLoss = parseFloat(document.getElementById('calcAvgLoss')?.value) || 0;
    
    const recommendedSizeEl = document.getElementById('recommendedSize');
    const accountUtilEl = document.getElementById('accountUtil');
    const expectedValEl = document.getElementById('expectedVal');
    
    if (!recommendedSizeEl || !accountUtilEl || !expectedValEl) {
        console.warn('Position calculator elements not found');
        return;
    }
    
    if (avgLoss === 0 || balance === 0) {
        recommendedSizeEl.textContent = '$0';
        accountUtilEl.textContent = '0%';
        expectedValEl.textContent = '$0';
        expectedValEl.className = 'sidebar-stat-value';
        
        const kellyStatusEl = document.getElementById('kellyStatus');
        if (kellyStatusEl) {
            kellyStatusEl.textContent = 'Safe';
            kellyStatusEl.className = 'sidebar-stat-value positive';
        }
        return;
    }
    
    const b = avgWin / avgLoss;
    const p = winRate;
    const q = 1 - winRate;
    
    const kellyFraction = Math.max(0, (b * p - q) / b);
    const fullKelly = balance * kellyFraction;
    
    const recommendedPosition = fullKelly * selectedKellyMultiplier;
    recommendedSizeEl.textContent = '$' + recommendedPosition.toFixed(0);
    
    const utilization = (recommendedPosition / balance) * 100;
    accountUtilEl.textContent = utilization.toFixed(1) + '%';
    
    const expectedValue = (p * avgWin - q * avgLoss) * (recommendedPosition / Math.max(avgWin, 1));
    expectedValEl.textContent = '$' + expectedValue.toFixed(0);
    expectedValEl.className = 'sidebar-stat-value ' + (expectedValue >= 0 ? 'positive' : 'negative');
    
    const kellyPercent = kellyFraction * 100;
    let riskLevel = 'Safe';
    if (kellyPercent > 25) riskLevel = 'High';
    else if (kellyPercent > 15) riskLevel = 'Medium';
    
    const kellyStatusEl = document.getElementById('kellyStatus');
    if (kellyStatusEl) {
        kellyStatusEl.textContent = riskLevel;
        kellyStatusEl.className = 'sidebar-stat-value ' + 
            (riskLevel === 'Safe' ? 'positive' : riskLevel === 'Medium' ? 'neutral' : 'negative');
    }
}

function selectKellyMultiplier(element) {
    document.querySelectorAll('.kelly-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedKellyMultiplier = parseFloat(element.dataset.multiplier);
    calculatePosition();
}

function autoLoadTradeData() {
    if (!trades || trades.length === 0) {
        alert('거래 이력이 없습니다.');
        return;
    }
    
    const recentTrades = trades.slice(-20);
    const wins = recentTrades.filter(trade => trade.pnl > 0);
    const losses = recentTrades.filter(trade => trade.pnl < 0);
    
    if (losses.length === 0) {
        alert('손실 거래가 없어 계산할 수 없습니다.');
        return;
    }
    
    const winRate = (wins.length / recentTrades.length) * 100;
    const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length);
    
    // Kelly 계산기 입력 필드에 값 설정
    const calcWinRateEl = document.getElementById('calcWinRate');
    const calcAvgWinEl = document.getElementById('calcAvgWin');
    const calcAvgLossEl = document.getElementById('calcAvgLoss');
    
    if (calcWinRateEl) calcWinRateEl.value = winRate.toFixed(1);
    if (calcAvgWinEl) calcAvgWinEl.value = avgWin.toFixed(0);
    if (calcAvgLossEl) calcAvgLossEl.value = avgLoss.toFixed(0);
    
    // 사이드바에도 표시
    const recentWinRateCalcEl = document.getElementById('recentWinRateCalc');
    const plRatioCalcEl = document.getElementById('plRatioCalc');
    
    if (recentWinRateCalcEl) recentWinRateCalcEl.textContent = winRate.toFixed(1) + '%';
    if (plRatioCalcEl) plRatioCalcEl.textContent = (avgWin / avgLoss).toFixed(2);
    
    // 계산 실행
    calculatePosition();
    showToast('거래 이력에서 데이터를 불러왔습니다');
}

// Risk Calculator Functions
function calculateRiskPosition() {
    const balance = parseFloat(document.getElementById('riskAccountBalance')?.value) || 0;
    const riskPercent = parseFloat(document.getElementById('riskPercentage')?.value) || 0;
    const entryPrice = parseFloat(document.getElementById('riskEntryPrice')?.value) || 0;
    const stopPrice = parseFloat(document.getElementById('riskStopPrice')?.value) || 0;
    
    if (balance === 0 || entryPrice === 0 || stopPrice === 0 || entryPrice === stopPrice) {
        resetRiskCalculatorDisplay();
        return;
    }
    
    const riskAmount = balance * (riskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopPrice);
    const sharesQuantity = Math.floor(riskAmount / riskPerShare);
    const positionSize = sharesQuantity * entryPrice;
    const actualMaxLoss = sharesQuantity * riskPerShare;
    const accountUtilization = (positionSize / balance) * 100;
    
    // 안전한 요소 업데이트 함수
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    // 기존 사이드바 업데이트 (포지션 분석)
    updateElement('recommendedSize', '$' + positionSize.toFixed(0));
    updateElement('accountUtil', accountUtilization.toFixed(1) + '%');
    updateElement('expectedVal', '-$' + actualMaxLoss.toFixed(0));
    
    // 새로운 사이드바 업데이트 (자동 분석)
    updateElement('riskPositionSizeSidebar', '$' + positionSize.toFixed(0));
    updateElement('riskSharesQuantitySidebar', sharesQuantity.toString());
    updateElement('riskPerShareSidebar', '$' + riskPerShare.toFixed(2));
    updateElement('riskMaxLossSidebar', '$' + actualMaxLoss.toFixed(2));
    updateElement('riskPositionCostSidebar', '$' + positionSize.toFixed(2));
    
    // 기존 결과 섹션 업데이트
    updateElement('riskPositionSize', '$' + positionSize.toFixed(0));
    updateElement('riskSharesQuantity', sharesQuantity.toString());
    updateElement('riskPerShare', '$' + riskPerShare.toFixed(2));
    updateElement('riskMaxLoss', '$' + actualMaxLoss.toFixed(2));
    updateElement('riskPositionCost', '$' + positionSize.toFixed(2));
    updateElement('riskAccountUtil', accountUtilization.toFixed(2) + '%');
}

function setRiskPreset(percent) {
    document.querySelectorAll('.risk-preset-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#374151';
        btn.style.borderColor = '#4b5563';
        btn.style.color = '#e4e4e7';
    });
    
    // event.target 대신 직접 찾기
    const targetBtn = document.querySelector(`[onclick="setRiskPreset(${percent})"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.style.background = '#3b82f6';
        targetBtn.style.borderColor = '#3b82f6';
        targetBtn.style.color = 'white';
    }
    
    document.getElementById('riskPercentage').value = percent;
    calculateRiskPosition();
}

function resetRiskCalculatorDisplay() {
    // 안전한 요소 업데이트 함수
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    // 기존 결과 섹션 초기화
    updateElement('riskPositionSize', '$0');
    updateElement('riskSharesQuantity', '0');
    updateElement('riskPerShare', '$0.00');
    updateElement('riskMaxLoss', '$0.00');
    updateElement('riskPositionCost', '$0.00');
    updateElement('riskAccountUtil', '0.00%');
    
    // 포지션 분석 사이드바 초기화
    updateElement('recommendedSize', '$0');
    updateElement('accountUtil', '0%');
    updateElement('expectedVal', '$0');
    
    // 자동 분석 사이드바 초기화
    updateElement('riskPositionSizeSidebar', '$0');
    updateElement('riskSharesQuantitySidebar', '0');
    updateElement('riskPerShareSidebar', '$0.00');
    updateElement('riskMaxLossSidebar', '$0.00');
    updateElement('riskPositionCostSidebar', '$0.00');
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
