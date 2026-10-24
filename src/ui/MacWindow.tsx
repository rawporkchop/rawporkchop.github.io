import type { ReactNode } from "react";
import "./MacWindow.css";

interface MacWindowProps {
  title: string;
  children: ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function MacWindow({
  title,
  children,
  x = 100,
  y = 100,
  width = 460,
  height = 320,
}: MacWindowProps) {
  return (
    <div className="window-layer">
      <section className="window" style={{ left: x, top: y, width, height }}>
        <div className="header">
          <button type="button" className="light close" aria-label="Close" />
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
    </div>
  );
}
