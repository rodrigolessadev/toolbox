import { useEffect, useRef, useState } from "react";
import { api, CommandType } from "../lib/api";
import { LucideIconPicker } from "./LucideIconPicker";
import { resolveLucideIcon, isImageIcon } from "../lib/icons";

interface Props {
  open: boolean;
  mode?: "create" | "edit";
  initialCommand?: {
    name: string;
    type: CommandType;
    url?: string;
    path?: string;
    args?: string;
    run_as_admin?: boolean;
    script_type?: "powershell" | "batch";
    script_content?: string;
    text_content?: string;
    description?: string;
    icon?: string;
    favorite?: boolean;
  };
  onClose: () => void;
  onCreated: (name: string) => void;
  onUpdated?: (name: string) => void;
  onOpenPluginFolder?: () => Promise<string | null>;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

type Tab = CommandType;
type IconMode = "emoji" | "lucide" | "custom";

const TABS: { id: Tab; label: string }[] = [
  { id: "link",        label: "Link"       },
  { id: "application", label: "Aplicativo" },
  { id: "clipboard",   label: "Snippet"    },
  { id: "script",      label: "Script"     },
  { id: "plugin",      label: "Plugin"     },
];

const MAX_SCRIPT_LINES = 150;

export function AddCommandModal({ open, mode = "create", initialCommand, onClose, onCreated, onUpdated, onOpenPluginFolder, onError, onInfo }: Props) {
  const [tab,           setTab]           = useState<Tab>("link");
  const [name,          setName]          = useState("");
  const [url,           setUrl]           = useState("");
  const [path,          setPath]          = useState("");
  const [args,          setArgs]          = useState("");
  const [runAsAdmin,    setRunAsAdmin]    = useState(false);
  const [scriptType,    setScriptType]    = useState<"powershell" | "batch">("powershell");
  const [scriptContent, setScriptContent] = useState("");
  const [textContent,   setTextContent]   = useState("");
  const [description,   setDescription]   = useState("");
  const [icon,          setIcon]          = useState("");
  const [iconMode,      setIconMode]      = useState<IconMode>("emoji");
  const [favorite,      setFavorite]      = useState(false);
  const [iconLoading,   setIconLoading]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [plugins,       setPlugins]       = useState<import("../lib/api").PluginInfo[]>([]);

  const prevOpenRef = useRef(false);
  const prevCommandNameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (open && tab === "plugin") {
      api.listPlugins().then(setPlugins).catch(() => setPlugins([]));
    }
  }, [open, tab]);

  useEffect(() => {
    if (tab === "plugin" && path && !icon) {
      const normalizedPath = path.toLowerCase().replace(/\\/g, "/");
      const leaf = normalizedPath.split("/").filter(Boolean).pop();
      const match = plugins.find((p) => {
        const pLeaf = p.path.toLowerCase().replace(/\\/g, "/").split("/").filter(Boolean).pop();
        return pLeaf === leaf || p.name.toLowerCase() === leaf || p.path.toLowerCase() === normalizedPath;
      });
      if (match?.icon) {
        setIcon(match.icon);
      }
    }
  }, [tab, path, plugins, icon]);

  // Reset e inicialização controlada ao abrir / trocar de comando
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }

    const isNewlyOpened = !prevOpenRef.current;
    const isDifferentCommand = initialCommand?.name !== prevCommandNameRef.current;

    if (isNewlyOpened || isDifferentCommand) {
      prevOpenRef.current = true;
      prevCommandNameRef.current = initialCommand?.name;

      const initial = initialCommand;
      const initialIcon = initial?.icon ?? "";
      setTab(initial?.type ?? "link");
      setName(initial?.name ?? "");
      setUrl(initial?.url ?? "");
      setPath(initial?.path ?? "");
      setArgs(initial?.args ?? "");
      setRunAsAdmin(initial?.run_as_admin ?? false);
      setScriptType(initial?.script_type ?? "powershell");
      setScriptContent(initial?.script_content ?? "");
      setTextContent(initial?.text_content ?? "");
      setDescription(initial?.description ?? "");
      setIcon(initialIcon);

      if (initialIcon.startsWith("data:") || initialIcon.startsWith("http")) {
        setIconMode("custom");
      } else if (resolveLucideIcon(initialIcon)) {
        setIconMode("lucide");
      } else {
        setIconMode(initial?.type === "plugin" ? "lucide" : "emoji");
      }

      setFavorite(initial?.favorite ?? false);
      setIconLoading(false);
      setSubmitting(false);
    }
  }, [open, initialCommand]);

  const handleBrowseCustomIcon = async () => {
    try {
      const { open: dlg } = await import("@tauri-apps/plugin-dialog");
      const selected = await dlg({
        multiple: false,
        title: "Selecionar Ícone ou Imagem",
        filters: [
          { name: "Imagens (*.png, *.ico, *.svg, *.jpg, *.webp)", extensions: ["png", "ico", "svg", "jpg", "jpeg", "webp"] },
          { name: "Todos os Arquivos (*.*)", extensions: ["*"] },
        ],
      });
      let filePath: string | null = null;
      if (typeof selected === "string") {
        filePath = selected;
      } else if (Array.isArray(selected) && (selected as unknown[]).length > 0) {
        const first = (selected as unknown[])[0];
        filePath = typeof first === "string" ? first : (first as { path?: string })?.path || null;
      }

      if (typeof filePath === "string" && filePath.trim()) {
        setIconLoading(true);
        const dataUrl = await api.importCustomIcon(filePath);
        setIcon(dataUrl);
        setIconMode("custom");
        onInfo?.("Ícone importado e salvo no Toolbox com sucesso!");
      }
    } catch (err) {
      onError?.("Falha ao importar ícone: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIconLoading(false);
    }
  };

  // Auto-busca favicon ao digitar URL
  useEffect(() => {
    if (tab !== "link" || !open || !url || url.length < 8) {
      return;
    }
    // Não sobrescrever se o usuário estiver no modo customizado ou Lucide
    if (iconMode === "custom" || iconMode === "lucide") {
      return;
    }
    setIconLoading(true);
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await api.fetchFavicon(url);
        if (dataUrl) {
          setIcon(dataUrl);
        }
      } catch {
        // silencia se falhar
      } finally {
        setIconLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [url, tab, open, iconMode]);

  // Auto-extrai ícone do .exe ao digitar o caminho
  useEffect(() => {
    if (tab !== "application" || !open || !path || path.length < 4) {
      return;
    }
    // Não sobrescrever se o usuário estiver no modo customizado ou Lucide
    if (iconMode === "custom" || iconMode === "lucide") {
      return;
    }
    const lower = path.toLowerCase();
    if (!lower.endsWith(".exe") && !lower.endsWith(".dll")) return;

    setIconLoading(true);
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await api.extractExeIcon(path);
        if (dataUrl) {
          setIcon(dataUrl);
        }
      } catch {
        // silencia — usa fallback
      } finally {
        setIconLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [path, tab, open, iconMode]);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const scriptLineCount = scriptContent ? scriptContent.split(/\r?\n/).length : 0;
  const isScriptTooLong = scriptLineCount > MAX_SCRIPT_LINES;

  const pluginPlaceholder = tab === "plugin" ? "meu-plugin" : "";
  const canSubmit =
    name.trim().length > 0 &&
    (tab === "link"
      ? url.trim().length > 0
      : tab === "script"
      ? scriptContent.trim().length > 0 && !isScriptTooLong
      : tab === "clipboard"
      ? textContent.trim().length > 0
      : path.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (mode === "edit" && initialCommand) {
        await api.updateCommand({
          old_name: initialCommand.name,
          name: name.trim(),
          type: tab,
          url: tab === "link" ? url.trim() : undefined,
          path: (tab === "plugin" || tab === "application") ? path.trim() : undefined,
          args: (tab === "application" || tab === "script") && args.trim() ? args.trim() : undefined,
          run_as_admin: (tab === "application" || tab === "script") ? runAsAdmin : undefined,
          script_type: tab === "script" ? scriptType : undefined,
          script_content: tab === "script" ? scriptContent : undefined,
          text_content: tab === "clipboard" ? textContent : undefined,
          description: tab === "clipboard" && description.trim() ? description.trim() : undefined,
          icon: icon || undefined,
          favorite,
        });
        onInfo?.(`Comando "${name.trim()}" atualizado.`);
        onUpdated?.(name.trim());
      } else {
        await api.createCommand({
          name: name.trim(),
          type: tab,
          url: tab === "link" ? url.trim() : undefined,
          path: (tab === "plugin" || tab === "application") ? path.trim() : undefined,
          args: (tab === "application" || tab === "script") && args.trim() ? args.trim() : undefined,
          run_as_admin: (tab === "application" || tab === "script") ? runAsAdmin : undefined,
          script_type: tab === "script" ? scriptType : undefined,
          script_content: tab === "script" ? scriptContent : undefined,
          text_content: tab === "clipboard" ? textContent : undefined,
          description: tab === "clipboard" && description.trim() ? description.trim() : undefined,
          icon: icon || undefined,
          favorite,
        });
        if (favorite) {
          await api.toggleFavorite({ name: name.trim(), favorite: true });
        }
        onInfo?.(`Comando "${name.trim()}" criado.`);
        onCreated(name.trim());
      }
      onClose();
    } catch (err) {
      onError?.("Falha ao criar: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const browseFolder = async () => {
    try {
      let selected: string | null = null;
      if (onOpenPluginFolder) {
        selected = await onOpenPluginFolder();
      } else {
        const { open: dlg } = await import("@tauri-apps/plugin-dialog");
        const r = await dlg({ directory: true, multiple: false, title: "Pasta do plugin" });
        if (typeof r === "string") selected = r;
      }
      if (selected) setPath(selected);
    } catch (e) {
      onError?.("Não foi possível abrir o seletor de pastas: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const browseExe = async () => {
    try {
      const { open: dlg } = await import("@tauri-apps/plugin-dialog");
      const r = await dlg({
        multiple: false,
        title: "Selecione o executável ou script",
        filters: [
          { name: "Executáveis e Scripts (*.exe, *.bat, *.cmd, *.ps1, *.lnk)", extensions: ["exe", "bat", "cmd", "ps1", "lnk"] },
          { name: "Scripts PowerShell (*.ps1)", extensions: ["ps1"] },
          { name: "Scripts em Lote (*.bat, *.cmd)", extensions: ["bat", "cmd"] },
          { name: "Binários Executáveis (*.exe, *.lnk)", extensions: ["exe", "lnk"] },
          { name: "Todos os Arquivos (*.*)", extensions: ["*"] },
        ],
      });
      if (typeof r === "string") setPath(r);
    } catch (e) {
      onError?.("Não foi possível abrir o seletor de arquivos: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const isScriptPath = (p: string) => {
    const l = p.toLowerCase();
    return l.endsWith(".ps1") || l.endsWith(".bat") || l.endsWith(".cmd");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="modal__header">
          <h2>{mode === "edit" ? "Editar comando" : "Novo comando"}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        {/* Tabs */}
        <div className="modal__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`modal__tab${tab === t.id ? " modal__tab--active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setPath("");
                setUrl("");
                setArgs("");
                setIcon("");
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal__form">

          {/* Nome */}
          <div className="modal__field">
            <label className="modal__label">Nome / Gatilho do Comando</label>
            <input
              type="text"
              className="modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: graphify, pix, modelo-email"
              autoFocus
              required
            />
          </div>

          {/* Plugin: caminho relativo */}
          {tab === "plugin" && (
            <>
              <div className="modal__field">
                <label className="modal__label">Caminho do Plugin (relativo a plugins/)</label>
                <div className="modal__row">
                  <input
                    type="text"
                    className="modal__input"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder={pluginPlaceholder}
                    required
                  />
                  <button type="button" className="modal__browse-btn" onClick={browseFolder} title="Selecionar pasta">
                    📁
                  </button>
                </div>
                <small className="modal__hint">
                  Após salvar, crie a pasta{" "}
                  <code>plugins/{path || "meu-plugin"}</code> com{" "}
                  <code>plugin.json</code> e <code>main.py</code>.
                </small>
              </div>
            </>
          )}

          {/* Link: URL */}
          {tab === "link" && (
            <div className="modal__field">
              <label className="modal__label">URL</label>
              <div className="modal__row">
                <input
                  type="url"
                  className="modal__input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  required
                />
                <div className="modal__icon-preview" aria-live="polite">
                  {iconLoading
                    ? <span className="modal__icon-spinner" />
                    : icon
                    ? <img src={icon} alt="" className="modal__icon-img" />
                    : <span style={{ opacity: 0.3, fontSize: 18 }}>🔗</span>}
                </div>
              </div>
            </div>
          )}

          {/* Aplicativo: executável ou script + argumentos */}
          {tab === "application" && (
            <>
              <div className="modal__field">
                <label className="modal__label">Executável ou Script (.exe, .bat, .cmd, .ps1)</label>
                <div className="modal__row">
                  <input
                    type="text"
                    className="modal__input"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder='C:\Scripts\rotina.ps1 ou C:\Program Files\App\app.exe'
                    required
                  />
                  <div className="modal__icon-preview" aria-live="polite">
                    {iconLoading
                      ? <span className="modal__icon-spinner" />
                      : icon
                      ? <img src={icon} alt="" className="modal__icon-img" />
                      : <span style={{ opacity: 0.3, fontSize: 18 }}>{isScriptPath(path) ? "📜" : "⚙️"}</span>}
                  </div>
                  <button type="button" className="modal__browse-btn" onClick={browseExe} title="Selecionar arquivo">
                    📁
                  </button>
                </div>
                {isScriptPath(path) && (
                  <small className="modal__hint" style={{ color: "var(--accent)" }}>
                    {path.toLowerCase().endsWith(".ps1")
                      ? "⚡ Script PowerShell detectado (executará via powershell.exe -ExecutionPolicy Bypass)"
                      : "⚡ Script em lote detectado (executará via cmd.exe /c)"}
                  </small>
                )}
              </div>

              <div className="modal__field">
                <label className="modal__label">Argumentos <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  className="modal__input"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder='-Parametro1 "valor" --verbose'
                />
                <small className="modal__hint">
                  Parâmetros repassados ao executável ou script. Use aspas para argumentos com espaços.
                </small>
              </div>

              <label className="modal__checkbox">
                <input
                  type="checkbox"
                  checked={runAsAdmin}
                  onChange={(e) => setRunAsAdmin(e.target.checked)}
                />
                <span>
                  <strong>Executar como Administrador</strong>
                  <small style={{ display: "block", opacity: 0.65, fontSize: "11px", marginTop: 2 }}>
                    Solicita confirmação de elevação de privilégios (UAC) do Windows ao iniciar.
                  </small>
                </span>
              </label>
            </>
          )}

          {/* Snippet / Clipboard: texto para a Área de Transferência */}
          {tab === "clipboard" && (
            <>
              <div className="modal__field">
                <label className="modal__label">Conteúdo do Texto (será copiado ao acionar)</label>
                <textarea
                  className="modal__textarea"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Cole ou digite aqui o texto, caminho, comando ou snippet a ser copiado..."
                  rows={6}
                  spellCheck={false}
                  required
                />
              </div>

              <div className="modal__field">
                <label className="modal__label">Descrição / Observação <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  className="modal__input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ex: Caminho do repositório Graphify"
                />
              </div>
            </>
          )}

          {/* Script: código inline (PowerShell ou Batch) */}
          {tab === "script" && (
            <>
              <div className="modal__field">
                <label className="modal__label">Tipo de Interpretador</label>
                <div className="modal__script-type-toggle">
                  <button
                    type="button"
                    className={`modal__script-type-btn${scriptType === "powershell" ? " modal__script-type-btn--active" : ""}`}
                    onClick={() => setScriptType("powershell")}
                  >
                    ⚡ PowerShell (.ps1)
                  </button>
                  <button
                    type="button"
                    className={`modal__script-type-btn${scriptType === "batch" ? " modal__script-type-btn--active" : ""}`}
                    onClick={() => setScriptType("batch")}
                  >
                    ⚙️ Batch (.bat)
                  </button>
                </div>
              </div>

              <div className="modal__field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="modal__label">Código do Script</label>
                  <span style={{ fontSize: "11px", color: isScriptTooLong ? "var(--danger)" : "var(--fg-muted)", fontWeight: isScriptTooLong ? 700 : 400 }}>
                    {scriptLineCount} / {MAX_SCRIPT_LINES} linhas
                  </span>
                </div>
                <textarea
                  className="modal__textarea"
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder={scriptType === "powershell" ? "# Digite seu script PowerShell aqui...\nWrite-Host 'Olá do Toolbox!'" : "REM Digite seu script Batch aqui...\necho Olá do Toolbox!"}
                  rows={8}
                  spellCheck={false}
                  required
                />
                {isScriptTooLong && (
                  <small className="modal__hint" style={{ color: "var(--danger)" }}>
                    O script excedeu o limite máximo de {MAX_SCRIPT_LINES} linhas.
                  </small>
                )}
              </div>

              <div className="modal__field">
                <label className="modal__label">Argumentos <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
                <input
                  type="text"
                  className="modal__input"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder='-Parametro1 "valor" --verbose'
                />
              </div>

              <label className="modal__checkbox">
                <input
                  type="checkbox"
                  checked={runAsAdmin}
                  onChange={(e) => setRunAsAdmin(e.target.checked)}
                />
                <span>
                  <strong>Executar como Administrador</strong>
                  <small style={{ display: "block", opacity: 0.65, fontSize: "11px", marginTop: 2 }}>
                    Solicita confirmação de elevação de privilégios (UAC) do Windows ao executar o script.
                  </small>
                </span>
              </label>
            </>
          )}

          {/* Seção Universal de Ícone do Comando */}
          <div className="modal__field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label className="modal__label">Ícone do Comando</label>
              {icon && (
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--danger, #ef4444)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                  onClick={() => setIcon("")}
                  title="Remover personalização de ícone"
                >
                  ✕ Remover Ícone
                </button>
              )}
            </div>

            {/* Abas do Tipo de Ícone */}
            <div className="modal__script-type-toggle" style={{ marginBottom: 8 }}>
              <button
                type="button"
                className={`modal__script-type-btn${iconMode === "emoji" ? " modal__script-type-btn--active" : ""}`}
                onClick={() => setIconMode("emoji")}
              >
                😀 Emoji / Texto
              </button>
              <button
                type="button"
                className={`modal__script-type-btn${iconMode === "lucide" ? " modal__script-type-btn--active" : ""}`}
                onClick={() => setIconMode("lucide")}
              >
                ✨ Ícones Lucide
              </button>
              <button
                type="button"
                className={`modal__script-type-btn${iconMode === "custom" ? " modal__script-type-btn--active" : ""}`}
                onClick={() => setIconMode("custom")}
              >
                🖼️ Imagem / Arquivo Local
              </button>
            </div>

            {/* Modo Emoji / Texto */}
            {iconMode === "emoji" && (
              <div>
                <input
                  type="text"
                  className="modal__input"
                  value={isImageIcon(icon) ? "" : icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder={tab === "clipboard" ? "📋" : tab === "script" ? "📜" : tab === "link" ? "🔗" : "⚙️"}
                  maxLength={8}
                />
                <small className="modal__hint">
                  Digite um emoji ou sigla curta (até 8 caracteres). Deixe em branco para usar o ícone padrão.
                </small>
              </div>
            )}

            {/* Modo Lucide */}
            {iconMode === "lucide" && (
              <div>
                <LucideIconPicker
                  value={isImageIcon(icon) ? "" : icon}
                  onSelect={(iconName) => setIcon(iconName)}
                />
                <small className="modal__hint">
                  Busque em{" "}
                  <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="lucide-picker__link">
                    lucide.dev/icons
                  </a>
                  {" "}— ex: workflow, terminal, database, zap, puzzle
                </small>
              </div>
            )}

            {/* Modo Imagem / Arquivo Local */}
            {iconMode === "custom" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    className="modal__browse-btn"
                    onClick={handleBrowseCustomIcon}
                    disabled={iconLoading}
                    style={{ flex: 1, height: "36px" }}
                  >
                    {iconLoading ? "Importando ícone..." : "Selecionar Arquivo de Imagem..."}
                  </button>
                </div>

                {icon && isImageIcon(icon) && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "var(--bg-input, rgba(255,255,255,0.05))",
                    borderRadius: "6px",
                    border: "1px solid var(--border)"
                  }}>
                    <img
                      src={icon}
                      alt="Preview"
                      style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4 }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--fg)" }}>
                      Ícone personalizado carregado com sucesso
                    </span>
                  </div>
                )}

                <small className="modal__hint">
                  Suporta PNG, ICO, SVG, JPG e WEBP (máx. 5 MB). O arquivo é salvo localmente no Toolbox e não quebra se o original for movido ou apagado.
                </small>
              </div>
            )}
          </div>

          {/* Favorito */}
          <label className="modal__checkbox">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>Marcar como favorito</span>
          </label>

          {/* Footer */}
          <footer className="modal__footer">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={!canSubmit || submitting}>
              {submitting ? "Salvando..." : mode === "edit" ? "Atualizar" : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
