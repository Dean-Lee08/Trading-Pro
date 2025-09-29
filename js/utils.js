// js/utils.js
// Utility Functions

// Function to get EST trading date
function getESTTradingDate(date = new Date()) {
    return new Date(date);
}

// Function to format date for storage (EST trading date)
function formatTradingDate(date) {
    return date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0');
}

// Language functions
function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLanguage][key];
            } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

function changeLanguageFromSettings() {
    const select = document.getElementById('settingsLanguageSelect');
    currentLanguage = select.value;
    updateLanguage();
    updateStats();
    updateDetailedAnalytics();
    localStorage.setItem('tradingPlatformLanguage', currentLanguage);
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

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

// Navigation functions
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

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

// Detail card collapse function
function toggleDetailCard(header) {
    const card = header.parentElement;
    card.classList.toggle('collapsed');
}

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
function clearAnalyticsRange() {
    analyticsStartDate = null;
    analyticsEndDate = null;
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    updateDetailedAnalytics();
}

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
