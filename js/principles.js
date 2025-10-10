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

    // Load trading environment data
    document.getElementById('principlesStartTime').value = data.startTime || '';
    document.getElementById('principlesEndTime').value = data.endTime || '';
    document.getElementById('principlesEnvironmentType').value = data.environmentType || 'home';

    // Load account rules data
    document.getElementById('principlesAccountBalance').value = data.accountBalance || '';
    document.getElementById('principlesDailyTarget').value = data.dailyTarget || '';
    document.getElementById('principlesMaxDailyLoss').value = data.maxDailyLoss || '';
    document.getElementById('principlesMaxTradeCount').value = data.maxTradeCount || '';

    // Load trade details data
    document.getElementById('principlesConsecutiveLossLimit').value = data.consecutiveLossLimit || '';
    document.getElementById('principlesMaxSingleLoss').value = data.maxSingleLoss || '';
    document.getElementById('principlesMaxPositionSize').value = data.maxPositionSize || '';
    document.getElementById('principlesMinRiskReward').value = data.minRiskReward || '';

    // Update percentages and visual cards
    updatePrinciplesTargetPercentages();
    updatePrinciplesVisualCards();

    // Check and update warnings
    checkAndUpdateWarnings(date);
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

    // Update visual cards when percentages change
    updatePrinciplesVisualCards();
}

// Update Environment Score Card
function updatePrinciplesEnvironmentCard() {
    const envTypeEl = document.getElementById('principlesEnvironmentType');
    if (!envTypeEl) return;

    const envType = envTypeEl.value || 'home';

    const envScores = {
        'home': 85,
        'office': 70,
        'cafe': 50,
        'hotel': 40
    };

    const baseScore = envScores[envType] || 50;
    const totalScore = Math.max(0, Math.min(100, baseScore));

    const scoreEl = document.getElementById('principlesEnvironmentScore');
    const typeDisplayEl = document.getElementById('principlesEnvironmentTypeDisplay');
    const circleEl = document.getElementById('principlesEnvironmentCircle');
    const statusEl = document.getElementById('principlesEnvironmentStatus');

    if (scoreEl) scoreEl.textContent = Math.round(totalScore);
    if (typeDisplayEl) typeDisplayEl.textContent = envType.charAt(0).toUpperCase() + envType.slice(1);

    if (circleEl) {
        const circumference = 157;
        const offset = circumference - (totalScore / 100) * circumference;
        circleEl.style.strokeDashoffset = offset;
    }

    let status = 'Good';
    if (totalScore >= 80) status = 'Excellent';
    else if (totalScore >= 60) status = 'Good';
    else if (totalScore >= 40) status = 'Fair';
    else status = 'Poor';

    if (statusEl) statusEl.textContent = status;
}

// Update Risk Assessment Card
function updatePrinciplesRiskCard() {
    const balance = parseFloat(document.getElementById('principlesAccountBalance').value) || 0;
    const target = parseFloat(document.getElementById('principlesDailyTarget').value) || 0;
    const maxLoss = parseFloat(document.getElementById('principlesMaxDailyLoss').value) || 0;

    const targetPercentEl = document.getElementById('principlesTargetRiskPercent');
    const maxLossPercentEl = document.getElementById('principlesMaxLossRiskPercent');
    const targetBarEl = document.getElementById('principlesTargetRiskBar');
    const maxLossBarEl = document.getElementById('principlesMaxLossRiskBar');
    const riskStatusEl = document.getElementById('principlesRiskStatus');

    if (balance > 0) {
        const targetPercent = (target / balance * 100);
        const lossPercent = (maxLoss / balance * 100);

        if (targetPercentEl) targetPercentEl.textContent = `${targetPercent.toFixed(1)}%`;
        if (maxLossPercentEl) maxLossPercentEl.textContent = `${lossPercent.toFixed(1)}%`;

        if (targetBarEl) targetBarEl.style.width = `${Math.min(targetPercent * 10, 100)}%`;
        if (maxLossBarEl) maxLossBarEl.style.width = `${Math.min(lossPercent * 10, 100)}%`;

        let status = 'Conservative';
        if (targetPercent > 5 || lossPercent > 10) status = 'High risk';
        else if (targetPercent > 3 || lossPercent > 5) status = 'Moderate risk';
        else if (targetPercent > 1 || lossPercent > 2) status = 'Low risk';

        if (riskStatusEl) riskStatusEl.textContent = status;
    } else {
        if (targetPercentEl) targetPercentEl.textContent = '0%';
        if (maxLossPercentEl) maxLossPercentEl.textContent = '0%';
        if (targetBarEl) targetBarEl.style.width = '0%';
        if (maxLossBarEl) maxLossBarEl.style.width = '0%';
        if (riskStatusEl) riskStatusEl.textContent = 'No data';
    }
}

// Update all visual cards
function updatePrinciplesVisualCards() {
    try {
        updatePrinciplesEnvironmentCard();
        updatePrinciplesRiskCard();
    } catch (error) {
        console.error('Error updating principles visual cards:', error);
    }
}

// Save principles data
function savePrinciplesData() {
    const data = {
        // Trading environment
        startTime: document.getElementById('principlesStartTime').value || '',
        endTime: document.getElementById('principlesEndTime').value || '',
        environmentType: document.getElementById('principlesEnvironmentType').value || 'home',

        // Economic pressure
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

// showToast function is defined in utils.js
