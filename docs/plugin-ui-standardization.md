# Guia de Padronização Visual de Interfaces — Toolbox 2.0 (Etapa 7)

**Data:** 2026-08-12  
**Status:** ✅ COMPLETA  

---

## 1. Visão Geral

A **Etapa 7** padronizou o design visual e a experiência do usuário das interfaces Tkinter dos 4 plugins legados do KapiNote:

- `stract-json`
- `converter-data`
- `gerador-marcacoes`
- `gerador-afd`

---

## 2. Arquitetura do Sistema de Design em Python

Foi implementado o módulo centralizador [`plugins/theme_utils.py`](file:///c:/tools/toolbox/plugins/theme_utils.py) para expor os tokens do sistema de design Dark Mode e utilitários visuais reutilizáveis:

```python
DARK_TOKENS = {
    "bg":          "#0e1014",  # Nível 0: background primário
    "bg_elev1":    "#161a21",  # Nível 1: janelas e cards
    "bg_elev2":    "#1f242d",  # Nível 2: painéis e seções
    "bg_elev3":    "#262c36",  # Nível 3: inputs e bordas
    "bg_elev4":    "#2d3440",  # Nível 4: hover
    "fg":          "#e8eaed",  # Texto primário
    "fg_muted":    "#8b94a3",  # Texto secundário / rótulos
    "accent":      "#6aa3ff",  # Azul primário
    "success":     "#4cc38a",  # Sucesso / cópia
    "danger":      "#ff6369",  # Erro / perigo
    "input_bg":    "#0e1014",  # Fundo de campo texto
}
```

---

## 3. Melhorias de UX e Feedback Não-Bloqueante

### 3.1. Eliminação de Diálogos Bloqueantes
Alertas e erros deixaram de usar `messagebox.showerror` / `showwarning` bloqueantes em favor do componente [`StatusBanner`](file:///c:/tools/toolbox/plugins/theme_utils.py#L125-L158), que apresenta avisos inline coloridos com temporizador automático.

### 3.2. Feedback Visual de Cópia e Exportação
Ao clicar em áreas de resultado ou botões de ação, o usuário recebe confirmação imediata no banner com indicador verde (`✓`) e mensagem descritiva.

### 3.3. Tipografia e Hierarquia
- **Títulos de Janela / Headers**: Segoe UI 14pt Bold
- **Seções / Rótulos**: Segoe UI 9pt Bold Muted
- **Campos de Código / Resultados**: Consolas 9pt / 10pt

---

## 4. Resultados da Validação

- **Testes de Regressão de Lógica**: 25/25 testes de domínio aprovados.
- **Harmonia Visual**: 4/4 interfaces alinhadas com a paleta Dark Mode do Toolbox 2.0.
