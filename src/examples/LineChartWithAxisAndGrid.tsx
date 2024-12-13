import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";

type DataPoint = { x: number; y: number };
const createDynamicData = (length: number): DataPoint[] => {
  const data = new Array(length).fill(0).map((_, i) => ({
    x: i,
    y: Math.random() * 100,
  }));

  return data;
};

// 예제 데이터
const data = createDynamicData(50);

const width = 500;
const height = 300;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
// bottom margin을 조금 늘려 축 레이블이 겹치지 않게 함

const LineChartWithAxisAndGrid = () => {
  // x, y 범위 계산
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  const xDomain = [Math.min(...xValues), Math.max(...xValues)];
  const yDomain = [0, Math.max(...yValues)];

  // scale 정의
  const xScale = scaleLinear<number>({
    domain: xDomain,
    range: [margin.left, width - margin.right],
  });

  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [height - margin.bottom, margin.top],
    nice: true, // tick을 조금 더 보기 좋게
  });

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100">
      <svg
        width={width}
        height={height}
        className="bg-white border border-gray-300 shadow"
      >
        {/* Grid */}
        <GridRows
          scale={yScale}
          width={width - margin.left - margin.right}
          stroke="#e2e8f0" // tailwind gray-200
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
          stroke="#4f46e5" // Indigo-600
          strokeWidth={2}
        />

        {/* Axis: Bottom */}
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

        {/* Axis: Left */}
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
    </div>
  );
};

export default LineChartWithAxisAndGrid;
