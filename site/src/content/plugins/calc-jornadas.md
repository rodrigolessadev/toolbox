---
id: "calc-jornadas"
name: "Calculadora de Jornadas"
description: "Calcula horas normais, noturnas e noturnas reduzidas por jornada de trabalho."
version: "1.1.0"
author: "Rodrigo Lessa"
language: "python"
command: "calc-jornadas"
icon: "calculator"
tags: ["rh", "jornada", "horas", "trabalho"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/calc-jornadas-1.1.0/calc-jornadas.zip"
updated_at: "2026-08-18"
---

# ⏱️ Calculadora de Jornadas de Trabalho

A **Calculadora de Jornadas** permite apurar de forma precisa o total de horas trabalhadas, segregando horas normais diurnas, horas noturnas e o cálculo da redução ficta noturna conforme a CLT (onde 52 minutos e 30 segundos equivalem a 1 hora de trabalho).

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `calc-jornadas` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Preenchimento dos Horários
1. No campo **Entrada**, informe o horário de início do expediente no formato `HH:MM` (ex: `08:00` ou `22:00`).
2. No campo **Saída**, informe o horário de término do expediente no formato `HH:MM` (ex: `17:00` ou `06:00`).
3. *(Opcional)* Se a jornada possui intervalo de almoço/refeição:
   - Informe a **Saída para Intervalo** e o **Retorno do Intervalo**.

### 2. Parâmetros Noturnos
- Por padrão, o início do horário noturno é definido para às `22:00` e o término às `05:00`.
- Se o seu acordo coletivo utilizar horários diferenciados (ex: rural ou categorias especiais), ajuste os campos **Início Noturno** e **Fim Noturno**.

### 3. Visualização do Resultado
1. Clique no botão **Calcular**.
2. O painel inferior exibirá o resumo detalhado:
   - **Total de Horas Trabalhadas** (tempo bruto decorrido).
   - **Horas Normais Diurnas**.
   - **Horas Noturnas com Redução Ficta (52m30s)**.
   - **Valor Estimado do Adicional Noturno**.
3. Clique em **Copiar Resumo** para colar as informações no seu e-mail ou planilha.

---

## 💡 Dicas Úteis & Casos Especiais

> [!NOTE]
> **Jornadas que Viram a Noite**: O plugin calcula automaticamente jornadas que cruzam a meia-noite (por exemplo, entrada às `22:00` de um dia e saída às `06:00` do dia seguinte).

> [!TIP]
> **Digitação Rápida**: Você pode digitar os 4 números seguidos (ex: `0800`), e a máscara colocará os dois pontos (`:`) automaticamente.
