# Guia de Desenvolvimento de Plugins

## O que é um plugin?

Um plugin é uma extensão independente que roda no ecossistema do **Toolbox**. Ele é estruturado como um diretório dentro de `plugins/` contendo um manifesto `plugin.json` e o código executável (`main.py`).

O Toolbox descobre plugins automaticamente na inicialização ou através do **Marketplace de Plugins integrado**, sem necessidade de recompilar a aplicação principal.

---

## Estrutura Oficial de um Plugin (Padrão Moderno)

O padrão oficial para criação de plugins com interface gráfica no ecossistema é **Python + `pywebview`** com frontend HTML/CSS/JavaScript estilizado com **Material Design 3**:

```text
plugins/
└── meu-plugin/
    ├── plugin.json         ← Manifesto do plugin (metadados e versão)
    ├── main.py             ← Ponto de entrada (cria janela pywebview e API bridge)
    ├── domain.py           ← Regras de negócio e processamento puro (opcional)
    └── ui/                 ← Interface visual (HTML, CSS, JS)
        ├── index.html
        ├── app.js
        └── style.css
```

---

## Manifesto `plugin.json`

O arquivo `plugin.json` identifica seu plugin para o Toolbox e para o Marketplace:

```json
{
  "name": "Meu Plugin",
  "version": "1.0.0",
  "description": "Automatiza tarefas e processamento de dados.",
  "author": "Seu Nome",
  "language": "python",
  "entry": "main.py",
  "icon": "sparkles",
  "min_toolbox_version": "1.22.3",
  "theme_version": "material-3"
}
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `name` | Sim | Nome legível exibido na interface e no Marketplace |
| `version` | Sim | Versão SemVer (ex.: `1.0.0`) |
| `description` | Não | Descrição concisa das capacidades do plugin |
| `author` | Não | Nome do autor/mantenedor |
| `language` | Sim | `python` (recomendado), `node` ou `exe` |
| `entry` | Sim | Arquivo principal de execução (ex.: `main.py`) |
| `icon` | Não | Nome do ícone Lucide correspondente (ex.: `shield-check`, `ticket`, `file-text`) |
| `min_toolbox_version` | Não | Versão mínima do Toolbox requerida |
| `theme_version` | Não | Versão do tema visual (`material-3`) |

---

## Exemplo Completo: Plugin com Interface `pywebview` + Material 3

### 1. Backend (`main.py`)

```python
#!/usr/bin/env python3
import os
import sys
import webview

class PluginApi:
    """Ponte de comunicação bidirecional entre JavaScript e Python."""
    def processar_dados(self, texto: str) -> dict:
        if not texto:
            return {"success": False, "error": "Texto vazio"}
        
        resultado = texto.strip().upper()
        return {"success": True, "resultado": resultado}

def main():
    ui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui")
    index_path = os.path.join(ui_dir, "index.html")

    api = PluginApi()
    window = webview.create_window(
        title="Meu Plugin — Toolbox",
        url=f"file:///{index_path}",
        js_api=api,
        width=720,
        height=540,
        resizable=True,
    )
    webview.start(debug=False)

if __name__ == "__main__":
    main()
```

### 2. Frontend (`ui/index.html`)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Meu Plugin</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>✨ Meu Plugin</h1>
      <p>Transformador e processador rápido de texto</p>
    </header>

    <main class="content">
      <textarea id="inputTexto" placeholder="Digite seu texto aqui..."></textarea>
      <div class="actions">
        <button id="btnProcessar" class="btn btn-primary">Processar</button>
      </div>
      <div id="saida" class="resultado"></div>
    </main>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

### 3. JavaScript (`ui/app.js`)

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('inputTexto');
  const btn = document.getElementById('btnProcessar');
  const saida = document.getElementById('saida');

  btn.addEventListener('click', async () => {
    const texto = input.value;
    try {
      // Chama método Python exposto em PluginApi
      const resp = await window.pywebview.api.processar_dados(texto);
      if (resp.success) {
        saida.textContent = resp.resultado;
      } else {
        saida.textContent = `Erro: ${resp.error}`;
      }
    } catch (err) {
      saida.textContent = `Falha na comunicação: ${err}`;
    }
  });
});
```

---

## 🗄️ Persistência & Banco de Dados Central

Se o seu plugin necessita armazenar histórico, configurações ou entidades estruturadas:

- **Regra do Ecossistema:** Os plugins **não criam arquivos de banco próprios**.
- Toda persistência estruturada é unificada no **SQLite Central do Toolbox**, localizado em:
  ```text
  %APPDATA%\com.toolbox.desktop\toolbox.db
  ```
- No Linux/macOS, o fallback reside em `~/.toolbox/toolbox.db`.

---

## 🚀 Como Distribuir e Publicar

1. **Empacotamento:** O plugin é distribuído como um arquivo `.zip` contendo todos os seus arquivos internos (`main.py`, `plugin.json`, `ui/`, etc.).
2. **Marketplace:** Ao publicar a release no GitHub, inclua o zip nos assets e registre a nova versão no `catalog.json` oficial.
3. **Instalação pelo Usuário:** No Toolbox, o usuário acessa a aba **Marketplace**, clica em **Instalar/Atualizar** e o plugin é baixado e ativado imediatamente.
