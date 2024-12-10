import { addDays, subDays } from "date-fns";

interface DataPoint {
  date: Date;
  value: number;
}

interface GeneratorOptions {
  startDate?: Date;
  numberOfDays?: number;
  initialValue?: number;
  volatility?: number;
  trend?: number;
  seasonality?: number;
  hasWeekends?: boolean;
}

/**
 * 현실적인 금융 데이터를 생성하는 함수
 *
 * @param options 데이터 생성 옵션
 * - startDate: 시작 날짜 (기본값: 90일 전)
 * - numberOfDays: 생성할 데이터 포인트 수 (기본값: 90)
 * - initialValue: 초기값 (기본값: 100)
 * - volatility: 변동성 (기본값: 0.02)
 * - trend: 전반적인 상승/하락 트렌드 (기본값: 0.0002)
 * - seasonality: 계절성 변동의 강도 (기본값: 5)
 * - hasWeekends: 주말 포함 여부 (기본값: false)
 */
export function generateFinancialData({
  startDate = subDays(new Date(), 90),
  numberOfDays = 90,
  initialValue = 100,
  volatility = 0.02,
  trend = 0.0002,
  seasonality = 5,
  hasWeekends = false,
}: GeneratorOptions = {}): DataPoint[] {
  const data: DataPoint[] = [];
  let currentValue = initialValue;
  let currentDate = startDate;

  // 브라운 운동(Random Walk)과 트렌드를 결합하여 데이터 생성
  for (let i = 0; i < numberOfDays; i++) {
    // 주말 제외 옵션 처리
    if (!hasWeekends) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate = addDays(currentDate, 1);
        continue;
      }
    }

    // 1. 랜덤 워크 컴포넌트 (브라운 운동)
    const randomWalk = (Math.random() - 0.5) * 2 * volatility * currentValue;

    // 2. 트렌드 컴포넌트
    const trendComponent = currentValue * trend;

    // 3. 계절성 컴포넌트 (사인파)
    const seasonalComponent = Math.sin(i / 10) * seasonality;

    // 4. 노이즈 추가 (미세한 랜덤 변동)
    const noise = (Math.random() - 0.5) * volatility * 0.5;

    // 모든 컴포넌트를 결합하여 새로운 값 계산
    currentValue = Math.max(
      0, // 음수 방지
      currentValue + randomWalk + trendComponent + seasonalComponent + noise,
    );

    // 데이터 포인트 추가
    data.push({
      date: new Date(currentDate),
      value: Number(currentValue.toFixed(2)),
    });

    // 다음 날짜로 이동
    currentDate = addDays(currentDate, 1);
  }

  return data;
}

/**
 * 여러 시리즈의 데이터를 생성하는 함수
 * 예: 여러 주식이나 지표의 비교 데이터
 */
export function generateMultipleSeriesData(
  numberOfSeries: number,
  baseOptions: GeneratorOptions = {},
): Array<{ name: string; data: DataPoint[] }> {
  return Array.from({ length: numberOfSeries }, (_, i) => ({
    name: `Series ${i + 1}`,
    data: generateFinancialData({
      ...baseOptions,
      initialValue: 100 + Math.random() * 50,
      volatility: 0.02 + Math.random() * 0.01,
      trend: 0.0002 + (Math.random() - 0.5) * 0.0004,
    }),
  }));
}

// 사용 예시와 테스트를 위한 데이터 생성
export function getExampleData() {
  // 1. 기본 시계열 데이터
  const basicData = generateFinancialData({
    numberOfDays: 90,
    initialValue: 100,
    volatility: 0.015,
    trend: 0.0003,
    seasonality: 3,
  });

  // 2. 강한 상승 트렌드를 가진 데이터
  const bullishData = generateFinancialData({
    numberOfDays: 90,
    initialValue: 100,
    volatility: 0.02,
    trend: 0.001,
    seasonality: 2,
  });

  // 3. 높은 변동성을 가진 데이터
  const volatileData = generateFinancialData({
    numberOfDays: 90,
    initialValue: 100,
    volatility: 0.04,
    trend: 0,
    seasonality: 8,
  });

  // 4. 여러 시리즈 비교 데이터
  const multipleSeriesData = generateMultipleSeriesData(3, {
    numberOfDays: 90,
    hasWeekends: false,
  });

  return {
    basicData,
    bullishData,
    volatileData,
    multipleSeriesData,
  };
}
