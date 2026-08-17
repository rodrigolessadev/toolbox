import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { api } from "../lib/api";
import { Theme } from "../hooks/useTheme";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported?: () => Promise<void> | void;
  onInfo?: (message: string) => void;
  onError?: (message: string) => void;
  onOpenDataDir?: () => Promise<void> | void;
  onOpenLogsDir?: () => Promise<void> | void;
  updateVersion?: string | null;
  onInstallUpdate?: () => Promise<void>;
  updating?: boolean;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

export function SettingsModal({
  open,
  onClose,
  onImported,
  onInfo,
  onError,
  onOpenDataDir,
  onOpenLogsDir,
  updateVersion,
  onInstallUpdate,
  updating,
  theme: propTheme,
  onThemeChange,
}: Props) {
  const [theme, setTheme] = useState<Theme>(propTheme || "dark");

  useEffect(() => {
    if (propTheme) setTheme(propTheme);
  }, [propTheme]);
  const [dataDir, setDataDir] = useState<string>("");
  const [pluginsDir, setPluginsDir] = useState<string>("");
  const [logsDir, setLogsDir] = useState<string>("");
  const [appVersion, setAppVersion] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setWorking(true);
        const [dd, pd, ld, t, v] = await Promise.all([
          api.getDataDir(),
          api.getPluginsDir(),
          api.getLogsDir(),
          api.getTheme().catch(() => "dark"),
          getVersion().catch(() => "1.0.0"),
        ]);
        if (cancelled) return;
        setDataDir(dd);
        setPluginsDir(pd);
        setLogsDir(ld);
        if (!propTheme && (t === "light" || t === "dark" || t === "system")) setTheme(t as Theme);
        setAppVersion(v);
      } catch {
        if (!cancelled) onError?.("Falha ao carregar configurações.");
      } finally {
        if (!cancelled) setWorking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, onError]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const handleThemeChange = async (next: string) => {
    const nextTheme = next as Theme;
    setTheme(nextTheme);
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
    try {
      await api.setTheme(nextTheme);
      onInfo?.("Tema atualizado.");
    } catch {
      onError?.("Falha ao alterar tema.");
    }
  };

  const handleOpenDataDir = async () => {
    if (onOpenDataDir) await onOpenDataDir();
    else try { await api.openPath(dataDir); } catch { onError?.("Falha ao abrir pasta."); }
  };

  const handleOpenLogsDir = async () => {
    if (onOpenLogsDir) await onOpenLogsDir();
    else try { await api.openPath(logsDir); } catch { onError?.("Falha ao abrir pasta."); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await api.exportCommands();
      const blob = new Blob([json], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "toolbox-commands.json";
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      onInfo?.("Comandos exportados.");
    } catch { onError?.("Falha ao exportar."); }
    finally  { setExporting(false); }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await api.importCommands(await file.text());
      await onImported?.();
      onInfo?.("Comandos importados.");
      onClose();
    } catch (e) {
      onError?.("Falha ao importar: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <header className="modal__header">
          <h2>Configurações</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        <div className="modal__form">

          {/* Atualizações */}
          <section className="settings__section">
            <h3 className="settings__title">Atualizações do Sistema</h3>
            {updateVersion ? (
              <div className="settings__update-row">
                <div className="settings__row-info">
                  <strong>Nova versão disponível: v{updateVersion}</strong>
                  <span className="settings__path">Versão atual instalada: v{appVersion || "1.0.0"}</span>
                </div>
                {onInstallUpdate && (
                  <button
                    type="button"
                    className="settings__update-btn"
                    onClick={onInstallUpdate}
                    disabled={updating}
                  >
                    {updating ? "Atualizando..." : "Atualizar agora"}
                  </button>
                )}
              </div>
            ) : (
              <div className="settings__row">
                <div className="settings__row-info">
                  <strong>Toolbox v{appVersion || "1.0.0"}</strong>
                  <span className="settings__path">O aplicativo está atualizado.</span>
                </div>
              </div>
            )}
          </section>

          {/* Aparência */}
          <section className="settings__section">
            <h3 className="settings__title">Aparência</h3>
            <div className="modal__field">
              <label className="modal__label">Tema</label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                disabled={working}
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </section>

          {/* Pastas */}
          <section className="settings__section">
            <h3 className="settings__title">Pastas</h3>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Dados do aplicativo</strong>
                <code className="settings__path">{dataDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse-btn"
                onClick={handleOpenDataDir}
                disabled={!dataDir}
                title="Abrir pasta de dados"
              >Abrir</button>
            </div>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Plugins</strong>
                <code className="settings__path">{pluginsDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse-btn"
                onClick={async () => {
                  try { await api.openPath(pluginsDir); }
                  catch { onError?.("Falha ao abrir pasta de plugins."); }
                }}
                disabled={!pluginsDir}
                title="Abrir pasta de plugins"
              >Abrir</button>
            </div>

            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Logs</strong>
                <code className="settings__path">{logsDir || "carregando..."}</code>
              </div>
              <button
                type="button"
                className="modal__browse-btn"
                onClick={handleOpenLogsDir}
                disabled={!logsDir}
                title="Abrir pasta de logs"
              >Abrir</button>
            </div>
          </section>

          {/* Backup */}
          <section className="settings__section">
            <h3 className="settings__title">Backup</h3>
            <div className="settings__actions">
              <button type="button" onClick={handleExport} disabled={exporting}>
                {exporting ? "Exportando..." : "Exportar comandos"}
              </button>
              <label className="settings__import">
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImport}
                  disabled={importing}
                />
                <span>{importing ? "Importando..." : "Importar comandos"}</span>
              </label>
            </div>
            <small className="modal__hint">A importação substitui todos os comandos existentes.</small>
          </section>

          <footer className="modal__footer">
            <button type="button" className="modal__btn" onClick={onClose}>Fechar</button>
          </footer>

        </div>
      </div>
    </div>
  );
}
