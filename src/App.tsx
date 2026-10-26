import { Scene } from "./scene/Scene";
import { MenuBar } from "./ui/MenuBar/MenuBar";
import { MacWindowManager } from "./ui/MacWindow/Manager";

export default function App() {
  return (
    <>
      <Scene />
      <MenuBar />
      <MacWindowManager />
    </>
  );
}
