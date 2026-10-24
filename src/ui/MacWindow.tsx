import "./MacWindow.css";

export function MacWindow() {
  return (
    <section className="window">
      <div className="header">
        <button type="button" className="light close" aria-label="Close" />
        <button
          type="button"
          className="light minimize"
          aria-label="Minimize"
        />
        <button type="button" className="light zoom" aria-label="Zoom" />
        <h2>Title</h2>
      </div>
      <div className="text">
        <p>this is some test english </p>
      </div>
    </section>
  );
}
