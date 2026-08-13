import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Opções do select: [{ label, value }, ...] */
  options: Array<{ label: string; value: string | number }>;
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de sucesso */
  success?: boolean;
  /** Label placeholder (antes de selecionar) */
  placeholder?: string;
}

/**
 * Select — Componente de seleção
 * 
 * @example
 * <Select 
 *   options={[
 *     { label: 'Python', value: 'python' },
 *     { label: 'Node.js', value: 'node' },
 *   ]}
 *   value="python"
 *   onChange={(e) => setLang(e.target.value)}
 * />
 */
export function Select({
  options,
  error,
  success,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const classes = [
    'select',
    error && 'select--error',
    success && 'select--success',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <select className={classes} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="select__error">{error}</span>}
    </>
  );
}
