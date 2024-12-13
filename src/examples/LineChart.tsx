import React from "react";
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

const data = createDynamicData(50);

const width = 500;
const height = 300;
const margin = { top: 20, right: 20, bottom: 20, left: 40 };

// Translate input data to pixel values
// Mapping: Data space to Screen space

const BasicLineChart: React.FC = () => {
  // x, y 범위 구하기
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  const xDomain = [Math.min(...xValues), Math.max(...xValues)];
  const yDomain = [0, Math.max(...yValues)];

  // Create xScale - 데이터를 픽셀로 변환
  const xScale = scaleLinear<number>({
    domain: xDomain,
    range: [margin.left, width - margin.right],
  });

  // Create yScale
  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [height - margin.bottom, margin.top],
  });

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100">
      <svg
        width={width}
        height={height}
        className="bg-white border border-gray-300 shadow"
      >
        {/* Path creation */}
        <LinePath
          data={data}
          // Data processing
          x={(d) => xScale(d.x) ?? 0}
          y={(d) => yScale(d.y) ?? 0}
          stroke="#4f46e5" // Tailwind Indigo-600
          strokeWidth={2}
        />
      </svg>
    </div>
  );
};

export default BasicLineChart;
