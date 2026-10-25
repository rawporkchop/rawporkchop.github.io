import { useState } from "react";
import { MacWindow } from "./Body";
import "./Manager.css";

interface WindowInstance {
  id: number;
  appId: AppId;

  width: number;
  height: number;

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

export function MacWindowManager() {
  const [windows, setWindows] = useState<WindowInstance[]>([
    { id: 1, appId: "about", x: 100, y: 200, width: 400, height: 300 },
    { id: 2, appId: "projects", x: 400, y: 300, width: 400, height: 300 },
  ]);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  const closeWindow = (id: number) =>
    setWindows((prev) => prev.filter((w) => w.id !== id));

  const moveWindow = (id: number, x: number, y: number) => {
    const edge = 0;

    return setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              x: clamp(x, edge, window.innerWidth - w.width - edge),
              y: clamp(y, edge, window.innerHeight - w.height - edge),
            }
          : w,
      ),
    );
  };

  return (
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
  );
}
