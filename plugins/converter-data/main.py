#!/usr/bin/env python3
"""
Plugin: Converter Data
Converte data + hora para número serial Excel/Lotus (base 30/12/1899).
Porta fiel do date-time-modal.tsx do KapiNote.
"""
import tkinter as tk
from tkinter import ttk
from datetime import datetime, timezone, timedelta


# ─── Lógica de conversão ──────────────────────────────────────────────────

BASE_DATE = datetime(1899, 12, 30, tzinfo=timezone.utc)


def to_excel_serial(date_str: str, time_str: str) -> float:
    """
    Converte 'YYYY-MM-DD' + 'HH:MM' para o número serial Excel.
    Parte inteira = dias desde 30/12/1899.
    Parte decimal = fração do dia.
    """
    year, month, day = map(int, date_str.split("-"))
    hour, minute = map(int, time_str.split(":"))
    target = datetime(year, month, day, hour, minute, 0, tzinfo=timezone.utc)
    diff_days = (target - BASE_DATE).total_seconds() / 86400
    return round(diff_days, 5)


def convert_date_time_to_serial(date_str: str, time_str: str) -> dict:
    """
    Valida a entrada de data e hora e executa a conversão para número serial Excel.

    Returns:
        dict com chaves: success (bool), serial (float|None), error (str|None)
    """
    d_clean = date_str.strip() if date_str else ""
    t_clean = time_str.strip() if time_str else ""

    if not d_clean or not t_clean:
        return {"success": False, "serial": None, "error": "Data e hora devem ser fornecidas."}

    try:
        datetime.strptime(d_clean, "%Y-%m-%d")
        datetime.strptime(t_clean, "%H:%M")
    except ValueError:
        return {"success": False, "serial": None, "error": "Formato de data (YYYY-MM-DD) ou hora (HH:MM) inválido."}

    try:
        serial = to_excel_serial(d_clean, t_clean)
        return {"success": True, "serial": serial, "error": None}
    except Exception as e:
        return {"success": False, "serial": None, "error": f"Erro na conversão: {e}"}


# ─── UI ──────────────────────────────────────────────────────────────────

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from theme_utils import (
        DARK_TOKENS, setup_theme, create_primary_button,
        create_secondary_button, StatusBanner
    )
except ImportError:
    DARK_TOKENS = {"bg_elev1": "#161a21", "bg_elev2": "#1f242d", "fg": "#e8eaed", "fg_muted": "#8b94a3", "accent": "#6aa3ff", "success": "#4cc38a", "danger": "#ff6369"}
    def setup_theme(r): pass
    def create_primary_button(p, text, command=None, **kw): return tk.Button(p, text=text, command=command, bg="#6aa3ff", fg="#fff", relief="flat")
    def create_secondary_button(p, text, command=None, **kw): return tk.Button(p, text=text, command=command, bg="#1f242d", fg="#eee", relief="flat")
    class StatusBanner(ttk.Frame):
        def show_success(self, msg, **kw): pass
        def show_error(self, msg, **kw): pass
        def clear(self): pass


def build_ui():
    root = tk.Tk()
    root.title("Converter Data — Toolbox")
    root.geometry("420x440")
    root.resizable(False, False)

    setup_theme(root)

    # ── Banner de Status Inline ──
    status_banner = StatusBanner(root)
    status_banner.pack(fill="x", padx=24, pady=(12, 0))

    # ── Título ──
    frame_header = ttk.Frame(root)
    frame_header.pack(fill="x", padx=24, pady=(8, 12))
    ttk.Label(frame_header, text="Conversor de Data e Hora", style="Header.TLabel").pack(anchor="w")
    ttk.Label(
        frame_header,
        text="Converte data e hora para número serial Excel (base 30/12/1899).",
        style="Subheader.TLabel"
    ).pack(anchor="w", pady=(2, 0))

    frame = ttk.Frame(root)
    frame.pack(padx=24, fill="x")

    now = datetime.now()

    # ── Data ──
    ttk.Label(frame, text="Data (AAAA-MM-DD)", style="Section.TLabel").grid(row=0, column=0, sticky="w", pady=(0, 2))
    date_var = tk.StringVar(value=now.strftime("%Y-%m-%d"))
    entry_date = ttk.Entry(frame, textvariable=date_var, font=("Segoe UI", 10))
    entry_date.grid(row=1, column=0, sticky="ew", pady=(0, 10))

    # ── Hora ──
    ttk.Label(frame, text="Hora (HH:MM)", style="Section.TLabel").grid(row=2, column=0, sticky="w", pady=(0, 2))
    time_var = tk.StringVar(value=now.strftime("%H:%M"))
    entry_time = ttk.Entry(frame, textvariable=time_var, font=("Segoe UI", 10))
    entry_time.grid(row=3, column=0, sticky="ew", pady=(0, 14))

    frame.columnconfigure(0, weight=1)

    # ── Resultado ──
    ttk.Label(root, text="Resultado Serial (clique para copiar)", style="Section.TLabel").pack(anchor="w", padx=24, pady=(0, 2))

    result_var = tk.StringVar(value="—")
    result_btn = tk.Button(
        root,
        textvariable=result_var,
        font=("Consolas", 12, "bold"),
        bg=DARK_TOKENS["bg_elev2"],
        fg=DARK_TOKENS["accent"],
        activebackground=DARK_TOKENS["bg_elev3"],
        activeforeground=DARK_TOKENS["accent"],
        relief="flat",
        cursor="hand2",
        padx=12,
        pady=10,
    )
    result_btn.pack(padx=24, fill="x", pady=(0, 14))

    def copy_result():
        val = result_var.get()
        if val and val != "—" and not val.startswith("⚠"):
            root.clipboard_clear()
            root.clipboard_append(val)
            status_banner.show_success("Número serial copiado para a área de transferência!")

    result_btn.configure(command=copy_result)

    def do_convert(event=None):
        status_banner.clear()
        date_s = date_var.get()
        time_s = time_var.get()

        res = convert_date_time_to_serial(date_s, time_s)
        if not res["success"]:
            status_banner.show_error(res["error"])
            result_var.set("⚠ Entrada inválida")
            return

        result_var.set(str(res["serial"]))
        status_banner.show_success(f"Serial gerado: {res['serial']}. Clique no botão para copiar.")

    # ── Botão converter ──
    btn_conv = create_primary_button(root, text="Converter Agora", command=do_convert)
    btn_conv.pack(padx=24, fill="x", pady=(0, 16))

    entry_date.bind("<Return>", do_convert)
    entry_time.bind("<Return>", do_convert)
    root.bind("<Control-Return>", do_convert)

    entry_date.focus()
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
    date_str = payload.get("date", "")
    time_str = payload.get("time", "")

    if not date_str and "args" in payload:
        args = payload.get("args") or []
        if len(args) >= 2:
            date_str, time_str = args[0], args[1]

    res = convert_date_time_to_serial(date_str, time_str)
    if res["success"]:
        handler.send_success(
            result={"serial": res["serial"], "output": str(res["serial"])},
            output_message=str(res["serial"])
        )
    else:
        handler.send_error("INVALID_INPUT", res["error"])


if __name__ == "__main__":
    if not sys.stdin.isatty():
        run_protocol()
    else:
        build_ui()


