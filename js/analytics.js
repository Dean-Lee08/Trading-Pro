/* AUTO-GENERATED: extracted from original 4.html
   filename: js/analytics.js
*/

// Chart instances
        
        // Chart instances
        let basicCharts = {};
        let advancedCharts = {};

// Chart.js loading helper

        // Chart.js loading helper
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

// Destroy existing chart if it exists

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

// Clear charts if no data
                // Clear charts if no data
                ['basicCumulativePLChart', 'basicWinLossChart', 'basicDailyPLChart', 'basicMonthlyChart'].forEach(chartId => {
                    if (basicCharts[chartId]) {
                        basicCharts[chartId].destroy();
                        delete basicCharts[chartId];
                    }

// Cumulative P&L Chart

            // Cumulative P&L Chart

// Win/Loss Distribution

            // Win/Loss Distribution
            const wins = filteredTrades.filter(trade => trade.pnl > 0).length;
            const losses = filteredTrades.filter(trade => trade.pnl < 0).length;

            createBasicChart('basicWinLossChart', 'doughnut', {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            });

// Clear charts if no data
        // Clear charts if no data
        Object.keys(advancedCharts).forEach(chartId => {
            if (advancedCharts[chartId]) {
                advancedCharts[chartId].destroy();
                delete advancedCharts[chartId];
            }
        });

// 2. Drawdown Chart

    // 2. Drawdown Chart

// Update basic charts if in detail section

            // Update basic charts if in detail section
            if (currentAnalyticsSection === 'detail') {
                setTimeout(async () => await updateBasicCharts(), 100);
            }
        }

        function updateTradingPerformanceDetails(filteredTrades, totalPL, totalWins, totalLosses, totalDailyFees) {
            const totalVolume = filteredTrades.reduce((sum, trade) => sum + trade.amount, 0);
            const netTotalPL = totalPL - totalDailyFees;
            const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

            document.getElementById('detailTotalPL').textContent = `$${netTotalPL.toFixed(2)}`;
            document.getElementById('detailTotalPL').className = `detail-value ${netTotalPL >= 0 ? 'positive' : 'negative'}`;
            document.getElementById('detailTotalGain').textContent = `$${totalWins.toFixed(2)}`;
            document.getElementById('detailTotalLoss').textContent = `$${totalLosses.toFixed(2)}`;
            document.getElementById('detailTotalFees').textContent = `$${totalDailyFees.toFixed(2)}`;
            document.getElementById('detailTotalVolume').textContent = `$${totalVolume.toFixed(2)}`;
            document.getElementById('detailProfitFactor').textContent = profitFactor.toFixed(2);
            document.getElementById('detailProfitFactor').className = `detail-value ${profitFactor >= 1 ? 'positive' : 'negative'}`;
        }

        function updateWinLossStatistics(filteredTrades, wins, losses, winRate) {
            const avgWinningTrade = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
            const avgLosingTrade = losses.length > 0 ? losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length : 0;
            const pnls = filteredTrades.map(trade => trade.pnl);
            const largestWin = filteredTrades.length > 0 ? Math.max(...pnls) : 0;
            const largestLoss = filteredTrades.length > 0 ? Math.min(...pnls) : 0;

            document.getElementById('detailWinningTrades').textContent = `${wins.length} (${winRate.toFixed(1)}%)`;
            document.getElementById('detailLosingTrades').textContent = `${losses.length} (${(100 - winRate).toFixed(1)}%)`;
            document.getElementById('detailAvgWinningTrade').textContent = `$${avgWinningTrade.toFixed(2)}`;
            document.getElementById('detailAvgLosingTrade').textContent = `$${avgLosingTrade.toFixed(2)}`;
            document.getElementById('detailLargestWin').textContent = `$${largestWin.toFixed(2)}`;
            document.getElementById('detailLargestLoss').textContent = `$${largestLoss.toFixed(2)}`;
        }

        function updateDailyPerformanceDetails(filteredTrades, uniqueDatesForFees, totalDailyFees) {

// Apply daily fees and determine win/loss days

            // Apply daily fees and determine win/loss days
            const dailyPLsWithFees = [];
            Object.keys(dailyStats).forEach(date => {
                const fee = dailyFees[date] || 0;
                const netDailyPL = dailyStats[date].tradePL - fee;
                dailyPLsWithFees.push(netDailyPL);
                
                if (netDailyPL > 0) dailyStats[date].winDays = 1;
                else if (netDailyPL < 0) dailyStats[date].lossDays = 1;
            });

            const winDays = Object.values(dailyStats).filter(data => data.winDays > 0).length;
            const lossDays = Object.values(dailyStats).filter(data => data.lossDays > 0).length;
            const bestTradingDay = dailyPLsWithFees.length > 0 ? Math.max(...dailyPLsWithFees) : 0;
