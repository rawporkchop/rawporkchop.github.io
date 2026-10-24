import { useRef, useState } from "react";
import { MacWindow } from "./ui/MacWindow.tsx";
import { Scene } from "./scene/Scene.tsx";

interface WindowInstance {
  id: number; // identity — never reused, used as React key
  appId: AppId; // which app this is a window of
  x: number;
  y: number;
}

export const APPS = {
  about: { title: "About", content: <p>Some bio text.</p> },
  projects: {
    title: "Projects",
    content: (
      <>
        <h3>Volvo 245</h3>
        <p>…</p>
      </>
    ),
  },
} as const;

export type AppId = keyof typeof APPS;

export default function App() {
  const [windows, setWindows] = useState<WindowInstance[]>([
    { id: 1, appId: "about", x: 100, y: 200 },
  ]);

  const nextId = useRef(2);

  const closeWindow = (id: number) =>
    setWindows((prev) => prev.filter((w) => w.id !== id));

  const moveWindow = (id: number, x: number, y: number) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));

  const openWindow = (appId: AppId) =>
    setWindows((prev) => [
      ...prev,
      { id: nextId.current++, appId, x: 140, y: 140 },
    ]);

  return (
    <>
      <button onClick={() => openWindow("about")}>Open About</button>
      <Scene />
      <div className="window-layer">
        {windows.map((w) => (
          <MacWindow
            key={w.id}
            title={APPS[w.appId].title}
            x={w.x}
            y={w.y}
            onClose={() => closeWindow(w.id)}
            onMove={(x, y) => moveWindow(w.id, x, y)}
          >
            {APPS[w.appId].content}
          </MacWindow>
        ))}
      </div>
    </>
  );
}
