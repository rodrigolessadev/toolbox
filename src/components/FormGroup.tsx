import React from 'react';
import { Label } from './Label';

export interface FormGroupProps {
  /** ID do input associado */
  inputId: string;
  /** Label do campo */
  label: string;
  /** Componente input (Input, Textarea, Select, etc) */
  children: React.ReactNode;
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de ajuda */
  help?: string;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * FormGroup — Componente composto para grupo de formulário
 * Encapsula label, input e mensagens de erro/ajuda
 * 
 * @example
 * <FormGroup
 *   inputId="email"
 *   label="Email"
 *   error={emailError}
 *   help="Seu email para contato"
 *   required
 * >
 *   <Input id="email" type="email" value={email} onChange={handleChange} />
 * </FormGroup>
 */
export function FormGroup({
  inputId,
  label,
  children,
  error,
  help,
  required,
  className,
}: FormGroupProps) {
  const classes = [
    'form-group',
    error && 'form-group--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <div className="form-group__control">
        {children}
      </div>
      {help && !error && (
        <span className="form-group__help">{help}</span>
      )}
      {error && (
        <span className="form-group__error">{error}</span>
      )}
    </div>
  );
}
