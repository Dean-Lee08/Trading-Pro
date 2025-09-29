/* AUTO-GENERATED: extracted from original 4.html
   filename: js/utils.js
*/

// Function to get EST trading date
        
        // Function to get EST trading date
        function getESTTradingDate(date = new Date()) {
            return new Date(date);
        }

// Function to format date for storage (EST trading date)

        // Function to format date for storage (EST trading date)
        function formatTradingDate(date) {
            return date.getFullYear() + '-' + 
                String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                String(date.getDate()).padStart(2, '0');
        }

// Date management functions

        // Date management functions
        function updateCurrentDateDisplay() {
            const dateStr = currentTradingDate.toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            document.getElementById('currentDateDisplay').textContent = dateStr;
        }

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

        function closeDatePicker() {
            document.getElementById('datePickerModal').style.display = 'none';
        }

        function applySelectedDate() {
            const input = document.getElementById('datePickerInput');
            if (input.value) {
                currentTradingDate = new Date(input.value + 'T12:00:00');
                updateCurrentDateDisplay();
                updateStats();
                loadDailyFees();
                closeDatePicker();
            }
        }

        function changeTradingDate(direction) {
            const newDate = new Date(currentTradingDate);
            newDate.setDate(newDate.getDate() + direction);
            currentTradingDate = newDate;
            updateCurrentDateDisplay();
            updateStats();
            updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
            loadDailyFees();
            showToast(direction > 0 ? 'Next day' : 'Previous day');
        }

// Note formatting functions

        // Note formatting functions
        function toggleBold() {
            document.execCommand('bold');
            document.querySelector('[onclick="toggleBold()"]').classList.toggle('active');
        }

        function toggleItalic() {
            document.execCommand('italic');
            document.querySelector('[onclick="toggleItalic()"]').classList.toggle('active');
        }

        function toggleUnderline() {
            document.execCommand('underline');
            document.querySelector('[onclick="toggleUnderline()"]').classList.toggle('active');
        }

        function changeFont() {
            const font = document.getElementById('fontSelector').value;
            currentFont = font;
            document.getElementById('noteContentEditor').style.fontFamily = font;
            document.execCommand('fontName', false, font);
        }

        function changeTextColor(color) {
            currentTextColor = color;
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('active');
            });

// Dashboard date range functions

        // Dashboard date range functions
        function clearDashboardRange() {
            dashboardStartDate = null;
            dashboardEndDate = null;
            document.getElementById('dashboardStartDate').value = '';
            document.getElementById('dashboardEndDate').value = '';
            updateStats();
            updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
        }

        function getFilteredDashboardTrades() {
            let filteredTrades = trades;
            const currentDate = formatTradingDate(currentTradingDate);
            
            if (dashboardStartDate || dashboardEndDate) {
                filteredTrades = trades.filter(trade => {
                    const tradeDate = trade.date;
                    if (dashboardStartDate && tradeDate < dashboardStartDate) return false;
                    if (dashboardEndDate && tradeDate > dashboardEndDate) return false;
                    return true;
                });
            } else {
                filteredTrades = trades.filter(trade => trade.date === currentDate);
            }
            
            return filteredTrades;
        }

// Analytics date range functions

        // Analytics date range functions
        function clearAnalyticsRange() {
            analyticsStartDate = null;
            analyticsEndDate = null;
            document.getElementById('analyticsStartDate').value = '';
            document.getElementById('analyticsEndDate').value = '';
            updateDetailedAnalytics();
        }

// Trades page date range functions

        // Trades page date range functions
        function clearTradesRange() {
            tradesStartDate = null;
            tradesEndDate = null;
            document.getElementById('tradesStartDate').value = '';
            document.getElementById('tradesEndDate').value = '';
            updateAllTradesList();
        }

        function getFilteredTradesList() {
            if (tradesStartDate || tradesEndDate) {
                return trades.filter(trade => {
                    const tradeDate = trade.date;
                    if (tradesStartDate && tradeDate < tradesStartDate) return false;
                    if (tradesEndDate && tradeDate > tradesEndDate) return false;
                    return true;
                });
            }
            return trades;
        }

// Update existing note
        // Update existing note
        const noteIndex = notes.findIndex(n => n.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title,
                content: content,
                font: currentFont,
                textColor: currentTextColor,
                updatedAt: now.toISOString()
            };
        }
    } else {

// Update tab states
            
            // Update tab states
            document.querySelectorAll('.analytics-tab').forEach(tab => {
                tab.classList.remove('active');
            });

// Dashboard date range listeners
            
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

// Statistics update function

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

// Update dashboard table as well
            
            // Update dashboard table as well
            updateTradesTable(getFilteredDashboardTrades(), 'tradesTableBody');
            const dashboardTrades = getFilteredDashboardTrades();
            document.getElementById('periodSummary').textContent = `${dashboardTrades.length} ${tradesText}`;
        }

// Apply custom date range if set
            
            // Apply custom date range if set
            if (analyticsStartDate || analyticsEndDate) {
                filteredTrades = trades.filter(trade => {
                    const tradeDate = trade.date;
                    if (analyticsStartDate && tradeDate < analyticsStartDate) return false;
                    if (analyticsEndDate && tradeDate > analyticsEndDate) return false;
                    return true;
                });
            } else {

// Update Summary Cards
            
            // Update Summary Cards
            document.getElementById('summaryNetProfit').textContent = `$${netTotalPL.toFixed(2)}`;
            document.getElementById('summaryNetProfit').className = `summary-card-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
            document.getElementById('summaryTotalTrades').textContent = filteredTrades.length;
            document.getElementById('summaryWinRate').textContent = `${winRate.toFixed(1)}%`;
            document.getElementById('summaryWinRate').className = `summary-card-value ${winRate >= 50 ? 'positive' : 'negative'}`;
            document.getElementById('summaryProfitFactor').textContent = profitFactor.toFixed(2);
            document.getElementById('summaryProfitFactor').className = `summary-card-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
            document.getElementById('summaryLargestWin').textContent = `$${largestWin.toFixed(2)}`;
            document.getElementById('summaryLargestWin').className = `summary-card-value positive`;
            document.getElementById('summaryLargestLoss').textContent = `$${largestLoss.toFixed(2)}`;
            document.getElementById('summaryLargestLoss').className = `summary-card-value negative`;

// Update detail cards

            // Update detail cards
            updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees);
            updateWinLossStatistics(filteredTrades, wins, losses, winRate);
            updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees);
            updateTimeAnalysisDetails(filteredTrades);
            updateTradingActivityDetails(filteredTrades, uniqueDatesForFees);
            updateStreakAnalysisDetails(filteredTrades);
            updateSymbolPerformanceDetails(filteredTrades);
            updateRiskManagementDetails(filteredTrades);

// Update tab states
            // Update tab states
            document.querySelectorAll('.position-calc-tab').forEach(tab => {
                tab.classList.remove('active');
                tab.style.background = 'transparent';
                tab.style.color = '#94a3b8';
            });
