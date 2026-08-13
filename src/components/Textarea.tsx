import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de sucesso */
  success?: boolean;
  /** Mostrar contador de caracteres */
  showCounter?: boolean;
  /** Máximo de caracteres (para contador) */
  maxLength?: number;
}

/**
 * Textarea — Componente de área de texto
 * 
 * @example
 * <Textarea 
 *   placeholder="Digite uma descrição..." 
 *   showCounter 
 *   maxLength={500}
 * />
 */
export function Textarea({
  error,
  success,
  showCounter,
  maxLength,
  value,
  className,
  ...props
}: TextareaProps) {
  const classes = [
    'textarea',
    error && 'textarea--error',
    success && 'textarea--success',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <>
      <textarea
        className={classes}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {showCounter && maxLength && (
        <span className="textarea__counter">
          {charCount} / {maxLength}
        </span>
      )}
      {error && <span className="textarea__error">{error}</span>}
    </>
  );
}
