---
id: "analysis-orchestrator"
name: "Analysis Orchestrator"
description: "Orquestra a análise ponta a ponta executando sanitização, filtragem, otimização, timeline e evidências."
version: "1.0.1"
author: "Rodrigo Lessa"
language: "python"
command: "analysis-orchestrator"
tags: ["logs", "har", "timeline", "orchestrator", "incident"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/analysis-orchestrator-1.0.1/analysis-orchestrator.zip"
updated_at: "2026-08-14"
---
## 📌 Visão Geral

O plugin **Analysis Orchestrator** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Orquestra a análise ponta a ponta executando sanitização, filtragem, otimização, timeline e evidências.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **Analysis Orchestrator** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `analysis-orchestrator` ou selecionando-o na lista de ferramentas.

### 2. Protocolo Headless (IPC v1.0)
Para integrações via linha de comando ou automações externas, o plugin suporta o **Protocolo Toolbox IPC v1.0** via `STDIN`/`STDOUT` no formato JSON:

#### Exemplo de Entrada (STDIN):
```json
{
  "protocol_version": "1.0",
  "request_id": "req_001",
  "action": "run",
  "input": {
    "sample_field": "valor_de_exemplo"
  },
  "options": {}
}
```

#### Exemplo de Saída (STDOUT):
```json
{
  "protocol_version": "1.0",
  "request_id": "req_001",
  "status": "success",
  "result": {
    "output": "Operação realizada com sucesso."
  },
  "error": null,
  "warnings": []
}
```

---

## 🔒 Segurança e Privacidade
- **Processamento 100% Local**: O plugin executa exclusivamente no ambiente do usuário, sem chamadas para APIs de terceiros ou serviços externos.
- **Determinismo**: Todas as saídas são geradas por algoritmos e regras determinísticas.
- **Não Destrutivo**: O plugin nunca sobrescreve arquivos originais sem autorização explícita.


---

## 📖 Documentação Detalhada

Plugin orquestrador determinístico do ecossistema Toolbox para investigações técnicas e análise de incidentes.

## 🎯 Objetivo
Automatizar a execução integrada e sequencial dos 8 plugins de análise (`log-sanitizer`, `incident-filter`, `log-optimizer`, `log-cluster`, `log-timeline`, `har-optimizer`, `source-extractor` e `evidence-package`), gerando uma árvore estruturada de resultados, manifestos de integridade e resumos executivos.

## 🚀 Ações Suportadas
1. **`run_analysis`**: Executa o pipeline completo (com suporte a `dry_run: true` para simulação).
2. **`discover`**: Descobre e cataloga arquivos do diretório de análise e planeja as etapas sem executar.
3. **`run_plugin`**: Executa uma única etapa/plugin isoladamente sobre o diretório de análise.
4. **`validate_results`**: Valida a conformidade de uma pasta de resultados gerada anteriormente.
5. **`resume`**: Retoma a execução a partir de um manifesto de resultados anterior, executando etapas pendentes.

## 📁 Estrutura do Diretório de Resultados
```
analysis-directory/
├── logs/
├── har/
├── source/
├── metadata/
└── analysis-results-YYYYMMDD-HHMMSS/
    ├── manifest.json
    ├── execution-summary.json
    ├── sanitized/
    ├── filtered/
    ├── optimized/
    ├── clusters/
    ├── timelines/
    ├── source-extracts/
    ├── evidence/
    ├── reports/
    └── logs/
```

## 🔒 Segurança e Regras Determinísticas
- **Não utiliza IA**, LLMs ou modelos probabilísticos.
- Leitura não-destrutiva dos arquivos originais (nunca sobrescreve ou apaga a entrada).
- Proteção contra path traversal e criação estrita dentro do escopo de análise.
- Mascaramento e higienização estritos de secrets e credenciais.
