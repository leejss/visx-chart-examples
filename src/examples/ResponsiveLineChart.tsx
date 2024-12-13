import React from "react";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { ParentSize } from "@visx/responsive";

type DataPoint = { x: number; y: number };

const data: DataPoint[] = [
  { x: 0, y: 10 },
  { x: 10, y: 20 },
  { x: 20, y: 15 },
  { x: 30, y: 25 },
  { x: 40, y: 18 },
];

const margin = { top: 20, right: 20, bottom: 40, left: 40 };

// 차트를 그리는 부분을 별도 컴포넌트로 분리해 width, height를 props로 받는다.
interface ChartProps {
  width: number;
  height: number;
}

const ResponsiveLineChartInner: React.FC<ChartProps> = ({ width, height }) => {
  if (width < 10) return null; // width가 너무 작으면 렌더링 생략
  if (height < 10) return null;

  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  const xDomain = [Math.min(...xValues), Math.max(...xValues)];
  const yDomain = [0, Math.max(...yValues)];

  const xScale = scaleLinear<number>({
    domain: xDomain,
    range: [margin.left, width - margin.right],
  });

  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [height - margin.bottom, margin.top],
    nice: true,
  });

  return (
    <svg
      width={width}
      height={height}
      className="bg-white border border-gray-300 shadow"
    >
      {/* Grid */}
      <GridRows
        scale={yScale}
        width={width - margin.left - margin.right}
        stroke="#e2e8f0"
        left={margin.left}
      />
      <GridColumns
        scale={xScale}
        height={height - margin.top - margin.bottom}
        stroke="#e2e8f0"
        top={margin.top}
      />

      {/* LinePath */}
      <LinePath
        data={data}
        x={(d) => xScale(d.x) ?? 0}
        y={(d) => yScale(d.y) ?? 0}
        stroke="#4f46e5"
        strokeWidth={2}
      />

      {/* Axis Bottom */}
      <AxisBottom
        top={height - margin.bottom}
        scale={xScale}
        stroke="#4f46e5"
        tickStroke="#4f46e5"
        tickLabelProps={() => ({
          fill: "#4f46e5",
          fontSize: 12,
          textAnchor: "middle",
        })}
      />

      {/* Axis Left */}
      <AxisLeft
        left={margin.left}
        scale={yScale}
        stroke="#4f46e5"
        tickStroke="#4f46e5"
        tickLabelProps={() => ({
          fill: "#4f46e5",
          fontSize: 12,
          textAnchor: "end",
          dx: "-0.5em",
        })}
      />
    </svg>
  );
};

// 실제 렌더링은 ParentSize를 이용해 래퍼 div의 크기를 가져온 뒤, 그 값을 ResponsiveLineChartInner에 전달

// ParentSize 컴포넌트를 이용하여 차트의 사이즈를 조정한다.
const ResponsiveLineChart = () => {
  return (
    <div
      className="flex items-center justify-center p-4 bg-gray-100"
      style={{ width: "100%", height: "400px" }}
    >
      {/* debounceTime을 설정하여 반응 속도를 조정할 수 있다. */}
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <ResponsiveLineChartInner width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
};

export default ResponsiveLineChart;
