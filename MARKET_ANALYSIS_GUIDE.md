# Market Data Analysis Guide

## 개요
Trading Platform Pro의 시장 데이터 통합 기능이 확장되어 이제 Analytics의 Detail 섹션에서 **종목의 Float, 시가총액, 변동성(Beta), 거래량**을 기반으로 한 성과 분석을 제공합니다.

## 새로 추가된 분석 카드

### 1. **Market Characteristics** (시장 특성 분석)
수익을 낸 종목들의 평균 시장 특성을 분석합니다.

**표시 항목:**
- **Avg Float (Winners)**: 수익 낸 종목들의 평균 유통 주식 수
- **Avg Market Cap (Winners)**: 수익 낸 종목들의 평균 시가총액
- **Avg Beta (Winners)**: 수익 낸 종목들의 평균 변동성
- **Symbols Analyzed**: 분석에 사용된 종목 수

**예시 해석:**
```
Avg Float: 18.5M shares
Avg Market Cap: $1.2B
Avg Beta: 2.3
Symbols Analyzed: 5 / 8
```
→ 당신은 **소형주**(시총 $1.2B), **Float이 작은 종목**(18.5M), **고변동성 종목**(Beta 2.3)에서 수익을 내는 경향이 있습니다.

### 2. **Volume & Liquidity** (거래량 & 유동성)
거래량에 따른 성과를 분석합니다.

**표시 항목:**
- **High Volume Win Rate**: 거래량이 중간값 이상인 날의 승률
- **Low Volume Win Rate**: 거래량이 중간값 이하인 날의 승률
- **Median Volume**: 거래량 중간값

**예시 해석:**
```
High Volume Win Rate: 72.5%
Low Volume Win Rate: 45.2%
Median Volume: 25.3M
```
→ 당신은 **거래량이 높은 날**(25.3M 이상) 승률이 훨씬 높습니다 (72.5% vs 45.2%).
→ 거래량이 적은 종목/시간대 피하기!

### 3. **Volatility Performance** (변동성 성과)
Beta(변동성 지표)에 따른 성과를 분류합니다.

**Beta 분류:**
- **High Volatility**: Beta > 1.5 (시장 대비 50% 이상 변동성)
- **Medium Volatility**: Beta 1.0 - 1.5
- **Low Volatility**: Beta < 1.0

**예시 해석:**
```
High Volatility: 68.0% (25 trades)
Medium Volatility: 52.3% (15 trades)
Low Volatility: 38.5% (8 trades)
```
→ 당신은 **고변동성 종목**(Beta > 1.5)에서 가장 높은 승률(68%)을 보입니다.
→ 안정적인 종목(Beta < 1.0)은 승률이 낮으므로 피하는 것이 좋습니다.

### 4. **Market Cap Preference** (시가총액 선호도)
시가총액별 성과를 분석합니다.

**시총 분류:**
- **Small Cap**: < $2B (소형주)
- **Mid Cap**: $2B - $10B (중형주)
- **Large Cap**: > $10B (대형주)

**표시 형식:** `승률% | 평균손익 (거래수)`

**예시 해석:**
```
Small Cap: 75.0% | $250 (20 trades)
Mid Cap: 55.0% | $150 (10 trades)
Large Cap: 40.0% | $80 (5 trades)
```
→ 당신은 **소형주**에서 최고의 성과를 보입니다 (승률 75%, 평균 수익 $250).
→ 대형주는 승률과 수익이 낮으므로 집중도를 낮추세요.

## 사용 방법

### 1. Analytics 페이지 접속
1. 좌측 메뉴에서 **Analytics** 클릭
2. **Detail** 탭 선택 (기본 활성화됨)
3. 아래로 스크롤하여 새로 추가된 4개의 카드 확인

### 2. 시장 데이터 로딩
- 페이지 접속 시 자동으로 로딩됩니다
- "Loading..." 상태에서 분석 완료까지 약 1-2분 소요 (API rate limit 준수)
- 분석 완료 후 자동으로 데이터 표시

### 3. 데이터 새로고침
- Analytics 페이지를 다시 방문하면 자동 새로고침
- 또는 Settings에서 "Clear Market Data Cache"로 캐시 삭제 후 재로딩

## API 사용량 관리

### Alpha Vantage API 제한
- **5 calls/minute**: 분당 5회 API 호출
- **25 calls/day**: 일일 25회 API 호출

### 최적화 전략
1. **자동 제한**: 시스템이 자동으로 12초 간격으로 API 호출
2. **최대 5개 종목**: 한 번에 최대 5개 종목만 분석
3. **캐싱**:
   - Overview 데이터는 24시간 캐싱
   - Quote 데이터는 5분 캐싱
   - Price context 데이터는 5분 캐싱

### API 호출 절약 팁
- 자주 새로고침하지 말기
- 거래 종목 수를 5개 이하로 유지하면 모든 데이터 확인 가능
- 캐시가 있는 동안에는 API 호출 없음

## 실전 활용 예시

### 시나리오 1: 패턴 발견
```
분석 결과:
- Market Characteristics: Avg Float 15M, Avg Market Cap $800M, Avg Beta 2.5
- Volatility Performance: High Volatility 70%, Low Volatility 30%
- Market Cap Preference: Small Cap 80%, Large Cap 35%
```

**해석:**
당신의 스타일은 **소형 고변동성 종목** 전문입니다.
- Float < 20M
- 시총 < $2B
- Beta > 1.5

**액션:**
앞으로 이 조건에 맞는 종목만 선별적으로 거래!

### 시나리오 2: 약점 발견
```
분석 결과:
- Volume & Liquidity: High Volume 65%, Low Volume 38%
```

**해석:**
거래량이 낮은 날 승률이 크게 떨어집니다.

**액션:**
- 거래 전 당일 거래량 체크
- 거래량 < median이면 거래 자제
- 거래량 > median일 때만 진입

### 시나리오 3: 최적 범위 찾기
```
분석 결과:
- Volatility: High 45%, Medium 68%, Low 52%
```

**해석:**
의외로 **중간 변동성**(Beta 1.0-1.5) 종목에서 가장 좋은 성과.

**액션:**
- 너무 변동성 높은 종목(Beta > 1.5) 피하기
- Beta 1.0-1.5 범위의 종목에 집중

## 데이터 요구사항

### 최소 데이터
- **최소 10개 거래**: 통계적 의미를 위해
- **최소 3개 종목**: 다양성 분석을 위해
- **승리 거래 최소 5개**: Market Characteristics 분석용

### 데이터가 부족할 때
표시되는 메시지:
- **"N/A"**: 해당 분석에 필요한 데이터 없음
- **"Error"**: API 호출 실패 또는 시스템 오류
- **"0 / 0"**: 분석된 종목 없음

## 문제 해결

### "N/A" 또는 "Error" 표시
**원인:**
- API 호출 실패
- 해당 종목에 대한 데이터 없음
- API rate limit 초과

**해결:**
1. 몇 분 후 페이지 새로고침
2. Settings에서 API 키 확인
3. 브라우저 콘솔(F12) 에러 메시지 확인

### 로딩이 너무 느림
**원인:**
- API rate limit 준수를 위한 12초 delay

**해결:**
- 정상입니다. 5개 종목 분석 시 약 1분 소요
- 거래 종목 수를 줄이면 더 빠름

### 일부 카드만 로딩됨
**원인:**
- 특정 분석에 필요한 데이터 부족

**해결:**
- 정상입니다.
- 예: 거래량 분석은 daily data 필요, volatility는 overview 필요
- 더 많은 거래를 기록하면 개선됨

## 고급 활용

### 1. 전략 백테스팅
분석 결과를 바탕으로 새 전략 수립:
```
조건:
- Float < 평균 Float
- Beta > 평균 Beta
- Volume > median
→ 이 조건 만족 시에만 진입
```

### 2. 리스크 관리
```
만약 Beta > 2.0이고 승률이 낮다면:
→ 포지션 크기 줄이기
→ 스탑로스 더 타이트하게
```

### 3. 종목 선별 체크리스트
```
✓ Float < 30M?
✓ Market Cap < $5B?
✓ Beta 1.0-2.0 범위?
✓ Volume > 20M?
→ 4개 모두 만족 시 거래
```

## 데이터 프라이버시

모든 시장 데이터는:
- Alpha Vantage에서 직접 가져옴
- 브라우저 로컬스토리지에만 저장
- 외부 서버로 전송되지 않음
- 브라우저 데이터 삭제 시 함께 삭제

---

## 요약

**새 기능:**
- ✅ 수익 종목의 평균 Float, 시가총액, Beta 분석
- ✅ 거래량에 따른 승률 비교
- ✅ 변동성별 성과 분석
- ✅ 시가총액별 성과 분석

**핵심 장점:**
- 자신의 트레이딩 스타일과 수익 패턴을 시장 데이터와 연결
- 어떤 종류의 종목에서 잘하는지 객관적으로 확인
- 데이터 기반 종목 선별 기준 수립

**활용 방법:**
1. Analytics → Detail로 이동
2. 4개 새 카드 확인
3. 자신의 강점/약점 패턴 파악
4. 수익 패턴에 맞는 종목만 선별적 거래

🎯 **목표: 데이터 기반 의사결정으로 승률 향상!**
