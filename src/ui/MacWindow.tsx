import { useRef } from "react";
import type { ReactNode } from "react";
import "./MacWindow.css";

interface MacWindowProps {
  title: string;
  children: ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onClose: () => void;
  onMove: (x: number, y: number) => void;
}

export function MacWindow({
  title,
  children,
  x = 100,
  y = 100,
  width = 460,
  height = 320,
  onClose,
  onMove,
}: MacWindowProps) {
  const drag = useRef<{
    px: number;
    py: number;
    wx: number;
    wy: number;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return; // ignore right/middle
    if ((e.target as HTMLElement).closest(".light")) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, wx: x, wy: y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    onMove(d.wx + e.clientX - d.px, d.wy + e.clientY - d.py);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
  }

  return (
    <section
      className="window"
      style={{ transform: `translate3d(${x}px, ${y}px, 0)`, width, height }}
    >
      <div
        className="header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <button
          type="button"
          className="light close"
          aria-label="Close"
          onClick={onClose}
        />
        <button
          type="button"
          className="light minimize"
          aria-label="Minimize"
        />
        <button type="button" className="light zoom" aria-label="Zoom" />
        <h2>{title}</h2>
      </div>
      <div className="text">{children}</div>
    </section>
  );
}
