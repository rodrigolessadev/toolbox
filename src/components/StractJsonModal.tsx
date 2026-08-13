import React, { useState, useEffect, useCallback } from "react";
import { FormGroup } from "./FormGroup";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { ResultArea } from "./ResultArea";
import { ValidationMessage } from "./ValidationMessage";
import { api } from "../lib/api";

interface StractJsonModalProps {
  open: boolean;
  onClose: () => void;
  onInfo?: (msg: string) => void;
  onError?: (msg: string) => void;
}

/// Extração recursiva client-side equivalente à função de domínio Python
function extractField(data: unknown, field: string): string[] {
  const results: string[] = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      results.push(...extractField(item, field));
    }
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (field in obj) {
      const val = obj[field];
      results.push(typeof val === "number" ? String(val) : `'${val}'`);
    }

    if (obj.colaborador && typeof obj.colaborador === "object") {
      const col = obj.colaborador as Record<string, unknown>;
      if (field in col) {
        const val = col[field];
        results.push(typeof val === "number" ? String(val) : `'${val}'`);
      }
    }

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && typeof val === "object") {
        results.push(...extractField(val, field));
      }
    }
  }

  return results;
}

export function processJsonExtraction(rawJson: string, fieldName: string) {
  const rawClean = rawJson.trim();
  const fieldClean = fieldName.trim();

  if (!rawClean) {
    return { success: false, values: [], resultStr: "", error: "JSON não pode estar vazio." };
  }
  if (!fieldClean) {
    return { success: false, values: [], resultStr: "", error: "Nome do campo não pode estar vazio." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawClean);
  } catch (e) {
    return {
      success: false,
      values: [],
      resultStr: "",
      error: `JSON inválido: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const rawValues = extractField(parsed, fieldClean);
  const uniqueValues = Array.from(new Set(rawValues));

  if (uniqueValues.length === 0) {
    return {
      success: true,
      values: [],
      resultStr: `Campo "${fieldClean}" não encontrado no JSON.`,
      error: null,
    };
  }

  return {
    success: true,
    values: uniqueValues,
    resultStr: uniqueValues.join(", "),
    error: null,
  };
}

export const StractJsonModal: React.FC<StractJsonModalProps> = ({
  open,
  onClose,
  onInfo,
  onError,
}) => {
  const [rawJson, setRawJson] = useState("");
  const [fieldName, setFieldName] = useState("numeroCadastro");
  const [resultText, setResultText] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStatusMsg(null);
    }
  }, [open]);

  const handleExtract = useCallback(() => {
    setStatusMsg(null);
    const res = processJsonExtraction(rawJson, fieldName);

    if (!res.success) {
      setStatusMsg({ type: "error", message: res.error! });
      setResultText("");
      if (onError) onError(res.error!);
      return;
    }

    if (res.values.length === 0) {
      setStatusMsg({ type: "info", message: res.resultStr });
      setResultText(res.resultStr);
      return;
    }

    setResultText(res.resultStr);
    const msg = `${res.values.length} valor(es) extraído(s) com sucesso.`;
    setStatusMsg({ type: "success", message: msg });
    if (onInfo) onInfo(msg);
  }, [rawJson, fieldName, onError, onInfo]);

  const handleClear = () => {
    setRawJson("");
    setFieldName("numeroCadastro");
    setResultText("");
    setStatusMsg(null);
  };

  const handleRunFallback = async () => {
    try {
      setLoading(true);
      await api.runCommand("stract-json");
      if (onInfo) onInfo("Plugin Stract JSON aberto na janela legada (Tkinter).");
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
        handleExtract();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, handleExtract]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal modal--large"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stract-json-title"
      >
        <div className="modal__header">
          <div className="modal__header-title">
            <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>🔍</span>
            <h2 id="stract-json-title">Stract JSON — Extração de Campos</h2>
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

          <FormGroup
            inputId="stract-json-raw"
            label="Conteúdo JSON"
            help="Cole o objeto ou array JSON bruto que deseja analisar"
          >
            <Textarea
              id="stract-json-raw"
              rows={8}
              placeholder='{"colaborador": {"numeroCadastro": 12345}, "itens": [{"numeroCadastro": 67890}]}'
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              autoFocus
            />
          </FormGroup>

          <FormGroup
            inputId="stract-json-field"
            label="Nome do Campo"
            help="Informe a chave exata a ser buscada recursivamente (ex: numeroCadastro, id, email)"
          >
            <Input
              id="stract-json-field"
              type="text"
              placeholder="numeroCadastro"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </FormGroup>

          {resultText && (
            <FormGroup inputId="stract-json-result" label="Resultado da Extração">
              <ResultArea
                content={resultText}
                copyable
                copyLabel="Copiar"
                minHeight="80px"
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
            <Button variant="secondary" onClick={handleClear}>
              Limpar
            </Button>
            <Button variant="primary" onClick={handleExtract}>
              ⚡ Extrair Valores
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
