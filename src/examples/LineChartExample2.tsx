import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { DataPoint, getExampleData } from "../lib/data";
import { scaleLinear } from "@visx/scale";
import { extent } from "d3-array";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { ParentSize } from "@visx/responsive";

const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;

type LineChartProps = {
  width: number;
  height: number;
};

function LineChart({ width, height }: LineChartProps) {
  const { basicData } = getExampleData();
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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
      </Group>
    </svg>
  );
}

// Wrapper component that makes the chart responsive
export default function LineChartExample2() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ParentSize>
        {({ width, height }) => <LineChart width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
