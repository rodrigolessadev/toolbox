import React, { useState, useEffect, useCallback } from "react";
import { FormGroup } from "./FormGroup";
import { Input } from "./Input";
import { Button } from "./Button";
import { Select } from "./Select";
import { ResultArea } from "./ResultArea";
import { ValidationMessage } from "./ValidationMessage";
import { api } from "../lib/api";

interface GeradorMarcacoesModalProps {
  open: boolean;
  onClose: () => void;
  onInfo?: (msg: string) => void;
  onError?: (msg: string) => void;
}

const INSERT_ORDER = [
  "NUMCRA","DATACC","HORACC","SEQACC","TIPACC","CODPLT","CODRLG","CODFNC",
  "DIRACC","QTDACC","ORIACC","USOMAR","NUMEMP","TIPCOL","NUMCAD",
  "DATAPU","CODREF","USOREF","VALREF","CODSOR","FLAACC","CODBNF",
  "STARLG","EXCPON","CODDSP","MOTIGN","NUMNSR",
];

const NUMERIC_FIELDS = new Set([
  "NUMCRA","HORACC","SEQACC","TIPACC","CODPLT","CODRLG","CODFNC",
  "QTDACC","USOMAR","NUMEMP","TIPCOL","NUMCAD","CODREF","USOREF",
  "VALREF","CODSOR","FLAACC","CODBNF","STARLG","CODDSP","MOTIGN","NUMNSR",
]);

const DATE_FIELDS = new Set(["DATACC", "DATAPU"]);

const DEFAULTS: Record<string, string> = {
  NUMCRA: "600000010",
  USOMAR: "2",
  NUMEMP: "1",
  TIPCOL: "1",
  NUMCAD: "0",
  DATACC: "03-04-2025 00:00:00.000",
  HORACC: "720",
  SEQACC: "1",
  TIPACC: "1",
  CODPLT: "1",
  CODRLG: "1",
  CODFNC: "0",
  DIRACC: "E",
  QTDACC: "1",
  ORIACC: "E",
  DATAPU: "31-12-1900 00:00:00.000",
  CODREF: "0",
  USOREF: "0",
  VALREF: "0",
  CODSOR: "0",
  FLAACC: "0",
  CODBNF: "0",
  STARLG: "0",
  EXCPON: "N",
  CODDSP: "0",
  MOTIGN: "0",
  NUMNSR: "0",
};

function timeToMinutes(t: string): string {
  const [h, m] = t.split(":").map((v) => parseInt(v, 10));
  return String(h * 60 + m);
}

function escapeSql(v: string): string {
  return v.replace(/'/g, "''");
}

function formatDate(value: string, banco: string): string {
  let val = value;
  if (val.includes("/")) {
    const parts = val.split(" ");
    const [d, mo, y] = parts[0].split("/");
    val = `${d}-${mo}-${y} ${parts[1] || "00:00:00.000"}`;
  }
  if (banco === "sqlserver") {
    return `'${val}'`;
  }
  const withoutMs = val.split(".")[0];
  return `TO_DATE('${withoutMs}', 'DD-MM-YYYY HH24:MI:SS')`;
}

function formatValue(field: string, value: string, banco: string): string {
  if (NUMERIC_FIELDS.has(field)) return value;
  if (DATE_FIELDS.has(field)) return formatDate(value, banco);
  return `'${escapeSql(value)}'`;
}

export function processGerarMarcacoesClient(
  numCra: string,
  horarios: string[],
  banco: string,
  extraFields: Record<string, string>
) {
  const activeTimes = horarios.filter((h) => h.trim() !== "");
  if (activeTimes.length === 0) {
    return { success: false, sql: "", totalRecords: 0, error: "Ao menos um horário deve ser fornecido." };
  }

  const fields: Record<string, string> = { ...DEFAULTS, NUMCRA: numCra, ...extraFields };
  const lines: string[] = [];

  for (const hora of activeTimes) {
    const vm: Record<string, string> = {};
    for (const fname of INSERT_ORDER) {
      let raw = fields[fname] || DEFAULTS[fname] || "0";
      if (fname === "HORACC") {
        raw = timeToMinutes(hora);
      }
      vm[fname] = formatValue(fname, raw, banco);
    }
    const cols = INSERT_ORDER.join(",");
    const vals = INSERT_ORDER.map((c) => vm[c]).join(",");
    lines.push(`INSERT INTO R070ACC(${cols}) VALUES(${vals})`);
  }

  const sql = lines.join("\n");
  return { success: true, sql, totalRecords: lines.length, error: null };
}

export const GeradorMarcacoesModal: React.FC<GeradorMarcacoesModalProps> = ({
  open,
  onClose,
  onInfo,
  onError,
}) => {
  const [numCra, setNumCra] = useState("600000010");
  const [banco, setBanco] = useState("sqlserver");
  const [horarios, setHorarios] = useState<string[]>(["08:00", "12:00", "13:00", "18:00"]);
  const [numEmp, setNumEmp] = useState("1");
  const [numCad, setNumCad] = useState("0");
  const [sqlResult, setSqlResult] = useState("");
  const [recordCount, setRecordCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStatusMsg(null);
    }
  }, [open]);

  const handleGenerate = useCallback(() => {
    setStatusMsg(null);
    const res = processGerarMarcacoesClient(numCra, horarios, banco, {
      NUMEMP: numEmp,
      NUMCAD: numCad,
    });

    if (!res.success) {
      setStatusMsg({ type: "error", message: res.error! });
      setSqlResult("");
      setRecordCount(0);
      if (onError) onError(res.error!);
      return;
    }

    setSqlResult(res.sql);
    setRecordCount(res.totalRecords);
    const msg = `${res.totalRecords} instrução(ões) SQL gerada(s) com sucesso.`;
    setStatusMsg({ type: "success", message: msg });
    if (onInfo) onInfo(msg);
  }, [numCra, horarios, banco, numEmp, numCad, onError, onInfo]);

  const handleAddHorario = () => {
    setHorarios([...horarios, "08:00"]);
  };

  const handleRemoveHorario = (index: number) => {
    if (horarios.length <= 1) return;
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const handleHorarioChange = (index: number, val: string) => {
    const updated = [...horarios];
    updated[index] = val;
    setHorarios(updated);
  };

  const handleRunFallback = async () => {
    try {
      setLoading(true);
      await api.runCommand("gerador-marcacoes");
      if (onInfo) onInfo("Plugin Gerador de Marcações aberto na janela legada (Tkinter).");
      onClose();
    } catch (err) {
      const msg = `Falha ao abrir plugin legado: ${err instanceof Error ? err.message : String(err)}`;
      setStatusMsg({ type: "error", message: msg });
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, handleGenerate]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal modal--large"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gerador-marcacoes-title"
      >
        <div className="modal__header">
          <div className="modal__header-title">
            <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>⏱️</span>
            <h2 id="gerador-marcacoes-title">Gerador de Marcações — R070ACC</h2>
          </div>
          <button
            type="button"
            className="modal__close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">
          {statusMsg && (
            <div style={{ marginBottom: "16px" }}>
              <ValidationMessage type={statusMsg.type} showIcon>
                {statusMsg.message}
              </ValidationMessage>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="marc-numcra" label="Número do Crachá (NumCra)">
                <Input
                  id="marc-numcra"
                  type="text"
                  value={numCra}
                  onChange={(e) => setNumCra(e.target.value)}
                  autoFocus
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="marc-banco" label="Banco de Dados">
                <Select
                  id="marc-banco"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  options={[
                    { value: "sqlserver", label: "SQL Server" },
                    { value: "oracle", label: "Oracle (TO_DATE)" },
                  ]}
                />
              </FormGroup>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="marc-numemp" label="Código Empresa (NumEmp)">
                <Input
                  id="marc-numemp"
                  type="text"
                  value={numEmp}
                  onChange={(e) => setNumEmp(e.target.value)}
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="marc-numcad" label="Cadastro Colaborador (NumCad)">
                <Input
                  id="marc-numcad"
                  type="text"
                  value={numCad}
                  onChange={(e) => setNumCad(e.target.value)}
                />
              </FormGroup>
            </div>
          </div>

          <FormGroup inputId="marc-horarios" label="Horários de Marcação (HH:MM)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              {horarios.map((h, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Input
                    id={`horario-${idx}`}
                    type="time"
                    value={h}
                    onChange={(e) => handleHorarioChange(idx, e.target.value)}
                    style={{ width: "110px" }}
                  />
                  {horarios.length > 1 && (
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveHorario(idx)}
                      title="Remover horário"
                      style={{ padding: "4px 8px" }}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={handleAddHorario} title="Adicionar novo horário">
                + Adicionar Horário
              </Button>
            </div>
          </FormGroup>

          {sqlResult && (
            <FormGroup
              inputId="marc-result"
              label={`Instruções SQL (${recordCount} registro(s) gerado(s))`}
            >
              <ResultArea
                content={sqlResult}
                format="code"
                copyable
                copyLabel="Copiar SQL"
                minHeight="140px"
              />
            </FormGroup>
          )}
        </div>

        <div className="modal__footer" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
          <div>
            <Button
              variant="secondary"
              onClick={handleRunFallback}
              disabled={loading}
              title="Abre a janela gráfica Tkinter legada"
            >
              🖥️ Abrir no Tkinter (Fallback)
            </Button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="primary" onClick={handleGenerate}>
              ⚡ Gerar Marcações SQL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
