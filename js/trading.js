/* AUTO-GENERATED: extracted from original 4.html
   filename: js/trading.js
*/

// 12. Trade Duration Analysis

    // 12. Trade Duration Analysis
    const durationStats = {};
    filteredTrades.forEach(trade => {
        if (trade.holdingTime) {
            const duration = parseInt(trade.holdingTime.replace('m', ''));
            let range;
            if (duration < 30) range = '0-30m';
            else if (duration < 60) range = '30-60m';
            else if (duration < 120) range = '1-2h';
            else if (duration < 240) range = '2-4h';
            else range = '4h+';
            
            if (!durationStats[range]) {
                durationStats[range] = { count: 0, totalPL: 0 };
            }
            durationStats[range].count++;
            durationStats[range].totalPL += trade.pnl;
        }
    });

    const durationData = Object.entries(durationStats).map(([range, data]) => ({
        label: range,
        avgPL: data.count > 0 ? data.totalPL / data.count : 0
    }));

    createAdvancedChart('tradeDurationAnalysisChart', 'bar', {
        labels: durationData.map(d => d.label),
        datasets: [{
            label: 'Avg P&L by Duration',
            data: durationData.map(d => d.avgPL),
            backgroundColor: '#06b6d4'
        }]
    });

// Trade related functions

        // Trade related functions
        function calculatePnL() {
            const shares = parseFloat(document.getElementById('shares').value) || 0;
            const buyPrice = parseFloat(document.getElementById('buyPrice').value) || 0;
            const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;

// Calculate trades per day
            
            // Calculate trades per day
            const tradesPerDay = {};
            filteredTrades.forEach(trade => {
                tradesPerDay[trade.date] = (tradesPerDay[trade.date] || 0) + 1;
            });
            const maxTradesDay = Object.keys(tradesPerDay).length > 0 ? Math.max(...Object.values(tradesPerDay)) : 0;

            const positions = filteredTrades.map(trade => trade.amount);
            const avgPositionSize = positions.length > 0 ? positions.reduce((sum, pos) => sum + pos, 0) / positions.length : 0;
            const largestPosition = positions.length > 0 ? Math.max(...positions) : 0;
            const smallestPosition = positions.length > 0 ? Math.min(...positions) : 0;

            document.getElementById('detailTradingDays').textContent = tradingDays;
            document.getElementById('detailAvgTradesPerDay').textContent = avgTradesPerDay.toFixed(2);
            document.getElementById('detailMaxTradesDay').textContent = maxTradesDay;
            document.getElementById('detailAvgPositionSize').textContent = `$${avgPositionSize.toFixed(0)}`;
            document.getElementById('detailLargestPosition').textContent = `$${largestPosition.toFixed(0)}`;
            document.getElementById('detailSmallestPosition').textContent = `$${smallestPosition.toFixed(0)}`;
        }

        function updateStreakAnalysisDetails(filteredTrades) {
            let currentStreak = 0;
            let maxWinStreak = 0;
            let maxLossStreak = 0;
            let currentWinStreak = 0;
            let currentLossStreak = 0;
            let winStreaks = [];
            let totalWinStreaks = 0;

            const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

            sortedTrades.forEach((trade, index) => {
                if (trade.pnl > 0) {
                    if (currentLossStreak > 0) {
                        currentLossStreak = 0;
                    }
                    currentWinStreak++;
                    maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
                    if (index === sortedTrades.length - 1) {
                        currentStreak = currentWinStreak;
                    }
                } else if (trade.pnl < 0) {
                    if (currentWinStreak > 0) {
                        winStreaks.push(currentWinStreak);
                        totalWinStreaks++;
                        currentWinStreak = 0;
                    }
                    currentLossStreak++;
                    maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
                    if (index === sortedTrades.length - 1) {
                        currentStreak = -currentLossStreak;
                    }
                }
            });

            if (currentWinStreak > 0) {
                winStreaks.push(currentWinStreak);
                totalWinStreaks++;
            }

            const avgWinStreak = totalWinStreaks > 0 ? winStreaks.reduce((sum, streak) => sum + streak, 0) / totalWinStreaks : 0;

// Trade selection functions for dashboard

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
