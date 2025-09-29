/* AUTO-GENERATED: extracted from original 4.html
   filename: js/calendar.js
*/

// Monthly Performance

            // Monthly Performance
            const monthlyStats = {};
            filteredTrades.forEach(trade => {
                const month = trade.date.substring(0, 7);
                if (!monthlyStats[month]) {
                    monthlyStats[month] = 0;
                }
                monthlyStats[month] += trade.pnl;
            });

            const monthlyData = Object.entries(monthlyStats)
                .sort(([a], [b]) => a.localeCompare(b));

            createBasicChart('basicMonthlyChart', 'line', {
                labels: monthlyData.map(([month]) => month),
                datasets: [{
                    label: 'Monthly P&L',
                    data: monthlyData.map(([, pnl]) => pnl),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                }]
            });
        }
        async function updateAdvancedCharts() {
    const filteredTrades = getFilteredTradesForAnalytics();

    if (filteredTrades.length === 0) {

// Day of week analysis

            // Day of week analysis
            const dayStats = {};
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const daysOfWeekKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

            filteredTrades.forEach(trade => {
                const day = new Date(trade.date).getDay();
                if (!dayStats[day]) {
                    dayStats[day] = { count: 0, totalPL: 0 };
                }
                dayStats[day].count++;
                dayStats[day].totalPL += trade.pnl;
            });

            const bestDayOfWeek = Object.entries(dayStats)
                .sort((a, b) => b[1].totalPL - a[1].totalPL)[0];

            document.getElementById('detailAvgHoldTime').textContent = `${avgHoldTime.toFixed(0)}m`;
            document.getElementById('detailShortestHold').textContent = `${shortestHold}m`;
            document.getElementById('detailLongestHold').textContent = `${longestHold}m`;
            document.getElementById('detailBestHour').textContent = bestHour ? 
                `${bestHour[0]}:00 ($${bestHour[1].totalPL.toFixed(2)})` : '-';
            document.getElementById('detailWorstHour').textContent = worstHour ? 
                `${worstHour[0]}:00 ($${worstHour[1].totalPL.toFixed(2)})` : '-';
            document.getElementById('detailBestDayOfWeek').textContent = bestDayOfWeek ? 
                (currentLanguage === 'ko' ? daysOfWeekKo[bestDayOfWeek[0]] : daysOfWeek[bestDayOfWeek[0]]) : '-';
        }

        function updateTradingActivityDetails(filteredTrades, uniqueDatesForFees) {
            const tradingDays = uniqueDatesForFees.length;
            const avgTradesPerDay = tradingDays > 0 ? filteredTrades.length / tradingDays : 0;

// Calendar related functions

        // Calendar related functions
        function renderCalendar() {
            const grid = document.getElementById('calendarGrid');
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            
            const monthNames = currentLanguage === 'ko' ? 
                ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
                ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.getElementById('calendarTitle').textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            const existingDays = grid.querySelectorAll('.calendar-day, .calendar-week-pnl');
            existingDays.forEach(day => day.remove());
            
            const showWeekPnl = window.innerWidth > 768;
            const header = document.getElementById('weekPnlHeader');
            
            if (showWeekPnl) {
                grid.classList.add('expanded');
                if (header) header.style.display = 'block';
            } else {
                grid.classList.remove('expanded');
                if (header) header.style.display = 'none';
            }
            
            updateCalendarStats();

// Month Details Modal Functions
        
        // Month Details Modal Functions
        let selectedMonthYear = null;
        let selectedMonth = null;

        function showMonthDetails(year, month) {
            selectedMonthYear = year;
            selectedMonth = month;
            
            const monthNames = currentLanguage === 'ko' ? 
                ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
                ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.getElementById('monthDetailsTitle').textContent = `${monthNames[month]} ${year}`;
            
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const monthTrades = trades.filter(trade => trade.date.startsWith(monthStr));
            
            const tradePnL = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            const uniqueDates = [...new Set(monthTrades.map(trade => trade.date))];
            const totalFees = uniqueDates.reduce((sum, date) => sum + (dailyFees[date] || 0), 0);
            const totalPnL = tradePnL - totalFees;
            
            const wins = monthTrades.filter(trade => trade.pnl > 0);
            const winRate = monthTrades.length > 0 ? (wins.length / monthTrades.length) * 100 : 0;
            
            document.getElementById('monthDetailPnl').textContent = `$${totalPnL.toFixed(2)}`;
            document.getElementById('monthDetailPnl').className = `month-detail-stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}`;
            
            document.getElementById('monthDetailTrades').textContent = monthTrades.length;
            
            document.getElementById('monthDetailWinRate').textContent = `${winRate.toFixed(1)}%`;
            document.getElementById('monthDetailWinRate').className = `month-detail-stat-value ${winRate >= 50 ? 'positive' : 'negative'}`;
            
            document.getElementById('monthDetailsModal').style.display = 'flex';
        }

        function closeMonthDetails() {
            document.getElementById('monthDetailsModal').style.display = 'none';
            selectedMonthYear = null;
            selectedMonth = null;
        }

        function navigateToMonth() {
            if (selectedMonthYear && selectedMonth !== null) {
                calendarDate = new Date(selectedMonthYear, selectedMonth, 1);
                renderCalendar();
                closeMonthDetails();
            }
        }

// 기존 showWeekDetails 함수를 완전히 교체

        // 기존 showWeekDetails 함수를 완전히 교체
        function showWeekDetails(weekNumber, weekTrades, weekPnl) {

// 기존 선택된 week P/L 초기화
            // 기존 선택된 week P/L 초기화
            document.querySelectorAll('.calendar-week-pnl').forEach(weekEl => {
                weekEl.classList.remove('selected');
            });

// 현재 클릭한 week P/L 선택 표시
            
            // 현재 클릭한 week P/L 선택 표시
            event.target.closest('.calendar-week-pnl').classList.add('selected');
            selectedWeekPnl = { weekNumber, weekTrades, weekPnl };
            
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            const monthNames = currentLanguage === 'ko' ? 
                ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
                ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
