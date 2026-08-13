import React, { useState, useEffect, useCallback } from "react";
import { FormGroup } from "./FormGroup";
import { Input } from "./Input";
import { Button } from "./Button";
import { ResultArea } from "./ResultArea";
import { ValidationMessage } from "./ValidationMessage";
import { api } from "../lib/api";

interface GeradorAfdModalProps {
  open: boolean;
  onClose: () => void;
  onInfo?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export function calcularCrc16(data: string): string {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function padLeft(val: string | number, size: number): string {
  return String(val).padStart(size, "0");
}

function padRight(val: string, size: number): string {
  return val.padEnd(size, " ").substring(0, size);
}

function cleanDigits(val: string): string {
  return val.replace(/\D/g, "");
}

export function gerarAfdContent(
  repNumber: string,
  cnpj: string,
  razaoSocial: string,
  dataInicial: string,
  dataFinal: string,
  cpfColaborador: string
): string {
  const repNumClean = padLeft(cleanDigits(repNumber), 17);
  const cnpjClean = padLeft(cleanDigits(cnpj), 14);
  const razaoPadded = padRight(razaoSocial, 150);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const dh = `${yyyy}-${mm}-${dd}T${hh}:${min}:00-0300`;

  // Tipo 1 Header
  const reg1Base = `${padLeft(0, 9)}11${cnpjClean}${padLeft("", 14)}${razaoPadded}${repNumClean}${dataInicial}${dataFinal}${dh}003112345678000195`;
  const reg1Crc = calcularCrc16(reg1Base);
  const line1 = reg1Base + reg1Crc;

  // Tipo 2 Registro Estabelecimento
  const reg2Base = `${padLeft(1, 9)}2${dh}1${cnpjClean}${padLeft("", 14)}${razaoPadded}LOCAL TESTE DE TRABALHO               `;
  const reg2Crc = calcularCrc16(reg2Base);
  const line2 = reg2Base + reg2Crc;

  // Tipo 3 Marcação Exemplo
  const cpfClean = padLeft(cleanDigits(cpfColaborador || "12345678900"), 11);
  const reg3Base = `${padLeft(2, 9)}3${dh}${cpfClean}`;
  const reg3Crc = calcularCrc16(reg3Base);
  const line3 = reg3Base + reg3Crc;

  // Tipo 9 Trailer
  const reg9Base = `${padLeft(3, 9)}900000001000000010000000100000000000000000000000009`;
  const reg9Crc = calcularCrc16(reg9Base);
  const line9 = reg9Base + reg9Crc;

  return [line1, line2, line3, line9].join("\r\n");
}

export const GeradorAfdModal: React.FC<GeradorAfdModalProps> = ({
  open,
  onClose,
  onInfo,
  onError,
}) => {
  const [repNumber, setRepNumber] = useState("00000000000000001");
  const [cnpj, setCnpj] = useState("12345678000195");
  const [razaoSocial, setRazaoSocial] = useState("EMPRESA DEMO S.A.");
  const [dataInicial, setDataInicial] = useState("01/01/2025");
  const [dataFinal, setDataFinal] = useState("31/01/2025");
  const [cpf, setCpf] = useState("12345678900");
  const [afdResult, setAfdResult] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStatusMsg(null);
    }
  }, [open]);

  const handleGenerate = useCallback(() => {
    setStatusMsg(null);
    if (!repNumber.trim() || !cnpj.trim() || !razaoSocial.trim()) {
      const err = "REP, CNPJ e Razão Social são obrigatórios.";
      setStatusMsg({ type: "error", message: err });
      if (onError) onError(err);
      return;
    }

    try {
      const content = gerarAfdContent(repNumber, cnpj, razaoSocial, dataInicial, dataFinal, cpf);
      setAfdResult(content);
      const msg = "Arquivo AFD (Padrão REP-C com CRC16) gerado com sucesso.";
      setStatusMsg({ type: "success", message: msg });
      if (onInfo) onInfo(msg);
    } catch (e) {
      const err = `Falha na geração do AFD: ${e instanceof Error ? e.message : String(e)}`;
      setStatusMsg({ type: "error", message: err });
      if (onError) onError(err);
    }
  }, [repNumber, cnpj, razaoSocial, dataInicial, dataFinal, cpf, onError, onInfo]);

  const handleRunFallback = async () => {
    try {
      setLoading(true);
      await api.runCommand("gerador-afd");
      if (onInfo) onInfo("Plugin Gerador de AFD aberto na janela legada (Tkinter).");
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
        aria-labelledby="gerador-afd-title"
      >
        <div className="modal__header">
          <div className="modal__header-title">
            <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>📜</span>
            <h2 id="gerador-afd-title">Gerador de AFD (REP-C com Checksum CRC16)</h2>
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
              <FormGroup inputId="afd-rep" label="Número do REP (até 17 dígitos)">
                <Input
                  id="afd-rep"
                  type="text"
                  value={repNumber}
                  onChange={(e) => setRepNumber(e.target.value)}
                  autoFocus
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="afd-cnpj" label="CNPJ do Empregador">
                <Input
                  id="afd-cnpj"
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </FormGroup>
            </div>
          </div>

          <FormGroup inputId="afd-razao" label="Razão Social (até 150 caracteres)">
            <Input
              id="afd-razao"
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="afd-dini" label="Data Inicial (DD/MM/AAAA)">
                <Input
                  id="afd-dini"
                  type="text"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="afd-dfim" label="Data Final (DD/MM/AAAA)">
                <Input
                  id="afd-dfim"
                  type="text"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </FormGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FormGroup inputId="afd-cpf" label="CPF Colaborador">
                <Input
                  id="afd-cpf"
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </FormGroup>
            </div>
          </div>

          {afdResult && (
            <FormGroup inputId="afd-result" label="Conteúdo AFD Gerado (Padrão REP-C)">
              <ResultArea
                content={afdResult}
                format="code"
                copyable
                copyLabel="Copiar Conteúdo AFD"
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
              ⚡ Gerar Arquivo AFD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
