import { AxisBottom, AxisRight } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";

// 차트의 사이즈와 마진 정의
const width = 1000;
const height = 700;

const margin = {
  top: 20,
  right: 30,
  bottom: 60,
  left: 60,
};

const createDynamicData = (length: number) => {
  const data = new Array(length).fill(0).map((_, i) => ({
    x: i,
    y: Math.random() * 100,
  }));

  return data;
};

// 예제 데이터
const data = createDynamicData(50);

export default function LineChartWithAxisAndGridCopy() {
  // x, y 값
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  // x, y 축 범위

  const xDomain = [Math.min(...xValues), Math.max(...xValues)];
  const yDomain = [0, Math.max(...yValues)];

  // Scale 정의
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
    <div className="flex items-center justify-center p-4 bg-gray-100">
      {/* svg area */}
      <svg
        width={width}
        height={height}
        className="bg-white border border-gray-300 shadow"
      >
        <GridRows
          stroke="#e2e8f0"
          scale={yScale}
          left={margin.left}
          width={width - margin.left - margin.right}
        />
        <GridColumns
          scale={xScale}
          height={height - margin.top - margin.bottom}
          stroke="#e2e8f0"
          top={margin.top}
        />
        <LinePath
          data={data}
          x={(value) => xScale(value.x)}
          y={(value) => yScale(value.y)}
          stroke="#4f46e5"
          strokeWidth={2}
        />

        {/* Intervals of axis */}
        <AxisBottom
          top={height - margin.bottom}
          scale={xScale}
          stroke="#4f46e5"
          numTicks={5}
          tickStroke="#4f46e5"
          tickLabelProps={() => ({
            fill: "#4f46e5",
            fontSize: 12,
            textAnchor: "middle",
          })}
        />
        <AxisRight
          left={width - margin.right}
          scale={yScale}
          numTicks={5}
          stroke=""
          tickStroke=""
          tickLabelProps={() => ({
            fill: "#4f46e5",
            fontSize: 12,
            // textAnchor: "end",
            // dx: "-0.5em",
          })}
        />
      </svg>
    </div>
  );
}

// // 1. numTicks를 사용한 간단한 방법
// <AxisBottom
//   top={height - margin.bottom}
//   scale={xScale}
//   // 표시할 tick 개수를 지정
//   numTicks={10}
//   ...
// />

// // 2. tickValues를 사용한 상세 커스텀 방법
// <AxisBottom
//   top={height - margin.bottom}
//   scale={xScale}
//   // 직접 표시할 값들을 지정
//   tickValues={[0, 10, 20, 30, 40, 50]}
//   ...
// />

// // 3. 동적으로 tickValues 생성하는 방법
// const generateTickValues = (start: number, end: number, step: number) => {
//   // start부터 end까지 step 간격으로 배열 생성
//   return Array.from(
//     {length: Math.floor((end - start) / step) + 1},
//     (_, i) => start + (i * step)
//   );
// }

// <AxisBottom
//   top={height - margin.bottom}
//   scale={xScale}
//   // 5단위로 틱 표시
//   tickValues={generateTickValues(xDomain[0], xDomain[1], 5)}
//   ...
// />
