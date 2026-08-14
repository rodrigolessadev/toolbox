---
id: "stract-log"
name: "Stract Log"
description: "Filtra e extrai blocos de log por nível, parâmetro adicional e regra de recorrência (mais recente / mais antiga). Salva o resultado em um arquivo .log ao lado do original."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "stract-log"
tags: ["log", "suporte", "filtro", "análise"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/stract-log-1.0.0/stract-log.zip"
updated_at: "2026-08-14"
---
## 📌 Visão Geral

O plugin **Stract Log** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Filtra e extrai blocos de log por nível, parâmetro adicional e regra de recorrência (mais recente / mais antiga). Salva o resultado em um arquivo .log ao lado do original.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **Stract Log** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `stract-log` ou selecionando-o na lista de ferramentas.

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

Filtra arquivos de log por **nível**, **parâmetro adicional** e regra de
**recorrência**, salvando o resultado em um arquivo `.log` no mesmo diretório
do arquivo de origem.

## Como executar

O Toolbox descobre este plugin automaticamente. Digite `stract-log` na barra
de pesquisa e pressione **Enter**.

## Campos da interface

| Campo | Descrição |
|-------|-----------|
| Arquivo | Caminho do arquivo de log (botão para procurar no disco) |
| Level | Lista com os níveis mais comuns — `SEVERE`, `WARNING`, `INFO`, `FINE`, `ERROR` |
| Parâmetro adicional | Texto opcional que deve aparecer no bloco de log |
| Recorrências | Quando marcado, agrupa blocos com o mesmo conteúdo (ignorando data) e mantém apenas a ocorrência *Mais recente* ou *Mais antiga* |
| Ocorrência | `Mais recente` (padrão) ou `Mais antiga`. Habilitado somente quando *Recorrências* está marcado |

## Saída

O resultado é gravado em
`<diretório do arquivo>/<nome>-stract-<YYYYMMDD-HHMMSS>.log` com os blocos
filtrados na mesma ordem em que aparecem no arquivo original.

## Requisitos

- Python 3.7+ (Tkinter é nativo)
