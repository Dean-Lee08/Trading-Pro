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

// Detail card collapse function
function toggleDetailCard(header) {
    const card = header.parentElement;
    card.classList.toggle('collapsed');
}

// Safe element update helper
function safeUpdateElement(id, value, className = null) {
    const element = document.getElementById(id);
    if (element) {
        if (typeof value === 'string' || typeof value === 'number') {
            element.textContent = value;
        }
        if (className) {
            element.className = className;
        }
    }
}

// Standard deviation calculation
function calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
}
