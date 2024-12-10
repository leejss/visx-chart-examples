import React, { useMemo, useState, useCallback } from "react";
import { scaleLinear } from "@visx/scale";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { Grid } from "@visx/grid";
import { curveMonotoneX } from "@visx/curve";
import { localPoint } from "@visx/event";
import { extent, bisector } from "@visx/vendor/d3-array";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { timeFormat } from "d3-time-format";
import { line } from "d3-shape";
import { generateMultipleSeriesData } from "../lib/data";

// 타입 정의
interface DataPoint {
  date: Date;
  value: number;
}

interface Series {
  name: string;
  data: DataPoint[];
  color: string;
}

interface MultiSeriesChartProps {
  width: number;
  height: number;
  series: Series[];
}

// 상수 정의
const formatDate = timeFormat("%Y-%m-%d");
const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

// 범례 아이템 컴포넌트
const LegendItem: React.FC<{
  name: string;
  color: string;
  isActive: boolean;
  onToggle: () => void;
}> = ({ name, color, isActive, onToggle }) => (
  <div
    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
    onClick={onToggle}
    style={{ opacity: isActive ? 1 : 0.3 }}
  >
    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
    <span>{name}</span>
  </div>
);

const MultiSeriesLineChart: React.FC<MultiSeriesChartProps> = ({
  width = 800,
  height = 400,
  series,
}) => {
  // 차트 여백 설정
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Control visibility of series
  const [activeSeriesNames, setActiveSeriesNames] = useState<Set<string>>(
    new Set(series.map((s) => s.name)),
  );

  // 툴팁 상태 관리
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<{
    date: Date;
    values: { name: string; value: number; color: string }[];
  }>();

  // X축 스케일 (시간)
  const xScale = useMemo(() => {
    const allDates = series.flatMap((s) => s.data.map(getDate));
    const domain = extent(allDates) as [Date, Date];
    return scaleLinear({
      range: [0, innerWidth],
      domain: [domain[0].getTime(), domain[1].getTime()],
    });
  }, [series, innerWidth]);

  // Y축 스케일
  const yScale = useMemo(() => {
    const allValues = series.flatMap((s) => s.data.map(getValue));
    const domain = extent(allValues) as [number, number];
    const padding = (domain[1] - domain[0]) * 0.1;
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [domain[0] - padding, domain[1] + padding],
      nice: true,
    });
  }, [series, innerHeight]);

  // 라인 생성기

  // Role of createLinePath: createLinePath is a function that takes an array of DataPoint objects as input and returns a string that represents the SVG path data for a line chart.
  const createLinePath = useCallback(
    (data: DataPoint[]) => {
      const lineGenerator = line<DataPoint>()
        // DataPoint to pixel position
        .x((d) => xScale(getDate(d).getTime()))
        .y((d) => yScale(getValue(d)))
        .curve(curveMonotoneX);

      return lineGenerator(data);
    },
    [xScale, yScale],
  );

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      const x = point.x - margin.left;

      const timestamp = xScale.invert(x);
      const date = new Date(timestamp);

      // 각 활성화된 시리즈의 해당 시점 값을 찾음
      const values = series
        .filter((s) => activeSeriesNames.has(s.name))
        .map((s) => {
          const index = bisectDate(s.data, date);
          const d0 = s.data[index - 1];
          const d1 = s.data[index];
          if (!d0 || !d1) return null;

          const d =
            timestamp - getDate(d0).getTime() >
            getDate(d1).getTime() - timestamp
              ? d1
              : d0;

          return {
            name: s.name,
            value: getValue(d),
            color: s.color,
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      if (values.length > 0) {
        showTooltip({
          tooltipData: {
            date: new Date(timestamp),
            values,
          },
          tooltipLeft: xScale(timestamp) + margin.left,
          tooltipTop: point.y,
        });
      }
    },
    [showTooltip, xScale, series, activeSeriesNames, margin],
  );

  // 시리즈 토글 핸들러
  const toggleSeries = useCallback((seriesName: string) => {
    setActiveSeriesNames((prev) => {
      const next = new Set(prev);
      if (next.has(seriesName)) {
        next.delete(seriesName);
      } else {
        next.add(seriesName);
      }
      return next;
    });
  }, []);

  return (
    <div className="relative" style={{ width }}>
      {/* 범례 */}
      <div
        className="absolute right-0 top-0 bg-white p-2 rounded shadow-sm"
        style={{ width: margin.right - 10 }}
      >
        {series.map((s) => (
          <LegendItem
            key={s.name}
            name={s.name}
            color={s.color}
            isActive={activeSeriesNames.has(s.name)}
            onToggle={() => toggleSeries(s.name)}
          />
        ))}
      </div>

      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 그리드 */}
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            strokeOpacity={0.2}
            numTicksRows={5}
            numTicksColumns={10}
          />

          {/* 데이터 라인 */}
          {series.map(
            (s) =>
              activeSeriesNames.has(s.name) && (
                <g key={s.name}>
                  <path
                    d={createLinePath(s.data) || ""}
                    stroke={s.color}
                    strokeWidth={2}
                    fill="none"
                    opacity={0.8}
                  />
                </g>
              ),
          )}

          {/* 마우스 이벤트를 위한 투명한 오버레이 */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={hideTooltip}
          />

          {/* 축 */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickFormat={(val) => formatDate(val as Date)}
          />
          <AxisLeft scale={yScale} />
        </g>
      </svg>

      {/* 툴팁 */}
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "0.5rem",
            border: "1px solid #ddd",
          }}
        >
          <div className="font-medium">{formatDate(tooltipData.date)}</div>
          {tooltipData.values.map((v) => (
            <div key={v.name} className="flex items-center gap-2 mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              <span>
                {v.name}: {v.value.toFixed(2)}
              </span>
            </div>
          ))}
        </TooltipWithBounds>
      )}
    </div>
  );
};

// 사용 예시
export const MultiSeriesChartExample: React.FC = () => {
  // 데이터 생성
  const seriesData = useMemo(() => {
    const colors = ["#2196f3", "#f44336", "#4caf50", "#ff9800"];
    return generateMultipleSeriesData(4, {
      numberOfDays: 90,
      hasWeekends: false,
    }).map((series, i) => ({
      ...series,
      color: colors[i],
    }));
  }, []);

  console.log(seriesData);

  // Get acutal data from seriesData

  return (
    <div className="p-4">
      <MultiSeriesLineChart width={900} height={400} series={seriesData} />
    </div>
  );
};

export default MultiSeriesChartExample;
