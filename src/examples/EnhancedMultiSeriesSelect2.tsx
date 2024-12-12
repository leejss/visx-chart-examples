import { AxisBottom, AxisLeft } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";
import { defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import { bisector, extent } from "@visx/vendor/d3-array";
import { timeFormat } from "d3-time-format";
import React, { useCallback, useMemo, useState } from "react";
import { generateMultipleSeriesData } from "../lib/data";

// TODO : Each series must have own tooltip
// TODO : 툴팁읍 서로 겹치지 않아야 한다.
// TODO: use GlyphCircle to show the point

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

interface TooltipData {
  date: Date;
  seriesName: string;
  value: number;
  xPos: number;
  yPos: number;
}

// 상수 정의
const formatDate = timeFormat("%Y-%m-%d");
const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

// 개별 시리즈 툴팁 컴포넌트
const SeriesToolTip: React.FC<{
  data: TooltipData;
  color: string;
  index: number;
  total: number;
}> = ({ data, color, index, total }) => {
  const verticalOffset = 40;
  const tooltipSpacing = 10;
  const adjustedTop =
    data.yPos - verticalOffset - (total - 1 - index) * tooltipSpacing;

  return (
    <TooltipWithBounds
      className="pointer-events-none px-2 py-1 rounded shadow-md text-sm inline-block "
      left={data.xPos}
      top={adjustedTop}
      style={{
        ...defaultStyles,
        transition: "all 0.1s ease-out",
        whiteSpace: "nowrap",
        width: "auto",
        backgroundColor: color,
      }}
    >
      <div className="font-medium whitespace-nowrap text-white">
        {data.seriesName} {data.value.toFixed(2)}
      </div>
    </TooltipWithBounds>
  );
};

// 타임스탬프 레이블 컴포넌트
const TimestampLabel: React.FC<{
  date: Date;
  xPos: number;
}> = ({ date, xPos }) => (
  <div
    className="absolute pointer-events-none bg-gray-800 text-white px-2 py-1 rounded text-sm"
    style={{
      left: `${xPos}px`,
      top: "0px",
      transform: "translate(-50%, -100%)",
    }}
  >
    {formatDate(date)}
  </div>
);
const margin = { top: 40, right: 120, bottom: 40, left: 50 };
const EnhancedMultiSeriesChart2: React.FC<MultiSeriesChartProps> = ({
  width = 800,
  height = 400,
  series,
}) => {
  // 차트 여백 설정

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 호버 상태 관리
  const [hoverInfo, setHoverInfo] = useState<{
    tooltips: TooltipData[];
    hoverLineX: number | null;
    date: Date | null;
  }>({
    tooltips: [],
    hoverLineX: null,
    date: null,
  });

  // X축 스케일
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

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      const x = point.x - margin.left;
      const timestamp = xScale.invert(x);
      const date = new Date(timestamp);

      // 각 활성화된 시리즈의 해당 시점 값을 찾음
      const tooltips = series
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
            date: getDate(d),
            seriesName: s.name,
            value: getValue(d),
            xPos: xScale(getDate(d).getTime()) + margin.left,
            yPos: yScale(getValue(d)) + margin.top,
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null);

      setHoverInfo({
        tooltips,
        hoverLineX: x,
        date,
      });
    },
    [xScale, yScale, series],
  );

  // 마우스 이벤트 제거 핸들러
  const handleMouseLeave = useCallback(() => {
    setHoverInfo({
      tooltips: [],
      hoverLineX: null,
      date: null,
    });
  }, []);

  return (
    <div className="relative" style={{ width }}>
      {/* 타임스탬프 레이블 */}
      {hoverInfo.date && hoverInfo.hoverLineX !== null && (
        <TimestampLabel
          date={hoverInfo.date}
          xPos={hoverInfo.hoverLineX + margin.left}
        />
      )}

      {/* 시리즈별 툴팁 - 값이 큰 순서대로 정렬 */}
      {hoverInfo.tooltips
        .sort((a, b) => b.value - a.value)
        .map((tooltip, index) => (
          <SeriesToolTip
            key={tooltip.seriesName}
            data={tooltip}
            index={index}
            total={hoverInfo.tooltips.length}
            color={
              series.find((s) => s.name === tooltip.seriesName)?.color || "#000"
            }
          />
        ))}

      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Vertical Hover Line */}
          {hoverInfo.hoverLineX !== null && (
            <line
              x1={hoverInfo.hoverLineX}
              x2={hoverInfo.hoverLineX}
              y1={0}
              y2={innerHeight}
              stroke="#666"
              strokeWidth={1}
              strokeDasharray="4,4"
              pointerEvents="none"
            />
          )}

          {/* 데이터 라인 및 포인트 */}
          {series.map((s) => (
            <React.Fragment key={s.name}>
              <LinePath
                data={s.data}
                x={(d) => xScale(getDate(d).getTime()) ?? 0}
                y={(d) => yScale(getValue(d)) ?? 0}
                stroke={s.color}
                strokeWidth={2}
              />
              {/* 호버 시 현재 포인트 표시 */}
              {hoverInfo.tooltips
                .filter((t) => t.seriesName === s.name)
                .map((tooltip) => (
                  <Circle
                    key={`point-${tooltip.seriesName}`}
                    cx={xScale(tooltip.date.getTime())}
                    cy={yScale(tooltip.value)}
                    r={4}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
            </React.Fragment>
          ))}

          {/* 마우스 이벤트를 위한 투명한 오버레이 */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* 축 */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickFormat={(val) => formatDate(val as Date)}
          />
          <AxisLeft scale={yScale} />
        </Group>
      </svg>
    </div>
  );
};

// 사용 예시
export const EnhancedChartExample: React.FC = () => {
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

  return (
    <div className="p-4">
      <EnhancedMultiSeriesChart2 width={900} height={400} series={seriesData} />
    </div>
  );
};

export default EnhancedChartExample;
