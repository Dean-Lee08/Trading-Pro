/* utils.js — 공용 헬퍼(교체용) */

/* 간단 DOM 헬퍼 (null-safe) */
function _el(id) {
  if (!id) return null;
  return document.getElementById(id);
}

/* EST trading date helper (간단 버전) */
function getESTTradingDate(date = new Date()) {
  // 현재는 단순히 Date 객체로 반환. 필요하면 TZ 변환 로직 보강 가능.
  return new Date(date);
}

/* YYYY-MM-DD 형식 (storage key 등) */
function formatTradingDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* Chart 로딩 대기 (Chart.js 비동기 로딩 대비) */
function waitForChart(timeout = 5000) {
  return new Promise(resolve => {
    if (typeof Chart !== 'undefined') return resolve();
    const start = Date.now();
    const t = setInterval(() => {
      if (typeof Chart !== 'undefined' || (Date.now() - start) > timeout) {
        clearInterval(t);
        resolve();
      }
    }, 100);
  });
}

/* 토스트 알림 (toastNotification id 사용) */
function showToast(message) {
  const toast = _el('toastNotification');
  if (!toast) {
    console.warn('toastNotification element not found:', message);
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

/* 페이지 내 data-lang 요소를 translations에 따라 업데이트 */
function updateLanguage() {
  if (!window.translations || !window.translations[currentLanguage]) {
    console.warn('translations or translations[currentLanguage] missing');
    return;
  }
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    const translated = translations[currentLanguage] && translations[currentLanguage][key];
    if (translated) {
      if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') && element.hasAttribute('placeholder')) {
        element.placeholder = translated;
      } else {
        element.textContent = translated;
      }
    }
  });
}

/* Settings 언어 선택 변경 핸들러 (index.html의 select onchange 바인딩) */
function changeLanguageFromSettings() {
  const select = _el('settingsLanguageSelect');
  if (!select) return;
  currentLanguage = select.value || currentLanguage;
  localStorage.setItem('tradingPlatformLanguage', currentLanguage);
  updateLanguage();
  // UI 갱신 함수들 호출 — 존재하면 호출
  try { updateStats(); } catch(e) {}
  try { updateDetailedAnalytics(); } catch(e) {}
}

/* 안전한 showPage (inline onclick로 호출되어도 event 에러 방지) */
function showPage(pageId) {
  try {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const page = _el(pageId);
    if (page) page.classList.add('active');

    // nav item 활성화 : onclick 속성으로 찾기 (안전)
    const navItem = document.querySelector(`.nav-item[onclick*="showPage('${pageId}')"]`);
    if (navItem) navItem.classList.add('active');
    else {
      // fallback: event.target 기반 (이전 코드와 호환)
      try { event.target.closest('.nav-item')?.classList.add('active'); } catch(e) {}
    }

    if (pageId === 'analysis' || pageId === 'analytics') {
      // analytics safe update
      setTimeout(() => {
        updateDetailedAnalytics();
        if (currentAnalyticsSection === 'detail') setTimeout(() => { if (typeof updateBasicCharts === 'function') updateBasicCharts(); }, 100);
        else setTimeout(() => { if (typeof updateAdvancedCharts === 'function') updateAdvancedCharts(); }, 100);
      }, 50);
    }

    if (pageId === 'notes') {
      try { renderAllNotesSections(); } catch(e) {}
    }

    if (pageId === 'psychology') {
      setTimeout(() => {
        try { loadPsychologyData(); } catch(e) {}
        try { updatePsychologyMetrics(); } catch(e) {}
      }, 80);
    }

    // mobile sidebar auto-close
    if (window.innerWidth <= 768) {
      const sidebar = _el('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
  } catch (err) {
    console.error('showPage error:', err);
  }
}

/* 사이드바 토글 */
function toggleSidebar() {
  const sidebar = _el('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

/* 날짜 표시 업데이트 (헤더) */
function updateCurrentDateDisplay() {
  const el = _el('currentDateDisplay');
  if (!el) return;
  try {
    const locale = currentLanguage === 'ko' ? 'ko-KR' : 'en-US';
    el.textContent = currentTradingDate.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch(e) {
    el.textContent = formatTradingDate(currentTradingDate);
  }
}

/* Date picker modal 핸들러 (index.html에서 사용) */
function openDatePicker() {
  const modal = _el('datePickerModal');
  const input = _el('datePickerInput');
  if (!modal || !input) return;
  const est = getESTTradingDate(currentTradingDate);
  input.value = formatTradingDate(est);
  modal.style.display = 'flex';
}
function closeDatePicker() {
  const modal = _el('datePickerModal');
  if (!modal) return;
  modal.style.display = 'none';
}
function applySelectedDate() {
  const input = _el('datePickerInput');
  if (!input || !input.value) return;
  currentTradingDate = new Date(input.value + 'T00:00:00');
  updateCurrentDateDisplay();
  // 페이지들에 반영
  try { loadPsychologyData(); updatePsychologyMetrics(); } catch(e) {}
  try { renderCalendar(); } catch(e) {}
  try { updateStats(); } catch(e) {}
  closeDatePicker();
}

/* -------------------------------
   Analytics 안전 래퍼 — analytics.js가 늦게 로드될 때 대비
   - updateDetailedAnalytics(): analytics 종합 업데이트 요청
   - showAnalyticsSection(): analytics 탭 전환 (fallback)
   - setAnalyticsPeriod(): period 변경
   ------------------------------- */
function updateDetailedAnalytics() {
  // analytics.js에 실제 구현(updateBasicCharts/updateAdvancedCharts 등)이 있으면 그걸 사용
  if (typeof updateBasicCharts === 'function' || typeof updateAdvancedCharts === 'function') {
    try {
      if (currentAnalyticsSection === 'detail') {
        if (typeof updateBasicCharts === 'function') updateBasicCharts();
      } else {
        if (typeof updateAdvancedCharts === 'function') updateAdvancedCharts();
      }
    } catch (e) {
      console.warn('updateDetailedAnalytics: chart update failed', e);
    }
    return;
  }
  // analytics 로직 미로드 상태: no-op
  console.warn('updateDetailedAnalytics: analytics functions not loaded yet.');
}

function showAnalyticsSection(sectionName) {
  // If analytics.js defines a different implementation later it will override, so this safe fallback is OK.
  currentAnalyticsSection = sectionName;
  document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
  const btn = document.querySelector(`.analytics-tab[onclick*="showAnalyticsSection('${sectionName}')"]`);
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.detail-section, .chart-section').forEach(s => s.classList.remove('active'));
  if (sectionName === 'detail') {
    const el = _el('detailSection'); if (el) el.classList.add('active');
    setTimeout(() => updateDetailedAnalytics(), 80);
  } else if (sectionName === 'charts') {
    const el = _el('chartSection'); if (el) el.classList.add('active');
    setTimeout(() => updateDetailedAnalytics(), 80);
  }
}

function setAnalyticsPeriod(period) {
  analyticsPeriod = period;
  try { updateDetailedAnalytics(); } catch(e) {}
}
