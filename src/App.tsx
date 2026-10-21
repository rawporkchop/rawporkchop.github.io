import { MacWindow } from "./ui/MacWindow.tsx";
import { Scene } from "./scene/Scene.tsx";

export default function App() {
  return (
    <>
      <Scene />
      <div className="window-layer">
        <MacWindow />
      </div>
    </>
  );
}
