import { api } from "../lib/api";
import "../styles/titlebar.css";

export function TitleBar() {
  const handleMinimize = () => {
    api.minimizeWindow();
  };

  const handleClose = () => {
    api.closeWindow();
  };

  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar__brand" data-tauri-drag-region>
        <span className="titlebar__icon" data-tauri-drag-region>⚙</span>
        <span className="titlebar__title" data-tauri-drag-region>Toolbox</span>
      </div>

      <div className="titlebar__controls">
        <button
          type="button"
          className="titlebar__btn"
          onClick={handleMinimize}
          aria-label="Minimizar"
          title="Minimizar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        <button
          type="button"
          className="titlebar__btn titlebar__btn--close"
          onClick={handleClose}
          aria-label="Fechar"
          title="Fechar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}