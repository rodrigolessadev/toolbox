#!/usr/bin/env python3
"""
Plugin: Stract JSON
Extrai valores de um campo específico de um JSON colado.
Porta fiel do json-stract-modal.tsx do KapiNote.
"""
import json
import tkinter as tk
from tkinter import ttk, messagebox


# ─── Lógica de extração ────────────────────────────────────────────────────

def extract_field(data, field: str) -> list[str]:
    """Extrai recursivamente os valores do campo em qualquer nível do JSON."""
    results: list[str] = []

    if isinstance(data, list):
        for item in data:
            results.extend(extract_field(item, field))

    elif isinstance(data, dict):
        # Campo direto
        if field in data:
            val = data[field]
            results.append(str(val) if isinstance(val, (int, float)) else f"'{val}'")

        # Suporte a objeto 'colaborador' aninhado
        if "colaborador" in data and isinstance(data["colaborador"], dict):
            col = data["colaborador"]
            if field in col:
                val = col[field]
                results.append(str(val) if isinstance(val, (int, float)) else f"'{val}'")

        # Recursão nas demais chaves
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                results.extend(extract_field(value, field))

    return results


def process_json_extraction(raw_json: str, field_name: str) -> dict:
    """
    Função pura de domínio que valida entradas, parseia o JSON e extrai os valores.

    Returns:
        dict com chaves: success (bool), values (list), result_str (str), error (str|None)
    """
    raw_clean = raw_json.strip() if raw_json else ""
    field_clean = field_name.strip() if field_name else ""

    if not raw_clean:
        return {"success": False, "values": [], "result_str": "", "error": "JSON não pode estar vazio."}
    if not field_clean:
        return {"success": False, "values": [], "result_str": "", "error": "Nome do campo não pode estar vazio."}

    try:
        parsed = json.loads(raw_clean)
    except json.JSONDecodeError as e:
        return {"success": False, "values": [], "result_str": "", "error": f"JSON inválido: {e}"}

    raw_values = extract_field(parsed, field_clean)
    unique_values = list(dict.fromkeys(raw_values))

    if not unique_values:
        return {
            "success": True,
            "values": [],
            "result_str": f'Campo "{field_clean}" não encontrado no JSON.',
            "error": None,
        }

    return {
        "success": True,
        "values": unique_values,
        "result_str": ", ".join(unique_values),
        "error": None,
    }


# ─── UI ───────────────────────────────────────────────────────────────────

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from theme_utils import (
        DARK_TOKENS, setup_theme, create_primary_button,
        create_secondary_button, create_styled_text, StatusBanner
    )
except ImportError:
    # Fallback se executado isoladamente sem pasta mãe no path
    DARK_TOKENS = {
        "bg_elev1": "#161a21", "bg_elev2": "#1f242d", "fg": "#e8eaed",
        "fg_muted": "#8b94a3", "border": "#262c36", "accent": "#6aa3ff",
        "input_bg": "#0e1014", "success": "#4cc38a", "danger": "#ff6369"
    }
    def setup_theme(r): pass
    def create_primary_button(p, text, command=None, **kw): return tk.Button(p, text=text, command=command, bg="#6aa3ff", fg="#fff", relief="flat")
    def create_secondary_button(p, text, command=None, **kw): return tk.Button(p, text=text, command=command, bg="#1f242d", fg="#eee", relief="flat")
    def create_styled_text(p, height=10, **kw): return tk.Text(p, height=height, bg="#0e1014", fg="#eee", relief="flat")
    class StatusBanner(ttk.Frame):
        def show_success(self, msg, **kw): pass
        def show_error(self, msg, **kw): pass
        def clear(self): pass


def build_ui():
    root = tk.Tk()
    root.title("Stract JSON — Toolbox")
    root.geometry("600x580")
    root.resizable(True, True)

    setup_theme(root)

    # ── Banner de Status Inline ──
    status_banner = StatusBanner(root)
    status_banner.pack(fill="x", padx=18, pady=(12, 0))

    # ── Cabeçalho ──
    frame_header = ttk.Frame(root)
    frame_header.pack(fill="x", padx=18, pady=(10, 8))
    ttk.Label(frame_header, text="Stract JSON", style="Header.TLabel").pack(anchor="w")
    ttk.Label(
        frame_header,
        text="Cole o JSON e informe a chave do campo para extração recursiva dos valores.",
        style="Subheader.TLabel"
    ).pack(anchor="w", pady=(2, 0))

    # ── Área de JSON ──
    frame_json = ttk.Frame(root)
    frame_json.pack(fill="both", expand=True, padx=18, pady=(0, 8))

    ttk.Label(frame_json, text="Conteúdo JSON", style="Section.TLabel").pack(anchor="w")

    txt = create_styled_text(frame_json, height=12)
    txt.pack(fill="both", expand=True, pady=(4, 0))

    # ── Campo ──
    frame_field = ttk.Frame(root)
    frame_field.pack(fill="x", padx=18, pady=(4, 8))

    ttk.Label(frame_field, text="Campo para Extração", style="Section.TLabel").pack(anchor="w")

    entry_field = ttk.Entry(frame_field, font=("Segoe UI", 10))
    entry_field.pack(fill="x", pady=(4, 0))
    entry_field.insert(0, "numeroCadastro")

    # ── Resultado ──
    frame_result = ttk.Frame(root)
    frame_result.pack(fill="x", padx=18, pady=(0, 8))

    lbl_result_title = ttk.Label(frame_result, text="Resultado", style="Section.TLabel")
    lbl_result_title.pack(anchor="w")

    result_var = tk.StringVar()
    result_box = create_styled_text(frame_result, height=3, state="disabled", cursor="hand2")
    result_box.configure(bg=DARK_TOKENS["bg_elev2"])
    result_box.pack(fill="x", pady=(4, 0))

    def copy_result(event=None):
        val = result_var.get()
        if val and not val.startswith("Campo"):
            root.clipboard_clear()
            root.clipboard_append(val)
            status_banner.show_success("Resultado copiado para a área de transferência.")

    result_box.bind("<Button-1>", copy_result)

    def do_extract():
        status_banner.clear()
        raw = txt.get("1.0", "end")
        field = entry_field.get()

        res = process_json_extraction(raw, field)

        result_box.configure(state="normal")
        result_box.delete("1.0", "end")

        if not res["success"]:
            status_banner.show_error(res["error"])
            result_box.insert("1.0", "Aguardando entrada válida...")
            result_box.configure(state="disabled")
            result_var.set("")
            return

        if not res["values"]:
            status_banner.show_error(res["result_str"])
            result_box.insert("1.0", res["result_str"])
            result_box.configure(state="disabled")
            result_var.set("")
            return

        result_box.insert("1.0", res["result_str"])
        result_box.configure(state="disabled")
        result_var.set(res["result_str"])
        status_banner.show_success(f"{len(res['values'])} valor(es) extraído(s) com sucesso. Clique no resultado para copiar.")

    # ── Botões ──
    frame_btns = ttk.Frame(root)
    frame_btns.pack(fill="x", padx=18, pady=(4, 16))

    btn_extract = create_primary_button(frame_btns, text="Extrair Valores", command=do_extract)
    btn_extract.pack(side="left", padx=(0, 8))

    def clear_all():
        txt.delete("1.0", "end")
        result_box.configure(state="normal")
        result_box.delete("1.0", "end")
        result_box.configure(state="disabled")
        result_var.set("")
        status_banner.clear()

    btn_clear = create_secondary_button(frame_btns, text="Limpar", command=clear_all)
    btn_clear.pack(side="left")

    entry_field.bind("<Return>", lambda e: do_extract())
    root.bind("<Control-Return>", lambda e: do_extract())

    entry_field.focus()
    root.mainloop()


def run_protocol():
    """Modo Headless via Protocolo Toolbox IPC v1.0."""
    try:
        from toolbox_protocol import ToolboxProtocolHandler
    except ImportError:
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared" / "python"))
        from toolbox_protocol import ToolboxProtocolHandler

    handler = ToolboxProtocolHandler()
    req = handler.read_request()
    if not req:
        return

    payload = req.get("payload", {})
    raw_json = payload.get("raw_json", "")
    field_name = payload.get("field_name", "")

    # Se chamado via protocolo sem payload explícito, tenta pegar dos argumentos extras
    if not raw_json and "args" in payload:
        args = payload.get("args") or []
        if len(args) >= 2:
            raw_json, field_name = args[0], args[1]

    res = process_json_extraction(raw_json, field_name)
    if res["success"]:
        if not res["values"]:
            handler.add_warning(res["result_str"])
        handler.send_success(
            result={
                "output": res["result_str"],
                "values": res["values"],
                "count": len(res["values"])
            },
            output_message=res["result_str"]
        )
    else:
        handler.send_error("INVALID_INPUT", res["error"])


if __name__ == "__main__":
    # Se STDIN não é tty, executa modo protocolo; caso contrário, interface gráfica legada
    if not sys.stdin.isatty():
        run_protocol()
    else:
        build_ui()


