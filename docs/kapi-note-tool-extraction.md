# Relatório de Extração de Lógica das Ferramentas KapiNote (Etapa 5)

**Data:** 2026-08-12  
**Status:** ✅ COMPLETA  

---

## 1. Visão Geral

A **Etapa 5** realizou o isolamento e a extração da lógica pura de domínio, regras de negócio e validações de dados das 4 ferramentas principais oriundas do KapiNote:

1. **Stract JSON**: Extração recursiva de valores por nome de campo.
2. **Converter Data**: Conversão de datas/horas para formato serial Excel (base `1899-12-30`).
3. **Gerador de Marcações**: Geração de `INSERT`s SQL (`R070ACC`) para SQL Server e Oracle com filtro por dia da semana e horários.
4. **Gerador de AFD**: Geração de arquivos de marcação de ponto AFD no padrão REP-C com cálculo de CRC16 (polinômio 0x1021).

---

## 2. Estrutura de Arquitetura Extraída

Cada plugin agora possui uma função pura de domínio (`process_*`) desacoplada de Tkinter, clipboard, navegadores ou banco de dados, retornando dicionários estruturados de resultado e erros:

```
plugins/
├── stract-json/
│   ├── main.py              # UI + process_json_extraction()
│   └── test_domain.py       # Suíte de testes unitários (6 testes)
├── converter-data/
│   ├── main.py              # UI + convert_date_time_to_serial()
│   └── test_domain.py       # Suíte de testes unitários (5 testes)
├── gerador-marcacoes/
│   ├── main.py              # UI + process_gerar_marcacoes()
│   └── test_domain.py       # Suíte de testes unitários (8 testes)
└── gerador-afd/
    ├── main.py              # UI + process_gerar_afd()
    └── test_domain.py       # Suíte de testes unitários (6 testes)
```

---

## 3. Contratos de Entrada e Saída

### 3.1. Stract JSON (`process_json_extraction`)
- **Entrada:** `raw_json: str`, `field_name: str`
- **Saída:** `dict` contendo `success` (bool), `values` (list[str]), `result_str` (str), `error` (str|None)
- **Garantias:** Remoção de duplicados preservando ordem, suporte a objetos `colaborador` aninhados e tratamento gracioso de erros de parsing JSON.

### 3.2. Converter Data (`convert_date_time_to_serial`)
- **Entrada:** `date_str: str` ("YYYY-MM-DD"), `time_str: str` ("HH:MM")
- **Saída:** `dict` contendo `success` (bool), `serial` (float|None), `error` (str|None)
- **Garantias:** Cálculo exato de número serial de dia/fração (base 30/12/1899) e validação rigorosa de formato.

### 3.3. Gerador de Marcações (`process_gerar_marcacoes`)
- **Entrada:** `fields: dict`, `horarios: list[str]`, `datas: list[date]`, `banco: str` ("sqlserver" | "oracle"), `selected_optional: list[str]`
- **Saída:** `dict` contendo `success` (bool), `sql` (str), `count` (int), `error` (str|None)
- **Garantias:** Conversão de horários em minutos, escape de SQL, formatação específica para Oracle (`TO_DATE`) e SQL Server, e ordenação de colunas da tabela `R070ACC`.

### 3.4. Gerador de AFD (`process_gerar_afd`)
- **Entrada:** `rep_number: str`, `cnpj: str`, `razao_social: str`, `data_inicial: str`, `data_final: str`, `colaboradores: list[dict]`
- **Saída:** `dict` contendo `success` (bool), `content` (str), `total_records` (int), `error` (str|None)
- **Garantias:** Formatação dos tipos 1 (Cabeçalho), 2 (Estabelecimento), 3 (Marcações) e 9 (Trailer) com cálculo preciso de CRC16 XModem (polinômio 0x1021) para cada linha.

---

## 4. Resultados dos Testes

Todas as suítes de testes de domínio foram executadas e validadas:
- `plugins/stract-json/test_domain.py`: 6/6 passaram.
- `plugins/converter-data/test_domain.py`: 5/5 passaram.
- `plugins/gerador-marcacoes/test_domain.py`: 8/8 passaram.
- `plugins/gerador-afd/test_domain.py`: 6/6 passaram.

Total: **25/25 testes de domínio aprovados com sucesso (100%)**.
