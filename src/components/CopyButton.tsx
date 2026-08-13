import { useState } from 'react';

export interface CopyButtonProps {
  /** Texto a copiar */
  text: string;
  /** Label do botão */
  label?: string;
  /** Callback ao copiar */
  onCopy?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * CopyButton — Botão de copiar com feedback
 * 
 * @example
 * <CopyButton text="npm install" label="Copiar comando" />
 */
export function CopyButton({
  text,
  label = 'Copiar',
  onCopy,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <button
      className={`copy-button ${copied ? 'copy-button--copied' : ''} ${className || ''}`}
      onClick={handleCopy}
      title={copied ? 'Copiado!' : label}
      aria-pressed={copied}
    >
      <span className="copy-button__icon">{copied ? '✓' : '📋'}</span>
      <span className="copy-button__text">{copied ? 'Copiado!' : label}</span>
    </button>
  );
}
