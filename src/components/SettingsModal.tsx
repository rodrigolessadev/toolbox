import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { RefreshCw } from "lucide-react";
import { api, RuntimeInfo } from "../lib/api";
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
  onUpdateDetected?: (version: string) => void;
  onInstallUpdate?: () => Promise<void>;
  updating?: boolean;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  onOpenFeedback?: () => void;
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
  onUpdateDetected,
  onInstallUpdate,
  updating,
  theme: propTheme,
  onThemeChange,
  onOpenFeedback,
}: Props) {
  const [theme, setTheme] = useState<Theme>(propTheme || "dark");

  useEffect(() => {
    if (propTheme) setTheme(propTheme);
  }, [propTheme]);
  const [dataDir, setDataDir] = useState<string>("");
  const [pluginsDir, setPluginsDir] = useState<string>("");
  const [logsDir, setLogsDir] = useState<string>("");
  const [appVersion, setAppVersion] = useState<string>("");
  const [pythonRuntime, setPythonRuntime] = useState<RuntimeInfo | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [working, setWorking] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [lastCheckedText, setLastCheckedText] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setWorking(true);
        const [dd, pd, ld, t, v, py] = await Promise.all([
          api.getDataDir(),
          api.getPluginsDir(),
          api.getLogsDir(),
          api.getTheme().catch(() => "dark"),
          getVersion().catch(() => "1.0.0"),
          api.checkRuntimeStatus("python").catch(() => null),
        ]);
        if (cancelled) return;
        setDataDir(dd);
        setPluginsDir(pd);
        setLogsDir(ld);
        if (!propTheme && (t === "light" || t === "dark" || t === "system")) setTheme(t as Theme);
        setAppVersion(v);
        if (py) setPythonRuntime(py);
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

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await api.checkUpdate();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (res.available && res.version) {
        onUpdateDetected?.(res.version);
        setLastCheckedText(`Nova versão encontrada às ${timeStr}`);
        onInfo?.(`Nova versão disponível: v${res.version}`);
      } else {
        setLastCheckedText(`Verificado às ${timeStr}`);
        onInfo?.(`O Toolbox está atualizado na versão mais recente (v${res.current_version || appVersion || "1.0.0"}).`);
      }
    } catch (e) {
      onError?.(`Falha ao verificar atualizações: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setCheckingUpdate(false);
    }
  };

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
                  <span className="settings__path">
                    Versão atual instalada: v{appVersion || "1.0.0"}
                    {lastCheckedText ? ` • ${lastCheckedText}` : ""}
                  </span>
                </div>
                <div className="settings__update-actions">
                  <button
                    type="button"
                    className="settings__btn-verify"
                    onClick={handleCheckUpdate}
                    disabled={checkingUpdate || updating}
                    title="Verificar novamente"
                  >
                    <RefreshCw size={13} className={checkingUpdate ? "spin" : ""} />
                    <span>{checkingUpdate ? "Verificando..." : "Verificar"}</span>
                  </button>
                  {onInstallUpdate && (
                    <button
                      type="button"
                      className="settings__update-btn"
                      onClick={onInstallUpdate}
                      disabled={updating || checkingUpdate}
                    >
                      {updating ? "Atualizando..." : "Atualizar agora"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="settings__row">
                <div className="settings__row-info">
                  <strong>Toolbox v{appVersion || "1.0.0"}</strong>
                  <span className="settings__path">
                    {lastCheckedText
                      ? `O aplicativo está atualizado • ${lastCheckedText}`
                      : "O aplicativo está atualizado."}
                  </span>
                </div>
                <button
                  type="button"
                  className="settings__btn-verify"
                  onClick={handleCheckUpdate}
                  disabled={checkingUpdate || working}
                  title="Verificar se há novas versões"
                >
                  <RefreshCw size={13} className={checkingUpdate ? "spin" : ""} />
                  <span>{checkingUpdate ? "Verificando..." : "Verificar"}</span>
                </button>
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

          {/* Ambiente de Execução (Runtimes) */}
          <section className="settings__section">
            <h3 className="settings__title">Ambiente de Execução (Runtimes)</h3>
            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Python</strong>
                <span className="settings__path">
                  {pythonRuntime?.available
                    ? `${pythonRuntime.version || "Disponível"} ${pythonRuntime.is_embedded ? "• Embutido no aplicativo" : "• Sistema operacional"}`
                    : "Não detectado no sistema"}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: pythonRuntime?.available ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: pythonRuntime?.available ? "#10b981" : "#ef4444",
                  fontWeight: 500,
                }}
              >
                {pythonRuntime?.available ? (pythonRuntime.is_embedded ? "Embutido" : "Sistema") : "Ausente"}
              </span>
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

          {/* Feedback */}
          <section className="settings__section">
            <h3 className="settings__title">Feedback & Sugestões</h3>
            <div className="settings__row">
              <div className="settings__row-info">
                <strong>Tem alguma sugestão ou encontrou um problema?</strong>
                <span className="settings__desc" style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #888)" }}>
                  Envie sua mensagem diretamente para a equipe de desenvolvimento.
                </span>
              </div>
              <button
                type="button"
                className="modal__browse-btn"
                onClick={() => {
                  onClose();
                  onOpenFeedback?.();
                }}
                title="Abrir formulário de feedback"
              >
                Enviar Feedback
              </button>
            </div>
          </section>

          <footer className="modal__footer">
            <button type="button" className="modal__btn" onClick={onClose}>Fechar</button>
          </footer>

        </div>
      </div>
    </div>
  );
}
