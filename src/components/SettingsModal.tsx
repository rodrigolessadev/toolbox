import { useState } from "react";
import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { api, CommandsFile } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  onInfo: (m: string) => void;
  onError: (m: string) => void;
  onOpenWorkdir: () => void;
  onOpenLogsDir: () => void;
}

export function SettingsModal({
  open,
  onClose,
  onImported,
  onInfo,
  onError,
  onOpenWorkdir,
  onOpenLogsDir,
}: Props) {
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleImport() {
    try {
      const selected = await openDialog({
        multiple: false,
        directory: false,
        title: "Importar commands.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (typeof selected !== "string") return;

      const raw = await fetch(`file://${selected}`).then((r) => r.text()).catch(() => null);
      // Como o Tauri usa asset protocol, lemos diretamente via fetch.
      const data: CommandsFile = JSON.parse(raw ?? "{}");
      await api.importCommands(JSON.stringify(data));
      onImported();
      onInfo(`${Object.keys(data).length} comandos importados.`);
    } catch (e) {
      onError(`Falha ao importar: ${e}`);
    }
  }

  async function handleExport() {
    try {
      setBusy(true);
      const target = await saveDialog({
        title: "Exportar commands.json",
        defaultPath: "commands.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!target) return;
      const data = await api.exportCommands();
      const json = JSON.stringify(data, null, 2);
      // Usa o Tauri fs via writeTextFile seria ideal, mas simplificamos usando a API de download do browser.
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = target.split(/[\\/]/).pop() ?? "commands.json";
      a.click();
      URL.revokeObjectURL(url);
      onInfo("Comandos exportados.");
    } catch (e) {
      onError(`Falha ao exportar: ${e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Configurações</h2>
          <button className="icon-btn" onClick={onClose} title="Fechar">✕</button>
        </header>
        <div className="modal__body">
          <section className="settings-group">
            <h3>Dados</h3>
            <button className="btn btn--ghost btn--block" onClick={handleImport}>
              📥 Importar commands.json
            </button>
            <button className="btn btn--ghost btn--block" onClick={handleExport} disabled={busy}>
              📤 Exportar commands.json
            </button>
          </section>

          <section className="settings-group">
            <h3>Pastas</h3>
            <button className="btn btn--ghost btn--block" onClick={onOpenWorkdir}>
              📁 Abrir pasta do Toolbox
            </button>
            <button className="btn btn--ghost btn--block" onClick={onOpenLogsDir}>
              📋 Abrir pasta de logs
            </button>
          </section>

          <section className="settings-group">
            <h3>Atalhos</h3>
            <p>
              <kbd>Ctrl</kbd> + <kbd>Space</kbd> — abrir / fechar o Toolbox
            </p>
            <p>
              <kbd>↑</kbd> / <kbd>↓</kbd> — navegar
            </p>
            <p>
              <kbd>Enter</kbd> — executar
            </p>
            <p>
              <kbd>Esc</kbd> — ocultar
            </p>
          </section>
        </div>
        <footer className="modal__footer">
          <button className="btn btn--primary" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
