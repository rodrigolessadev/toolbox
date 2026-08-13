import React from 'react';
import { CopyButton } from './CopyButton';

export interface ResultAreaProps {
  /** Conteúdo a exibir */
  content: string | React.ReactNode;
  /** Formato do resultado ('text', 'json', 'code', etc) */
  format?: 'text' | 'json' | 'code' | 'html';
  /** Permitir copiar */
  copyable?: boolean;
  /** Label do botão copiar */
  copyLabel?: string;
  /** Callback ao copiar */
  onCopy?: () => void;
  /** Altura mínima */
  minHeight?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * ResultArea — Área de resultado com suporte a copiar
 * 
 * @example
 * <ResultArea
 *   content={JSON.stringify(data, null, 2)}
 *   format="json"
 *   copyable
 *   minHeight="200px"
 * />
 */
export function ResultArea({
  content,
  format = 'text',
  copyable,
  copyLabel,
  onCopy,
  minHeight = '150px',
  className,
}: ResultAreaProps) {
  const contentString =
    typeof content === 'string' ? content : String(content);

  return (
    <div className={`result-area result-area--${format} ${className || ''}`}>
      <pre className="result-area__content" style={{ minHeight }}>
        <code>{contentString}</code>
      </pre>
      {copyable && (
        <div className="result-area__actions">
          <CopyButton
            text={contentString}
            label={copyLabel}
            onCopy={onCopy}
            className="result-area__copy-btn"
          />
        </div>
      )}
    </div>
  );
}
