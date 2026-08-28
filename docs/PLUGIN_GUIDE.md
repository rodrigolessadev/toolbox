# Guia de Desenvolvimento de Plugins — Toolbox 2.0

> 📖 Para detalhes do protocolo IPC e contratos técnicos, veja [`plugin-protocol.md`](./plugin-protocol.md) e [`plugin-contract.md`](./plugin-contract.md).

---

## 🧩 O que é um Plugin?

No ecossistema **Toolbox 2.0**, os plugins são módulos independentes que oferecem utilitários focados e de alto desempenho. O ecossistema oficial é mantido no repositório descentralizado [`rodrigolessadev/toolbox-plugins`](https://github.com/rodrigolessadev/toolbox-plugins), onde cada plugin possui seu próprio ciclo de lançamento e distribuição via **Marketplace**.

Um plugin consiste em:
1. `plugin.json`: manifesto com metadados, permissões e entrypoint.
2. Entrypoint executável: tipicamente Python (`main.py`) com interface moderna **Pywebview (HTML/CSS/JS)** ou CLI via IPC.
3. Assets e estilos: suporte ao Design System e temas oficiais (**Material 3**, Claro, Escuro e Alto Contraste).

---

## 📁 Estrutura Padrão de um Plugin

```
plugins/
└── meu-plugin/
    ├── plugin.json          # Manifesto do plugin
    ├── main.py              # Entrypoint (Python / Pywebview ou CLI)
    └── ui/                  # (Opcional) Interface web para Pywebview
        ├── index.html
        ├── styles.css
        └── app.js
```

---

## 📝 Manifesto `plugin.json`

Exemplo completo e recomendado:

```json
{
  "name": "Meu Plugin",
  "version": "1.0.0",
  "description": "Descrição clara e objetiva do que o plugin faz.",
  "author": "Seu Nome",
  "language": "python",
  "entry": "main.py",
  "icon": "shield-check",
  "min_toolbox_version": "1.22.3",
  "theme_version": "material-3"
}
```

### Campos do Manifesto

| Campo | Obrigatório | Descrição | Exemplo |
| :--- | :---: | :--- | :--- |
| `name` | ✅ Sim | Nome amigável de exibição | `"Validador de CPF"` |
| `version` | ✅ Sim | Versão SemVer | `"1.0.0"` |
| `language` | ✅ Sim | Linguagem do runtime | `"python"`, `"node"`, `"rust"`, `"exe"` |
| `entry` | ✅ Sim | Arquivo ou binário de entrada | `"main.py"` |
| `description` | ❌ Não | Resumo das funcionalidades | `"Valida e formata CPFs"` |
| `author` | ❌ Não | Nome do autor/mantenedor | `"Rodrigo Lessa"` |
| `icon` | ❌ Não | Nome do ícone Lucide | `"shield-check"`, `"key"` |
| `min_toolbox_version` | ❌ Não | Versão mínima do Toolbox necessária | `"1.22.3"` |
| `theme_version` | ❌ Não | Padrão de tema utilizado | `"material-3"` |

---

## 🚀 Padrões de Interface

### 1. Pywebview (Recomendado para UIs Ricas)
Plugins modernos utilizam `pywebview` para renderizar interfaces HTML5, CSS3 e JavaScript modernas com visual nativo:

```python
import webview
import os

class Api:
    def process_data(self, payload):
        return {"status": "ok", "result": f"Recebido: {payload}"}

if __name__ == "__main__":
    api = Api()
    html_path = os.path.join(os.path.dirname(__file__), "ui", "index.html")
    webview.create_window("Meu Plugin", html_path, js_api=api, width=800, height=600)
    webview.start()
```

### 2. Protocolo IPC (STDIN / STDOUT)
Para plugins integrados diretamente às modais do Toolbox ou ferramentas CLI:
- Entrada recebida via `sys.stdin` (JSON ou NDJSON).
- Saída emitida via `sys.stdout` no formato especificado pelo [`plugin-protocol.md`](./plugin-protocol.md).

---

## 📦 Distribuição e Marketplace

1. Desenvolva o plugin dentro do repositório `toolbox-plugins/plugins/<id>`.
2. Inclua o registro no arquivo `catalog.json` com `version`, `download_url` e `icon`.
3. Ao criar a tag Git (ex: `<id>-1.0.0`), o GitHub Actions compila o arquivo `.zip` e publica a release automaticamente.
4. Os usuários podem instalar ou atualizar o plugin com 1 clique através da aba **Marketplace** no Toolbox.

