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
    
    // 기존 이벤트 리스너 제거를 위해 그리드 클론
    const newGrid = grid.cloneNode(false);
    
    // 헤더만 복사
    const headers = grid.querySelectorAll('.calendar-day-header');
    headers.forEach(header => newGrid.appendChild(header.cloneNode(true)));
    
    // 기존 그리드 교체
    grid.parentNode.replaceChild(newGrid, grid);
    
    // 새로운 그리드 참조 업데이트
    const currentGrid = document.getElementById('calendarGrid');
    
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
    
    // 전역 mouseup 이벤트 리스너 제거 후 재등록
    const existingListener = window._calendarMouseUpListener;
    if (existingListener) {
        document.removeEventListener('mouseup', existingListener);
    }
    
    window._calendarMouseUpListener = endRangeSelection;
    document.addEventListener('mouseup', endRangeSelection);
    
    for (let week = 0; week < 6; week++) {
        let weekTrades = [];
        let weekPnl = 0;
        
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + day);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const estDate = getESTTradingDate(currentDate);
            const dateString = formatTradingDate(estDate);
            dayElement.dataset.date = dateString;
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === new Date().toDateString();
            
            if (!isCurrentMonth) {
                dayElement.classList.add('other-month');
            }
            
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = estDate.getDate();
            dayElement.appendChild(dayNumber);
            
            const dayTrades = trades.filter(trade => trade.date === dateString);
            
            if (dayTrades.length > 0) {
                const tradePnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                const dailyFee = dailyFees[dateString] || 0;
                const totalPnL = tradePnL - dailyFee;
                weekPnl += totalPnL;
                weekTrades = weekTrades.concat(dayTrades);
                
                const pnlElement = document.createElement('div');
                pnlElement.className = `calendar-day-pnl ${totalPnL > 0 ? 'positive' : totalPnL < 0 ? 'negative' : 'neutral'}`;
                pnlElement.textContent = `$${totalPnL.toFixed(0)}`;
                dayElement.appendChild(pnlElement);
                
                const tradesElement = document.createElement('div');
                tradesElement.className = 'calendar-day-trades';
                const tradeText = currentLanguage === 'ko' ? '거래' : 'trade';
                tradesElement.textContent = `${dayTrades.length} ${tradeText}${dayTrades.length !== 1 && currentLanguage !== 'ko' ? 's' : ''}`;
                dayElement.appendChild(tradesElement);
            }
            
            dayElement.addEventListener('click', function(e) {
                e.stopPropagation();
                selectCalendarDay(dateString, dayTrades);
            });
            
            dayElement.addEventListener('mousedown', function(e) {
                e.preventDefault();
                startRangeSelection(dateString);
            });
            
            dayElement.addEventListener('mouseenter', function() {
                if (isSelecting) {
                    updateRangeSelection(dateString);
                }
            });
            
            currentGrid.appendChild(dayElement);
        }
        
        if (showWeekPnl) {
            const weekPnlElement = document.createElement('div');
            weekPnlElement.className = 'calendar-week-pnl';
            
            if (weekTrades.length > 0) {
                weekPnlElement.onclick = () => showWeekDetails(week + 1, weekTrades, weekPnl);
                
                const weekPnlValue = document.createElement('div');
                weekPnlValue.className = `week-pnl-value ${weekPnl > 0 ? 'positive' : weekPnl < 0 ? 'negative' : 'neutral'}`;
                weekPnlValue.textContent = `$${weekPnl.toFixed(0)}`;
                weekPnlElement.appendChild(weekPnlValue);
                
                const weekTradesCount = document.createElement('div');
                weekTradesCount.className = 'week-trades-count';
                const tradeText = currentLanguage === 'ko' ? '거래' : 'trades';
                weekTradesCount.textContent = `${weekTrades.length} ${tradeText}`;
                weekPnlElement.appendChild(weekTradesCount);
            }
            
            currentGrid.appendChild(weekPnlElement);
        }
    }
    
    // 이벤트 리스너를 한 번만 등록
    document.addEventListener('mouseup', endRangeSelection);
    
    renderAnnualHeatmap();
}

function selectCalendarDay(dateString, dayTrades) {
    selectedCalendarDay = dateString;
    
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    const selectedDay = document.querySelector(`[data-date="${dateString}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    showDayDetails(dateString, dayTrades);
}

function showDayDetails(dateString, dayTrades) {
    const dayDetails = document.getElementById('dayDetails');
    const dayDetailsTitle = document.getElementById('dayDetailsTitle');
    const dayTradesList = document.getElementById('dayTradesList');
    
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    dayDetailsTitle.textContent = formattedDate;
    
    if (dayTrades.length === 0) {
        dayTradesList.innerHTML = `
            <div class="empty-state">
                <div style="color: #64748b; font-size: 12px;">
                    ${currentLanguage === 'ko' ? '이 날 거래가 없습니다' : 'No trades on this day'}
                </div>
            </div>
        `;
    } else {
        // 티커별로 거래를 집계
        const tickerStats = {};
        
        dayTrades.forEach(trade => {
            const symbol = trade.symbol;
            if (!tickerStats[symbol]) {
                tickerStats[symbol] = {
                    totalShares: 0,
                    totalCost: 0,
                    totalPnL: 0,
                    tradeCount: 0
                };
            }
            
            const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
            tickerStats[symbol].totalShares += shares;
            tickerStats[symbol].totalCost += shares * trade.buyPrice;
            tickerStats[symbol].totalPnL += trade.pnl;
            tickerStats[symbol].tradeCount++;
        });
        
        // 티커별 정보를 P/L 순으로 정렬
        const sortedTickers = Object.entries(tickerStats)
            .sort((a, b) => b[1].totalPnL - a[1].totalPnL);
        
        dayTradesList.innerHTML = sortedTickers.map(([symbol, stats]) => {
            const avgCostBasis = stats.totalCost / stats.totalShares;
            return `
                <div class="day-trade-item">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span class="trade-symbol">${symbol}</span>
                        <span class="trade-pnl ${stats.totalPnL >= 0 ? 'positive' : 'negative'}">$${stats.totalPnL.toFixed(2)}</span>
                    </div>
                    <div style="font-size: 11px; color: #64748b;">
                        ${currentLanguage === 'ko' ? 'Cost Basis' : 'Cost Basis'}: $${avgCostBasis.toFixed(2)} | ${stats.tradeCount} ${currentLanguage === 'ko' ? '거래' : 'trade'}${stats.tradeCount !== 1 && currentLanguage !== 'ko' ? 's' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    dayDetails.style.display = 'block';
}

function startRangeSelection(dateString) {
    isSelecting = true;
    calendarStartDate = dateString;
    calendarEndDate = dateString;
    updateRangeVisual();
}

function updateRangeSelection(dateString) {
    if (isSelecting) {
        calendarEndDate = dateString;
        updateRangeVisual();
    }
}

function endRangeSelection() {
    if (isSelecting) {
        isSelecting = false;
        updateCalendarStats();
    }
}

function updateRangeVisual() {
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('range-start', 'range-end', 'in-range');
    });
    
    if (calendarStartDate && calendarEndDate) {
        const start = new Date(calendarStartDate);
        const end = new Date(calendarEndDate);
        
        const actualStart = start <= end ? start : end;
        const actualEnd = start <= end ? end : start;
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            const dayDate = new Date(day.dataset.date);
            
            if (dayDate.getTime() === actualStart.getTime()) {
                day.classList.add('range-start');
            } else if (dayDate.getTime() === actualEnd.getTime()) {
                day.classList.add('range-end');
            } else if (dayDate > actualStart && dayDate < actualEnd) {
                day.classList.add('in-range');
            }
        });
    }
}

function changeMonth(direction) {
    calendarDate.setMonth(calendarDate.getMonth() + direction);
    renderCalendar();
}

function clearCalendarRange() {
    calendarStartDate = null;
    calendarEndDate = null;
    selectedCalendarDay = null;
    selectedWeekPnl = null;
    
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected', 'range-start', 'range-end', 'in-range');
    });
    
    document.querySelectorAll('.calendar-week-pnl').forEach(weekEl => {
        weekEl.classList.remove('selected');
    });
    
    document.getElementById('dayDetails').style.display = 'none';
    updateCalendarStats();
}

function updateCalendarStats() {
    let filteredTrades = trades;
    let periodLabel = currentLanguage === 'ko' ? '현재 월' : 'Current Month';
    let showBestWorst = false;
    
    if (calendarStartDate && calendarEndDate) {
        const start = new Date(calendarStartDate);
        const end = new Date(calendarEndDate);
        const actualStart = start <= end ? start : end;
        const actualEnd = start <= end ? end : start;
        
        filteredTrades = trades.filter(trade => {
            const tradeDate = new Date(trade.date);
            return tradeDate >= actualStart && tradeDate <= actualEnd;
        });
        
        const startStr = actualStart.toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' });
        const endStr = actualEnd.toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' });
        periodLabel = `${startStr} - ${endStr}`;
        showBestWorst = true; // 범위선택일 때만 최고/최악의 날 표시
    } else {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        filteredTrades = trades.filter(trade => trade.date.startsWith(monthStr));
        
        const monthNames = currentLanguage === 'ko' ? 
            ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        periodLabel = `${monthNames[month]} ${year}`;
    }
    
    const totalTrades = filteredTrades.length;
    const tradePL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    const uniqueDatesInPeriod = [...new Set(filteredTrades.map(trade => trade.date))];
    const totalFeesInPeriod = uniqueDatesInPeriod.reduce((sum, date) => sum + (dailyFees[date] || 0), 0);
    const totalPL = tradePL - totalFeesInPeriod;
    
    const dailyStats = {};
    filteredTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = 0;
        }
        dailyStats[trade.date] += trade.pnl;
    });
    
    Object.keys(dailyStats).forEach(date => {
        dailyStats[date] -= (dailyFees[date] || 0);
    });
    
    const dailyPLs = Object.values(dailyStats);
    const avgDaily = dailyPLs.length > 0 ? dailyPLs.reduce((sum, pnl) => sum + pnl, 0) / dailyPLs.length : 0;
    
    document.getElementById('calendarPeriodLabel').textContent = periodLabel;
    document.getElementById('calendarTotalTrades').textContent = totalTrades;
    
    document.getElementById('calendarTotalPL').textContent = `$${totalPL.toFixed(2)}`;
    document.getElementById('calendarTotalPL').className = `calendar-stat-value ${totalPL >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('calendarAvgDaily').textContent = `$${avgDaily.toFixed(2)}`;
    document.getElementById('calendarAvgDaily').className = `calendar-stat-value ${avgDaily >= 0 ? 'positive' : 'negative'}`;
    
    if (showBestWorst && dailyPLs.length > 0) {
        const bestDay = Math.max(...dailyPLs);
        const worstDay = dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : Math.min(...dailyPLs);
        
        document.getElementById('calendarBestDay').textContent = `$${bestDay.toFixed(2)}`;
        // 모든 날이 수익일 때는 최악의 날을 표시하지 않음
        if (dailyPLs.some(pnl => pnl < 0)) {
            document.getElementById('calendarWorstDay').textContent = `$${worstDay.toFixed(2)}`;
        } else {
            document.getElementById('calendarWorstDay').textContent = '$0.00';
        }
    } else {
        document.getElementById('calendarBestDay').textContent = '-';
        document.getElementById('calendarWorstDay').textContent = '-';
    }
}

function renderAnnualHeatmap() {
    const currentYear = calendarDate.getFullYear();
    const heatmapGrid = document.getElementById('annualHeatmapGrid');
    const heatmapTitle = document.getElementById('annualHeatmapTitle');
    
    if (!heatmapGrid || !heatmapTitle) return;
    
    const titleText = currentLanguage === 'ko' ? `${currentYear}년 거래 개요` : `${currentYear} Trading Overview`;
    heatmapTitle.textContent = titleText;
    heatmapGrid.innerHTML = '';
    
    const monthNames = currentLanguage === 'ko' ? 
        ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // 그리드를 4x3으로 재설정
    heatmapGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    `;
    
    for (let month = 0; month < 12; month++) {
        const monthContainer = document.createElement('div');
        monthContainer.style.cssText = `
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 250px;
        `;
        
        if (month === calendarDate.getMonth() && currentYear === calendarDate.getFullYear()) {
            monthContainer.style.borderColor = '#3b82f6';
            monthContainer.style.background = 'rgba(59, 130, 246, 0.1)';
        }
        
        monthContainer.onclick = () => showMonthDetails(currentYear, month);
        
        // 월 헤더
        const monthHeader = document.createElement('div');
        monthHeader.style.cssText = `
            color: #e4e4e7;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        monthHeader.innerHTML = `
            <span>${monthNames[month]}, ${currentYear}</span>
            <span style="background: #374151; color: #94a3b8; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Open</span>
        `;
        
        monthContainer.appendChild(monthHeader);
        
        // 요일 헤더
        const weekDayHeader = document.createElement('div');
        weekDayHeader.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            margin-bottom: 4px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
            font-weight: 500;
        `;
        
        const dayAbbrs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayAbbrs.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.cssText = 'padding: 2px;';
            weekDayHeader.appendChild(dayHeader);
        });
        
        monthContainer.appendChild(weekDayHeader);
        
        // 달력 그리드
        const miniCalendar = document.createElement('div');
        miniCalendar.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            height: 120px;
            margin-bottom: 12px;
        `;
        
        const firstDay = new Date(currentYear, month, 1);
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        const startPadding = firstDay.getDay();
        
        let monthPnl = 0;
        let monthTrades = 0;
        
        // 이전 달 빈 셀들
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? currentYear - 1 : currentYear;
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
        
        for (let i = startPadding - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const emptyDay = document.createElement('div');
            emptyDay.style.cssText = `
                width: 20px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #4b5563;
                background: transparent;
            `;
            emptyDay.textContent = dayNum;
            miniCalendar.appendChild(emptyDay);
        }
        
        // 현재 달 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, month, day);
            const dateString = formatTradingDate(date);
            const dayTrades = trades.filter(trade => trade.date === dateString);
            
            const dayElement = document.createElement('div');
            dayElement.style.cssText = `
                width: 20px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 500;
                border-radius: 2px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: #334155;
                color: #94a3b8;
            `;
            
            dayElement.textContent = day;
            
            if (dayTrades.length > 0) {
                const tradePnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                const dailyFee = dailyFees[dateString] || 0;
                const totalPnL = tradePnL - dailyFee;
                
                monthPnl += totalPnL;
                monthTrades += dayTrades.length;
                
                if (totalPnL > 0) {
                    dayElement.style.background = '#10b981';
                    dayElement.style.color = 'white';
                } else if (totalPnL < 0) {
                    dayElement.style.background = '#ef4444';
                    dayElement.style.color = 'white';
                } else {
                    dayElement.style.background = '#f59e0b';
                    dayElement.style.color = 'white';
                }
                
                dayElement.title = `${day}일: $${totalPnL.toFixed(0)} (${dayTrades.length} trades)`;
            }
            
            dayElement.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.zIndex = '10';
            });
            
            dayElement.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.zIndex = '1';
            });
            
            miniCalendar.appendChild(dayElement);
        }
        
        // 다음 달 빈 셀들
        const totalCells = 42; // 6주 * 7일
        const usedCells = startPadding + daysInMonth;
        const remainingCells = totalCells - usedCells;
        
        for (let day = 1; day <= Math.min(remainingCells, 14); day++) {
            const emptyDay = document.createElement('div');
            emptyDay.style.cssText = `
                width: 20px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #4b5563;
                background: transparent;
            `;
            emptyDay.textContent = day;
            miniCalendar.appendChild(emptyDay);
        }
        
        monthContainer.appendChild(miniCalendar);
        
        // 월 통계
        const monthStats = document.createElement('div');
        monthStats.style.cssText = `
            text-align: center;
            border-top: 1px solid #334155;
            padding-top: 8px;
        `;
        
        const monthPnlElement = document.createElement('div');
        monthPnlElement.style.cssText = `
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
            color: ${monthPnl > 0 ? '#10b981' : monthPnl < 0 ? '#ef4444' : '#64748b'};
        `;
        monthPnlElement.textContent = `$${monthPnl.toFixed(0)}`;
        monthStats.appendChild(monthPnlElement);
        
        const monthTradesElement = document.createElement('div');
        monthTradesElement.style.cssText = `
            font-size: 11px;
            color: #64748b;
        `;
        const tradeText = currentLanguage === 'ko' ? '거래' : 'trades';
        monthTradesElement.textContent = `${monthTrades} ${tradeText}`;
        monthStats.appendChild(monthTradesElement);
        
        monthContainer.appendChild(monthStats);
        heatmapGrid.appendChild(monthContainer);
    }
}

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

function showWeekDetails(weekNumber, weekTrades, weekPnl) {
    // 기존 선택된 week P/L 초기화
    document.querySelectorAll('.calendar-week-pnl').forEach(weekEl => {
        weekEl.classList.remove('selected');
    });
    
    // 현재 클릭한 week P/L 선택 표시
    event.target.closest('.calendar-week-pnl').classList.add('selected');
    selectedWeekPnl = { weekNumber, weekTrades, weekPnl };
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthNames = currentLanguage === 'ko' ? 
        ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] :
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // 주간 통계 계산
    const wins = weekTrades.filter(trade => trade.pnl > 0);
    const winRate = weekTrades.length > 0 ? (wins.length / weekTrades.length) * 100 : 0;
    
    // 일별 P/L 계산 (수수료 포함)
    const dailyStats = {};
    weekTrades.forEach(trade => {
        if (!dailyStats[trade.date]) {
            dailyStats[trade.date] = 0;
        }
        dailyStats[trade.date] += trade.pnl;
    });
    
    // 수수료 적용
    Object.keys(dailyStats).forEach(date => {
        const fee = dailyFees[date] || 0;
        dailyStats[date] -= fee;
    });
    
    const dailyPLs = Object.values(dailyStats);
    const bestDay = dailyPLs.length > 0 ? Math.max(...dailyPLs) : 0;
    const worstDay = dailyPLs.length > 0 && dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : 0;
    
    // 티커별 통계 계산
    const tickerStats = {};
    weekTrades.forEach(trade => {
        const symbol = trade.symbol;
        if (!tickerStats[symbol]) {
            tickerStats[symbol] = {
                totalShares: 0,
                totalCost: 0,
                totalPnL: 0,
                tradeCount: 0
            };
        }
        
        const shares = trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0);
        tickerStats[symbol].totalShares += shares;
        tickerStats[symbol].totalCost += shares * trade.buyPrice;
        tickerStats[symbol].totalPnL += trade.pnl;
        tickerStats[symbol].tradeCount++;
    });
    
    // 주간요약 칸 업데이트
    const weekText = currentLanguage === 'ko' ? 
        `${monthNames[month]} ${weekNumber}주차` : 
        `Week ${weekNumber} of ${monthNames[month]}`;
        
    document.getElementById('selectedWeekLabel').textContent = weekText;
    document.getElementById('selectedWeekTrades').textContent = weekTrades.length;
    document.getElementById('selectedWeekPnl').textContent = `$${weekPnl.toFixed(2)}`;
    document.getElementById('selectedWeekPnl').className = `weekly-value ${weekPnl >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('selectedWeekWinRate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('selectedWeekWinRate').className = `weekly-value ${winRate >= 50 ? 'positive' : 'negative'}`;
    document.getElementById('selectedWeekBestDay').textContent = `$${bestDay.toFixed(2)}`;
    document.getElementById('selectedWeekWorstDay').textContent = worstDay < 0 ? `$${worstDay.toFixed(2)}` : '$0.00';
    
    // 기존 상세 정보 제거
    let existingWeekDetails = document.getElementById('weekTickerDetails');
    if (existingWeekDetails) {
        existingWeekDetails.remove();
    }
    
    // 티커별 정보를 P/L 순으로 정렬
    const sortedTickers = Object.entries(tickerStats)
        .sort((a, b) => b[1].totalPnL - a[1].totalPnL);
    
    if (sortedTickers.length > 0) {
        const weekDetailsDiv = document.createElement('div');
        weekDetailsDiv.id = 'weekTickerDetails';
        weekDetailsDiv.style.cssText = `
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #334155;
        `;
        
        // 페이지네이션 변수 (6개씩)
        const itemsPerPage = 6;
        const totalPages = Math.ceil(sortedTickers.length / itemsPerPage);
        let currentPage = 1;
        
        const detailsTitle = document.createElement('div');
        detailsTitle.style.cssText = `
            color: #f8fafc;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const titleText = currentLanguage === 'ko' ? '주간 티커 상세' : 'Week Ticker Details';
        
        if (totalPages > 1) {
            detailsTitle.innerHTML = `
                <span>${titleText}</span>
                <div style="display: flex; gap: 4px; align-items: center;">
                    <button id="weekPrevBtn" style="background: #374151; border: 1px solid #4b5563; color: #e4e4e7; padding: 4px 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">‹</button>
                    <span id="weekPageInfo" style="font-size: 11px; color: #94a3b8; min-width: 30px; text-align: center;">1/${totalPages}</span>
                    <button id="weekNextBtn" style="background: #374151; border: 1px solid #4b5563; color: #e4e4e7; padding: 4px 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">›</button>
                </div>
            `;
        } else {
            detailsTitle.innerHTML = `<span>${titleText}</span>`;
        }
        
        weekDetailsDiv.appendChild(detailsTitle);
        
        const tickerList = document.createElement('div');
        tickerList.id = 'weekTickerList';
        weekDetailsDiv.appendChild(tickerList);
        
        // 페이지 렌더링 함수
        function renderWeekPage() {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, sortedTickers.length);
            const pageItems = sortedTickers.slice(startIndex, endIndex);
            
            tickerList.innerHTML = pageItems.map(([symbol, stats]) => {
                const avgCostBasis = stats.totalCost / stats.totalShares;
                return `
                    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px; margin-bottom: 8px; font-size: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: #e4e4e7;">${symbol}</span>
                            <span style="font-weight: 600;" class="${stats.totalPnL >= 0 ? 'positive' : 'negative'}">$${stats.totalPnL.toFixed(2)}</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b;">
                            ${currentLanguage === 'ko' ? 'Cost Basis' : 'Cost Basis'}: $${avgCostBasis.toFixed(2)} | ${stats.tradeCount} ${currentLanguage === 'ko' ? '거래' : 'trade'}${stats.tradeCount !== 1 && currentLanguage !== 'ko' ? 's' : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            if (totalPages > 1) {
                const pageInfo = document.getElementById('weekPageInfo');
                const prevBtn = document.getElementById('weekPrevBtn');
                const nextBtn = document.getElementById('weekNextBtn');
                
                if (pageInfo) pageInfo.textContent = `${currentPage}/${totalPages}`;
                if (prevBtn) prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
                if (nextBtn) nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
            }
        }
        
        // 이벤트 리스너 추가
        if (totalPages > 1) {
            setTimeout(() => {
                const prevBtn = document.getElementById('weekPrevBtn');
                const nextBtn = document.getElementById('weekNextBtn');
                
                if (prevBtn) {
                    prevBtn.onclick = () => {
                        if (currentPage > 1) {
                            currentPage--;
                            renderWeekPage();
                        }
                    };
                }
                
                if (nextBtn) {
                    nextBtn.onclick = () => {
                        if (currentPage < totalPages) {
                            currentPage++;
                            renderWeekPage();
                        }
                    };
                }
            }, 50);
        }
        
        renderWeekPage();
        document.getElementById('weeklySummary').parentNode.appendChild(weekDetailsDiv);
    }
    
    // Day details 숨기기
    document.getElementById('dayDetails').style.display = 'none';
}

function closeWeekDetails() {
    document.getElementById('weekDetailsModal').style.display = 'none';
}
