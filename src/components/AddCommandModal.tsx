import { useState } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { api, CommandType, CreateCommandPayload } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
  onOpenPluginFolder: (path: string) => void;
  onError: (msg: string) => void;
  onInfo: (msg: string) => void;
}

export function AddCommandModal({
  open,
  onClose,
  onCreated,
  onOpenPluginFolder,
  onError,
  onInfo,
}: Props) {
  const [tab, setTab] = useState<CommandType>("plugin");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("");
  const [icon, setIcon] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  function reset() {
    setTab("plugin");
    setName("");
    setUrl("");
    setPath("");
    setIcon("");
    setFavorite(false);
  }

  async function pickExe() {
    try {
      const selected = await openDialog({
        multiple: false,
        directory: false,
        title: "Selecione um executável",
        filters: [{ name: "Executável", extensions: ["exe", "bat", "cmd"] }],
      });
      if (typeof selected === "string") setPath(selected);
    } catch (e) {
      onError(`Falha ao selecionar arquivo: ${e}`);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      onError("Informe o nome do comando.");
      return;
    }
    setBusy(true);

    const payload: CreateCommandPayload = {
      name: name.trim(),
      kind: tab,
      url: tab === "link" ? url.trim() : undefined,
      path: tab !== "link" ? path.trim() : undefined,
      favorite,
      icon: icon.trim() || undefined,
    };

    try {
      const entry = await api.createCommand(payload);
      onCreated(entry.name || name);

      if (tab === "plugin") {
        // Plugin salvo: também garante que o diretório existe (commands_store já insere
        // o registro, mas o desenvolvedor precisa criar manualmente os arquivos).
        onInfo(
          `Plugin "${name}" registrado. Crie a pasta plugins/${name} com plugin.json + main.py.`
        );
        onOpenPluginFolder(`plugins/${name}`);
      } else {
        onInfo(`Comando "${name}" criado com sucesso.`);
      }

      reset();
      onClose();
    } catch (e) {
      onError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Novo comando</h2>
          <button className="icon-btn" onClick={onClose} title="Fechar">✕</button>
        </header>

        <div className="tabs">
          {(["plugin", "link", "application"] as CommandType[]).map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? "tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "plugin" ? "Plugin" : t === "link" ? "Link" : "Aplicativo"}
            </button>
          ))}
        </div>

        <div className="modal__body">
          <label className="field">
            <span>Nome do comando</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: cpf, google, word"
              autoFocus
            />
          </label>

          {tab === "link" && (
            <label className="field">
              <span>URL</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://google.com.br"
              />
            </label>
          )}

          {tab === "application" && (
            <label className="field">
              <span>Caminho do executável</span>
              <div className="field__row">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="C:\Program Files\..."
                />
                <button className="btn btn--ghost" onClick={pickExe}>
                  Procurar…
                </button>
              </div>
            </label>
          )}

          {tab === "plugin" && (
            <label className="field">
              <span>Caminho do plugin (relativo a plugins/)</span>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="meu-plugin"
              />
              <small className="field__hint">
                Após salvar, crie a pasta <code>plugins/{name || "meu-plugin"}</code> com
                <code> plugin.json</code> e <code>main.py</code>.
              </small>
            </label>
          )}

          <label className="field">
            <span>Ícone (emoji ou texto curto)</span>
            <input
              type="text"
              maxLength={2}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🔗"
            />
          </label>

          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>Marcar como favorito</span>
          </label>
        </div>

        <footer className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="btn btn--primary" onClick={handleSave} disabled={busy}>
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
