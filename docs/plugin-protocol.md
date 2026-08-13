# Especificação do Protocolo de Comunicação Toolbox ↔ Plugins (v1.0)

**Versão do Protocolo:** `1.0`  
**Data:** 2026-08-13  
**Status:** Oficial / Estável  

---

## 1. Visão Geral

O **Protocolo Toolbox ↔ Plugins v1.0** define o contrato de comunicação assíncrona entre o container principal do Toolbox (escrito em Rust com Tauri) e os plugins de extensão (Python, Node.js, Rust, executáveis binários).

O protocolo opera sobre os canais padrão de entrada e saída do sistema operacional (**STDIN / STDOUT**):
- **STDIN (Toolbox → Plugin):** O Toolbox envia a requisição de execução formatada em JSON único.
- **STDOUT (Plugin → Toolbox):** O Plugin emite mensagens JSON delimitadas por nova linha (NDJSON) representando a resposta final, atualizações de progresso ou avisos.
- **STDERR / STDOUT não-JSON:** Qualquer saída de texto livre que não seja uma mensagem JSON válida do protocolo é tratada como **log de execução** e roteada para o logger interno do Toolbox (`logger::write_line`), sem corromper o parsing da resposta.

---

## 2. Contrato de Mensagens JSON

### 2.1. Requisição (Toolbox → Plugin)

Enviada no STDIN do processo do plugin imediatamente após o início da execução:

```json
{
  "protocol_version": "1.0",
  "request_id": "req_8a7d9f2e",
  "action": "execute",
  "payload": {
    "args": ["--verbose"],
    "input_data": null
  },
  "context": {
    "plugin_name": "protocol-reference",
    "data_dir": "C:/Users/.../AppData/Local/toolbox",
    "commands_file": "C:/Users/.../AppData/Local/toolbox/commands.json",
    "timeout_ms": 30000
  }
}
```

#### Campos da Requisição:
- `protocol_version` (string, obrigatório): Versão do protocolo utilizada pelo host (ex: `"1.0"`).
- `request_id` (string, obrigatório): Identificador único da requisição para rastreabilidade.
- `action` (string, obrigatório): Ação solicitada ao plugin (ex: `"execute"`).
- `payload` (objeto, obrigatório): Parâmetros específicos passados para a execução.
- `context` (objeto, opcional): Contexto de execução (diretórios, arquivo de comandos, timeout max).

---

### 2.2. Resposta Final (Plugin → Toolbox)

Emitida no STDOUT do processo quando a execução é concluída:

```json
{
  "protocol_version": "1.0",
  "request_id": "req_8a7d9f2e",
  "status": "success",
  "result": {
    "output": "Processamento concluído com sucesso",
    "items_processed": 42
  },
  "error": null,
  "warnings": [
    "O parâmetro 'legacy_flag' está descontinuado"
  ]
}
```

Em caso de erro retornado pelo plugin:

```json
{
  "protocol_version": "1.0",
  "request_id": "req_8a7d9f2e",
  "status": "error",
  "result": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "O arquivo de entrada especificado não foi encontrado",
    "details": "FileNotFoundError: [Errno 2] No such file: 'data.json'"
  },
  "warnings": []
}
```

#### Valores de `status`:
- `"success"`: Execução concluída sem falhas impeditivas.
- `"error"`: Falha na execução do plugin.
- `"warning"`: Sucesso parcial com alertas.
- `"progress"`: Mensagem intermediária de progresso (veja seção 2.3).

---

### 2.3. Mensagens Intermediárias de Progresso (Opcional)

Plugins de longa duração podem emitir updates de progresso no STDOUT antes da resposta final:

```json
{
  "protocol_version": "1.0",
  "request_id": "req_8a7d9f2e",
  "status": "progress",
  "progress": {
    "percent": 45.5,
    "message": "Convertendo registro 455/1000..."
  }
}
```

---

## 3. Códigos de Erro Padronizados

Quando ocorre uma falha no protocolo ou na execução do processo, o Toolbox categoriza o erro utilizando os seguintes códigos padronizados:

| Código | Nome | Descrição |
|---|---|---|
| `-32600` | `INVALID_MESSAGE` | A mensagem enviada/recebida não atende ao schema JSON do protocolo. |
| `-32601` | `UNSUPPORTED_VERSION` | A versão do protocolo informada não é suportada. |
| `-32602` | `INCOMPLETE_RESPONSE` | O processo do plugin encerrou sem emitir uma resposta final válida. |
| `-32603` | `TIMEOUT` | A execução do plugin excedeu o limite máximo de tempo (`timeout_ms`). |
| `-32604` | `PROCESS_EXITED` | O processo do plugin finalizou abruptamente (código de saída != 0). |
| `-32605` | `INTERNAL_ERROR` | Exceção não capturada ou falha interna do executor Rust. |
| `-32606` | `OUTPUT_TOO_LARGE` | A resposta do plugin excedeu o tamanho máximo permitido (10 MB). |

---

## 4. Regras de Isolamento de Logs e STDIO

Para garantir que logs e prints não corrompam a comunicação JSON:
1. **Diferenciação por Schema:** O executor do Toolbox analisa cada linha do STDOUT. Se for um objeto JSON válido contendo os campos `"protocol_version"` e `"request_id"`, é processado como mensagem do protocolo.
2. **Direcionamento de Logs:** Qualquer linha que não seja uma mensagem do protocolo é encaminhada ao logger do Toolbox como log de nível `INFO` (se vinda do STDOUT) ou `WARN` (se vinda do STDERR).
3. **SDKs Helper:** As bibliotecas auxiliares (ex: `ToolboxProtocolHandler` em Python) garantem o redirecionamento transparente de `stdout` regular para os logs do Toolbox, mantendo apenas as mensagens JSON no canal limpo de resposta.

---

## 5. Limites e Controle de Processos

- **Timeout:** Por padrão, o Toolbox aguarda até **30 segundos** (configurável via manifesto ou contexto).
- **Encerramento Forçado:** Em caso de timeout, o Toolbox envia uma solicitação de encerramento gracioso e, caso o processo não responda em 2 segundos, cancela a árvore de processos (`process tree kill`).
- **Buffer de Saída:** O tamanho máximo combinado de buffers de resposta é limitado a **10 MB** para evitar exaustão de memória.

---

## 6. Compatibilidade com Plugins Legados

Plugins que não declararem o campo `"protocol_version"` no manifesto `plugin.json` continuam sendo executados no **modo legado** (`spawn` de processo simples com streaming do STDOUT/STDERR para logs e retorno imediato), garantindo 100% de retrocompatibilidade.
