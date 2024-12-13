# visx

## Animating path

- 컴포넌트가 마운트 될때 Path가 그려지는 애니메이션을 구현해보자.

## Drawing path

### LinePath

```tsx

<LinePath data={data} x={(d) => xScale(getDate(d)) ?? 0} y={(d) => yScale(getValue(d)) ?? 0} />

```

### line function

```tsx

const createLinePath = (data: DataPoint[]) => {
  return line<DataPoint>()
    .x((d) => xScale(getDate(d)) ?? 0)
    .y((d) => yScale(getValue(d)) ?? 0)
    .curve(curveMonotoneX);
};

// Data를 받아서 라인 패스를 생성하는 함수
<g>
  <path d={createLinePath(data)} stroke="#4f46e5" strokeWidth={2} />
</g>
```

## Interactivity

### Tooltip

- 포인터의 x, y 좌표를 얻는다.
- 그리고 포인터 위치에 대응하는 데이터를 얻는다.
- rect 요소를 통해서 hover area를 설정한다.

## Data Processing - Change Data Range
