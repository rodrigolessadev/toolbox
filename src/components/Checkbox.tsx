import React from 'react';
import { Label } from './Label';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label do checkbox */
  label: string;
  /** Mensagem de erro */
  error?: string;
}

/**
 * Checkbox — Componente de checkbox com label
 * 
 * @example
 * <Checkbox 
 *   id="agree" 
 *   label="Concordo com os termos"
 *   checked={agree}
 *   onChange={(e) => setAgree(e.target.checked)}
 * />
 */
export function Checkbox({
  id,
  label,
  error,
  className,
  ...props
}: CheckboxProps) {
  const classes = ['checkbox', error && 'checkbox--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="checkbox-wrapper">
      <input
        id={id}
        type="checkbox"
        className={classes}
        {...props}
      />
      <Label htmlFor={id}>{label}</Label>
      {error && <span className="checkbox__error">{error}</span>}
    </div>
  );
}
