#!/usr/bin/env python3
"""
Módulo de Utilidades de Tema e Estilo — Toolbox 2.0 (Etapa 7)
Centraliza os design tokens do Toolbox (Dark Mode) para interfaces Tkinter.
"""
import tkinter as tk
from tkinter import ttk

# Tokens de cores baseados em src/styles/tokens.ts (Dark mode)
DARK_TOKENS = {
    "bg":          "#0e1014",  # Nível 0: background primário
    "bg_elev1":    "#161a21",  # Nível 1: janelas e cards
    "bg_elev2":    "#1f242d",  # Nível 2: painéis e seções
    "bg_elev3":    "#262c36",  # Nível 3: inputs e bordas
    "bg_elev4":    "#2d3440",  # Nível 4: hover
    "bg_elev5":    "#34394a",  # Nível 5: active
    "fg":          "#e8eaed",  # Texto primário
    "fg_muted":    "#8b94a3",  # Texto secundário / rótulos
    "fg_disabled": "#5a6270",  # Texto desabilitado
    "border":      "#262c36",  # Bordas padrão
    "border_muted":"#1f242d",  # Bordas sutis
    "accent":      "#6aa3ff",  # Azul primário
    "accent_hover":"#7bb3ff",  # Hover botão
    "accent_active":"#5a93ef", # Active botão
    "success":     "#4cc38a",  # Sucesso / cópia
    "success_bg":  "#132c21",  # Fundo banner sucesso
    "warning":     "#f5a524",  # Alerta
    "warning_bg":  "#332611",  # Fundo banner alerta
    "danger":      "#ff6369",  # Erro / perigo
    "danger_bg":   "#36171a",  # Fundo banner erro
    "input_bg":    "#0e1014",  # Fundo de campo texto
    "font_family": ("Segoe UI", "Inter", "sans-serif"),
}


def setup_theme(root: tk.Tk) -> ttk.Style:
    """Configura o tema TTK escuro padronizado e a janela raiz."""
    root.configure(bg=DARK_TOKENS["bg_elev1"])
    style = ttk.Style()

    try:
        style.theme_use("clam")
    except tk.TclError:
        pass

    # Configuração de componentes TTK
    style.configure(".", background=DARK_TOKENS["bg_elev1"], foreground=DARK_TOKENS["fg"])
    style.configure("TLabel", background=DARK_TOKENS["bg_elev1"], foreground=DARK_TOKENS["fg"])
    style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground=DARK_TOKENS["fg"])
    style.configure("Subheader.TLabel", font=("Segoe UI", 9), foreground=DARK_TOKENS["fg_muted"])
    style.configure("Section.TLabel", font=("Segoe UI", 9, "bold"), foreground=DARK_TOKENS["fg_muted"])

    style.configure("TFrame", background=DARK_TOKENS["bg_elev1"])
    style.configure("Card.TFrame", background=DARK_TOKENS["bg_elev2"], relief="flat")

    style.configure("TLabelframe", background=DARK_TOKENS["bg_elev1"], bordercolor=DARK_TOKENS["border"])
    style.configure("TLabelframe.Label", background=DARK_TOKENS["bg_elev1"], foreground=DARK_TOKENS["fg_muted"], font=("Segoe UI", 9, "bold"))

    style.configure("TEntry", fieldbackground=DARK_TOKENS["input_bg"], foreground=DARK_TOKENS["fg"], bordercolor=DARK_TOKENS["border"], padding=4)
    style.configure("TCombobox", fieldbackground=DARK_TOKENS["input_bg"], foreground=DARK_TOKENS["fg"], bordercolor=DARK_TOKENS["border"])
    style.map("TCombobox", fieldbackground=[("readonly", DARK_TOKENS["input_bg"])], selectbackground=[("readonly", DARK_TOKENS["bg_elev3"])])

    style.configure("TCheckbutton", background=DARK_TOKENS["bg_elev1"], foreground=DARK_TOKENS["fg"])
    style.map("TCheckbutton", background=[("active", DARK_TOKENS["bg_elev1"])])

    style.configure("TRadiobutton", background=DARK_TOKENS["bg_elev1"], foreground=DARK_TOKENS["fg"])
    style.map("TRadiobutton", background=[("active", DARK_TOKENS["bg_elev1"])])

    return style


def create_primary_button(parent, text: str, command=None, **kwargs) -> tk.Button:
    """Cria um botão com estilo primário acentuado."""
    btn = tk.Button(
        parent,
        text=text,
        font=("Segoe UI", 9, "bold"),
        bg=DARK_TOKENS["accent"],
        fg="#ffffff",
        activebackground=DARK_TOKENS["accent_hover"],
        activeforeground="#ffffff",
        relief="flat",
        cursor="hand2",
        padx=14,
        pady=5,
        command=command,
        **kwargs
    )
    return btn


def create_secondary_button(parent, text: str, command=None, **kwargs) -> tk.Button:
    """Cria um botão com estilo secundário neutro."""
    btn = tk.Button(
        parent,
        text=text,
        font=("Segoe UI", 9),
        bg=DARK_TOKENS["bg_elev2"],
        fg=DARK_TOKENS["fg"],
        activebackground=DARK_TOKENS["bg_elev4"],
        activeforeground=DARK_TOKENS["fg"],
        relief="flat",
        cursor="hand2",
        padx=14,
        pady=5,
        command=command,
        **kwargs
    )
    return btn


def create_styled_text(parent, height=10, **kwargs) -> tk.Text:
    """Cria uma área de texto estilizada com tema escuro."""
    txt = tk.Text(
        parent,
        height=height,
        font=("Consolas", 9),
        bg=DARK_TOKENS["input_bg"],
        fg=DARK_TOKENS["fg"],
        insertbackground=DARK_TOKENS["fg"],
        relief="flat",
        highlightthickness=1,
        highlightbackground=DARK_TOKENS["border"],
        highlightcolor=DARK_TOKENS["accent"],
        **kwargs
    )
    return txt


class StatusBanner(ttk.Frame):
    """Componente de banner de status inline não-bloqueante."""
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        self.label = tk.Label(
            self,
            text="",
            font=("Segoe UI", 9),
            anchor="w",
            padx=10,
            pady=4,
            relief="flat",
        )
        self.label.pack(fill="x", expand=True)
        self.after_id = None

    def show_success(self, message: str, timeout_ms: int = 3000):
        if self.after_id:
            self.after_cancel(self.after_id)
        self.label.configure(
            text=f"✓  {message}",
            bg=DARK_TOKENS["success_bg"],
            fg=DARK_TOKENS["success"],
        )
        if timeout_ms > 0:
            self.after_id = self.after(timeout_ms, self.clear)

    def show_error(self, message: str, timeout_ms: int = 5000):
        if self.after_id:
            self.after_cancel(self.after_id)
        self.label.configure(
            text=f"⚠  {message}",
            bg=DARK_TOKENS["danger_bg"],
            fg=DARK_TOKENS["danger"],
        )
        if timeout_ms > 0:
            self.after_id = self.after(timeout_ms, self.clear)

    def clear(self):
        self.label.configure(text="", bg=DARK_TOKENS["bg_elev1"], fg=DARK_TOKENS["fg"])
        self.after_id = None
