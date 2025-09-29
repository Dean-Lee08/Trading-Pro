/* AUTO-GENERATED: extracted from original 4.html
   filename: js/main.js
*/

// Detail card collapse function

        // Detail card collapse function
        function toggleDetailCard(header) {
            const card = header.parentElement;
            card.classList.toggle('collapsed');
        }

// 모든 상태 초기화
            
            // 모든 상태 초기화
            currentNotesSection = section;
            currentViewingNoteId = null;
            editingNoteId = null;

// 에디터와 뷰모드 숨기기
            
            // 에디터와 뷰모드 숨기기
            document.getElementById('noteEditor').style.display = 'none';
            document.getElementById('noteViewMode').style.display = 'none';

// 탭 상태 업데이트
            
            // 탭 상태 업데이트
            document.querySelectorAll('.notes-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');

// 모든 섹션 숨기기
            
            // 모든 섹션 숨기기
            document.querySelectorAll('.note-section').forEach(noteSection => {
                noteSection.classList.remove('active');
                noteSection.style.display = 'none';
            });

// 선택된 섹션만 표시
            
            // 선택된 섹션만 표시
            const targetSection = document.getElementById(`${section}NotesSection`);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
            }

// 색상 매핑 객체를 사용한 올바른 활성화
            
            // 색상 매핑 객체를 사용한 올바른 활성화
            const colorMap = {
                '#e4e4e7': 'rgb(228, 228, 231)',
                '#10b981': 'rgb(16, 185, 129)',
                '#ef4444': 'rgb(239, 68, 68)',
                '#3b82f6': 'rgb(59, 130, 246)',
                '#f59e0b': 'rgb(245, 158, 11)',
                '#8b5cf6': 'rgb(139, 92, 246)'
            };
            
            document.querySelectorAll('.color-option').forEach(option => {
                if (colorMap[color] === option.style.backgroundColor) {
                    option.classList.add('active');
                }
            });

            const selection = window.getSelection();
            
            if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('foreColor', false, color);
                return;
            }
            
            const editor = document.getElementById('noteContentEditor');
            editor.style.color = color;
        }

// Daily fees functions

        // Daily fees functions
        function saveDailyFees() {
            const currentDate = formatTradingDate(currentTradingDate);
            const feesValue = parseFloat(document.getElementById('dailyFees').value) || 0;
            dailyFees[currentDate] = feesValue;
            localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
            showToast('Daily fees saved');
        }

        function loadDailyFees() {
            const currentDate = formatTradingDate(currentTradingDate);
            const feesInput = document.getElementById('dailyFees');
            if (dailyFees[currentDate]) {
                feesInput.value = dailyFees[currentDate];
            } else {
                feesInput.value = '';
            }
        }

// Toast notification

        // Toast notification
        function showToast(message) {
            const toast = document.getElementById('toastNotification');
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

// 기존 내용이 있는지 확인
    // 기존 내용이 있는지 확인
    const noteEditor = document.getElementById('noteEditor');
    const isCurrentlyEditing = noteEditor.style.display === 'block';
    
    if (isCurrentlyEditing) {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContentEditor').innerHTML.trim();
        
        if (title || content) {
            const confirmMessage = currentLanguage === 'ko' ? 
                '작성 중인 노트가 있습니다. 새 노트를 시작하시겠습니까?' : 
                'You have unsaved content. Start a new note?';
            
            if (!confirm(confirmMessage)) {
                return;
            }
        }
    }

    editingNoteId = null;
    currentFont = "'Inter', sans-serif";
    currentTextColor = '#e4e4e7';
    
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContentEditor').innerHTML = '';
    document.getElementById('noteContentEditor').style.fontFamily = currentFont;
    document.getElementById('noteContentEditor').style.color = currentTextColor;
    document.getElementById('fontSelector').value = currentFont;

// 색상 옵션 초기화
    
    // 색상 옵션 초기화
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    const defaultColorOption = document.querySelector('.color-option[style*="228, 228, 231"]');
    if (defaultColorOption) {
        defaultColorOption.classList.add('active');
    }
    
    document.getElementById('noteEditor').style.display = 'block';
    document.getElementById('noteViewMode').style.display = 'none';
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('noteTitle').focus();
}
        
        function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        editingNoteId = noteId;
        currentTextColor = note.textColor || '#e4e4e7';
        currentFont = note.font || "'Inter', sans-serif";
        
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContentEditor').innerHTML = note.content;
        document.getElementById('noteContentEditor').style.fontFamily = currentFont;
        document.getElementById('noteContentEditor').style.color = currentTextColor;
        document.getElementById('fontSelector').value = currentFont;

// 색상 옵션 업데이트
        
        // 색상 옵션 업데이트
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });

// 현재 색상에 맞는 옵션 선택
        
        // 현재 색상에 맞는 옵션 선택
        const colorMap = {
            '#e4e4e7': 'rgb(228, 228, 231)',
            '#10b981': 'rgb(16, 185, 129)',
            '#ef4444': 'rgb(239, 68, 68)',
            '#3b82f6': 'rgb(59, 130, 246)',
            '#f59e0b': 'rgb(245, 158, 11)',
            '#8b5cf6': 'rgb(139, 92, 246)'
        };
        
        document.querySelectorAll('.color-option').forEach(option => {
            if (colorMap[currentTextColor] === option.style.backgroundColor) {
                option.classList.add('active');
            }
        });
        
        document.getElementById('noteEditor').style.display = 'block';
        document.getElementById('noteViewMode').style.display = 'none';
        document.querySelectorAll('.note-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('noteTitle').focus();
    }
}

        function deleteNote(noteId) {
            if (confirm(currentLanguage === 'ko' ? '이 노트를 삭제하시겠습니까?' : 'Are you sure you want to delete this note?')) {
                notes = notes.filter(note => note.id !== noteId);
                saveNotes();
                renderAllNotesSections();
                showToast(currentLanguage === 'ko' ? '노트가 삭제되었습니다' : 'Note deleted');
            }
        }

        function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContentEditor').innerHTML.trim();
    
    if (!title || !content) {
        alert(currentLanguage === 'ko' ? '제목과 내용을 모두 입력해주세요.' : 'Please enter both title and content.');
        return;
    }

    const now = new Date();
    
    if (editingNoteId) {

// 모든 섹션 숨기기 후 현재 카테고리만 표시
    
    // 모든 섹션 숨기기 후 현재 카테고리만 표시
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${currentNotesSection}NotesSection`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }

// Collapse
        // Collapse
        const preview = note.content.replace(/<[^>]*>/g, '');
        previewElement.innerHTML = preview.substring(0, 150) + '...';
        previewElement.style.fontFamily = note.font || "'Inter', sans-serif";
        previewElement.style.color = note.textColor || '#94a3b8';
        previewElement.classList.remove('expanded');
        buttonElement.textContent = currentLanguage === 'ko' ? '더보기' : 'Show more';
    } else {

// Expand
        // Expand
        previewElement.innerHTML = note.content;
        previewElement.style.fontFamily = note.font || "'Inter', sans-serif";
        previewElement.style.color = note.textColor || '#94a3b8';
        previewElement.classList.add('expanded');
        buttonElement.textContent = currentLanguage === 'ko' ? '접기' : 'Show less';
    }
}

        function viewNote(noteId) {
            const note = notes.find(n => n.id === noteId);
            if (!note) return;
            
            currentViewingNoteId = noteId;
            
            document.getElementById('noteViewTitle').textContent = note.title;
            document.getElementById('noteViewContent').innerHTML = note.content;

// 폰트와 색상 적용
            
            // 폰트와 색상 적용
            const viewContent = document.getElementById('noteViewContent');
            viewContent.style.fontFamily = note.font || "'Inter', sans-serif";
            viewContent.style.color = note.textColor || '#e4e4e7';

// Show view mode, hide other sections
            
            // Show view mode, hide other sections
            document.getElementById('noteViewMode').style.display = 'block';
            document.getElementById('noteEditor').style.display = 'none';
            document.querySelectorAll('.note-section').forEach(section => {
                section.style.display = 'none';
            });
        }

        function backToNotesList() {
            currentViewingNoteId = null;
            editingNoteId = null;
            
            document.getElementById('noteViewMode').style.display = 'none';
            document.getElementById('noteEditor').style.display = 'none';

// 모든 섹션 숨기기
            
            // 모든 섹션 숨기기
            document.querySelectorAll('.note-section').forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

// 현재 카테고리 섹션만 표시
            
            // 현재 카테고리 섹션만 표시
            const targetSection = document.getElementById(`${currentNotesSection}NotesSection`);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
            }
        }
        
        function editCurrentNote() {
            if (currentViewingNoteId) {
                editNote(currentViewingNoteId);
            }
        }

        function togglePinNote(noteId) {
            const noteIndex = notes.findIndex(n => n.id === noteId);
            if (noteIndex !== -1) {
                notes[noteIndex].pinned = !notes[noteIndex].pinned;
                saveNotes();
                renderAllNotesSections();
                
                const message = notes[noteIndex].pinned ? 
                    (currentLanguage === 'ko' ? '노트가 상단에 고정되었습니다' : 'Note pinned to top') :
                    (currentLanguage === 'ko' ? '노트 고정이 해제되었습니다' : 'Note unpinned');
                
                showToast(message);
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

// Analytics section management

        // Analytics section management
        function showAnalyticsSection(sectionName) {
            currentAnalyticsSection = sectionName;

// event.target 대신 직접 요소 찾기
            // event.target 대신 직접 요소 찾기
            document.querySelector(`[onclick="showAnalyticsSection('${sectionName}')"]`).classList.add('active');

// Show/hide sections
            
            // Show/hide sections
            document.querySelectorAll('.detail-section, .chart-section').forEach(section => {
                section.classList.remove('active');
            });
            
            if (sectionName === 'detail') {
                document.getElementById('detailSection').classList.add('active');
                setTimeout(async () => await updateBasicCharts(), 100);
            } else if (sectionName === 'charts') {
                document.getElementById('chartSection').classList.add('active');
                setTimeout(async () => await updateAdvancedCharts(), 100);
            }
        }

        async function createBasicChart(canvasId, type, data, options = {}) {
            try {
                await waitForChart();
                const ctx = document.getElementById(canvasId);
                if (!ctx) return null;

// 기존 차트가 있다면 완전히 제거

                // 기존 차트가 있다면 완전히 제거
                if (basicCharts[canvasId]) {
                    basicCharts[canvasId].destroy();
                    delete basicCharts[canvasId];
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

                basicCharts[canvasId] = new Chart(ctx, {
                    type: type,
                    data: data,
                    options: { ...defaultOptions, ...options }
                });

                return basicCharts[canvasId];
            } catch (error) {
                console.error(`Error creating basic chart ${canvasId}:`, error);
                return null;
            }
        }

        async function createAdvancedChart(canvasId, type, data, options = {}) {
            try {
                await waitForChart();
                const ctx = document.getElementById(canvasId);
                if (!ctx) return null;

// Continue with rest of JavaScript functions...

        // Continue with rest of JavaScript functions...
        
        async function updateBasicCharts() {
            const filteredTrades = getFilteredTradesForAnalytics();

            if (filteredTrades.length === 0) {

// Show "No data" message
                    // Show "No data" message
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        const parent = canvas.parentElement;
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #64748b;">No data available</div>';
                    }
                });
                return;
            }

// Restore canvas elements if they were replaced with "No data" message

            // Restore canvas elements if they were replaced with "No data" message
            ['basicCumulativePLChart', 'basicWinLossChart', 'basicDailyPLChart', 'basicMonthlyChart'].forEach(chartId => {
                const existing = document.getElementById(chartId);
                if (!existing || existing.tagName !== 'CANVAS') {
                    const parent = document.querySelector(`#${chartId}`);
                    if (parent && parent.parentElement) {
                        parent.parentElement.innerHTML = `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
                    }
                }
            });

// 먼저 일일 P&L을 집계
            // 먼저 일일 P&L을 집계
            const dailyPL = {};
            filteredTrades.forEach(trade => {
                if (!dailyPL[trade.date]) {
                    dailyPL[trade.date] = 0;
                }
                dailyPL[trade.date] += trade.pnl;
            });

// 날짜순으로 정렬하고 누적 계산

            // 날짜순으로 정렬하고 누적 계산
            const sortedDates = Object.keys(dailyPL).sort();
            const cumulativePL = [];
            let runningTotal = 0;
            
            sortedDates.forEach(date => {
                runningTotal += dailyPL[date];
                cumulativePL.push({
                    x: date,
                    y: runningTotal
                });
            });

            createBasicChart('basicCumulativePLChart', 'line', {
                labels: cumulativePL.map(p => new Date(p.x).toLocaleDateString()),
                datasets: [{
                    label: 'Cumulative P&L',
                    data: cumulativePL.map(p => p.y),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            });

// Daily P&L

            // Daily P&L
            const dailyStats = {};
            filteredTrades.forEach(trade => {
                if (!dailyStats[trade.date]) {
                    dailyStats[trade.date] = 0;
                }
                dailyStats[trade.date] += trade.pnl;
            });

            const dailyData = Object.entries(dailyStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, pnl]) => ({
                    x: date,
                    y: pnl
                }));

            createBasicChart('basicDailyPLChart', 'bar', {
                datasets: [{
                    label: 'Daily P&L',
                    data: dailyData,
                    backgroundColor: dailyData.map(d => d.y >= 0 ? '#10b981' : '#ef4444')
                }]
            });

// Show "No data" messages
        
        // Show "No data" messages
        const chartIds = [
            'equityCurveChart', 'drawdownChart', 'symbolPerformanceChart', 'timeDistributionChart',
            'returnDistributionChart', 'volumeAnalysisChart', 'correlationMatrixChart',
            'performanceAttributionChart', 'tradeDurationAnalysisChart',
            'winRateByTimeChart', 'positionSizingAnalysisChart', 'tradingEfficiencyMetricsChart'
        ];
        
        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const parent = canvas.parentElement;
                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #64748b;">No data available</div>';
            }
        });
        return;
    }

// Restore canvas elements

    // Restore canvas elements
    const chartIds = [
            'equityCurveChart', 'drawdownChart', 'symbolPerformanceChart', 'timeDistributionChart',
            'returnDistributionChart', 'volumeAnalysisChart', 'correlationMatrixChart',
            'performanceAttributionChart', 'tradeDurationAnalysisChart',
            'winRateByTimeChart', 'positionSizingAnalysisChart', 'tradingEfficiencyMetricsChart'
        ];
    
    chartIds.forEach(chartId => {
        const existing = document.getElementById(chartId);
        if (!existing || existing.tagName !== 'CANVAS') {
            const parent = document.querySelector(`#${chartId}`);
            if (parent && parent.parentElement) {
                parent.parentElement.innerHTML = `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
            }
        }
    });

    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const uniqueSymbols = [...new Set(filteredTrades.map(trade => trade.symbol))];

// 1. Equity Curve

    // 1. Equity Curve

// 일일 P&L 집계
            // 일일 P&L 집계
            const equityDailyPL = {};
            filteredTrades.forEach(trade => {
                if (!equityDailyPL[trade.date]) {
                    equityDailyPL[trade.date] = 0;
                }
                equityDailyPL[trade.date] += trade.pnl;
            });

// 날짜순으로 정렬하고 누적 equity 계산

            // 날짜순으로 정렬하고 누적 equity 계산
            const equitySortedDates = Object.keys(equityDailyPL).sort();
            const equityData = [];
            let equity = 0;
            
            equitySortedDates.forEach(date => {
                equity += equityDailyPL[date];
                equityData.push({
                    x: date,
                    y: equity
                });
            });

            createAdvancedChart('equityCurveChart', 'line', {
                labels: equityData.map(p => new Date(p.x).toLocaleDateString()),
                datasets: [{
                    label: 'Equity',
                    data: equityData.map(p => p.y),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            });

// 일일 P&L 집계
            // 일일 P&L 집계
            const drawdownDailyPL = {};
            filteredTrades.forEach(trade => {
                if (!drawdownDailyPL[trade.date]) {
                    drawdownDailyPL[trade.date] = 0;
                }
                drawdownDailyPL[trade.date] += trade.pnl;
            });

// 날짜순으로 정렬하고 drawdown 계산

            // 날짜순으로 정렬하고 drawdown 계산
            const drawdownSortedDates = Object.keys(drawdownDailyPL).sort();
            const drawdownData = [];
            let peak = 0;
            let currentEquity = 0;

            drawdownSortedDates.forEach(date => {
                currentEquity += drawdownDailyPL[date];
                if (currentEquity > peak) {
                    peak = currentEquity;
                }
                const drawdown = peak > 0 ? ((peak - currentEquity) / Math.abs(peak)) * 100 : 0;
                drawdownData.push({
                    x: date,
                    y: -Math.abs(drawdown)
                });
            });

            createAdvancedChart('drawdownChart', 'line', {
                labels: drawdownData.map(p => new Date(p.x).toLocaleDateString()),
                datasets: [{
                    label: 'Drawdown %',
                    data: drawdownData.map(p => p.y),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                }]
            });

// 3. Symbol Performance

    // 3. Symbol Performance
    const symbolStats = {};
    filteredTrades.forEach(trade => {
        if (!symbolStats[trade.symbol]) {
            symbolStats[trade.symbol] = 0;
        }
        symbolStats[trade.symbol] += trade.pnl;
    });

    const symbolData = Object.entries(symbolStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    createAdvancedChart('symbolPerformanceChart', 'bar', {
        labels: symbolData.map(([symbol]) => symbol),
        datasets: [{
            label: 'P&L by Symbol',
            data: symbolData.map(([, pnl]) => pnl),
            backgroundColor: symbolData.map(([, pnl]) => pnl >= 0 ? '#10b981' : '#ef4444')
        }]
    });

// 4. Time Distribution

    // 4. Time Distribution
    const hourStats = {};
    filteredTrades.forEach(trade => {
        if (trade.entryTime) {
            const hour = parseInt(trade.entryTime.split(':')[0]);
            if (!hourStats[hour]) {
                hourStats[hour] = { count: 0, totalPL: 0 };
            }
            hourStats[hour].count++;
            hourStats[hour].totalPL += trade.pnl;
        }
    });

    const hourData = Object.entries(hourStats)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([hour, data]) => ({
            x: parseInt(hour),
            y: data.count
        }));

    createAdvancedChart('timeDistributionChart', 'bar', {
        datasets: [{
            label: 'Trades by Hour',
            data: hourData,
            backgroundColor: '#3b82f6'
        }]
    });

// 5. Return Distribution

    // 5. Return Distribution
    const returnRanges = {
        '<-5%': 0, '-5% to -2%': 0, '-2% to 0%': 0,
        '0% to 2%': 0, '2% to 5%': 0, '>5%': 0
    };

    filteredTrades.forEach(trade => {
        const returnPct = trade.returnPct;
        if (returnPct < -5) returnRanges['<-5%']++;
        else if (returnPct < -2) returnRanges['-5% to -2%']++;
        else if (returnPct < 0) returnRanges['-2% to 0%']++;
        else if (returnPct < 2) returnRanges['0% to 2%']++;
        else if (returnPct < 5) returnRanges['2% to 5%']++;
        else returnRanges['>5%']++;
    });

    createAdvancedChart('returnDistributionChart', 'bar', {
        labels: Object.keys(returnRanges),
        datasets: [{
            label: 'Trade Count',
            data: Object.values(returnRanges),
            backgroundColor: '#8b5cf6'
        }]
    });

// 7. Volume Analysis

    // 7. Volume Analysis
    const volumeData = filteredTrades.map((trade, index) => ({
        x: index + 1,
        y: trade.amount
    }));

    createAdvancedChart('volumeAnalysisChart', 'scatter', {
        datasets: [{
            label: 'Position Size',
            data: volumeData,
            backgroundColor: '#06b6d4'
        }]
    });

// 8. Performance Correlation (Volume vs P&L)

    // 8. Performance Correlation (Volume vs P&L)
    const correlationData = [];
    filteredTrades.forEach((trade, index) => {
        correlationData.push({
            x: trade.amount,
            y: trade.pnl
        });
    });

    createAdvancedChart('correlationMatrixChart', 'scatter', {
        datasets: [{
            label: 'Volume vs P&L',
            data: correlationData,
            backgroundColor: 'rgba(16, 185, 129, 0.6)'
        }]
    });

// 11. Performance Attribution

    // 11. Performance Attribution
    const attributionData = [];
    uniqueSymbols.forEach(symbol => {
        const symbolTrades = filteredTrades.filter(trade => trade.symbol === symbol);
        const totalPL = symbolTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        attributionData.push({
            symbol: symbol,
            pnl: totalPL
        });
    });

    const topContributors = attributionData.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 10);

    createAdvancedChart('performanceAttributionChart', 'bar', {
        labels: topContributors.map(item => item.symbol),
        datasets: [{
            label: 'Contribution to P&L',
            data: topContributors.map(item => item.pnl),
            backgroundColor: topContributors.map(item => item.pnl >= 0 ? '#10b981' : '#ef4444')
        }]
    });

// 14. Win Rate by Time

    // 14. Win Rate by Time
            const timeWinRate = {};
            filteredTrades.forEach(trade => {
                if (trade.entryTime) {
                    const hour = parseInt(trade.entryTime.split(':')[0]);
                    if (!timeWinRate[hour]) {
                        timeWinRate[hour] = { wins: 0, total: 0 };
                    }
                    timeWinRate[hour].total++;
                    if (trade.pnl > 0) timeWinRate[hour].wins++;
                }
            });

            const winRateData = Object.entries(timeWinRate)
                .sort(([a], [b]) => parseInt(a) - parseInt(b));

            createAdvancedChart('winRateByTimeChart', 'line', {
                labels: winRateData.map(([hour]) => hour + ':00'),
                datasets: [{
                    label: 'Win Rate by Hour (%)',
                    data: winRateData.map(([, data]) => data.total > 0 ? (data.wins / data.total) * 100 : 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            }, {
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Win Rate (%)',
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day',
                            color: '#94a3b8'
                        }
                    }
                }
            });

// 15. Position Sizing Analysis

    // 15. Position Sizing Analysis
    const positionSizes = filteredTrades.map(trade => trade.amount);
    const sizeRanges = {
        '0-1000': 0, '1000-2500': 0, '2500-5000': 0,
        '5000-10000': 0, '10000+': 0
    };

    positionSizes.forEach(size => {
        if (size < 1000) sizeRanges['0-1000']++;
        else if (size < 2500) sizeRanges['1000-2500']++;
        else if (size < 5000) sizeRanges['2500-5000']++;
        else if (size < 10000) sizeRanges['5000-10000']++;
        else sizeRanges['10000+']++;
    });

    createAdvancedChart('positionSizingAnalysisChart', 'doughnut', {
        labels: Object.keys(sizeRanges),
        datasets: [{
            data: Object.values(sizeRanges),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        }]
    });

// 16. Trading Efficiency Metrics

    // 16. Trading Efficiency Metrics
    const wins = filteredTrades.filter(trade => trade.pnl > 0);
    const losses = filteredTrades.filter(trade => trade.pnl < 0);
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length) : 0;
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;

    const efficiencyData = [
        { label: 'Win Rate', value: winRate },
        { label: 'Profit Factor', value: Math.min(profitFactor * 10, 100) }, // Scale for radar
        { label: 'Avg Win/Loss', value: avgLoss > 0 ? Math.min((avgWin / avgLoss) * 10, 100) : 0 }
    ];

    createAdvancedChart('tradingEfficiencyMetricsChart', 'radar', {
        labels: efficiencyData.map(d => d.label),
        datasets: [{
            label: 'Efficiency Metrics',
            data: efficiencyData.map(d => d.value),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true
        }]
    }, {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' }
            }
        }
    });
}

// Page initialization

        // Page initialization
        document.addEventListener('DOMContentLoaded', async function() {
    await waitForChart();
    const savedLanguage = localStorage.getItem('tradingPlatformLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;

// Load daily fees
            
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

// Navigation functions

        // Navigation functions
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.getElementById(pageId).classList.add('active');
            event.target.closest('.nav-item').classList.add('active');
            
            if (pageId === 'analysis') {
                updateDetailedAnalytics();
                if (currentAnalyticsSection === 'detail') {
                    setTimeout(updateBasicCharts, 100);
                } else {
                    setTimeout(updateAdvancedCharts, 100);
                }
            }
            
            if (pageId === 'notes') {
                renderAllNotesSections();
            }

            if (pageId === 'psychology') {
                setTimeout(() => {
    loadPsychologyData();
    updatePsychologyMetrics();
}, 100);
            }
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
        }

// Time related functions

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

// Always calculate and display amount if shares and buyPrice are available
            
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
            
            // Recalculate P&L and return percentage
            updatedTrade.pnl = updatedTrade.shares * (updatedTrade.sellPrice - updatedTrade.buyPrice);
            updatedTrade.returnPct = ((updatedTrade.sellPrice - updatedTrade.buyPrice) / updatedTrade.buyPrice) * 100;

// Calculate holding time
            
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

// Data save/load functions

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

// Continue with remaining functions...

        // Continue with remaining functions...
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

// Continue with analytics and other functions...

        // Continue with analytics and other functions...
        function setAnalyticsPeriod(period) {
            analyticsPeriod = period;
            document.querySelectorAll('.filter-controls .filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

// event.target 대신 직접 요소 찾기
            
            // event.target 대신 직접 요소 찾기
            document.querySelector(`[onclick="setAnalyticsPeriod('${period}')"]`).classList.add('active');
            updateDetailedAnalytics();
        }

        function getFilteredTradesForAnalytics() {
            let filteredTrades = trades;

// Apply period filter
                // Apply period filter
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                switch (analyticsPeriod) {
                    case 'day':
                        const todayStr = formatTradingDate(today);
                        filteredTrades = trades.filter(trade => trade.date === todayStr);
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        const weekAgoStr = formatTradingDate(weekAgo);
                        filteredTrades = trades.filter(trade => trade.date >= weekAgoStr);
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        const monthAgoStr = formatTradingDate(monthAgo);
                        filteredTrades = trades.filter(trade => trade.date >= monthAgoStr);
                        break;
                    default:
                        filteredTrades = trades;
                }
            }
            
            return filteredTrades;
        }

        function updateDetailedAnalytics() {
            const filteredTrades = getFilteredTradesForAnalytics();
            
            if (filteredTrades.length === 0) {
                resetDetailedAnalyticsDisplay();
                return;
            }

// Calculate basic metrics
            
            // Calculate basic metrics
            const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            const uniqueDatesForFees = [...new Set(filteredTrades.map(trade => trade.date))];
            const totalDailyFees = uniqueDatesForFees.reduce((sum, date) => sum + (dailyFees[date] || 0), 0);
            const netTotalPL = totalPL - totalDailyFees;
            const wins = filteredTrades.filter(trade => trade.pnl > 0);
            const losses = filteredTrades.filter(trade => trade.pnl < 0);
            const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
            
            const pnls = filteredTrades.map(trade => trade.pnl);
            const largestWin = Math.max(...pnls);
            const largestLoss = Math.min(...pnls);
            
            const totalWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
            const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
            const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

// Calculate daily P/L
            // Calculate daily P/L
            const dailyStats = {};
            filteredTrades.forEach(trade => {
                if (!dailyStats[trade.date]) {
                    dailyStats[trade.date] = { tradePL: 0, winDays: 0, lossDays: 0 };
                }
                dailyStats[trade.date].tradePL += trade.pnl;
            });

// 모든 날이 수익일 때는 최악의 날을 0으로 표시
            // 모든 날이 수익일 때는 최악의 날을 0으로 표시
            const worstTradingDay = dailyPLsWithFees.length > 0 && dailyPLsWithFees.some(pnl => pnl < 0) ? Math.min(...dailyPLsWithFees) : 0;
            const avgDailyPL = dailyPLsWithFees.length > 0 ? dailyPLsWithFees.reduce((sum, pnl) => sum + pnl, 0) / dailyPLsWithFees.length : 0;
            const avgDailyFees = uniqueDatesForFees.length > 0 ? totalDailyFees / uniqueDatesForFees.length : 0;

            document.getElementById('detailDailyPerWin').textContent = winDays > 0 ? `$${(dailyPLsWithFees.filter(pnl => pnl > 0).reduce((sum, pnl) => sum + pnl, 0) / winDays).toFixed(2)}` : '$0.00';
            document.getElementById('detailDailyPerLoss').textContent = lossDays > 0 ? `$${(dailyPLsWithFees.filter(pnl => pnl < 0).reduce((sum, pnl) => sum + pnl, 0) / lossDays).toFixed(2)}` : '$0.00';
            document.getElementById('detailDailyPerFees').textContent = `$${avgDailyFees.toFixed(2)}`;
            document.getElementById('detailBestTradingDay').textContent = `$${bestTradingDay.toFixed(2)}`;
            document.getElementById('detailWorstTradingDay').textContent = `$${worstTradingDay.toFixed(2)}`;
            document.getElementById('detailAvgDailyPL').textContent = `$${avgDailyPL.toFixed(2)}`;
            document.getElementById('detailAvgDailyPL').className = `detail-value ${avgDailyPL >= 0 ? 'positive' : 'negative'}`;
        }
        
        function updateTimeAnalysisDetails(filteredTrades) {

// Hold time analysis
            // Hold time analysis
            const holdTimes = filteredTrades
                .filter(trade => trade.holdingTime)
                .map(trade => parseInt(trade.holdingTime.replace('m', '')));
            
            const avgHoldTime = holdTimes.length > 0 ? 
                holdTimes.reduce((sum, time) => sum + time, 0) / holdTimes.length : 0;
            const shortestHold = holdTimes.length > 0 ? Math.min(...holdTimes) : 0;
            const longestHold = holdTimes.length > 0 ? Math.max(...holdTimes) : 0;

// Hour analysis

            // Hour analysis
            const hourStats = {};
            filteredTrades.forEach(trade => {
                if (trade.entryTime) {
                    const hour = parseInt(trade.entryTime.split(':')[0]);
                    if (!hourStats[hour]) {
                        hourStats[hour] = { count: 0, totalPL: 0 };
                    }
                    hourStats[hour].count++;
                    hourStats[hour].totalPL += trade.pnl;
                }
            });

            const bestHour = Object.entries(hourStats)
                .sort((a, b) => b[1].totalPL - a[1].totalPL)[0];
            const worstHour = Object.entries(hourStats)
                .sort((a, b) => a[1].totalPL - b[1].totalPL)[0];

// Get current streaks

            // Get current streaks
            const recentTrades = sortedTrades.slice(-10);
            let recentWinStreak = 0;
            let recentLossStreak = 0;
            
            for (let i = recentTrades.length - 1; i >= 0; i--) {
                if (recentTrades[i].pnl > 0) {
                    if (recentLossStreak === 0) recentWinStreak++;
                    else break;
                } else if (recentTrades[i].pnl < 0) {
                    if (recentWinStreak === 0) recentLossStreak++;
                    else break;
                } else break;
            }

            document.getElementById('detailCurrentStreak').textContent = currentStreak;
            document.getElementById('detailCurrentStreak').className = `detail-value ${currentStreak >= 0 ? 'positive' : 'negative'}`;
            document.getElementById('detailMaxWinStreak').textContent = maxWinStreak;
            document.getElementById('detailMaxLossStreak').textContent = maxLossStreak;
            document.getElementById('detailCurrentWinStreak').textContent = recentWinStreak;
            document.getElementById('detailCurrentWinStreak').className = `detail-value ${recentWinStreak > 0 ? 'positive' : 'neutral'}`;
            document.getElementById('detailCurrentLossStreak').textContent = recentLossStreak;
            document.getElementById('detailCurrentLossStreak').className = `detail-value ${recentLossStreak > 0 ? 'negative' : 'neutral'}`;
            document.getElementById('detailAvgWinStreak').textContent = avgWinStreak.toFixed(2);
        }

        function updateSymbolPerformanceDetails(filteredTrades) {
            const symbolStats = {};
            filteredTrades.forEach(trade => {
                if (!symbolStats[trade.symbol]) {
                    symbolStats[trade.symbol] = {
                        count: 0,
                        totalPL: 0,
                        wins: 0,
                        totalReturn: 0
                    };
                }
                symbolStats[trade.symbol].count++;
                symbolStats[trade.symbol].totalPL += trade.pnl;
                symbolStats[trade.symbol].totalReturn += trade.returnPct;
                if (trade.pnl > 0) symbolStats[trade.symbol].wins++;
            });

            const symbolEntries = Object.entries(symbolStats);
            if (symbolEntries.length > 0) {
                const mostProfitable = symbolEntries.sort((a, b) => b[1].totalPL - a[1].totalPL)[0];
                const leastProfitable = symbolEntries.sort((a, b) => a[1].totalPL - b[1].totalPL)[0];
                const mostTraded = symbolEntries.sort((a, b) => b[1].count - a[1].count)[0];
                const bestWinRate = symbolEntries.sort((a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count))[0];
                const bestAvgReturn = symbolEntries.sort((a, b) => (b[1].totalReturn / b[1].count) - (a[1].totalReturn / a[1].count))[0];

                document.getElementById('detailMostProfitableSymbol').textContent = 
                    `${mostProfitable[0]} ($${mostProfitable[1].totalPL.toFixed(2)})`;
                document.getElementById('detailLeastProfitableSymbol').textContent = 
                    `${leastProfitable[0]} ($${leastProfitable[1].totalPL.toFixed(2)})`;
                document.getElementById('detailMostTradedSymbol').textContent = 
                    `${mostTraded[0]} (${mostTraded[1].count} trades)`;
                document.getElementById('detailUniqueSymbols').textContent = symbolEntries.length;
                document.getElementById('detailBestSymbolWinRate').textContent = 
                    `${bestWinRate[0]} (${((bestWinRate[1].wins / bestWinRate[1].count) * 100).toFixed(1)}%)`;
                document.getElementById('detailBestSymbolReturn').textContent = 
                    `${bestAvgReturn[0]} (${(bestAvgReturn[1].totalReturn / bestAvgReturn[1].count).toFixed(2)}%)`;
            } else {
                ['detailMostProfitableSymbol', 'detailLeastProfitableSymbol', 'detailMostTradedSymbol', 
                 'detailBestSymbolWinRate', 'detailBestSymbolReturn'].forEach(id => {
                    document.getElementById(id).textContent = '-';
                });
                document.getElementById('detailUniqueSymbols').textContent = '0';
            }
        }

        function updateRiskManagementDetails(filteredTrades) {

// Drawdown calculation
            // Drawdown calculation
            const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
            let cumulativePL = 0;
            let peak = 0;
            let maxDrawdown = 0;
            let currentDrawdown = 0;

            sortedTrades.forEach((trade, index) => {
                cumulativePL += trade.pnl;
                if (cumulativePL > peak) {
                    peak = cumulativePL;
                }
                const drawdown = peak - cumulativePL;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
                if (index === sortedTrades.length - 1) {
                    currentDrawdown = drawdown;
                }
            });

// Daily P/L analysis with fees

            // Daily P/L analysis with fees
            const dailyStats = {};
            filteredTrades.forEach(trade => {
                if (!dailyStats[trade.date]) {
                    dailyStats[trade.date] = 0;
                }
                dailyStats[trade.date] += trade.pnl;
            });

// Apply fees to daily stats

            // Apply fees to daily stats
            Object.keys(dailyStats).forEach(date => {
                const fee = dailyFees[date] || 0;
                dailyStats[date] -= fee;
            });

            const dailyPLs = Object.values(dailyStats);
            const maxDailyGain = dailyPLs.length > 0 ? Math.max(...dailyPLs) : 0;

// 모든 날이 수익일 때는 최악의 날을 0으로 표시
            // 모든 날이 수익일 때는 최악의 날을 0으로 표시
            const maxDailyLoss = dailyPLs.length > 0 && dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : 0;

// Recovery factor

            // Recovery factor
            const totalReturn = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

// Risk/Reward ratio (simplified)

            // Risk/Reward ratio (simplified)
            const wins = filteredTrades.filter(trade => trade.pnl > 0);
            const losses = filteredTrades.filter(trade => trade.pnl < 0);
            const avgWin = wins.length > 0 ? wins.reduce((sum, trade) => sum + trade.pnl, 0) / wins.length : 0;
            const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0) / losses.length) : 0;
            const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

            document.getElementById('detailMaxDrawdown').textContent = `$${maxDrawdown.toFixed(2)}`;
            document.getElementById('detailCurrentDrawdown').textContent = `$${currentDrawdown.toFixed(2)}`;
            document.getElementById('detailCurrentDrawdown').className = `detail-value ${currentDrawdown === 0 ? 'positive' : 'negative'}`;
            document.getElementById('detailRecoveryFactor').textContent = recoveryFactor.toFixed(2);
            document.getElementById('detailRecoveryFactor').className = `detail-value ${recoveryFactor >= 1 ? 'positive' : 'negative'}`;
            document.getElementById('detailMaxDailyGain').textContent = `$${maxDailyGain.toFixed(2)}`;
            document.getElementById('detailMaxDailyLoss').textContent = `$${maxDailyLoss.toFixed(2)}`;
            document.getElementById('detailRiskRewardRatio').textContent = riskRewardRatio.toFixed(2);
            document.getElementById('detailRiskRewardRatio').className = `detail-value ${riskRewardRatio >= 1 ? 'positive' : 'negative'}`;
        }

        function resetDetailedAnalyticsDisplay() {

// Reset summary cards
            // Reset summary cards
            document.getElementById('summaryNetProfit').textContent = '$0.00';
            document.getElementById('summaryNetProfit').className = 'summary-card-value';
            document.getElementById('summaryTotalTrades').textContent = '0';
            document.getElementById('summaryWinRate').textContent = '0%';
            document.getElementById('summaryWinRate').className = 'summary-card-value';
            document.getElementById('summaryProfitFactor').textContent = '0.00';
            document.getElementById('summaryProfitFactor').className = 'summary-card-value';
            document.getElementById('summaryLargestWin').textContent = '$0.00';
            document.getElementById('summaryLargestWin').className = 'summary-card-value';
            document.getElementById('summaryLargestLoss').textContent = '$0.00';
            document.getElementById('summaryLargestLoss').className = 'summary-card-value';

// Reset all detail values

            // Reset all detail values
            const detailElements = [
                'detailTotalPL', 'detailTotalGain', 'detailTotalLoss', 'detailTotalFees', 'detailTotalVolume', 'detailProfitFactor',
                'detailWinningTrades', 'detailLosingTrades', 'detailAvgWinningTrade', 'detailAvgLosingTrade', 'detailLargestWin', 'detailLargestLoss',
                'detailDailyPerWin', 'detailDailyPerLoss', 'detailDailyPerFees', 'detailBestTradingDay', 'detailWorstTradingDay', 'detailAvgDailyPL',
                'detailAvgHoldTime', 'detailShortestHold', 'detailLongestHold', 'detailTradingDays', 'detailAvgTradesPerDay', 'detailMaxTradesDay',
                'detailAvgPositionSize', 'detailLargestPosition', 'detailSmallestPosition', 'detailCurrentStreak', 'detailMaxWinStreak', 'detailMaxLossStreak',
                'detailCurrentWinStreak', 'detailCurrentLossStreak', 'detailAvgWinStreak', 'detailUniqueSymbols', 'detailMaxDrawdown', 'detailCurrentDrawdown',
                'detailRecoveryFactor', 'detailMaxDailyGain', 'detailMaxDailyLoss', 'detailRiskRewardRatio'
            ];

            detailElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (id.includes('Symbol') || id.includes('Hour') || id.includes('Day')) {
                        element.textContent = '-';
                    } else if (id.includes('Trades') && !id.includes('Total') && !id.includes('Avg') && !id.includes('Max')) {
                        element.textContent = '0 (0%)';
                    } else if (id.includes('Time')) {
                        element.textContent = '0m';
                    } else if (id.includes('$') || id.includes('PL') || id.includes('Gain') || id.includes('Loss') || 
                              id.includes('Fees') || id.includes('Volume') || id.includes('Position') || id.includes('Drawdown')) {
                        element.textContent = '$0.00';
                    } else {
                        element.textContent = '0';
                    }
                    element.className = 'detail-value';
                }
            });

// Reset special text fields

            // Reset special text fields
            document.getElementById('detailBestHour').textContent = '-';
            document.getElementById('detailWorstHour').textContent = '-';
            document.getElementById('detailBestDayOfWeek').textContent = '-';
            document.getElementById('detailMostProfitableSymbol').textContent = '-';
            document.getElementById('detailLeastProfitableSymbol').textContent = '-';
            document.getElementById('detailMostTradedSymbol').textContent = '-';
            document.getElementById('detailBestSymbolWinRate').textContent = '-';
            document.getElementById('detailBestSymbolReturn').textContent = '-';
        }

// 기존 이벤트 리스너 제거
            
            // 기존 이벤트 리스너 제거
            document.removeEventListener('mouseup', endRangeSelection);
            
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
                    
                    grid.appendChild(dayElement);
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
                    
                    grid.appendChild(weekPnlElement);
                }
            }

// 이벤트 리스너를 한 번만 등록
            
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

// Settings functions
        
        // Settings functions
        function exportData() {
            const exportData = {
                trades: trades,
                notes: notes,
                dailyFees: dailyFees
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
                                notes: trade.notes || ''
                            }));
                            if (importedData.notes && Array.isArray(importedData.notes)) {
                                notes = importedData.notes.map(note => ({
                                    ...note,
                                    category: note.category || 'general',
                                    font: note.font || "'Source Code Pro', monospace"
                                }));
                            }
                            if (importedData.dailyFees) {
                                dailyFees = importedData.dailyFees;
                            }
                            saveTrades();
                            saveNotes();
                            localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
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
                saveTrades();
                saveNotes();
                localStorage.setItem('tradingPlatformDailyFees', JSON.stringify(dailyFees));
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

// Dashboard Section Management

        // Dashboard Section Management
        let currentDashboardSection = 'trading';
        let selectedKellyMultiplier = 0.1;

        function showDashboardSection(section) {
            currentDashboardSection = section;

// 탭 상태 업데이트
            
            // 탭 상태 업데이트
            document.querySelectorAll('.dashboard-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');

// 섹션 표시/숨기기
            
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
            
            // Kelly 계산기 입력 필드에 값 설정
            const calcWinRateEl = document.getElementById('calcWinRate');
            const calcAvgWinEl = document.getElementById('calcAvgWin');
            const calcAvgLossEl = document.getElementById('calcAvgLoss');
            
            if (calcWinRateEl) calcWinRateEl.value = winRate.toFixed(1);
            if (calcAvgWinEl) calcAvgWinEl.value = avgWin.toFixed(0);
            if (calcAvgLossEl) calcAvgLossEl.value = avgLoss.toFixed(0);

// 사이드바에도 표시
            
            // 사이드바에도 표시
            const recentWinRateCalcEl = document.getElementById('recentWinRateCalc');
            const plRatioCalcEl = document.getElementById('plRatioCalc');
            
            if (recentWinRateCalcEl) recentWinRateCalcEl.textContent = winRate.toFixed(1) + '%';
            if (plRatioCalcEl) plRatioCalcEl.textContent = (avgWin / avgLoss).toFixed(2);

// 계산 실행
            
            // 계산 실행
            calculatePosition();
            showToast('거래 이력에서 데이터를 불러왔습니다');
        }

// Calculator Tab Management

        // Calculator Tab Management
        function showCalculatorTab(tabName) {

// Activate clicked tab - event.target 대신 직접 찾기
            
            // Activate clicked tab - event.target 대신 직접 찾기
            const targetTab = document.querySelector(`[onclick="showCalculatorTab('${tabName}')"]`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.background = '#3b82f6';
                targetTab.style.color = 'white';
            }

// Show/hide content
            
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

// Risk Calculator Functions

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
            
            // 안전한 요소 업데이트 함수
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

// 기존 사이드바 업데이트 (포지션 분석)
            
            // 기존 사이드바 업데이트 (포지션 분석)
            updateElement('recommendedSize', '$' + positionSize.toFixed(0));
            updateElement('accountUtil', accountUtilization.toFixed(1) + '%');
            updateElement('expectedVal', '-$' + actualMaxLoss.toFixed(0));

// 새로운 사이드바 업데이트 (자동 분석)
            
            // 새로운 사이드바 업데이트 (자동 분석)
            updateElement('riskPositionSizeSidebar', '$' + positionSize.toFixed(0));
            updateElement('riskSharesQuantitySidebar', sharesQuantity.toString());
            updateElement('riskPerShareSidebar', '$' + riskPerShare.toFixed(2));
            updateElement('riskMaxLossSidebar', '$' + actualMaxLoss.toFixed(2));
            updateElement('riskPositionCostSidebar', '$' + positionSize.toFixed(2));

// 기존 결과 섹션 업데이트
            
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
            // 안전한 요소 업데이트 함수
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

// 기존 결과 섹션 초기화
            
            // 기존 결과 섹션 초기화
            updateElement('riskPositionSize', '$0');
            updateElement('riskSharesQuantity', '0');
            updateElement('riskPerShare', '$0.00');
            updateElement('riskMaxLoss', '$0.00');
            updateElement('riskPositionCost', '$0.00');
            updateElement('riskAccountUtil', '0.00%');

// 포지션 분석 사이드바 초기화
            
            // 포지션 분석 사이드바 초기화
            updateElement('recommendedSize', '$0');
            updateElement('accountUtil', '0%');
            updateElement('expectedVal', '$0');

// 자동 분석 사이드바 초기화
            
            // 자동 분석 사이드바 초기화
            updateElement('riskPositionSizeSidebar', '$0');
            updateElement('riskSharesQuantitySidebar', '0');
            updateElement('riskPerShareSidebar', '$0.00');
            updateElement('riskMaxLossSidebar', '$0.00');
            updateElement('riskPositionCostSidebar', '$0.00');
        }
        
        function toggleCustomRisk() {
    document.querySelectorAll('.risk-preset-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#374151';
        btn.style.borderColor = '#4b5563';
        btn.style.color = '#e4e4e7';
    });
    
    event.target.classList.add('active');
    event.target.style.background = '#3b82f6';
    event.target.style.borderColor = '#3b82f6';
    event.target.style.color = 'white';
    
    const customInput = document.getElementById('customRiskInput');
    customInput.style.display = 'flex';
    document.getElementById('customRiskValue').focus();
}

function applyCustomRisk() {
    const customValue = parseFloat(document.getElementById('customRiskValue').value);
    if (customValue && customValue > 0 && customValue <= 100) {
        document.getElementById('riskPercentage').value = customValue;
        calculateRiskPosition();
    }
}

// 안전한 요소 접근을 위한 헬퍼 함수
            
            // 안전한 요소 접근을 위한 헬퍼 함수
            const getElementValue = (id, defaultValue = 0) => {
                const element = document.getElementById(id);
                return element ? (parseFloat(element.value) || defaultValue) : defaultValue;
            };
            
            const getElementStringValue = (id, defaultValue = '') => {
                const element = document.getElementById(id);
                return element ? (element.value || defaultValue) : defaultValue;
            };
            
            const data = {
                date: currentDate,
                timestamp: new Date().toISOString(),

// Biological data
                
                // Biological data
                sleepHours: getElementValue('sleepHours'),

// Time & environment
                
                // Time & environment
                startTime: getElementStringValue('startTime', '09:30'),
                endTime: getElementStringValue('endTime'),
                environmentType: getElementStringValue('environmentType', 'home'),

// Economic pressure
                
                // Economic pressure
                accountBalance: getElementValue('accountBalance'),
                dailyTarget: getElementValue('dailyTarget'),
                maxDailyLoss: getElementValue('maxDailyLoss'),

// Emotional state
                
                // Emotional state
                stressLevel: getElementValue('stressLevel', 3),
                confidenceLevel: getElementValue('confidenceLevel', 3),
                focusLevel: getElementValue('focusLevel', 3)
            };
            
            psychologyData[currentDate] = data;
            localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData));
            
            updatePsychologyMetrics();
            generatePsychologyInsights();
            showToast(currentLanguage === 'ko' ? '심리 데이터가 저장되었습니다' : 'Psychology data saved');
        }
        
        
        
         catch (error) {
                console.error('Error showing psychology section:', error);
            }
        }

        function calculateDailyScore() {
            const currentDate = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[currentDate];
            
            if (!todayData) {
                alert(currentLanguage === 'ko' ? '먼저 심리 데이터를 입력해주세요.' : 'Please input psychology data first.');
                return;
            }

// 수면 요인 계산 (25점 만점)
            
            // 수면 요인 계산 (25점 만점)
            const sleepFactor = calculateSleepFactor(todayData.sleepHours);

// 스트레스 요인 계산 (25점 만점)
            
            // 스트레스 요인 계산 (25점 만점)
            const stressFactor = calculateStressFactor(todayData.sleepHours, todayData.stressLevel, todayData.focusLevel);

// 규율 요인 계산 (25점 만점) - 거래 데이터 기반
            
            // 규율 요인 계산 (25점 만점) - 거래 데이터 기반
            const disciplineFactor = calculateDisciplineFactor();

// 일관성 요인 계산 (25점 만점) - 거래 데이터 기반
            
            // 일관성 요인 계산 (25점 만점) - 거래 데이터 기반
            const consistencyFactor = calculateConsistencyFactor();

// 총점 계산
            
            // 총점 계산
            const totalScore = sleepFactor + stressFactor + disciplineFactor + consistencyFactor;

// UI 업데이트
            
            // UI 업데이트
            updateScoreCard('sleepFactorCard', 'sleepFactorScore', 'sleepFactorStatus', sleepFactor, 25);
            updateScoreCard('stressFactorCard', 'stressFactorScore', 'stressFactorStatus', stressFactor, 25);
            updateScoreCard('disciplineFactorCard', 'disciplineFactorScore', 'disciplineFactorStatus', disciplineFactor, 25);
            updateScoreCard('consistencyFactorCard', 'consistencyFactorScore', 'consistencyFactorStatus', consistencyFactor, 25);
            updateScoreCard('totalScoreCard', 'totalPsychScore', 'totalScoreStatus', totalScore, 100);
            
            showToast(currentLanguage === 'ko' ? '일일 심리 점수가 계산되었습니다' : 'Daily psychology score calculated');
        }

        

        

        function calculateConsistencyFactor() {
            const recentTrades = trades.slice(-20);
            if (recentTrades.length === 0) return 15; // 기본값
            
            let consistencyScore = 25;

// 거래 시간 일관성
            
            // 거래 시간 일관성
            const tradeTimes = recentTrades.filter(trade => trade.entryTime).map(trade => {
                const [hour] = trade.entryTime.split(':').map(Number);
                return hour;
            });
            
            if (tradeTimes.length > 0) {
                const timeDeviation = calculateStandardDeviation(tradeTimes);
                if (timeDeviation > 3) consistencyScore -= 8;
                else if (timeDeviation > 2) consistencyScore -= 4;
            }
            
            return Math.max(0, Math.min(25, consistencyScore));
        }

        function calculateStandardDeviation(values) {
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
            const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
            return Math.sqrt(variance);
        }

        function updateScoreCard(cardId, scoreId, statusId, score, maxScore) {
            const card = document.getElementById(cardId);
            const scoreElement = document.getElementById(scoreId);
            const statusElement = document.getElementById(statusId);
            
            if (scoreElement) {
                scoreElement.textContent = `${Math.round(score)}/${maxScore}`;
            }
            
            const percentage = (score / maxScore) * 100;
            let status, cardClass;
            
            if (percentage >= 90) {
                status = currentLanguage === 'ko' ? '최적' : 'Optimal';
                cardClass = 'good';
            } else if (percentage >= 75) {
                status = currentLanguage === 'ko' ? '우수' : 'Excellent';
                cardClass = 'good';
            } else if (percentage >= 60) {
                status = currentLanguage === 'ko' ? '양호' : 'Good';
                cardClass = 'good';
            } else if (percentage >= 40) {
                status = currentLanguage === 'ko' ? '보통' : 'Fair';
                cardClass = 'warning';
            } else if (percentage >= 20) {
                status = currentLanguage === 'ko' ? '주의' : 'Poor';
                cardClass = 'warning';
            } else {
                status = currentLanguage === 'ko' ? '위험' : 'Critical';
                cardClass = 'danger';
            }
            
            if (statusElement) {
                statusElement.textContent = status;
            }
            
            if (card) {
                card.className = `psychology-metric-card ${cardClass}`;
                card.style.borderColor = cardClass === 'good' ? '#10b981' : 
                                        cardClass === 'warning' ? '#f59e0b' : '#ef4444';
            }
        }

        function updateBiasAnalysis() {

// 과신 편향 분석
            // 과신 편향 분석
            calculateOverconfidenceBias();

// 손실 회피 분석
            
            // 손실 회피 분석
            calculateLossAversionBias();

// 앵커링 편향 분석
            
            // 앵커링 편향 분석
            calculateAnchoringBias();

// 전체 편향 위험도 계산

            // 전체 편향 위험도 계산
            calculateOverallBiasRisk();
        }

        function calculateOverallBiasRisk() {

// 각 편향의 위험도를 0-100 점수로 변환
            // 각 편향의 위험도를 0-100 점수로 변환
            let overconfidenceScore = 0;
            let lossAversionScore = 0;
            let anchoringScore = 0;

// 과신 편향 점수 계산
            
            // 과신 편향 점수 계산
            const calibrationError = parseFloat(document.getElementById('calibrationError').textContent) || 0;
            const overtradingIndex = Math.abs(parseFloat(document.getElementById('overtradingIndex').textContent)) || 0;
            const positionDeviation = parseFloat(document.getElementById('positionDeviation').textContent) || 0;
            
            overconfidenceScore = Math.min(100, (calibrationError * 2) + (overtradingIndex * 0.5) + (positionDeviation * 100));

// 손실 회피 점수 계산
            
            // 손실 회피 점수 계산
            const dispositionRatio = parseFloat(document.getElementById('dispositionRatio').textContent) || 1;
            lossAversionScore = Math.min(100, Math.max(0, (dispositionRatio - 1) * 50));

// 앵커링 점수 계산
            
            // 앵커링 점수 계산
            const roundNumberBias = parseFloat(document.getElementById('roundNumberBias').textContent) || 0;
            anchoringScore = Math.min(100, roundNumberBias * 1.5);

// 전체 점수 계산
            
            // 전체 점수 계산
            const overallScore = (overconfidenceScore + lossAversionScore + anchoringScore) / 3;

// 위험도 레벨 결정
            
            // 위험도 레벨 결정
            let riskLevel, riskColor;
            if (overallScore < 20) {
                riskLevel = currentLanguage === 'ko' ? '낮음' : 'Low';
                riskColor = '#10b981';
            } else if (overallScore < 50) {
                riskLevel = currentLanguage === 'ko' ? '보통' : 'Medium';
                riskColor = '#f59e0b';
            } else {
                riskLevel = currentLanguage === 'ko' ? '높음' : 'High';
                riskColor = '#ef4444';
            }

// UI 업데이트
            
            // UI 업데이트
            document.getElementById('overallBiasRisk').textContent = riskLevel;
            document.getElementById('overallBiasRisk').style.color = riskColor;
            document.getElementById('overallBiasScore').textContent = `Score: ${overallScore.toFixed(0)}/100`;

// 조치 필요 여부
            
            // 조치 필요 여부
            let actionNeeded, actionDetails;
            if (overallScore > 70) {
                actionNeeded = currentLanguage === 'ko' ? '즉시 조치' : 'Immediate Action';
                actionDetails = currentLanguage === 'ko' ? '편향 위험 높음' : 'High bias risk';
            } else if (overallScore > 40) {
                actionNeeded = currentLanguage === 'ko' ? '주의 필요' : 'Caution Needed';
                actionDetails = currentLanguage === 'ko' ? '일부 편향 감지' : 'Some bias detected';
            } else {
                actionNeeded = currentLanguage === 'ko' ? '없음' : 'None';
                actionDetails = currentLanguage === 'ko' ? '모든 지표 정상' : 'All metrics normal';
            }
            
            document.getElementById('actionNeeded').textContent = actionNeeded;
            document.getElementById('actionNeeded').style.color = overallScore > 70 ? '#ef4444' : overallScore > 40 ? '#f59e0b' : '#10b981';
            document.getElementById('actionDetails').textContent = actionDetails;

            }
        
        function calculateOverconfidenceBias() {
            const recentTrades = trades.slice(-50);
            if (recentTrades.length === 0) return;

// 캘리브레이션 에러 계산 (예측 대비 실제)
            
            // 캘리브레이션 에러 계산 (예측 대비 실제)
            const currentDate = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[currentDate];
            
            if (todayData && todayData.predictedWinRate) {
                const actualWinRate = (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100;
                const calibrationError = Math.abs(todayData.predictedWinRate - actualWinRate);
                
                document.getElementById('calibrationError').textContent = `${calibrationError.toFixed(1)}%`;
                document.getElementById('calibrationErrorBar').style.width = `${Math.min(calibrationError * 5, 100)}%`;
                document.getElementById('calibrationErrorBar').style.backgroundColor = calibrationError > 20 ? '#ef4444' : calibrationError > 10 ? '#f59e0b' : '#10b981';
            }

// 과도거래 지수
            
            // 과도거래 지수
            if (todayData && todayData.plannedTrades) {
                const actualTrades = recentTrades.filter(t => t.date === currentDate).length;
                const overtradingIndex = ((actualTrades - todayData.plannedTrades) / todayData.plannedTrades) * 100;
                
                document.getElementById('overtradingIndex').textContent = `${overtradingIndex.toFixed(0)}%`;
                document.getElementById('overtradingBar').style.width = `${Math.min(Math.abs(overtradingIndex), 100)}%`;
                document.getElementById('overtradingBar').style.backgroundColor = Math.abs(overtradingIndex) > 50 ? '#ef4444' : '#f59e0b';
            }

// 포지션 크기 편차
            
            // 포지션 크기 편차
            const positionSizes = recentTrades.map(trade => trade.amount);
            if (positionSizes.length > 0) {
                const avgPosition = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
                const deviation = calculateStandardDeviation(positionSizes) / avgPosition;
                
                document.getElementById('positionDeviation').textContent = deviation.toFixed(2);
                document.getElementById('positionDeviationBar').style.width = `${Math.min(deviation * 200, 100)}%`;
                document.getElementById('positionDeviationBar').style.backgroundColor = deviation > 0.3 ? '#ef4444' : '#3b82f6';
            }
        }

        function calculateLossAversionBias() {
            const recentTrades = trades.slice(-50);
            if (recentTrades.length === 0) return;
            
            const winningTrades = recentTrades.filter(t => t.pnl > 0);
            const losingTrades = recentTrades.filter(t => t.pnl < 0);

// 처분 효과 비율 (손실 거래 보유 시간 / 수익 거래 보유 시간)
            
            // 처분 효과 비율 (손실 거래 보유 시간 / 수익 거래 보유 시간)
            const winningHoldTimes = winningTrades.filter(t => t.holdingTime).map(t => parseInt(t.holdingTime.replace('m', '')));
            const losingHoldTimes = losingTrades.filter(t => t.holdingTime).map(t => parseInt(t.holdingTime.replace('m', '')));
            
            if (winningHoldTimes.length > 0 && losingHoldTimes.length > 0) {
                const avgWinHold = winningHoldTimes.reduce((sum, time) => sum + time, 0) / winningHoldTimes.length;
                const avgLossHold = losingHoldTimes.reduce((sum, time) => sum + time, 0) / losingHoldTimes.length;
                const dispositionRatio = avgLossHold / avgWinHold;
                
                document.getElementById('dispositionRatio').textContent = dispositionRatio.toFixed(2);
                document.getElementById('dispositionBar').style.width = `${Math.min(dispositionRatio * 25, 100)}%`;
                document.getElementById('dispositionBar').style.backgroundColor = dispositionRatio > 2.0 ? '#ef4444' : '#10b981';
            }
        }

        function calculateAnchoringBias() {

// 앵커링 편향 분석 (간단한 버전)
            // 앵커링 편향 분석 (간단한 버전)
            const recentTrades = trades.slice(-30);
            if (recentTrades.length === 0) return;

// 라운드 넘버 의존도 (단순화된 계산)
            
            // 라운드 넘버 의존도 (단순화된 계산)
            const roundNumberTrades = recentTrades.filter(trade => {
                const buyPrice = trade.buyPrice;
                const sellPrice = trade.sellPrice;
                return (buyPrice % 1 === 0) || (sellPrice % 1 === 0);
            });
            
            const roundNumberBias = (roundNumberTrades.length / recentTrades.length) * 100;
            
            document.getElementById('roundNumberBias').textContent = `${roundNumberBias.toFixed(0)}%`;
            document.getElementById('roundNumberBar').style.width = `${roundNumberBias}%`;
            document.getElementById('roundNumberBar').style.backgroundColor = roundNumberBias > 40 ? '#ef4444' : '#f59e0b';
        }

        function updatePatternInsights() {
            analyzeTimeBasedPerformance();
            analyzeConsecutiveTradesPattern();
            generateAIInsights();
        }

        function analyzeTimeBasedPerformance() {
            const hourlyPerformance = {};
            
            trades.forEach(trade => {
                if (trade.entryTime) {
                    const hour = parseInt(trade.entryTime.split(':')[0]);
                    if (!hourlyPerformance[hour]) {
                        hourlyPerformance[hour] = { wins: 0, total: 0, totalPnL: 0 };
                    }
                    hourlyPerformance[hour].total++;
                    hourlyPerformance[hour].totalPnL += trade.pnl;
                    if (trade.pnl > 0) hourlyPerformance[hour].wins++;
                }
            });

// 최고/최악 시간대 찾기
            
            // 최고/최악 시간대 찾기
            let bestHour = null, worstHour = null;
            let bestWinRate = 0, worstWinRate = 100;
            
            Object.entries(hourlyPerformance).forEach(([hour, data]) => {
                if (data.total >= 3) { // 최소 3거래 이상
                    const winRate = (data.wins / data.total) * 100;
                    if (winRate > bestWinRate) {
                        bestWinRate = winRate;
                        bestHour = hour;
                    }
                    if (winRate < worstWinRate) {
                        worstWinRate = winRate;
                        worstHour = hour;
                    }
                }
            });
            
            if (bestHour) {
                document.getElementById('bestTradingHour').textContent = `${bestHour}:00`;
                document.getElementById('bestHourPerformance').textContent = `Win Rate: ${bestWinRate.toFixed(0)}%`;
            }
            
            if (worstHour) {
                document.getElementById('worstTradingHour').textContent = `${worstHour}:00`;
                document.getElementById('worstHourPerformance').textContent = `Win Rate: ${worstWinRate.toFixed(0)}%`;
            }
        }

        function analyzeConsecutiveTradesPattern() {

// 연속 거래 패턴 분석
            // 연속 거래 패턴 분석
            const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));
            
            const patterns = {
                after1Loss: [], after2Losses: [], after3Losses: [],
                after1Win: [], after2Wins: [], after3Wins: []
            };
            
            for (let i = 1; i < sortedTrades.length; i++) {
                const current = sortedTrades[i];
                const prev1 = sortedTrades[i-1];
                
                if (prev1.pnl < 0) {
                    patterns.after1Loss.push(current.pnl > 0 ? 1 : 0);
                    
                    if (i >= 2 && sortedTrades[i-2].pnl < 0) {
                        patterns.after2Losses.push(current.pnl > 0 ? 1 : 0);
                        
                        if (i >= 3 && sortedTrades[i-3].pnl < 0) {
                            patterns.after3Losses.push(current.pnl > 0 ? 1 : 0);
                        }
                    }
                } else if (prev1.pnl > 0) {
                    patterns.after1Win.push(current.pnl > 0 ? 1 : 0);
                    
                    if (i >= 2 && sortedTrades[i-2].pnl > 0) {
                        patterns.after2Wins.push(current.pnl > 0 ? 1 : 0);
                        
                        if (i >= 3 && sortedTrades[i-3].pnl > 0) {
                            patterns.after3Wins.push(current.pnl > 0 ? 1 : 0);
                        }
                    }
                }
            }

// 패턴 결과 업데이트
            
            // 패턴 결과 업데이트
            Object.entries(patterns).forEach(([key, values]) => {
                if (values.length > 0) {
                    const winRate = (values.reduce((sum, val) => sum + val, 0) / values.length) * 100;
                    const elementId = key.charAt(0).toLowerCase() + key.slice(1);
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.textContent = `${winRate.toFixed(0)}%`;
                        element.style.color = winRate >= 50 ? '#10b981' : '#ef4444';
                    }
                }
            });
        }

        function generateAIInsights() {
            const insights = [];
            const currentDate = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[currentDate];

// 수면과 성과 상관관계 분석
            
            // 수면과 성과 상관관계 분석
            const sleepPerformance = analyzeSleepPerformance();
            if (sleepPerformance.correlation !== null) {
                if (sleepPerformance.correlation > 0.3) {
                    insights.push({
                        type: 'good',
                        text: currentLanguage === 'ko' ? 
                            `수면 시간과 거래 성과 간 강한 양의 상관관계 발견 (${(sleepPerformance.correlation * 100).toFixed(0)}%). 충분한 수면이 성과 향상에 도움됩니다.` :
                            `Strong positive correlation found between sleep and trading performance (${(sleepPerformance.correlation * 100).toFixed(0)}%). Adequate sleep helps improve performance.`
                    });
                } else if (sleepPerformance.correlation < -0.3) {
                    insights.push({
                        type: 'warning',
                        text: currentLanguage === 'ko' ? 
                            `수면 시간과 거래 성과 간 음의 상관관계 발견. 과도한 수면이나 수면 패턴을 재검토해보세요.` :
                            `Negative correlation found between sleep and trading performance. Consider reviewing your sleep patterns.`
                    });
                }
            }

// 과도거래 패턴 감지
            
            // 과도거래 패턴 감지
            const recentOvertrading = detectOvertrading();
            if (recentOvertrading > 30) {
                insights.push({
                    type: 'warning',
                    text: currentLanguage === 'ko' ? 
                        `최근 계획 대비 ${recentOvertrading.toFixed(0)}% 과도거래 감지. 거래 빈도를 줄이고 품질에 집중하세요.` :
                        `Recent overtrading detected: ${recentOvertrading.toFixed(0)}% above planned trades. Focus on quality over quantity.`
                });
            }

// 시간대별 최적화 제안
            
            // 시간대별 최적화 제안
            const timeOptimization = getTimeOptimization();
            if (timeOptimization) {
                insights.push({
                    type: 'good',
                    text: currentLanguage === 'ko' ? 
                        `최적 거래 시간대: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (승률 ${timeOptimization.winRate.toFixed(0)}%)` :
                        `Optimal trading time: ${timeOptimization.bestHour}:00-${timeOptimization.bestHour + 1}:00 (${timeOptimization.winRate.toFixed(0)}% win rate)`
                });
            }

// 연속 손실 후 주의사항
            
            // 연속 손실 후 주의사항
            const consecutiveLossPattern = getConsecutiveLossPattern();
            if (consecutiveLossPattern && consecutiveLossPattern.after3Losses < 40) {
                insights.push({
                    type: 'danger',
                    text: currentLanguage === 'ko' ? 
                        `3연속 손실 후 승률이 ${consecutiveLossPattern.after3Losses.toFixed(0)}%로 급감. 연속 손실 시 거래 중단을 고려하세요.` :
                        `Win rate drops to ${consecutiveLossPattern.after3Losses.toFixed(0)}% after 3 consecutive losses. Consider taking a break.`
                });
            }

// 기본 메시지
            
            // 기본 메시지
            if (insights.length === 0) {
                insights.push({
                    type: 'info',
                    text: currentLanguage === 'ko' ? 
                        '더 많은 심리 데이터와 거래 기록을 수집하여 개인화된 인사이트를 생성하세요.' :
                        'Collect more psychology data and trading records to generate personalized insights.'
                });
            }

// 인사이트 렌더링
            
            // 인사이트 렌더링
            const insightsList = document.getElementById('aiInsightsList');
            if (insightsList) {
                insightsList.innerHTML = insights.map(insight => `
                    <div style="background: #0f172a; border-left: 4px solid ${getInsightColor(insight.type)}; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                        <div style="color: #e4e4e7; font-size: 14px; line-height: 1.5;">${insight.text}</div>
                    </div>
                `).join('');
            }
        }

// 차트 업데이트 (딜레이를 주어 DOM 업데이트 후 실행)
                
                // 차트 업데이트 (딜레이를 주어 DOM 업데이트 후 실행)
                setTimeout(() => {
                    createPsychologyChart();
                }, 100);
            } catch (error) {
                console.error('Error updating visual cards:', error);
            }
        }

        

        function updateEnvironmentCard() {
            const envType = document.getElementById('environmentType').value;
            const focusLevel = parseInt(document.getElementById('focusLevel').value) || 3;
            
            const envScores = {
                'home': 85,
                'office': 70,
                'cafe': 50,
                'hotel': 40
            };
            
            const baseScore = envScores[envType] || 50;
            const focusAdjustment = (focusLevel - 3) * 10;
            const totalScore = Math.max(0, Math.min(100, baseScore + focusAdjustment));
            
            document.getElementById('environmentScore').textContent = Math.round(totalScore);
            document.getElementById('environmentTypeDisplay').textContent = envType.charAt(0).toUpperCase() + envType.slice(1);
            
            const circle = document.getElementById('environmentCircle');
            if (circle) {
                const circumference = 157;
                const offset = circumference - (totalScore / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }
            
            let status = 'Good';
            if (totalScore >= 80) status = 'Excellent';
            else if (totalScore >= 60) status = 'Good';
            else if (totalScore >= 40) status = 'Fair';
            else status = 'Poor';
            
            document.getElementById('environmentStatus').textContent = status;
        }

        function updateEmotionalCard() {
            const stress = parseInt(document.getElementById('stressLevel').value) || 3;
            const confidence = parseInt(document.getElementById('confidenceLevel').value) || 3;
            const focus = parseInt(document.getElementById('focusLevel').value) || 3;
            
            document.getElementById('stressDisplay').textContent = stress;
            document.getElementById('confidenceDisplay').textContent = confidence;
            document.getElementById('focusDisplay').textContent = focus;
            
            const stressScore = (6 - stress) * 20;
            const confidenceScore = confidence * 20;
            const focusScore = focus * 20;
            const averageScore = (stressScore + confidenceScore + focusScore) / 3;
            
            let status = 'Balanced';
            if (averageScore >= 80) status = 'Excellent readiness';
            else if (averageScore >= 60) status = 'Good readiness';
            else if (averageScore >= 40) status = 'Fair readiness';
            else status = 'Poor readiness';
            
            document.getElementById('emotionalStatus').textContent = status;
        }

        function updateRiskCard() {
            const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
            const target = parseFloat(document.getElementById('dailyTarget').value) || 0;
            const maxLoss = parseFloat(document.getElementById('maxDailyLoss').value) || 0;
            
            if (balance > 0) {
                const targetPercent = (target / balance * 100);
                const lossPercent = (maxLoss / balance * 100);
                
                document.getElementById('targetRiskPercent').textContent = `${targetPercent.toFixed(1)}%`;
                document.getElementById('maxLossRiskPercent').textContent = `${lossPercent.toFixed(1)}%`;
                
                document.getElementById('targetRiskBar').style.width = `${Math.min(targetPercent * 10, 100)}%`;
                document.getElementById('maxLossRiskBar').style.width = `${Math.min(lossPercent * 10, 100)}%`;
                
                let status = 'Conservative';
                if (targetPercent > 5 || lossPercent > 10) status = 'High risk';
                else if (targetPercent > 3 || lossPercent > 5) status = 'Moderate risk';
                else if (targetPercent > 1 || lossPercent > 2) status = 'Low risk';
                
                document.getElementById('riskStatus').textContent = status;
            } else {
                document.getElementById('targetRiskPercent').textContent = '0%';
                document.getElementById('maxLossRiskPercent').textContent = '0%';
                document.getElementById('targetRiskBar').style.width = '0%';
                document.getElementById('maxLossRiskBar').style.width = '0%';
                document.getElementById('riskStatus').textContent = 'No data';
            }
        }

        async function createPsychologyChart() {
            try {
                await waitForChart();
                
                const ctx = document.getElementById('psychologyPerformanceChart');
                if (!ctx) {
                    console.warn('Psychology chart canvas not found');
                    return;
                }

// 기존 차트가 있다면 안전하게 제거
                
               // 기존 차트가 있다면 안전하게 제거
                if (typeof window.psychologyChart !== 'undefined' && window.psychologyChart && typeof window.psychologyChart.destroy === 'function') {
                    try {
                        window.psychologyChart.destroy();
                        window.psychologyChart = null;
                    } catch (error) {
                        console.warn('Chart destruction error:', error);
                    }
                }
                
                const chartData = preparePsychologyChartData();

// 데이터가 없으면 기본 메시지 표시
                
                // 데이터가 없으면 기본 메시지 표시
                if (!chartData || (chartData.sleepData.length === 0 && chartData.stressData.length === 0 && chartData.focusData.length === 0)) {
                    const parent = ctx.parentElement;
                    if (parent) {
                        parent.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #64748b; font-size: 14px;">
                                ${currentLanguage === 'ko' ? '심리 데이터와 거래 기록을 수집하여 차트를 생성하세요' : 'Collect psychology data and trading records to generate chart'}
                            </div>
                        `;
                    }
                    return;
                }

// 차트 설정
                
                // 차트 설정
                const chartConfig = {
                    type: 'scatter',
                    data: {
                        datasets: []
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            intersect: false,
                            mode: 'point'
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#e4e4e7',
                                    usePointStyle: true,
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                titleColor: '#e4e4e7',
                                bodyColor: '#e4e4e7',
                                borderColor: '#334155',
                                borderWidth: 1,
                                callbacks: {
                                    title: function(context) {
                                        return context[0].dataset.label;
                                    },
                                    label: function(context) {
                                        const factor = context.dataset.label.includes('Sleep') ? 'hours' : 'level';
                                        return `${context.dataset.label}: ${context.parsed.x} ${factor}, ${context.parsed.y.toFixed(1)}% win rate`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: currentLanguage === 'ko' ? '심리 요인' : 'Psychology Factor',
                                    color: '#94a3b8'
                                },
                                ticks: { 
                                    color: '#94a3b8',
                                    stepSize: 1
                                },
                                grid: { 
                                    color: '#334155',
                                    drawBorder: false
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: currentLanguage === 'ko' ? '승률 (%)' : 'Win Rate (%)',
                                    color: '#94a3b8'
                                },
                                min: 0,
                                max: 100,
                                ticks: { 
                                    color: '#94a3b8',
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                },
                                grid: { 
                                    color: '#334155',
                                    drawBorder: false
                                }
                            }
                        }
                    }
                };

// 데이터셋 추가
                
                // 데이터셋 추가
                if (chartData.sleepData.length > 0) {
                    chartConfig.data.datasets.push({
                        label: currentLanguage === 'ko' ? '수면 vs 성과' : 'Sleep vs Performance',
                        data: chartData.sleepData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: '#10b981',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        showLine: false
                    });
                }
                
                if (chartData.stressData.length > 0) {
                    chartConfig.data.datasets.push({
                        label: currentLanguage === 'ko' ? '스트레스 vs 성과' : 'Stress vs Performance',
                        data: chartData.stressData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: '#ef4444',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        showLine: false
                    });
                }
                
                if (chartData.focusData.length > 0) {
                    chartConfig.data.datasets.push({
                        label: currentLanguage === 'ko' ? '집중력 vs 성과' : 'Focus vs Performance',
                        data: chartData.focusData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        showLine: false
                    });
                }

// 차트 생성
                
                // 차트 생성
                window.psychologyChart = new Chart(ctx, chartConfig);
                
            } catch (error) {
                console.error('Error creating psychology chart:', error);
                const ctx = document.getElementById('psychologyPerformanceChart');
                if (ctx && ctx.parentElement) {
                    ctx.parentElement.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #ef4444; font-size: 14px;">
                            ${currentLanguage === 'ko' ? '차트 생성 중 오류가 발생했습니다' : 'Error creating chart'}
                        </div>
                    `;
                }
            }
        }

        function preparePsychologyChartData() {
            try {
                const sleepData = [];
                const stressData = [];
                const focusData = [];
                
                if (!psychologyData || typeof psychologyData !== 'object') {
                    return { sleepData, stressData, focusData };
                }
                
                Object.entries(psychologyData).forEach(([date, psyData]) => {
                    if (!psyData || typeof psyData !== 'object') return;
                    
                    const dayTrades = trades.filter(trade => trade && trade.date === date);
                    if (dayTrades.length === 0) return;

// 일일 승률 계산
                    
                    // 일일 승률 계산
                    const winningTrades = dayTrades.filter(trade => trade.pnl > 0);
                    const winRate = dayTrades.length > 0 ? (winningTrades.length / dayTrades.length * 100) : 0;

// 수면 데이터
                    
                    // 수면 데이터
                    if (psyData.sleepHours && typeof psyData.sleepHours === 'number' && psyData.sleepHours > 0) {
                        sleepData.push({ 
                            x: psyData.sleepHours, 
                            y: winRate,
                            date: date 
                        });
                    }

// 스트레스 데이터
                    
                    // 스트레스 데이터
                    if (psyData.stressLevel && typeof psyData.stressLevel === 'number') {
                        stressData.push({ 
                            x: psyData.stressLevel, 
                            y: winRate,
                            date: date 
                        });
                    }

// 집중력 데이터
                    
                    // 집중력 데이터
                    if (psyData.focusLevel && typeof psyData.focusLevel === 'number') {
                        focusData.push({ 
                            x: psyData.focusLevel, 
                            y: winRate,
                            date: date 
                        });
                    }
                });
                
                return { sleepData, stressData, focusData };
                
            } catch (error) {
                console.error('Error preparing psychology chart data:', error);
                return { sleepData: [], stressData: [], focusData: [] };
            }
        }

        function getInsightColor(type) {
            switch(type) {
                case 'good': return '#10b981';
                case 'warning': return '#f59e0b';
                case 'danger': return '#ef4444';
                default: return '#3b82f6';
            }
        }

        

        function detectOvertrading() {
            const today = formatTradingDate(currentTradingDate);
            const todayData = psychologyData[today];
            
            if (!todayData || !todayData.plannedTrades) return 0;
            
            const actualTrades = trades.filter(trade => trade.date === today).length;
            return ((actualTrades - todayData.plannedTrades) / todayData.plannedTrades) * 100;
        }

        function getTimeOptimization() {
            const hourlyStats = {};
            
            trades.forEach(trade => {
                if (trade.entryTime) {
                    const hour = parseInt(trade.entryTime.split(':')[0]);
                    if (!hourlyStats[hour]) {
                        hourlyStats[hour] = { wins: 0, total: 0 };
                    }
                    hourlyStats[hour].total++;
                    if (trade.pnl > 0) hourlyStats[hour].wins++;
                }
            });
            
            let bestHour = null;
            let bestWinRate = 0;
            
            Object.entries(hourlyStats).forEach(([hour, stats]) => {
                if (stats.total >= 5) { // 최소 5거래
                    const winRate = (stats.wins / stats.total) * 100;
                    if (winRate > bestWinRate) {
                        bestWinRate = winRate;
                        bestHour = parseInt(hour);
                    }
                }
            });
            
            return bestHour ? { bestHour, winRate: bestWinRate } : null;
        }

        function getConsecutiveLossPattern() {
            const sortedTrades = [...trades].sort((a, b) => new Date(a.date + ' ' + (a.entryTime || '00:00')) - new Date(b.date + ' ' + (b.entryTime || '00:00')));
            
            const after3Losses = [];
            
            for (let i = 3; i < sortedTrades.length; i++) {
                if (sortedTrades[i-1].pnl < 0 && sortedTrades[i-2].pnl < 0 && sortedTrades[i-3].pnl < 0) {
                    after3Losses.push(sortedTrades[i].pnl > 0 ? 1 : 0);
                }
            }
            
            if (after3Losses.length === 0) return null;
            
            const winRate = (after3Losses.reduce((sum, val) => sum + val, 0) / after3Losses.length) * 100;
            return { after3Losses: winRate };
        }

// 안전한 요소 업데이트
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

                // 차트 업데이트는 약간의 딜레이 후 실행
                setTimeout(() => {
                    updateVisualCards();
                }, 200);
            } else {

// 기본값으로 차트 생성
                // 기본값으로 차트 생성
                setTimeout(() => {
                    createPsychologyChart();
                }, 200);
            }
        }

// Annual Heatmap Functions
        
        // Annual Heatmap Functions

// Annual Heatmap Functions
        // Annual Heatmap Functions
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

// 주간 통계 계산
            
            // 주간 통계 계산
            const wins = weekTrades.filter(trade => trade.pnl > 0);
            const winRate = weekTrades.length > 0 ? (wins.length / weekTrades.length) * 100 : 0;

// 일별 P/L 계산 (수수료 포함)
            
            // 일별 P/L 계산 (수수료 포함)
            const dailyStats = {};
            weekTrades.forEach(trade => {
                if (!dailyStats[trade.date]) {
                    dailyStats[trade.date] = 0;
                }
                dailyStats[trade.date] += trade.pnl;
            });

// 수수료 적용
            
            // 수수료 적용
            Object.keys(dailyStats).forEach(date => {
                const fee = dailyFees[date] || 0;
                dailyStats[date] -= fee;
            });
            
            const dailyPLs = Object.values(dailyStats);
            const bestDay = dailyPLs.length > 0 ? Math.max(...dailyPLs) : 0;
            const worstDay = dailyPLs.length > 0 && dailyPLs.some(pnl => pnl < 0) ? Math.min(...dailyPLs) : 0;

// 티커별 통계 계산
            
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
            
            // 기존 상세 정보 제거
            let existingWeekDetails = document.getElementById('weekTickerDetails');
            if (existingWeekDetails) {
                existingWeekDetails.remove();
            }

// 티커별 정보를 P/L 순으로 정렬
            
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
            
            // Day details 숨기기
            document.getElementById('dayDetails').style.display = 'none';
        }
        
        function closeWeekDetails() {
            document.getElementById('weekDetailsModal').style.display = 'none';
        }
