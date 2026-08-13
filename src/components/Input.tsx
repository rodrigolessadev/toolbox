import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Mensagem de erro (mostra validação) */
  error?: string;
  /** Mensagem de sucesso */
  success?: boolean;
  /** Tamanho visual do input */
  sizeVariant?: 'sm' | 'md' | 'lg';
}

/**
 * Input — Componente base de input text
 * 
 * @example
 * <Input 
 *   placeholder="Digite algo..." 
 *   error="Campo obrigatório"
 * />
 * 
 * <Input type="email" success />
 */
export function Input({
  error,
  success,
  sizeVariant = 'md',
  className,
  ...props
}: InputProps) {
  const classes = [
    'input',
    `input--${sizeVariant}`,
    error && 'input--error',
    success && 'input--success',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <input className={classes} {...props} />
      {error && <span className="input__error">{error}</span>}
    </>
  );
}
