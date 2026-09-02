---
title: "Guia de Plugins"
description: "Crie seus próprios plugins para o Toolbox em qualquer linguagem."
---

Um **plugin** é um utilitário ou aplicação independente que o Toolbox sabe executar. Você pode criar automações para validação de dados, orquestração de logs, gestão de segredos, cálculo de prazos ou qualquer ferramenta personalizada para seu fluxo de trabalho.

O melhor: **você não precisa saber Rust nem alterar o código-fonte do Toolbox**. Plugins são organizados em diretórios independentes com manifesto `plugin.json` e frontend moderno.

---

## 📦 Plugins Oficiais Integrados

O ecossistema oficial conta com uma variedade de plugins prontos para instalação no **Marketplace do Toolbox**:

| Plugin | O que faz | Categoria |
|---|---|---|
| `safe` | Cofre seguro de senhas, biometria Windows Hello e integração KeePassXC | Segurança |
| `markdown-viewer` | Visualizador e editor GFM com múltiplas abas dinâmicas e Hot Exit | Documentação |
| `novo-ticket` | Criação de estrutura de chamados e extrator temporal de logs | Suporte |
| `logon-aws` | Logon AWS SSO e túneis SSM com conexão em 1 clique | Infraestrutura |
| `gerador-marcacoes` | Gera scripts de inserção SQL para espelho de ponto | Banco de Dados |
| `gerador-afd` | Cria arquivos AFD no padrão REP-C com CRC16 | RH & Ponto |
| `calc-jornadas` | Calculadora de jornadas de trabalho e horas noturnas | RH & Ponto |
| `cpf` | Gerador e validador de CPF com cópia rápida | Utilitário |
| `gerador-json` | Formatador, validador de sintaxe e mock data JSON | Desenvolvimento |
| `stract-log` & `stract-json` | Filtros e extratores avançados de logs e JSON | Análise |
| `analysis-orchestrator` | Suíte completa de análise de incidentes e timeline de logs | Suporte |
| `har-kibana-planner` | Gera planos de consulta determinísticos a partir de arquivos HAR | Análise |
| `converter-data` | Conversão bidirecional entre data/hora e serial Excel/Lotus | Utilitário |

---

## 🛠️ A Estrutura de um Plugin

Cada plugin é uma **pasta** dentro de `plugins/`. A estrutura padrão adota `pywebview` para interfaces gráficas com visual Material 3:

```text
plugins\
└── meu-plugin\
    ├── plugin.json         ← Manifesto com nome, versão e configurações
    ├── main.py             ← Backend Python (inicializa a janela e métodos)
    └── ui\                 ← Frontend HTML / CSS / JS
        ├── index.html
        ├── app.js
        └── style.css
```

---

## 📄 O Arquivo `plugin.json`

O `plugin.json` identifica seu plugin para o launcher e para o Marketplace:

```json
{
  "name": "Meu Plugin",
  "version": "1.0.0",
  "description": "Descrição curta do que o plugin faz",
  "author": "Seu Nome",
  "entry": "main.py",
  "language": "python",
  "icon": "sparkles",
  "min_toolbox_version": "1.22.3",
  "theme_version": "material-3"
}
```

---

## 🚀 Como Instalar e Executar

1. **Pelo Marketplace do Toolbox (Recomendado):**
   - Abra o Toolbox (`Ctrl + Space`).
   - Acesse a aba **Marketplace**.
   - Localize o plugin desejado e clique em **Instalar / Atualizar**. O download e a ativação são imediatos.
2. **Desenvolvimento Local:**
   - Coloque a pasta do seu plugin dentro de `%APPDATA%\com.toolbox.desktop\plugins\`.
   - O Toolbox detectará automaticamente o plugin na próxima execução.

---

## 🗄️ Onde os Arquivos e Dados Ficam Salvos

O Toolbox padroniza seus dados no diretório corporativo:

```text
%APPDATA%\com.toolbox.desktop\
├── toolbox.db              ← Banco de dados central SQLite (histórico, comandos, configurações)
├── logs\                   ← Logs de execução e diagnóstico
└── plugins\                ← Plugins instalados localmente
```

---

## 💡 Boas Práticas de Desenvolvimento

- **Interface Visual:** Utilize **`pywebview`** com HTML/CSS responsivo e tema escuro Material 3. Evite bibliotecas descontinuadas como `tkinter`.
- **Persistência Estruturada:** Utilize o banco de dados central `toolbox.db` para gravar dados e histórico do plugin.
- **Não Bloqueie a Thread Principal:** Em operações demoradas (como downloads ou processamentos pesados), execute em threads separadas para manter a UI responsiva.
- **Logs:** Registre mensagens através do módulo de logging padrão apontando para a pasta `logs/`.
