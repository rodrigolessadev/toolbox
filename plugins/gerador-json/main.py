#!/usr/bin/env python3
"""
Plugin: Gerador JSON (Em Desenvolvimento)
Esta é uma versão placeholder. Implementação completa em Etapa 6.
"""
import tkinter as tk
from tkinter import messagebox


def main():
    """Mostra mensagem informativa."""
    root = tk.Tk()
    root.withdraw()  # Esconde a janela principal
    
    messagebox.showinfo(
        "Gerador JSON",
        "🚧 Este plugin está em desenvolvimento.\n\n"
        "Versão completa em breve com templates para:\n"
        "• Pessoa (nome, email, idade, cidade, ativo)\n"
        "• Produto (nome, preço, estoque, categoria)\n"
        "• Usuário (id, username, email, role, createdAt)\n"
    )
    root.destroy()


if __name__ == "__main__":
    main()
