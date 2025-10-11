// ============================================
// localStorage 진단 테스트 스크립트
// ============================================
// 사용법: 브라우저 개발자 도구 콘솔에서 이 스크립트를 복사-붙여넣기하여 실행

console.log('=== localStorage 진단 시작 ===\n');

// 1. localStorage 사용 가능 여부 확인
function testLocalStorageAvailable() {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('✅ localStorage 사용 가능');
        return true;
    } catch (e) {
        console.error('❌ localStorage 사용 불가:', e.message);
        if (e.name === 'QuotaExceededError') {
            console.error('   → 저장 공간 초과');
        }
        return false;
    }
}

// 2. 현재 저장된 데이터 확인
function checkStoredData() {
    console.log('\n=== 저장된 데이터 확인 ===');

    const keys = [
        'tradingPlatformTrades',
        'tradingPlatformNotes',
        'tradingPlatformPrinciplesData',
        'tradingPlatformPsychologyData',
        'tradingPlatformDailyFees',
        'tradingPlatformLanguage',
        'tradingPlatformMarketDataCache',
        'tradingPlatformApiCallLog',
        'tradingPlatformAlphaVantageApiKey'
    ];

    let totalSize = 0;

    keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            const size = new Blob([data]).size;
            totalSize += size;
            console.log(`✅ ${key}:`);
            console.log(`   크기: ${(size / 1024).toFixed(2)} KB`);

            try {
                if (key === 'tradingPlatformLanguage' || key === 'tradingPlatformAlphaVantageApiKey') {
                    console.log(`   값: ${data}`);
                } else {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        console.log(`   항목 수: ${parsed.length}`);
                        if (parsed.length > 0) {
                            console.log(`   첫 번째 항목:`, parsed[0]);
                        }
                    } else if (typeof parsed === 'object') {
                        const keyCount = Object.keys(parsed).length;
                        console.log(`   키 개수: ${keyCount}`);
                        if (keyCount > 0) {
                            const firstKey = Object.keys(parsed)[0];
                            console.log(`   첫 번째 항목 (${firstKey}):`, parsed[firstKey]);
                        }
                    }
                }
            } catch (e) {
                console.error(`   ⚠️ JSON 파싱 실패:`, e.message);
            }
        } else {
            console.log(`⚪ ${key}: 데이터 없음`);
        }
    });

    console.log(`\n총 사용량: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`남은 공간: 약 ${((5000 - totalSize / 1024)).toFixed(2)} KB (5MB 제한 기준)`);
}

// 3. 저장/로드 테스트
function testSaveLoad() {
    console.log('\n=== 저장/로드 테스트 ===');

    try {
        // 테스트 거래 데이터
        const testTrade = {
            id: Date.now(),
            date: '2025-01-15',
            symbol: 'TEST',
            shares: 100,
            buyPrice: 50,
            sellPrice: 55,
            pnl: 500,
            returnPct: 10,
            amount: 5000,
            entryTime: '09:30',
            exitTime: '10:00',
            holdingMinutes: 30
        };

        console.log('테스트 거래 저장 중...');
        const currentTrades = JSON.parse(localStorage.getItem('tradingPlatformTrades') || '[]');
        currentTrades.push(testTrade);
        localStorage.setItem('tradingPlatformTrades', JSON.stringify(currentTrades));

        // 저장 확인
        const reloaded = JSON.parse(localStorage.getItem('tradingPlatformTrades'));
        const savedTrade = reloaded.find(t => t.id === testTrade.id);

        if (savedTrade) {
            console.log('✅ 저장/로드 성공');
            console.log('   저장된 테스트 거래:', savedTrade);

            // 테스트 데이터 제거
            const filtered = reloaded.filter(t => t.id !== testTrade.id);
            localStorage.setItem('tradingPlatformTrades', JSON.stringify(filtered));
            console.log('✅ 테스트 데이터 정리 완료');
        } else {
            console.error('❌ 저장된 데이터를 찾을 수 없음');
        }
    } catch (e) {
        console.error('❌ 저장/로드 테스트 실패:', e.message);
    }

    // 노트 테스트
    try {
        console.log('\n노트 저장/로드 테스트 중...');
        const testNote = {
            id: Date.now(),
            title: 'Test Note',
            content: 'Test content',
            category: 'general',
            textColor: '#e4e4e7',
            font: "'Inter', sans-serif",
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const currentNotes = JSON.parse(localStorage.getItem('tradingPlatformNotes') || '[]');
        currentNotes.push(testNote);
        localStorage.setItem('tradingPlatformNotes', JSON.stringify(currentNotes));

        // 저장 확인
        const reloadedNotes = JSON.parse(localStorage.getItem('tradingPlatformNotes'));
        const savedNote = reloadedNotes.find(n => n.id === testNote.id);

        if (savedNote) {
            console.log('✅ 노트 저장/로드 성공');
            console.log('   저장된 테스트 노트:', savedNote);

            // 테스트 데이터 제거
            const filteredNotes = reloadedNotes.filter(n => n.id !== testNote.id);
            localStorage.setItem('tradingPlatformNotes', JSON.stringify(filteredNotes));
            console.log('✅ 테스트 노트 정리 완료');
        } else {
            console.error('❌ 저장된 노트를 찾을 수 없음');
        }
    } catch (e) {
        console.error('❌ 노트 저장/로드 테스트 실패:', e.message);
    }
}

// 4. 전역 변수 확인
function checkGlobalVariables() {
    console.log('\n=== 전역 변수 확인 ===');

    const globalVars = [
        'trades',
        'notes',
        'principlesData',
        'dailyFees',
        'currentTradingDate',
        'currentLanguage'
    ];

    globalVars.forEach(varName => {
        if (typeof window[varName] !== 'undefined') {
            console.log(`✅ ${varName}:`, window[varName]);
        } else {
            console.error(`❌ ${varName}: 정의되지 않음`);
        }
    });
}

// 5. 함수 존재 확인
function checkFunctions() {
    console.log('\n=== 필수 함수 확인 ===');

    const functions = [
        'saveTrades',
        'loadTrades',
        'saveNotes',
        'loadNotes',
        'savePrinciplesDataToStorage',
        'loadPrinciplesData'
    ];

    functions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName}() 함수 존재`);
        } else {
            console.error(`❌ ${funcName}() 함수 없음`);
        }
    });
}

// 6. 권한 확인
function checkPermissions() {
    console.log('\n=== 권한 및 환경 확인 ===');

    console.log('프로토콜:', window.location.protocol);
    if (window.location.protocol === 'file:') {
        console.warn('⚠️ file:// 프로토콜 사용 중 - 일부 브라우저에서 localStorage 제한 가능');
    }

    console.log('도메인:', window.location.hostname || 'local file');
    console.log('브라우저:', navigator.userAgent);

    // Private/Incognito 모드 감지 시도
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        console.log('✅ 시크릿 모드 아님');
    } catch (e) {
        console.warn('⚠️ 시크릿/프라이빗 모드일 수 있음');
    }
}

// 모든 테스트 실행
function runAllTests() {
    const available = testLocalStorageAvailable();
    if (available) {
        checkStoredData();
        testSaveLoad();
        checkGlobalVariables();
        checkFunctions();
        checkPermissions();

        console.log('\n=== 진단 완료 ===');
        console.log('\n💡 문제 해결 팁:');
        console.log('1. 위 결과를 확인하여 어떤 데이터가 저장되어 있는지 확인하세요');
        console.log('2. 저장/로드 테스트가 실패하면 브라우저 설정에서 쿠키/스토리지 허용 확인');
        console.log('3. file:// 프로토콜 사용 시 http-server나 Live Server로 실행해보세요');
        console.log('4. 시크릿 모드에서는 데이터가 세션 종료 시 삭제됩니다');
        console.log('5. 저장 공간이 부족하면 오래된 캐시 데이터를 삭제하세요');
    }
}

// 테스트 실행
runAllTests();
