// trading.js - 거래 관련 기능

// ==================== Trade Entry & Calculation ====================

/**
 * P&L 계산 및 자동 시간 입력
 */
function calculatePnL() {
    try {
        const sharesEl = document.getElementById('shares');
        const buyPriceEl = document.getElementById('buyPrice');
        const sellPriceEl = document.getElementById('sellPrice');
        const amountDisplayEl = document.getElementById('amountDisplay');
        const pnlDisplayEl = document.getElementById('pnlDisplay');
        const returnPctEl = document.getElementById('returnPct');

        if (!sharesEl || !buyPriceEl || !sellPriceEl || !amountDisplayEl || !pnlDisplayEl || !returnPctEl) {
            console.error('Required form elements not found');
            return;
        }

        const shares = parseFloat(sharesEl.value) || 0;
        const buyPrice = parseFloat(buyPriceEl.value) || 0;
        const sellPrice = parseFloat(sellPriceEl.value) || 0;

        // Amount 계산 및 표시
        if (shares && buyPrice) {
            const amount = shares * buyPrice;
            amountDisplayEl.value = `$${amount.toFixed(2)}`;
        } else {
            amountDisplayEl.value = '';
        }

        // P&L 및 Return % 계산
        if (shares && buyPrice && sellPrice) {
            const pnl = shares * (sellPrice - buyPrice);
            const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;

            pnlDisplayEl.value = `${pnl.toFixed(2)}`;
            returnPctEl.value = `${returnPct.toFixed(2)}%`;

            if (pnl > 0) {
                pnlDisplayEl.style.color = '#10b981';
                returnPctEl.style.color = '#10b981';
            } else if (pnl < 0) {
                pnlDisplayEl.style.color = '#ef4444';
                returnPctEl.style.color = '#ef4444';
            } else {
                pnlDisplayEl.style.color = '#e4e4e7';
                returnPctEl.style.color = '#e4e4e7';
            }
        } else {
            pnlDisplayEl.value = '';
            returnPctEl.value = '';
        }

        // 자동 시간 입력
        if (!timeEditMode) {
            autoFillTradingTimes();
        }
    } catch (error) {
        console.error('Error calculating P&L:', error);
    }
}

/**
 * 거래 시간 자동 입력
 */
function autoFillTradingTimes() {
    const buyPriceInput = document.getElementById('buyPrice');
    const sellPriceInput = document.getElementById('sellPrice');
    const entryTimeInput = document.getElementById('entryTime');
    const exitTimeInput = document.getElementById('exitTime');

    if (!buyPriceInput || !sellPriceInput || !entryTimeInput || !exitTimeInput) {
        return;
    }

    const buyPrice = parseFloat(buyPriceInput.value) || 0;
    const sellPrice = parseFloat(sellPriceInput.value) || 0;

    // 현재 시간 가져오기
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Entry Time 자동 입력
    if (buyPrice > 0 && !entryTimeInput.value) {
        entryTimeInput.value = currentTime;
        calculateHoldingTime();
    }

    // Exit Time 자동 입력 - sellPrice만 있으면 설정 (entryTime이 없어도 설정)
    if (sellPrice > 0 && !exitTimeInput.value) {
        exitTimeInput.value = currentTime;

        // entryTime이 아직 없으면 지금 설정
        if (buyPrice > 0 && !entryTimeInput.value) {
            entryTimeInput.value = currentTime;
        }

        calculateHoldingTime();
    }
}

/**
 * 보유 시간 계산
 */
function calculateHoldingTime() {
    const entryTime = document.getElementById('entryTime').value;
    const exitTime = document.getElementById('exitTime').value;
    const holdingTimeDisplay = document.getElementById('holdingTimeDisplay');

    if (!holdingTimeDisplay) {
        return;
    }

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

            let holdingTimeText = '';
            if (hours > 0) {
                holdingTimeText = `${hours}h ${minutes}m`;
            } else {
                holdingTimeText = `${minutes}m`;
            }

            holdingTimeDisplay.value = holdingTimeText;
        } catch (error) {
            console.error('Error calculating holding time:', error);
            holdingTimeDisplay.value = '';
        }
    } else {
        holdingTimeDisplay.value = '';
    }
}

/**
 * 시간 편집 모드 토글
 */
function toggleTimeEdit() {
    timeEditMode = !timeEditMode;

    const editBtn = document.querySelector('.time-edit-btn');

    if (timeEditMode) {
        editBtn.textContent = translations[currentLanguage]['auto'] || 'Auto';
        editBtn.classList.add('active');
    } else {
        editBtn.textContent = translations[currentLanguage]['edit'] || 'Edit';
        editBtn.classList.remove('active');

        // Auto 모드로 돌아갈 때 자동 설정
        autoFillTradingTimes();
    }
}

/**
 * 거래 폼 제출 처리
 */
function handleTradeSubmit(event) {
    event.preventDefault();
    
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
    
    const tradingDateString = formatTradingDate(currentTradingDate);
    
    const pnl = shares * (sellPrice - buyPrice);
    const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
    const amount = shares * buyPrice;
    
    let holdingMinutes = 0;
    let holdingTime = '';
    if (entryTime && exitTime) {
        const [entryHour, entryMin] = entryTime.split(':').map(Number);
        const [exitHour, exitMin] = exitTime.split(':').map(Number);
        
        let entryMinutes = entryHour * 60 + entryMin;
        let exitMinutes = exitHour * 60 + exitMin;
        
        if (exitMinutes < entryMinutes) {
            exitMinutes += 24 * 60;
        }
        
        holdingMinutes = exitMinutes - entryMinutes;
        
        const hours = Math.floor(holdingMinutes / 60);
        const minutes = holdingMinutes % 60;
        
        if (hours > 0) {
            holdingTime = `${hours}h ${minutes}m`;
        } else {
            holdingTime = `${minutes}m`;
        }
    }
    
    const formData = {
        id: Date.now(),
        symbol: symbol,
        shares: shares,
        amount: amount,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        pnl: pnl,
        returnPct: returnPct,
        date: tradingDateString,
        entryTime: entryTime,
        exitTime: exitTime,
        holdingTime: holdingTime,
        holdingMinutes: holdingMinutes,
        notes: ''
    };
    
    trades.push(formData);
    saveTrades();
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
    renderCalendar();
    updateAllTradesList();
    updateDetailedAnalytics();
    resetForm();

    showToast(`${formData.symbol} ${currentLanguage === 'ko' ? '저장됨' : 'saved'}`);

    // 일일 손익 한도 체크
    checkDailyLimits(tradingDateString);

    // Principles 규칙 체크
    if (typeof checkTradeAgainstPrinciples === 'function') {
        checkTradeAgainstPrinciples(formData);
    }
}

/**
 * 거래 폼 초기화
 */
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

// ==================== Trade Edit & Delete ====================

/**
 * 거래 삭제
 */
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

/**
 * 거래 편집 모달 열기
 */
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

/**
 * 거래 편집 모달 닫기
 */
function closeEditTradeModal() {
    document.getElementById('editTradeModal').style.display = 'none';
}

/**
 * 거래 편집 폼 제출 처리
 */
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
    
    updatedTrade.pnl = updatedTrade.shares * (updatedTrade.sellPrice - updatedTrade.buyPrice);
    updatedTrade.returnPct = ((updatedTrade.sellPrice - updatedTrade.buyPrice) / updatedTrade.buyPrice) * 100;
    
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

    // 일일 손익 한도 체크
    checkDailyLimits(updatedTrade.date);

    // Principles 규칙 체크
    if (typeof checkTradeAgainstPrinciples === 'function') {
        checkTradeAgainstPrinciples(updatedTrade);
    }
}

// ==================== Trade Statistics ====================

/**
 * 통계 업데이트
 */
function updateStats() {
    try {
        const filteredTrades = getFilteredDashboardTrades();

        // 필수 DOM 요소 확인
        const elements = {
            totalPL: document.getElementById('totalPL'),
            totalTrades: document.getElementById('totalTrades'),
            winRate: document.getElementById('winRate'),
            winLossCount: document.getElementById('winLossCount'),
            bestTrade: document.getElementById('bestTrade'),
            worstTrade: document.getElementById('worstTrade'),
            avgWin: document.getElementById('avgWin'),
            avgLoss: document.getElementById('avgLoss'),
            totalVolume: document.getElementById('totalVolume'),
            profitFactorSidebar: document.getElementById('profitFactorSidebar')
        };

        // 요소가 없으면 조기 반환
        if (Object.values(elements).some(el => !el)) {
            console.error('Some stat elements not found');
            return;
        }

        if (filteredTrades.length === 0) {
            elements.totalPL.textContent = '$0.00';
            elements.totalTrades.textContent = '0';
            elements.winRate.textContent = '0%';
            elements.winLossCount.textContent = '0W / 0L';
            elements.bestTrade.textContent = '$0.00';
            elements.worstTrade.textContent = '$0.00';
            elements.avgWin.textContent = '$0.00';
            elements.avgLoss.textContent = '$0.00';
            elements.totalVolume.textContent = '$0.00';
            elements.profitFactorSidebar.textContent = '0.00';
            return;
        }

        const totalPL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const currentDate = currentTradingDate;
        const dailyFee = dailyFees[currentDate] || 0;
        const netPL = totalPL - dailyFee;
        const wins = filteredTrades.filter(trade => trade.pnl > 0);
        const losses = filteredTrades.filter(trade => trade.pnl < 0);
        const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;

        const pnls = filteredTrades.map(trade => trade.pnl || 0);
        const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
        const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

        const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0;
        const totalVolume = filteredTrades.reduce((sum, trade) => sum + (trade.amount || 0), 0);

        const totalWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
        const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
        const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

        elements.totalPL.textContent = `$${netPL.toFixed(2)}`;
        elements.totalPL.className = `stat-value ${netPL >= 0 ? 'positive' : 'negative'}`;

        elements.totalTrades.textContent = filteredTrades.length.toString();
        elements.winRate.textContent = `${winRate.toFixed(1)}%`;
        elements.winRate.className = `stat-value ${winRate >= 50 ? 'positive' : 'negative'}`;

        elements.winLossCount.textContent = `${wins.length}W / ${losses.length}L`;

        elements.bestTrade.textContent = `$${bestTrade.toFixed(2)}`;
        elements.worstTrade.textContent = `$${worstTrade.toFixed(2)}`;

        elements.avgWin.textContent = `$${avgWin.toFixed(2)}`;
        elements.avgLoss.textContent = `$${avgLoss.toFixed(2)}`;
        elements.totalVolume.textContent = `$${totalVolume.toFixed(2)}`;

        elements.profitFactorSidebar.textContent = profitFactor.toFixed(2);
        elements.profitFactorSidebar.className = `sidebar-stat-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ==================== Trade Table Management ====================

/**
 * 거래 테이블 업데이트
 */
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
    
    // 대시보드 테이블은 입력 순서(ID 역순), 거래 목록은 날짜+시간순
    let sortedTrades;
    if (tableBodyId === 'tradesTableBody') {
        // 대시보드: 최신 입력 순서대로 (ID 역순)
        sortedTrades = [...tradesToShow].sort((a, b) => b.id - a.id);
    } else {
        // 거래 목록: 날짜+시간순
        sortedTrades = [...tradesToShow].sort((a, b) => {
            const dateTimeA = new Date(a.date + 'T' + (a.exitTime || a.entryTime || '00:00') + ':00');
            const dateTimeB = new Date(b.date + 'T' + (b.exitTime || b.entryTime || '00:00') + ':00');

            if (a.date !== b.date) {
                return new Date(b.date) - new Date(a.date);
            }

            return dateTimeB - dateTimeA;
        });
    }
    
    if (tableBodyId === 'tradesTableBody') {
        // 대시보드 테이블
        const currentSelectedTrades = selectedTrades || new Set();
        tableBody.innerHTML = sortedTrades.map(trade => {
            const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
            const amount = trade.amount || (shares * trade.buyPrice);
            const isSelected = currentSelectedTrades.has(trade.id);
            return `
                <tr>
                    <td><input type="checkbox" data-trade-id="${trade.id}" ${isSelected ? 'checked' : ''} onchange="toggleTradeSelection(${trade.id})" style="accent-color: #3b82f6;"></td>
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
                    <td><input type="checkbox" data-trade-id="${trade.id}" ${isSelected ? 'checked' : ''} onchange="toggleTradeListSelection(${trade.id})" style="accent-color: #3b82f6;"></td>
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

/**
 * 모든 거래 목록 업데이트
 */
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

// ==================== Trade Selection (Dashboard) ====================

/**
 * 거래 선택 토글 (대시보드)
 */
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

/**
 * 모든 거래 선택/해제 (대시보드)
 */
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

/**
 * 전체 선택 체크박스 상태 업데이트 (대시보드)
 */
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

/**
 * 삭제 버튼 가시성 업데이트 (대시보드)
 */
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

/**
 * 선택된 거래 삭제 (대시보드)
 */
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

// ==================== Trade Selection (Trade List Page) ====================

/**
 * 거래 선택 토글 (거래 목록 페이지)
 */
function toggleTradeListSelection(tradeId) {
    if (selectedTradesList.has(tradeId)) {
        selectedTradesList.delete(tradeId);
    } else {
        selectedTradesList.add(tradeId);
    }
    updateDeleteListButtonVisibility();
    updateSelectAllListCheckbox();
}

/**
 * 모든 거래 선택/해제 (거래 목록 페이지)
 */
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

/**
 * 전체 선택 체크박스 상태 업데이트 (거래 목록 페이지)
 */
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

/**
 * 삭제 버튼 가시성 업데이트 (거래 목록 페이지)
 */
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

/**
 * 선택된 거래 삭제 (거래 목록 페이지)
 */
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

// ==================== Dashboard Section & Date Range ====================

// showDashboardSection() is defined in main.js

/**
 * 대시보드 날짜 범위 초기화
 */
function clearDashboardRange() {
    dashboardStartDate = null;
    dashboardEndDate = null;
    document.getElementById('dashboardStartDate').value = '';
    document.getElementById('dashboardEndDate').value = '';
    updateStats();
    updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
}

/**
 * 대시보드 필터링된 거래 가져오기
 */
function getFilteredDashboardTrades() {
    // currentTradingDate는 항상 YYYY-MM-DD 형식의 문자열
    if (dashboardStartDate || dashboardEndDate) {
        return filterTrades(trades, {
            startDate: dashboardStartDate,
            endDate: dashboardEndDate
        });
    } else {
        return filterTrades(trades, {
            specificDate: currentTradingDate
        });
    }
}

/**
 * 거래 목록 필터링된 거래 가져오기
 */
function getFilteredTradesList() {
    return filterTrades(trades, {
        startDate: tradesStartDate,
        endDate: tradesEndDate
    });
}

/**
 * 거래 목록 페이지 날짜 범위 초기화
 */
function clearTradesRange() {
    tradesStartDate = null;
    tradesEndDate = null;
    document.getElementById('tradesStartDate').value = '';
    document.getElementById('tradesEndDate').value = '';
    updateAllTradesList();
}

// ==================== Daily Fees Management ====================

/**
 * 일일 수수료 저장
 */
function saveDailyFees() {
    // currentTradingDate는 항상 YYYY-MM-DD 형식의 문자열
    const currentDate = currentTradingDate;

    const feesValue = parseFloat(document.getElementById('dailyFees').value) || 0;
    dailyFees[currentDate] = feesValue;

    try {
        localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
        updateStats();
        updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        showToast('Daily fees saved');
    } catch (error) {
        console.error('Error saving daily fees:', error);
        showToast('Error saving fees');
    }
}

/**
 * 일일 수수료 불러오기
 */
function loadDailyFees() {
    // currentTradingDate는 항상 YYYY-MM-DD 형식의 문자열
    const currentDate = currentTradingDate;

    const feesInput = document.getElementById('dailyFees');
    if (!feesInput) return;

    if (dailyFees[currentDate]) {
        feesInput.value = dailyFees[currentDate];
    } else {
        feesInput.value = '';
    }
}

// ==================== Date Navigation ====================

/**
 * 날짜 선택 모달 열기
 */
function openDatePicker() {
    const modal = document.getElementById('datePickerModal');
    const input = document.getElementById('datePickerInput');
    
    const estTradingDate = getESTTradingDate(currentTradingDate);
    const dateString = estTradingDate.getFullYear() + '-' + 
        String(estTradingDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(estTradingDate.getDate()).padStart(2, '0');
    
    input.value = dateString;
    modal.style.display = 'flex';
}

/**
 * 날짜 선택 모달 닫기
 */
function closeDatePicker() {
    document.getElementById('datePickerModal').style.display = 'none';
}

// applySelectedDate is defined in main.js
// changeTradingDate is defined in main.js

// ==================== Position Calculator ====================

/**
 * Kelly Criterion 포지션 계산
 */
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

/**
 * Kelly 배율 선택
 */
function selectKellyMultiplier(element) {
    document.querySelectorAll('.kelly-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedKellyMultiplier = parseFloat(element.dataset.multiplier);
    calculatePosition();
}

/**
 * 거래 데이터 자동 불러오기
 */
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

/**
 * 계산기 탭 전환
 */
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

// ==================== Risk Calculator ====================

/**
 * 리스크 기반 포지션 계산
 */
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

/**
 * 리스크 프리셋 설정
 */
function setRiskPreset(percent) {
    document.querySelectorAll('.risk-preset-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#374151';
        btn.style.borderColor = '#4b5563';
        btn.style.color = '#e4e4e7';
    });
    
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

/**
 * 리스크 계산기 디스플레이 초기화
 */
function resetRiskCalculatorDisplay() {
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

// ==================== Daily Limit Warnings ====================

/**
 * 일일 손익 한도 체크
 */
function checkDailyLimits(tradeDate) {
    // 원칙 데이터에서 해당 날짜의 한도 정보 가져오기
    if (!principlesData || !principlesData[tradeDate]) {
        return; // 원칙 데이터가 없으면 체크하지 않음
    }

    const principlesForDate = principlesData[tradeDate];
    const dailyTarget = parseFloat(principlesForDate.dailyTarget) || 0;
    const maxDailyLoss = parseFloat(principlesForDate.maxDailyLoss) || 0;
    const maxTradeCount = parseInt(principlesForDate.maxTradeCount) || 0;

    // 한도가 설정되지 않았으면 체크하지 않음
    if (dailyTarget === 0 && maxDailyLoss === 0 && maxTradeCount === 0) {
        return;
    }

    // 해당 날짜의 모든 거래 필터링
    const dayTrades = trades.filter(trade => trade.date === tradeDate);

    if (dayTrades.length === 0) {
        return;
    }

    // 거래횟수 제한 체크 (가장 우선순위)
    if (maxTradeCount > 0 && dayTrades.length > maxTradeCount) {
        showLimitWarning('tradeCount', {
            currentCount: dayTrades.length,
            limit: maxTradeCount
        });
        return;
    }

    // 총 손익 계산
    const totalPnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

    // 목표 수익 달성 체크 (수익이 목표 이상일 때)
    if (dailyTarget > 0 && totalPnl >= dailyTarget) {
        showLimitWarning('profit', {
            currentPnl: totalPnl,
            target: dailyTarget
        });
        return;
    }

    // 손실 한도 초과 체크 (손실이 한도 이하일 때)
    if (maxDailyLoss > 0 && totalPnl <= -maxDailyLoss) {
        showLimitWarning('loss', {
            currentPnl: totalPnl,
            limit: maxDailyLoss
        });
        return;
    }
}

/**
 * 한도 경고 모달 표시
 */
function showLimitWarning(type, data) {
    const modal = document.getElementById('limitWarningModal');
    const icon = document.getElementById('limitWarningIcon');
    const title = document.getElementById('limitWarningTitle');
    const message = document.getElementById('limitWarningMessage');
    const stats = document.getElementById('limitWarningStats');
    const btn = document.getElementById('limitWarningBtn');
    const content = modal.querySelector('.limit-warning-content');

    if (!modal || !icon || !title || !message || !stats || !btn || !content) {
        console.error('Warning modal elements not found');
        return;
    }

    // 경고음 재생 (브라우저 beep)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'profit') {
            // 목표 달성: 높은 톤 (성공음)
            oscillator.frequency.value = 800;
        } else if (type === 'tradeCount') {
            // 거래횟수 초과: 중간 톤 (경고음)
            oscillator.frequency.value = 600;
        } else {
            // 손실 한도: 낮은 톤 (경고음)
            oscillator.frequency.value = 400;
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio playback not supported:', error);
    }

    // 모달 스타일 및 내용 설정
    if (type === 'profit') {
        // 목표 달성 (녹색 테마)
        icon.textContent = '🎉';
        title.textContent = translations[currentLanguage]['limit-warning-profit-title'] || 'Daily Target Achieved!';
        message.textContent = translations[currentLanguage]['limit-warning-profit-message'] || 'Congratulations! You have reached your daily profit target.';
        content.classList.remove('warning');
        content.classList.add('success');

        stats.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-top: 16px;">
                <div>
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-current'] || 'Current P/L'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #10b981;">$${data.currentPnl.toFixed(2)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-target'] || 'Daily Target'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #10b981;">$${data.target.toFixed(2)}</div>
                </div>
            </div>
        `;
    } else if (type === 'tradeCount') {
        // 거래횟수 한도 초과 (주황색 테마)
        icon.textContent = '⚠️';
        title.textContent = translations[currentLanguage]['limit-warning-tradecount-title'] || 'Trade Count Limit Exceeded!';
        message.textContent = translations[currentLanguage]['limit-warning-tradecount-message'] || 'You have exceeded your daily trade count limit. Consider taking a break.';
        content.classList.remove('success');
        content.classList.add('warning');

        stats.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; margin-top: 16px;">
                <div>
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-current-count'] || 'Current Trades'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${data.currentCount}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-count-limit'] || 'Limit'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${data.limit}</div>
                </div>
            </div>
        `;
    } else {
        // 손실 한도 초과 (빨간색 테마)
        icon.textContent = '⚠️';
        title.textContent = translations[currentLanguage]['limit-warning-loss-title'] || 'Daily Loss Limit Exceeded!';
        message.textContent = translations[currentLanguage]['limit-warning-loss-message'] || 'Warning! You have exceeded your maximum daily loss limit.';
        content.classList.remove('success');
        content.classList.add('warning');

        stats.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-top: 16px;">
                <div>
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-current'] || 'Current P/L'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #ef4444;">$${data.currentPnl.toFixed(2)}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">${translations[currentLanguage]['limit-warning-limit'] || 'Loss Limit'}</div>
                    <div style="font-size: 20px; font-weight: 600; color: #ef4444;">$${data.limit.toFixed(2)}</div>
                </div>
            </div>
        `;
    }

    btn.textContent = translations[currentLanguage]['limit-warning-ok'] || 'OK, I Understand';

    // 모달 표시
    modal.style.display = 'flex';
}

/**
 * 한도 경고 모달 닫기
 */
function closeLimitWarning() {
    const modal = document.getElementById('limitWarningModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
