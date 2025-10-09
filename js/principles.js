// ============================================
// Principles Management
// ============================================

// Load principles data from localStorage
function loadPrinciplesData() {
    const saved = localStorage.getItem('tradingPlatformPrinciplesData');
    if (saved) {
        principlesData = JSON.parse(saved);
    }
}

// Save principles data to localStorage
function savePrinciplesDataToStorage() {
    localStorage.setItem('tradingPlatformPrinciplesData', JSON.stringify(principlesData));
}

// Initialize principles page
function initPrinciplesPage() {
    if (!currentPrinciplesDate) {
        currentPrinciplesDate = formatTradingDate(new Date());
    }
    updatePrinciplesDateDisplay();
    loadPrinciplesDataForDate(currentPrinciplesDate);
}

// Update date display
function updatePrinciplesDateDisplay() {
    const dateText = document.getElementById('principlesDateText');
    if (dateText) {
        const today = formatTradingDate(new Date());
        if (currentPrinciplesDate === today) {
            dateText.textContent = currentLanguage === 'en' ? 'Today' : '오늘';
        } else {
            dateText.textContent = currentPrinciplesDate;
        }
    }
}

// Navigate to previous day
function previousPrinciplesDay() {
    const date = new Date(currentPrinciplesDate + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    currentPrinciplesDate = formatTradingDate(date);
    updatePrinciplesDateDisplay();
    loadPrinciplesDataForDate(currentPrinciplesDate);
}

// Navigate to next day
function nextPrinciplesDay() {
    const date = new Date(currentPrinciplesDate + 'T12:00:00');
    date.setDate(date.getDate() + 1);
    currentPrinciplesDate = formatTradingDate(date);
    updatePrinciplesDateDisplay();
    loadPrinciplesDataForDate(currentPrinciplesDate);
}

// Show date picker modal
function showPrinciplesDatePicker() {
    const modal = document.getElementById('datePickerModal');
    const input = document.getElementById('datePickerInput');
    if (modal && input) {
        input.value = currentPrinciplesDate;
        modal.style.display = 'flex';

        // Override the apply function temporarily
        window.tempApplyDateFunction = function() {
            currentPrinciplesDate = input.value;
            updatePrinciplesDateDisplay();
            loadPrinciplesDataForDate(currentPrinciplesDate);
            modal.style.display = 'none';
        };
    }
}

// Load principles data for specific date
function loadPrinciplesDataForDate(date) {
    const data = principlesData[date] || {};

    // Load economic pressure data
    document.getElementById('principlesAccountBalance').value = data.accountBalance || '';
    document.getElementById('principlesDailyTarget').value = data.dailyTarget || '';
    document.getElementById('principlesMaxDailyLoss').value = data.maxDailyLoss || '';
    document.getElementById('principlesMaxTradeCount').value = data.maxTradeCount || '';

    // Update percentages
    updatePrinciplesTargetPercentages();
}

// Update target percentages
function updatePrinciplesTargetPercentages() {
    const balance = parseFloat(document.getElementById('principlesAccountBalance').value) || 0;
    const target = parseFloat(document.getElementById('principlesDailyTarget').value) || 0;
    const maxLoss = parseFloat(document.getElementById('principlesMaxDailyLoss').value) || 0;

    const targetPercent = balance > 0 ? ((target / balance) * 100).toFixed(2) : '0.00';
    const lossPercent = balance > 0 ? ((maxLoss / balance) * 100).toFixed(2) : '0.00';

    document.getElementById('principlesDailyTargetPercent').textContent = targetPercent + '%';
    document.getElementById('principlesMaxLossPercent').textContent = lossPercent + '%';
}

// Save principles data
function savePrinciplesData() {
    const data = {
        accountBalance: parseFloat(document.getElementById('principlesAccountBalance').value) || 0,
        dailyTarget: parseFloat(document.getElementById('principlesDailyTarget').value) || 0,
        maxDailyLoss: parseFloat(document.getElementById('principlesMaxDailyLoss').value) || 0,
        maxTradeCount: parseInt(document.getElementById('principlesMaxTradeCount').value) || 0
    };

    principlesData[currentPrinciplesDate] = data;
    savePrinciplesDataToStorage();

    // Show toast notification
    showToast(currentLanguage === 'en' ? 'Principles data saved!' : '원칙 데이터가 저장되었습니다!');
}

// Reset principles data for current date
function resetPrinciplesData() {
    if (confirm(currentLanguage === 'en'
        ? 'Are you sure you want to reset all principles data for this date?'
        : '이 날짜의 모든 원칙 데이터를 초기화하시겠습니까?')) {

        delete principlesData[currentPrinciplesDate];
        savePrinciplesDataToStorage();
        loadPrinciplesDataForDate(currentPrinciplesDate);

        showToast(currentLanguage === 'en' ? 'Principles data reset!' : '원칙 데이터가 초기화되었습니다!');
    }
}

// Show toast notification (if not already defined)
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
