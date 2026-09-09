# Configuração do Webhook de Feedbacks (Google Apps Script + Google Sheets)

Este documento descreve como configurar e implantar o Web App no **Google Apps Script** conectado ao **Google Sheets** para persistência e triagem de feedbacks do ecossistema Toolbox.

---

## 1. Criar a Planilha no Google Sheets

1. Crie uma nova planilha no [Google Sheets](https://sheets.new) com o nome: `Toolbox - Feedbacks`.
2. Renomeie a primeira aba (aba ativa) para: `Feedbacks`.
3. Na primeira linha (cabeçalho), insira as seguintes colunas exatamente nesta ordem:

| Coluna A | Coluna B | Coluna C | Coluna D | Coluna E | Coluna F | Coluna G | Coluna H | Coluna I |
|---|---|---|---|---|---|---|---|---|
| **ID** | **Data** | **Versão** | **Tipo** | **Mensagem** | **Email** | **Plataforma** | **Status** | **PageURL** |

---

## 2. Configurar o Google Apps Script

1. Na planilha, clique no menu superior **Extensões** > **Apps Script**.
2. Substitua o conteúdo de `Código.gs` (ou `Code.gs`) pelo código abaixo:

```javascript
/**
 * Toolbox Ecosystem - Webhook de Feedbacks (Google Sheets API)
 * Suporta consulta (doGet) para triagem e escrita/atualização (doPost).
 */

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return responseJson({ status: "success", feedbacks: [], total: 0 });
    }

    var feedbacks = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      feedbacks.push({
        id: String(r[0] || ('row-' + (i + 1))),
        created_at: r[1] ? new Date(r[1]).toISOString() : new Date().toISOString(),
        app_version: String(r[2] || 'N/A'),
        type: String(r[3] || 'other'),
        message: String(r[4] || ''),
        email: r[5] ? String(r[5]) : null,
        platform: String(r[6] || 'N/A'),
        status: String(r[7] || 'new'),
        page_url: String(r[8] || 'desktop://toolbox/main'),
        row_index: i + 1
      });
    }

    // Ordenação decrescente (feedbacks mais recentes primeiro)
    feedbacks.reverse();

    return responseJson({ status: "success", feedbacks: feedbacks, total: feedbacks.length });
  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);

    // 1. Atualização de status de triagem (utilizado pelo toolbox-release)
    if (payload.action === "update_status") {
      var targetId = String(payload.id);
      var newStatus = String(payload.status);
      var rows = sheet.getDataRange().getValues();
      var found = false;

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId || ('row-' + (i + 1)) === targetId) {
          sheet.getRange(i + 1, 8).setValue(newStatus); // Coluna H (8): Status
          found = true;
          break;
        }
      }
      return responseJson({ status: found ? "success" : "not_found" });
    }

    // 2. Inserção de novo feedback (aplicativo Desktop e Site)
    var feedbackId = payload.id || Utilities.getUuid();
    sheet.appendRow([
      feedbackId,
      new Date(),
      payload.version || 'N/A',
      payload.type || 'other',
      payload.message || '',
      payload.email || '',
      payload.platform || 'N/A',
      'new', // Status inicial
      payload.page_url || ''
    ]);

    return responseJson({ status: "success", id: feedbackId });
  } catch (err) {
    return responseJson({ status: "error", message: err.toString() });
  }
}

function responseJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3. Implantar como Web App

1. No editor do Apps Script, clique no botão superior direito **Implantar** > **Nova implantação**.
2. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha **Aplicativo da Web**.
3. Preencha as configurações:
   - **Descrição:** `Toolbox Feedback Webhook v1`
   - **Executar como:** `Eu (<seu-email@gmail.com>)`
   - **Quem tem acesso:** `Qualquer pessoa` *(essencial para permitir o envio anônimo a partir do app/site)*
4. Clique em **Implantar**.
5. Conceda as permissões solicitadas pela sua conta Google.
6. Copie a **URL do aplicativo da Web** gerada (exemplo: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 4. Configurar no Ecossistema

- No Desktop (`toolbox/.env`):
  ```env
  VITE_FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/SEU_ID/exec
  ```

- No Site (`toolbox/site/.env`):
  ```env
  VITE_FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/SEU_ID/exec
  PUBLIC_FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/SEU_ID/exec
  ```
