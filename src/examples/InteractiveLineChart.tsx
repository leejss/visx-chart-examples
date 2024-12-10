import React, { useMemo, useState, useCallback } from "react";
import { scaleLinear } from "@visx/scale";
import { line, curveMonotoneX } from "d3-shape";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { Grid } from "@visx/grid";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { extent, bisector } from "d3-array";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { timeFormat } from "d3-time-format";

// 데이터 포인트 타입 정의
interface DataPoint {
  date: Date;
  value: number;
}

// 실제 차트 컴포넌트에 전달될 props 타입 정의
interface LineChartProps {
  width: number;
  height: number;
  data: DataPoint[];
}

// 날짜 포맷터 설정
const formatDate = timeFormat("%Y-%m-%d");

// 데이터 접근자 함수들
const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

const InteractiveLineChart: React.FC<LineChartProps> = ({
  width = 800,
  height = 400,
  data,
}) => {
  // Set avg dimension
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DataPoint>();

  // 호버 라인의 위치를 저장하는 상태
  const [hoverLineX, setHoverLineX] = useState<number | null>(null);

  // X축 스케일 (시간)
  const xScale = useMemo(() => {
    const domain = extent(data, getDate) as [Date, Date];
    return scaleLinear({
      range: [0, innerWidth],
      domain: [domain[0].getTime(), domain[1].getTime()],
    });
  }, [data, innerWidth]);

  // Y축 스케일
  const yScale = useMemo(() => {
    const domain = extent(data, getValue) as [number, number];
    const padding = (domain[1] - domain[0]) * 0.1;
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [domain[0] - padding, domain[1] + padding],
      nice: true,
    });
  }, [data, innerHeight]);

  // 라인 생성기
  // The .x() method defines how to get the x-coordinate, converting dates to timestamps and then to pixel values using xScale
  // The .y() method defines how to get the y-coordinate, using yScale to convert data values to pixel positions
  // The .curve(curveMonotoneX) method sets the interpolation method between points to create a smooth, monotonic line that preserves monotonicity in the data
  // Converting data points to a line path
  const linePath = useMemo(() => {
    const lineGenerator = line<DataPoint>()
      .x((d) => xScale(getDate(d).getTime()))
      .y((d) => yScale(getValue(d)))
      .curve(curveMonotoneX);

    return lineGenerator(data);
  }, [data, xScale, yScale]);

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      const x = point.x - margin.left;

      // x 좌표로부터 시간 값 계산
      // xScale : input data를 픽셀로 변환
      // xScale.invert : 픽셀를 input data으로 변환
      const timestamp = xScale.invert(x);

      // 가장 가까운 데이터 포인트 찾기

      // Role of bisectDate: Given a sorted array and a value, returns the index of the array element closest to the value
      const index = bisectDate(data, new Date(timestamp));
      const d0 = data[index - 1];
      const d1 = data[index];

      if (d0 && d1) {
        // 삼항 연산자를 사용하여 d0와 d1 중 timestamp와 더 가까운 포인트를 선택합니다
        const isCloserToD1 =
          timestamp - getDate(d0).getTime() > getDate(d1).getTime() - timestamp;

        const tooltipData = isCloserToD1 ? d1 : d0;

        showTooltip({
          tooltipData,
          tooltipLeft: xScale(getDate(tooltipData).getTime()) + margin.left,
          tooltipTop: yScale(getValue(tooltipData)) + margin.top,
        });

        // Convert timestamp to x-coordinate
        setHoverLineX(xScale(getDate(tooltipData).getTime()));
      }
    },
    [showTooltip, xScale, yScale, data, margin],
  );

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <LinearGradient
          id="area-gradient"
          from="#2196f3"
          to="#2196f3"
          fromOpacity={0.4}
          toOpacity={0}
        />

        {/* Add margin */}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 그리드 */}
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            strokeOpacity={0.4}
            numTicksRows={5}
            numTicksColumns={10}
          />

          {/* 데이터 라인 */}
          <path
            d={linePath || ""}
            stroke="#2196f3"
            strokeWidth={2}
            fill="none"
          />

          {/* Event capture area */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              hideTooltip();
              setHoverLineX(null);
            }}
          />

          {/* 호버 라인 */}
          {hoverLineX !== null && (
            <line
              x1={hoverLineX}
              x2={hoverLineX}
              y1={0}
              y2={innerHeight}
              stroke="#000"
              strokeWidth={1}
              strokeOpacity={0.2}
              // strokeDasharray="4,4"
              pointerEvents="none"
            />
          )}

          {/* 축 */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickFormat={(val) => formatDate(new Date(val))}
            stroke="#888888"
            tickStroke="#888888"
            label="Date"
          />

          <AxisLeft
            scale={yScale}
            stroke="#888888"
            tickStroke="#888888"
            label="Value"
          />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()} // 툴팁 위치 업데이트를 위한 key
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            background: "rgba(255, 255, 255, 0.95)",
            padding: "0.5rem",
            border: "1px solid #ddd",
            color: "#333",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>{formatDate(getDate(tooltipData))}</strong>
            <span>Value: {getValue(tooltipData).toFixed(2)}</span>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default InteractiveLineChart;
