import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { DataPoint, getExampleData } from "../lib/data";
import { scaleLinear } from "@visx/scale";
import { bisector, extent } from "d3-array";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ParentSize } from "@visx/responsive";
import { TooltipWithBounds, useTooltip, defaultStyles } from "@visx/tooltip";
import { useCallback } from "react";
import { localPoint } from "@visx/event";
import { GlyphCircle } from "@visx/glyph";

// TODO: add tooltip
// TODO: Understanding how showing a tooltip works
// TODO: add point

const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;

type LineChartProps = {
  width: number;
  height: number;
};

const bisectDate = bisector<DataPoint, Date>(getDate).left;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };
const { basicData } = getExampleData();
function LineChart({ width, height }: LineChartProps) {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
  } = useTooltip<DataPoint>();

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  // Scale creation - transforms data values to pixel values
  const xScale = scaleLinear({
    range: [0, innerWidth],
    domain: extent(basicData, getDate) as [Date, Date],
    nice: true,
  });

  const yScale = scaleLinear({
    range: [innerHeight, 0],
    domain: extent(basicData, getValue) as [number, number],
    nice: true,
  });

  const handleTooltip = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // Get coordinates from the event
      const { x } = localPoint(event) || { x: 0, y: 0 };
      // Get the data from the x coordinate
      const date = xScale.invert(x);
      // Get the index of the data from the x0
      const index = bisectDate(basicData, new Date(date));
      // Get the data from the index

      const d0 = basicData[index - 1];
      const d1 = basicData[index];
      let d = d0;

      if (d1 && getDate(d1)) {
        d =
          date.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - date.valueOf()
            ? d1
            : d0;
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: xScale(getDate(d)) + margin.left,
        tooltipTop: yScale(getValue(d)) + margin.top,
      });
    },
    [xScale, yScale, showTooltip],
  );

  return (
    <svg width={width} height={height}>
      {/* Group component handles margin and groups related elements */}
      <Group left={margin.left} top={margin.top}>
        {/* Draw the line path */}
        <LinePath
          data={basicData}
          x={(d) => xScale(getDate(d)) ?? 0}
          y={(d) => yScale(getValue(d)) ?? 0}
          stroke="#4f46e5"
          strokeWidth={2}
        />

        {/* Add axes */}
        <AxisLeft scale={yScale} label="Value" labelOffset={40} />
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          tickFormat={(d) => new Date(d as Date).toLocaleDateString()}
          label="Date"
          labelOffset={40}
        />

        {tooltipData ? (
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              // backgroundColor: "black",
              // border: "1px solid #ccc",
              // padding: "10px",
              // color: "#fff",
            }}
          >
            <p>{`Value: ${getValue(tooltipData).toFixed(2)}`}</p>
            <p>{`Date: ${getDate(tooltipData)}`}</p>
          </TooltipWithBounds>
        ) : null}

        {tooltipData && (
          <g>
            <GlyphCircle
              left={xScale(getDate(tooltipData))}
              top={yScale(getValue(tooltipData))}
              size={110}
              fill={"blue"}
              stroke={"white"}
              strokeWidth={2}
            />
          </g>
        )}

        {/* Hover Event area */}
        <rect
          x={0}
          y={0}
          width={innerWidth}
          fill="transparent"
          height={innerHeight}
          onMouseMove={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseLeave={() => {
            hideTooltip();
          }}
          onTouchEnd={hideTooltip}
        />
      </Group>
    </svg>
  );
}

// Wrapper component that makes the chart responsive
export default function LineChartExample2() {
  return (
    <div className="relative" style={{ width: "100%", height: "500px" }}>
      <ParentSize>
        {({ width, height }) => <LineChart width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
