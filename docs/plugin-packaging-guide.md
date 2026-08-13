# Guia de Empacotamento de Plugins — Toolbox 2.0 (Etapa 6)

**Data:** 2026-08-12  
**Versão do Contrato de Manifesto:** 2.0 (`PluginManifest` v1)

---

## 1. Visão Geral

Este documento descreve as especificações e procedimentos para empacotamento, declaração de capacidades, registro no catálogo e validação dos 4 plugins migrados do KapiNote:

- `stract-json`
- `converter-data`
- `gerador-marcacoes`
- `gerador-afd`

---

## 2. Estrutura de Diretórios dos Pacotes

Cada plugin reside em um diretório próprio dentro de `plugins/` e deve possuir no mínimo o manifesto `plugin.json` e o ponto de entrada declarado (`main.py`):

```
plugins/
├── stract-json/
│   ├── plugin.json
│   ├── main.py
│   └── test_domain.py
├── converter-data/
│   ├── plugin.json
│   ├── main.py
│   └── test_domain.py
├── gerador-marcacoes/
│   ├── plugin.json
│   ├── main.py
│   └── test_domain.py
└── gerador-afd/
    ├── plugin.json
    ├── main.py
    └── test_domain.py
```

---

## 3. Especificação do Manifesto (`plugin.json`)

Todos os pacotes devem seguir estritamente o schema `PluginManifest` v2 (`src-tauri/src/plugin.rs`).

Exemplo do manifesto de `gerador-afd/plugin.json`:

```json
{
  "name": "Gerador de AFD",
  "version": "1.0.0",
  "description": "Gera arquivo AFD (Arquivo de Fonte de Dados) no padrão REP-C com CRC16.",
  "author": "Toolbox Team",
  "language": "python",
  "entry": "main.py",
  "capabilities": [
    "clipboard",
    "file_export"
  ],
  "min_toolbox_version": "1.0.0"
}
```

### Campos do Manifesto:
- **name**: Nome amigável exibido na UI.
- **version**: Versão do pacote no formato SemVer (`1.0.0`).
- **description**: Descrição das funcionalidades do plugin.
- **author**: Desenvolvedor ou time responsável.
- **language**: Runtime de execução (`python`, `node`, `rust`, `exe`, `webview`).
- **entry**: Arquivo principal de execução (`main.py`).
- **capabilities**: Recursos requeridos (`clipboard`, `file_export`, `file_read`).
- **min_toolbox_version**: Versão mínima do Toolbox requerida.

---

## 4. Registro no Catálogo Oficial (`commands.json`)

Para que o Toolbox reconheça e exiba o plugin no catálogo, ele deve estar cadastrado em [`commands.json`](file:///c:/tools/toolbox/commands.json):

```json
{
  "commands": {
    "stract-json": {
      "type": "plugin",
      "path": "plugins/stract-json",
      "favorite": true,
      "icon": "🔍"
    },
    "converter-data": {
      "type": "plugin",
      "path": "plugins/converter-data",
      "favorite": true,
      "icon": "📅"
    },
    "gerador-marcacoes": {
      "type": "plugin",
      "path": "plugins/gerador-marcacoes",
      "favorite": true,
      "icon": "🗄️"
    },
    "gerador-afd": {
      "type": "plugin",
      "path": "plugins/gerador-afd",
      "favorite": true,
      "icon": "📄"
    }
  }
}
```

---

## 5. Procedimento de Validação Automática

A integridade dos pacotes do catálogo é validada automaticamente por meio de testes automatizados:

### 5.1. Testes em Rust (`cargo test`)
O arquivo [`src-tauri/src/plugin.rs`](file:///c:/tools/toolbox/src-tauri/src/plugin.rs) executa o teste `test_validate_all_workspace_plugins` que:
1. Varre o diretório `plugins/`.
2. Desserializa e valida cada `plugin.json` contra as regras do `PluginManifest`.
3. Garante que o arquivo de entrypoint (`main.py`) existe fisicamente no disco.

### 5.2. Testes Python por Pacote
Cada plugin possui testes unitários isolados executáveis via `unittest`:
```bash
python -m unittest discover -s plugins/stract-json -p test_domain.py
python -m unittest discover -s plugins/converter-data -p test_domain.py
python -m unittest discover -s plugins/gerador-marcacoes -p test_domain.py
python -m unittest discover -s plugins/gerador-afd -p test_domain.py
```
