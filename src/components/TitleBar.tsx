import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { api } from "../lib/api";
import "../styles/titlebar.css";

export function TitleBar() {
  const [hint, setHint] = useState(false);
  const [version, setVersion] = useState<string | null>(null);

  // Detecta se está rodando no Windows para mostrar o atalho correto
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    setHint(!isMac);
  }, []);

  useEffect(() => {
    getVersion()
      .then((v) => setVersion(v))
      .catch(() => {});
  }, []);

  const handleMinimize = () => api.minimizeWindow();
  const handleClose = () => api.closeWindow();

  return (
    <header className="titlebar">
      <div className="titlebar__drag" data-tauri-drag-region>
        <div className="titlebar__brand">
          <span className="titlebar__icon">⚙</span>
          <div className="titlebar__brand-text">
            <span className="titlebar__title">Toolbox</span>
            {version && <span className="titlebar__version">v{version}</span>}
          </div>
        </div>
      </div>

      <div className="titlebar__hint" data-tauri-drag-region>
        {hint && (
          <>
            <kbd className="titlebar__kbd">Ctrl</kbd>
            <span className="titlebar__plus">+</span>
            <kbd className="titlebar__kbd">Space</kbd>
            <span className="titlebar__hint-label">abrir</span>
          </>
        )}
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