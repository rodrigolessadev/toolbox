---
id: "har-kibana-planner"
name: "HAR Kibana Planner"
description: "Gera planos de consulta determinísticos no Elasticsearch/Kibana a partir de arquivos HAR 1.2."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "har-kibana-planner"
tags: ["har-kibana-planner"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/har-kibana-planner-1.0.0/har-kibana-planner.zip"
updated_at: "2026-08-14"
---
## 📌 Visão Geral

O plugin **HAR Kibana Planner** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Gera planos de consulta determinísticos no Elasticsearch/Kibana a partir de arquivos HAR 1.2.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **HAR Kibana Planner** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `har-kibana-planner` ou selecionando-o na lista de ferramentas.

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

## Objetivo do Plugin
O **HAR Kibana Planner** analisa arquivos HTTP Archive (HAR 1.2) gerados pelo DevTools dos navegadores, extrai sinais determinísticos de correlação (Trace IDs, Request IDs, Correlation IDs, Business IDs, falhas e rotas) e gera um **Plano Estruturado de Consultas** (Elasticsearch Query DSL e Kibana Query Language - KQL) para localizar logs relevantes no Kibana/Elasticsearch.

O plugin não executa chamadas de rede contra o cluster, atuando como um gerador de estratégias declarativas para posterior consumo por analistas ou MCPs (Model Context Protocol).

---

## Diferença entre Horário do HAR e Horário dos Logs (Clock Skew)
- O navegador registra o `startedDateTime` com base no relógio da máquina do usuário.
- Servidores de aplicação e bancos de dados utilizam NTP sincronizado com seus próprios fusos e latências de rede.
- O plugin aplica automaticamente uma tolerância de **Clock Skew** (`clock_skew_ms`, padrão: 5000ms) somada a janelas de contexto pré e pós requisição (`context_before_ms` e `context_after_ms`, padrão: 10000ms) para evitar perda de logs que ocorreram milissegundos antes ou depois da percepção do browser.

---

## Configuração de Mapeamento de Campos (`field_mapping`)
```json
{
  "field_mapping": {
    "timestamp": ["@timestamp", "timestamp", "event.created"],
    "service": ["service.name", "service", "app"],
    "request_id": ["request.id", "request_id", "requestId"],
    "trace_id": ["trace.id", "trace_id", "traceId"],
    "span_id": ["span.id", "span_id", "spanId"],
    "correlation_id": ["correlation.id", "correlation_id", "correlationId"],
    "http_method": ["http.request.method", "method"],
    "http_status": ["http.response.status_code", "status_code", "status"],
    "url_path": ["url.path", "http.request.path", "path"]
  }
}
```

---

## Regras de Mascaramento e Segurança
- `Authorization`, `Proxy-Authorization`, `Cookie`, `Set-Cookie`, `x-api-key`, `apikey` e `JWTs` são totalmente sanitizados (`[REDACTED]`).
- O arquivo HAR original **nunca é modificado**.
- Nenhum script embutido ou payload é executado.

---

## Estratégias de Consulta por Prioridade
1. **`trace_id`**: Correlação exata ponta a ponta distribuída (APM/OpenTelemetry).
2. **`request_id`**: Correlação exata de requisição no gateway/proxy reverso.
3. **`correlation_id`**: Identificador de fluxo assíncrono ou mensageria.
4. **`order_id` / `transaction_id`**: Identificador de transação de negócio.
5. **Serviço + Endpoint + Intervalo**: Fallback estruturado para rastreamento de falhas.
6. **Método + Host + Path + Intervalo**: Fallback de rota web.
7. **Intervalo Temporal da Sessão**: Janela global de observabilidade.

---

## Como Conectar a um MCP de Kibana
O payload gerado em `query_plan[].query_dsl` e `query_plan[].kql` segue as especificações oficiais do Elasticsearch e pode ser repassado diretamente para ferramentas como:
- `@modelcontextprotocol/server-elasticsearch`
- Scripts de busca via Python `elasticsearch-py`
- Barra de pesquisa Discover do Kibana via KQL.
