import { animated, to, useSpring } from "@react-spring/web";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve";
import { Grid } from "@visx/grid";
import { scaleLinear } from "@visx/scale";
import { line } from "@visx/shape";
import { extent } from "d3-array";
import { useMemo, useState } from "react";

interface DataPoint {
  x: number;
  y: number;
}

const generateData = (count: number, min: number, max: number): DataPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
    y: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
};

// 데이터 셋 변경 -> 라인 변경 애니메이션
const AnimatedLineChart = () => {
  // 차트 크기 설정
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  // 실제 차트가 그려질 영역 크기
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 데이터 상태 관리
  const [data, setData] = useState<DataPoint[]>(() => generateData(10, 0, 100));

  // 이전 데이터 셋을 저장하는 상태
  const [prevData, setPrevData] = useState(data);

  // 스케일 설정
  // 값을 position으로 변경
  // memoized mapping function
  const xScale = useMemo(() => {
    // find min and max value of x
    const domain = extent(data, (d) => d.x) as [number, number];
    //  think of it as a mathematical function that maps values from a domain (your data's min/max values) to a range (the pixel dimensions of your chart).
    return scaleLinear({
      domain,
      range: [0, innerWidth],
    });
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    const allData = [...data, ...prevData];
    const domain = extent(allData, (d) => d.y) as [number, number];
    return scaleLinear({
      domain: [0, domain[1] ? domain[1] + 10 : 100], // 여유 공간 추가
      range: [innerHeight, 0],
    });
  }, [data, prevData, innerHeight]);

  const getPath = (dataPoints: DataPoint[]) => {
    const lineGenerator = line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveMonotoneX);

    return lineGenerator(dataPoints) || "";
  };

  // 애니메이션 설정

  // animated transition between two svg paths using spring physics.
  const springProps = useSpring({
    to: {
      path: getPath(data),
    },

    // Starting states
    from: {
      path: getPath(prevData),
    },

    config: {
      tension: 200,
      friction: 50,
    },
  });

  // 데이터 업데이트 함수
  const updateData = () => {
    setPrevData(data);
    setData(generateData(10, 0, 100));
  };

  // 데이터 포인트 애니메이션
  const pointSpring = useSpring({
    to: { t: 1 },
    from: { t: 0 },
    reset: true,
    config: {
      tension: 200,
      friction: 50,
    },
  });

  return (
    <div className="relative">
      <button
        onClick={updateData}
        className="absolute top-2 right-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Update Data
      </button>
      <svg width={width} height={height}>
        {/* Grouping */}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 그리드 */}
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            numTicksRows={5}
            numTicksColumns={5}
          />

          {/* 애니메이션되는 라인 */}
          {/* animated component는 spring props를 이해한다. */}
          <animated.path
            // shape of path
            d={springProps.path}
            stroke="#2196f3"
            strokeWidth={3}
            fill="none"
          />

          {/* 데이터 포인트 */}
          {data.map((d, i) => (
            <animated.circle
              key={i}
              // x coordinate
              cx={xScale(d.x)}
              // y coordinate
              cy={to(
                pointSpring.t,
                (t) => yScale(prevData[i]?.y || 0) * (1 - t) + yScale(d.y) * t,
              )}
              r={4}
              fill="#2196f3"
            />
          ))}

          {/* Y축 */}
          <AxisLeft
            scale={yScale}
            stroke="#888888"
            tickStroke="#888888"
            label="Value"
            labelOffset={25}
            tickLabelProps={() => ({
              fill: "#888888",
              fontSize: 11,
              textAnchor: "end",
              dy: "0.33em",
              dx: -4,
            })}
          />

          {/* X축 */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="#888888"
            tickStroke="#888888"
            label="Time"
            labelOffset={25}
            tickLabelProps={() => ({
              fill: "#888888",
              fontSize: 11,
              textAnchor: "middle",
              dy: "0.71em",
            })}
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLineChart;
