import React, { useState, useEffect, useCallback } from "react";
import { FormGroup } from "./FormGroup";
import { Input } from "./Input";
import { Button } from "./Button";
import { ResultArea } from "./ResultArea";
import { ValidationMessage } from "./ValidationMessage";
import { api } from "../lib/api";

interface ConverterDataModalProps {
  open: boolean;
  onClose: () => void;
  onInfo?: (msg: string) => void;
  onError?: (msg: string) => void;
}

const BASE_DATE_TIME = new Date(Date.UTC(1899, 11, 30, 0, 0, 0));

export function convertDateTimeToSerial(dateStr: string, timeStr: string) {
  const dClean = dateStr.trim();
  const tClean = timeStr.trim();

  if (!dClean || !tClean) {
    return { success: false, serial: null, error: "Data e hora devem ser fornecidas." };
  }

  const dateParts = dClean.split("-");
  const timeParts = tClean.split(":");

  if (dateParts.length !== 3 || timeParts.length < 2) {
    return { success: false, serial: null, error: "Formato de data (YYYY-MM-DD) ou hora (HH:MM) inválido." };
  }

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    return { success: false, serial: null, error: "Valores numéricos de data/hora inválidos." };
  }

  const target = new Date(Date.UTC(year, month, day, hour, minute, 0));
  const diffDays = (target.getTime() - BASE_DATE_TIME.getTime()) / (86400 * 1000);
  const serial = Math.round(diffDays * 100000) / 100000;

  return { success: true, serial, error: null };
}

export const ConverterDataModal: React.FC<ConverterDataModalProps> = ({
  open,
  onClose,
  onInfo,
  onError,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [dateVal, setDateVal] = useState(todayStr);
  const [timeVal, setTimeVal] = useState("12:00");
  const [resultSerial, setResultSerial] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStatusMsg(null);
    }
  }, [open]);

  const handleConvert = useCallback(() => {
    setStatusMsg(null);
    const res = convertDateTimeToSerial(dateVal, timeVal);

    if (!res.success) {
      setStatusMsg({ type: "error", message: res.error! });
      setResultSerial("");
      if (onError) onError(res.error!);
      return;
    }

    const sStr = String(res.serial);
    setResultSerial(sStr);
    const msg = `Número serial gerado com sucesso: ${sStr}`;
    setStatusMsg({ type: "success", message: msg });
    if (onInfo) onInfo(msg);
  }, [dateVal, timeVal, onError, onInfo]);

  const handleFillNow = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    setDateVal(`${yyyy}-${mm}-${dd}`);
    setTimeVal(`${hh}:${min}`);
  };

  const handleRunFallback = async () => {
    try {
      setLoading(true);
      await api.runCommand("converter-data");
      if (onInfo) onInfo("Plugin Converter Data aberto na janela legada (Tkinter).");
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
        handleConvert();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, handleConvert]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="converter-data-title"
      >
        <div className="modal__header">
          <div className="modal__header-title">
            <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>📅</span>
            <h2 id="converter-data-title">Converter Data — Excel Serial</h2>
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

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="conv-date" label="Data (AAAA-MM-DD)">
                <Input
                  id="conv-date"
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  autoFocus
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="conv-time" label="Hora (HH:MM)">
                <Input
                  id="conv-time"
                  type="time"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                />
              </FormGroup>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Button variant="secondary" onClick={handleFillNow} title="Preencher com data e hora atuais">
              🕒 Usar Data/Hora Atual
            </Button>
          </div>

          {resultSerial && (
            <FormGroup inputId="conv-result" label="Número Serial Excel (Base 30/12/1899)">
              <ResultArea
                content={resultSerial}
                copyable
                copyLabel="Copiar Serial"
                minHeight="50px"
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
            <Button variant="primary" onClick={handleConvert}>
              ⚡ Converter Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
