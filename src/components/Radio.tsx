import React from 'react';
import { Label } from './Label';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label do radio */
  label: string;
  /** Mensagem de erro */
  error?: string;
}

/**
 * Radio — Componente de radio button com label
 * 
 * @example
 * <Radio 
 *   id="lang-python" 
 *   name="language"
 *   value="python"
 *   label="Python"
 *   checked={lang === 'python'}
 *   onChange={(e) => setLang(e.target.value)}
 * />
 */
export function Radio({
  id,
  label,
  error,
  className,
  ...props
}: RadioProps) {
  const classes = ['radio', error && 'radio--error', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="radio-wrapper">
      <input
        id={id}
        type="radio"
        className={classes}
        {...props}
      />
      <Label htmlFor={id}>{label}</Label>
      {error && <span className="radio__error">{error}</span>}
    </div>
  );
}
