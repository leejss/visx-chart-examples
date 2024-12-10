import InteractiveLineChart from "./examples/InteractiveLineChart";
import { getExampleData } from "./lib/data";

export default function App() {
  const { basicData } = getExampleData();
  return (
    <div>
      <InteractiveLineChart width={800} height={400} data={basicData} />
    </div>
  );
}
