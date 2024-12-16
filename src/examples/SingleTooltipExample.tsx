import { AxisBottom, AxisRight } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { bisector, extent } from "d3-array";
import { DataPoint, generateFinancialData } from "../lib/data";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { useCallback } from "react";
import { localPoint } from "@visx/event";
import { formatDate } from "date-fns";

// x 축 방향으로 이동, y 축 방향으로 이동 -> left, top 프로퍼티로 조정

export default function SingleTooltipExample() {
  const data = generateFinancialData();
  return <SingleTooltip data={data} width={1600} height={900} />;
  // return (
  //   <ParentSize>
  //     {({ width, height }) => {
  //       return <SingleTooltip data={data} width={width} height={height} />;
  //     }}
  //   </ParentSize>
  // );
}
// Accessor functions

const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;
const SingleTooltip = ({
  data,
  width,
  height,
}: {
  data: DataPoint[];
  width: number;
  height: number;
}) => {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  // Calculate the actual width of the chart area by subtracting horizontal margins
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  // Calculate the actual height of the chart area by subtracting vertical margins
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,

    // 툴팁의 x,y 좌표
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DataPoint>();

  // Create x-axis scale that maps dates to horizontal pixel positions
  // range: maps to pixel coordinates from 0 to chart width
  // domain: maps from min to max dates in the data
  const xScale = scaleLinear({
    range: [0, innerWidth],
    domain: extent(data, (d) => getDate(d).getTime()) as [number, number],
  });

  // Create y-axis scale that maps values to vertical pixel positions
  // range: maps to pixel coordinates from bottom to top of chart
  // domain: maps from min to max values in the data
  const yScale = scaleLinear({
    // 데이터의 최소값은 맨 아래에 위치하고 제일 큰 값은 맨 위에 위치하도록 한다.
    range: [innerHeight, 0],
    domain: extent(data, getValue) as [number, number],
  });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const point = localPoint(event) || { x: 0, y: 0 };
      // Group의 transform을 고려하여 margin.top을 빼줍니다
      const x = point.x - margin.left;
      const y = point.y - margin.top;

      // 차트 영역을 벗어난 경우 툴팁을 표시하지 않습니다
      if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) {
        hideTooltip();
        return;
      }

      const timestamp = xScale.invert(x);
      const date = new Date(timestamp);

      const index = bisectDate(data, date);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (d0 && d1) {
        const isCloserToD1 =
          Math.abs(timestamp - getDate(d0).getTime()) >
          Math.abs(getDate(d1).getTime() - timestamp);

        const tooltipData = isCloserToD1 ? d1 : d0;
        const dataX = xScale(getDate(tooltipData).getTime());
        const dataY = yScale(getValue(tooltipData));

        showTooltip({
          tooltipData,
          // margin.left를 더해서 SVG 내에서의 실제 위치를 계산합니다
          tooltipLeft: dataX + margin.left,
          // margin.top을 더해서 SVG 내에서의 실제 위치를 계산합니다
          tooltipTop: dataY + margin.top,
        });
      }
    },
    [
      showTooltip,
      hideTooltip,
      xScale,
      yScale,
      data,
      margin.left,
      margin.top,
      innerWidth,
      innerHeight,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  return (
    <div>
      <svg width={width} height={height}>
        <Group top={margin.top}>
          {/* AxisRight */}
          <AxisRight
            left={innerWidth}
            scale={yScale}
            label="Value"
            labelOffset={40}
          />
          {/* AxisBottom */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickFormat={(d) => new Date(d as Date).toLocaleDateString()}
            label="Date"
            labelOffset={40}
          />
          {/* LinePath */}
          <LinePath
            data={data}
            x={(d) => xScale(getDate(d).getTime()) ?? 0}
            y={(d) => yScale(getValue(d)) ?? 0}
            stroke="#4f46e5"
            strokeWidth={2}
          />
          {/* GlyphCircle */}

          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </Group>
      </svg>
      {/* TooltipWithBounds */}
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>{formatDate(getDate(tooltipData), "yyyy-MM-dd")}</strong>
            <span>Value: {getValue(tooltipData).toFixed(2)}</span>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};
