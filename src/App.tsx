import { useState } from "react";
import {
  BasicLineChart,
  LineChartWithAxisAndGrid,
  ResponsiveLineChart,
  EnhancedMultiSeriesSelect,
  AnimatedLineChart,
  DrawingLineChart,
  EnhancedMultiSeriesSelect2,
  InteractiveLineChart,
  MultiSeriesLineChart,
} from "./examples";
import SingleTooltipExample from "./examples/SingleTooltipExample";

const examples = [
  {
    name: "BasicLineChart",
    component: BasicLineChart,
  },
  {
    name: "LineChartWithAxisAndGrid",
    component: LineChartWithAxisAndGrid,
  },
  {
    name: "ResponsiveLineChart",
    component: ResponsiveLineChart,
  },
  {
    name: "DrawingLineChart",
    component: DrawingLineChart,
  },
  {
    name: "InteractiveLineChart",
    component: InteractiveLineChart,
  },
  {
    name: "AnimatedLineChart",
    component: AnimatedLineChart,
  },
  {
    name: "MultiSeriesLineChart",
    component: MultiSeriesLineChart,
  },
  {
    name: "EnhancedMultiSeriesSelect",
    component: EnhancedMultiSeriesSelect,
  },
  {
    name: "EnhancedMultiSeriesSelect2",
    component: EnhancedMultiSeriesSelect2,
  },
  {
    name: "SingleTooltipExample",
    component: SingleTooltipExample,
  },
];

// 단순한 데이터를 상태로 저장하고 계산을 통해서 복잡한 값을 가져온다.

export default function App() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleSelectExample = (name: string) => {
    setSelectedExample(name);
  };

  const SelectedComponent = examples.find(
    (example) => example.name === selectedExample,
  )?.component;

  return (
    <div className="w-full h-screen flex flex-col gap-2">
      {/* Selection */}
      <div className="flex bg-red-500 p-4 flex-wrap gap-4 justify-center">
        {examples.map((example) => (
          <button
            key={example.name}
            onClick={() => handleSelectExample(example.name)}
            className={`px-4 py-2 rounded ${
              selectedExample === example.name
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {example.name}
          </button>
        ))}
      </div>

      {/* Chart component */}
      <div className="flex  flex-1 justify-center items-center">
        {SelectedComponent && <SelectedComponent />}
      </div>
    </div>
  );
}
