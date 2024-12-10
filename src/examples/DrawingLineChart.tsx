import { animated, useSpring } from "@react-spring/web";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Grid } from "@visx/grid";
import { scaleLinear } from "@visx/scale";
import { line } from "@visx/shape";
import { extent } from "@visx/vendor/d3-array";
import { curveMonotoneX } from "d3-shape";
import { useEffect, useMemo, useRef, useState } from "react";

// 타입 정의
interface DataPoint {
  x: number;
  y: number;
}

// 샘플 데이터 생성 함수
const generateData = (count: number, min: number, max: number): DataPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
    y: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
};

const DrawingLineChart = () => {
  // SVG Path 요소의 참조를 저장하기 위한 ref
  const pathRef = useRef<SVGPathElement | null>(null);

  // 차트 크기 설정
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 초기 데이터 생성
  const data = useMemo(() => generateData(10, 0, 100), []);

  // Path의 전체 길이를 저장하는 상태
  const [pathLength, setPathLength] = useState(0);

  // 스케일 설정
  const xScale = useMemo(() => {
    const domain = extent(data, (d) => d.x) as [number, number];
    return scaleLinear({
      domain,
      range: [0, innerWidth],
    });
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    const domain = extent(data, (d) => d.y) as [number, number];
    return scaleLinear({
      domain: [0, domain[1] ? domain[1] + 10 : 100],
      range: [innerHeight, 0],
    });
  }, [data, innerHeight]);

  // 컴포넌트가 마운트되면 Path의 전체 길이를 계산
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  // 드로잉 애니메이션을 위한 spring 설정
  const spring = useSpring({
    from: {
      strokeDashoffset: pathLength,
    },
    to: {
      strokeDashoffset: 0,
    },
    config: {
      tension: 20,
      friction: 10,
    },
    delay: 300, // 차트가 나타난 후 약간의 딜레이를 두고 애니메이션 시작
  });

  // 데이터 포인트 페이드인을 위한 spring 설정
  const pointSpring = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      tension: 20,
      friction: 10,
    },
    delay: 1000, // 라인 드로잉이 어느 정도 진행된 후 점들이 나타나도록 함
  });
  const getPath = useMemo(() => {
    const lineGenerator = line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveMonotoneX); // 선택적으로 곡선을 부드럽게 만들 수 있습니다

    return lineGenerator(data) || "";
  }, [data, xScale, yScale]);

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* 그리드 */}
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            strokeOpacity={0.3}
            numTicksRows={5}
            numTicksColumns={5}
          />

          {/* 데이터 라인 */}
          <animated.path
            ref={pathRef}
            d={getPath}
            stroke="#2196f3"
            strokeWidth={3}
            fill="none"
            strokeDasharray={pathLength}
            strokeDashoffset={spring.strokeDashoffset}
          />

          {/* 데이터 포인트 */}
          {data.map((d, i) => (
            <animated.circle
              key={i}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={4}
              fill="#2196f3"
              style={{
                opacity: pointSpring.opacity,
              }}
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

export default DrawingLineChart;
