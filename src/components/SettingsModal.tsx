import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported?: () => Promise<void> | void;
  onInfo?: (message: string) => void;
  onError?: (message: string) => void;
  onOpenDataDir?: () => Promise<void> | void;
  onOpenLogsDir?: () => Promise<void> | void;
}

export function SettingsModal({
  open,
  onClose,
  onImported,
  onInfo,
  onError,
  onOpenDataDir,
  onOpenLogsDir,
}: Props) {
  const [theme, setTheme] = useState<string>("dark");
  const [dataDir, setDataDir] = useState<string>("");
  const [pluginsDir, setPluginsDir] = useState<string>("");
  const [logsDir, setLogsDir] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [working, setWorking] = useState(false);

  // Carrega as informacoes quando o modal abre
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      try {
        setWorking(true);
        const [dd, pd, ld, t] = await Promise.all([
          api.getDataDir(),
          api.getPluginsDir(),
          api.getLogsDir(),
          api.getTheme().catch(() => "dark"),
        ]);
        if (cancelled) return;
        setDataDir(dd);
        setPluginsDir(pd);
        setLogsDir(ld);
        setTheme(t);
      } catch (e) {
        if (!cancelled) {
          onError?.("Falha ao carregar configuracoes.");
        }
      } finally {
        if (!cancelled) setWorking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, onError]);

  // Fecha com tecla ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleThemeChange = async (next: string) => {
    setTheme(next);
    try {
      await api.setTheme(next);
      onInfo?.("Tema atualizado.");
    } catch (e) {
      onError?.("Falha ao alterar tema.");
    }
  };

  const handleOpenDataDir = async () => {
    if (onOpenDataDir) {
      await onOpenDataDir();
    } else {
      try {
        await api.openPath(dataDir);
      } catch (e) {
        onError?.("Falha ao abrir pasta de dados.");
      }
    }
  };

  const handleOpenLogsDir = async () => {
    if (onOpenLogsDir) {
      await onOpenLogsDir();
    } else {
      try {
        await api.openPath(logsDir);
      } catch (e) {
        onError?.("Falha ao abrir pasta de logs.");
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await api.exportCommands();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "toolbox-commands.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onInfo?.("Comandos exportados com sucesso.");
    } catch (e) {
      onError?.("Falha ao exportar comandos.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await api.importCommands(text);
      await onImported?.();
      onInfo?.("Comandos importados com sucesso.");
      onClose();
    } catch (e) {
      onError?.(
        "Falha ao importar: " +
        (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Configuracoes</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar (Esc)"
          >
            x
          </button>
        </header>

        <div className="modal__form">
          <section className="settings__section">
            <h3 className="settings__title">Aparencia</h3>
            <label className="modal__field">
              <span>Tema</span>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                disabled={working}
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="system">Sistema</option>
              </select>
            </label>
          </section>

          <section className="settings__section">
            <h3 className="settings__title">Pastas</h3>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Dados do aplicativo</strong>
                <code className="settings__path">{dataDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse"
                onClick={handleOpenDataDir}
                disabled={!dataDir}
                title="Abrir pasta de dados"
              >
                Abrir
              </button>
            </div>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Plugins</strong>
                <code className="settings__path">{pluginsDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse"
                onClick={async () => {
                  try {
                    await api.openPath(pluginsDir);
                  } catch (e) {
                    onError?.("Falha ao abrir pasta de plugins.");
                  }
                }}
                disabled={!pluginsDir}
                title="Abrir pasta de plugins"
              >
                Abrir
              </button>
            </div>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Logs</strong>
                <code className="settings__path">{logsDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse"
                onClick={handleOpenLogsDir}
                disabled={!logsDir}
                title="Abrir pasta de logs"
              >
                Abrir
              </button>
            </div>
          </section>

          <section className="settings__section">
            <h3 className="settings__title">Backup</h3>
            <div className="settings__actions">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exportando..." : "Exportar comandos"}
              </button>

              <label className="settings__import">
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImport}
                  disabled={importing}
                />
                <span>
                  {importing ? "Importando..." : "Importar comandos"}
                </span>
              </label>
            </div>
            <small className="modal__hint">
              A importacao substitui todos os comandos existentes.
            </small>
          </section>

          <footer className="modal__footer">
            <button type="button" onClick={onClose}>
              Fechar
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}