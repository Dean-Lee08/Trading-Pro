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
    document.getElementById('principlesSleepHours').value = data.sleepHours || '';
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
        updatePrinciplesTradeDetailsCard();
    } catch (error) {
        console.error('Error updating principles visual cards:', error);
    }
}

// Update Trade Details Score Card
function updatePrinciplesTradeDetailsCard() {
    const consecutiveLossLimit = parseInt(document.getElementById('principlesConsecutiveLossLimit').value) || 0;
    const maxSingleLoss = parseFloat(document.getElementById('principlesMaxSingleLoss').value) || 0;
    const maxPositionSize = parseFloat(document.getElementById('principlesMaxPositionSize').value) || 0;
    const minRiskReward = parseFloat(document.getElementById('principlesMinRiskReward').value) || 0;

    const scoreEl = document.getElementById('principlesTradeDetailsScore');
    const complianceEl = document.getElementById('principlesTradeDetailsCompliance');
    const circleEl = document.getElementById('principlesTradeDetailsCircle');
    const statusEl = document.getElementById('principlesTradeDetailsStatus');

    // Calculate score based on how many rules are set
    let rulesSet = 0;
    if (consecutiveLossLimit > 0) rulesSet++;
    if (maxSingleLoss > 0) rulesSet++;
    if (maxPositionSize > 0) rulesSet++;
    if (minRiskReward > 0) rulesSet++;

    const totalScore = (rulesSet / 4) * 100;

    if (scoreEl) scoreEl.textContent = Math.round(totalScore);
    if (complianceEl) complianceEl.textContent = `${rulesSet}/4 Rules`;

    if (circleEl) {
        const circumference = 157;
        const offset = circumference - (totalScore / 100) * circumference;
        circleEl.style.strokeDashoffset = offset;
    }

    let status = 'No rules';
    if (totalScore >= 100) status = 'Full coverage';
    else if (totalScore >= 75) status = 'Good coverage';
    else if (totalScore >= 50) status = 'Partial coverage';
    else if (totalScore > 0) status = 'Minimal coverage';

    if (statusEl) statusEl.textContent = status;
}

// Save principles data
function savePrinciplesData() {
    const data = {
        // Trading environment
        startTime: document.getElementById('principlesStartTime').value || '',
        endTime: document.getElementById('principlesEndTime').value || '',
        environmentType: document.getElementById('principlesEnvironmentType').value || 'home',

        // Account rules
        accountBalance: parseFloat(document.getElementById('principlesAccountBalance').value) || 0,
        dailyTarget: parseFloat(document.getElementById('principlesDailyTarget').value) || 0,
        maxDailyLoss: parseFloat(document.getElementById('principlesMaxDailyLoss').value) || 0,
        maxTradeCount: parseInt(document.getElementById('principlesMaxTradeCount').value) || 0,

        // Trade details
        consecutiveLossLimit: parseInt(document.getElementById('principlesConsecutiveLossLimit').value) || 0,
        maxSingleLoss: parseFloat(document.getElementById('principlesMaxSingleLoss').value) || 0,
        maxPositionSize: parseFloat(document.getElementById('principlesMaxPositionSize').value) || 0,
        minRiskReward: parseFloat(document.getElementById('principlesMinRiskReward').value) || 0,

        // Warning triggers (preserve existing or initialize)
        warningTriggers: principlesData[currentPrinciplesDate]?.warningTriggers || {
            consecutiveLoss: 0,
            singleLoss: 0,
            positionSize: 0,
            riskReward: 0,
            dailyTarget: 0,
            maxLoss: 0,
            tradeCount: 0
        }
    };

    principlesData[currentPrinciplesDate] = data;
    savePrinciplesDataToStorage();

    // Re-check warnings after saving
    checkAndUpdateWarnings(currentPrinciplesDate);

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

// ============================================
// Warning Triggers System
// ============================================

/**
 * Check and update all warning triggers for a date
 */
function checkAndUpdateWarnings(date) {
    const principles = principlesData[date];
    if (!principles) {
        // No principles set for this date, show zeros
        updateWarningTriggersDisplay(0, 0, 0, 0, 0, 0, 0);
        return;
    }

    // Initialize warning counters
    let consecutiveLossCount = 0;
    let singleLossCount = 0;
    let positionSizeCount = 0;
    let riskRewardCount = 0;
    let dailyTargetCount = 0;
    let maxLossCount = 0;
    let tradeCountExceeded = 0;

    // Get trades for this date
    const dateTrades = trades.filter(t => t.date === date).sort((a, b) => {
        // Sort by entry time
        const timeA = a.entryTime || '00:00';
        const timeB = b.entryTime || '00:00';
        return timeA.localeCompare(timeB);
    });

    if (dateTrades.length === 0) {
        updateWarningTriggersDisplay(0, 0, 0, 0, 0, 0, 0);
        return;
    }

    // Trade Details Warnings
    // 1. Check consecutive losses
    if (principles.consecutiveLossLimit > 0) {
        consecutiveLossCount = checkConsecutiveLosses(dateTrades, principles.consecutiveLossLimit);
    }

    // 2. Check single loss limit
    if (principles.maxSingleLoss > 0) {
        singleLossCount = dateTrades.filter(t => t.pnl < -Math.abs(principles.maxSingleLoss)).length;
    }

    // 3. Check position size limit
    if (principles.maxPositionSize > 0) {
        positionSizeCount = dateTrades.filter(t => t.amount > principles.maxPositionSize).length;
    }

    // 4. Check risk/reward ratio
    if (principles.minRiskReward > 0) {
        riskRewardCount = checkRiskRewardViolations(dateTrades, principles.minRiskReward);
    }

    // Account Rules Warnings
    // 5. Check daily target hit
    if (principles.dailyTarget > 0) {
        const totalPnL = dateTrades.reduce((sum, t) => sum + t.pnl, 0);
        if (totalPnL >= principles.dailyTarget) {
            dailyTargetCount = 1;
        }
    }

    // 6. Check max daily loss
    if (principles.maxDailyLoss > 0) {
        const totalPnL = dateTrades.reduce((sum, t) => sum + t.pnl, 0);
        if (totalPnL <= -Math.abs(principles.maxDailyLoss)) {
            maxLossCount = 1;
        }
    }

    // 7. Check trade count limit
    if (principles.maxTradeCount > 0) {
        if (dateTrades.length >= principles.maxTradeCount) {
            tradeCountExceeded = 1;
        }
    }

    // Update principles data with warning counts
    if (!principles.warningTriggers) {
        principles.warningTriggers = {};
    }
    principles.warningTriggers.consecutiveLoss = consecutiveLossCount;
    principles.warningTriggers.singleLoss = singleLossCount;
    principles.warningTriggers.positionSize = positionSizeCount;
    principles.warningTriggers.riskReward = riskRewardCount;
    principles.warningTriggers.dailyTarget = dailyTargetCount;
    principles.warningTriggers.maxLoss = maxLossCount;
    principles.warningTriggers.tradeCount = tradeCountExceeded;

    // Save updated data
    savePrinciplesDataToStorage();

    // Update display
    updateWarningTriggersDisplay(
        consecutiveLossCount,
        singleLossCount,
        positionSizeCount,
        riskRewardCount,
        dailyTargetCount,
        maxLossCount,
        tradeCountExceeded
    );
}

/**
 * Check consecutive losses
 * Counts each time consecutive losses reach or exceed the limit
 */
function checkConsecutiveLosses(trades, limit) {
    let currentConsecutive = 0;
    let violationCount = 0;
    let inViolation = false; // Track if we're currently in a violation streak

    for (let trade of trades) {
        if (trade.pnl < 0) {
            currentConsecutive++;

            // Trigger warning when limit is first reached
            if (currentConsecutive >= limit && !inViolation) {
                violationCount++;
                inViolation = true; // Mark that we're in a violation streak
            }
        } else {
            // Reset on winning trade
            currentConsecutive = 0;
            inViolation = false;
        }
    }

    return violationCount;
}

/**
 * Check risk/reward ratio violations
 */
function checkRiskRewardViolations(trades, minRatio) {
    let count = 0;

    for (let trade of trades) {
        if (trade.pnl > 0) {
            // For winning trades, check if profit meets minimum ratio
            const profit = trade.pnl;
            const entry = trade.amount;
            const actualRatio = profit / (entry * 0.01); // Assuming 1% risk base

            if (actualRatio < minRatio && actualRatio > 0) {
                count++;
            }
        }
    }

    return count;
}

/**
 * Update warning triggers display
 * Preserves data-lang attributes and uses consistent color coding
 */
function updateWarningTriggersDisplay(consecutiveLoss, singleLoss, positionSize, riskReward, dailyTarget, maxLoss, tradeCount) {
    const elements = {
        consecutiveLoss: document.getElementById('warningConsecutiveLoss'),
        singleLoss: document.getElementById('warningSingleLoss'),
        positionSize: document.getElementById('warningPositionSize'),
        riskReward: document.getElementById('warningRiskReward'),
        dailyTarget: document.getElementById('warningDailyTarget'),
        maxLoss: document.getElementById('warningMaxLoss'),
        tradeCount: document.getElementById('warningTradeCount')
    };

    const values = {
        consecutiveLoss,
        singleLoss,
        positionSize,
        riskReward,
        dailyTarget,
        maxLoss,
        tradeCount
    };

    for (let [key, element] of Object.entries(elements)) {
        if (!element) continue;

        const count = values[key];

        // Update only the count number, preserving the "times" text with data-lang
        const timesSpan = element.querySelector('span[data-lang="times-triggered"]');
        if (timesSpan) {
            // Find the text node before the span (the count number)
            const textNode = element.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = count + ' ';
            } else {
                // If no text node exists, create one
                const newTextNode = document.createTextNode(count + ' ');
                element.insertBefore(newTextNode, timesSpan);
            }
        } else {
            // No timesSpan found, just update the element text
            element.textContent = count;
        }

        // Apply color coding with CSS classes (consistent approach)
        // Reset inline styles to let CSS classes control color
        element.style.color = '';

        // Remove all color classes first
        element.classList.remove('positive', 'negative', 'neutral', 'warning');

        // Apply appropriate class based on warning type and count
        if (key === 'dailyTarget') {
            // Daily target achievement is positive
            element.classList.add(count > 0 ? 'positive' : 'neutral');
        } else if (key === 'maxLoss') {
            // Max loss hit is negative
            element.classList.add(count > 0 ? 'negative' : 'neutral');
        } else {
            // Other warnings: 0 = neutral, 1-2 = warning, 3+ = negative
            if (count === 0) {
                element.classList.add('neutral');
            } else if (count <= 2) {
                element.classList.add('warning');
            } else {
                element.classList.add('negative');
            }
        }
    }
}

/**
 * Check trade against principles (called from trading.js)
 */
function checkTradeAgainstPrinciples(trade) {
    const principles = principlesData[trade.date];
    if (!principles) return;

    let violations = [];

    // Check single loss
    if (principles.maxSingleLoss > 0 && trade.pnl < -Math.abs(principles.maxSingleLoss)) {
        violations.push(currentLanguage === 'en'
            ? `Single loss exceeded: $${Math.abs(trade.pnl).toFixed(2)} > $${principles.maxSingleLoss}`
            : `단일 손실 초과: $${Math.abs(trade.pnl).toFixed(2)} > $${principles.maxSingleLoss}`);
    }

    // Check position size
    if (principles.maxPositionSize > 0 && trade.amount > principles.maxPositionSize) {
        violations.push(currentLanguage === 'en'
            ? `Position size exceeded: $${trade.amount.toFixed(2)} > $${principles.maxPositionSize}`
            : `포지션 크기 초과: $${trade.amount.toFixed(2)} > $${principles.maxPositionSize}`);
    }

    // Show violations if any
    if (violations.length > 0) {
        const message = violations.join('\n');
        showToast('⚠️ ' + message);
    }

    // Re-check all warnings for the date
    checkAndUpdateWarnings(trade.date);
}
