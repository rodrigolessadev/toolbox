---
id: "calc-jornadas"
name: "Calculadora de Jornadas"
description: "Calcula horas normais, noturnas e noturnas reduzidas por jornada de trabalho."
version: "1.1.0"
author: "Rodrigo Lessa"
language: "python"
command: "calc-jornadas"
tags: ["rh", "jornada", "horas", "trabalho"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/calc-jornadas-1.1.0/calc-jornadas.zip"
updated_at: "2026-08-13"
---
## 📌 Visão Geral

O plugin **Calculadora de Jornadas** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Calcula horas normais, noturnas e noturnas reduzidas por jornada de trabalho.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **Calculadora de Jornadas** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `calc-jornadas` ou selecionando-o na lista de ferramentas.

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
