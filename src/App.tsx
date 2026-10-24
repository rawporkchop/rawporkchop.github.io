import { MacWindow } from "./ui/MacWindow.tsx";
import { Scene } from "./scene/Scene.tsx";

export default function App() {
  return (
    <>
      <Scene />
      <div className="window-layer">
        <MacWindow title="Window 1" x={100} y={200}>
          <p>test string</p>
        </MacWindow>
        <MacWindow title="Window 2" x={400} y={400}>
          <p>test string2</p>
        </MacWindow>
      </div>
    </>
  );
}
