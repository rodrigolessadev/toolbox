import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Texto do label */
  children: React.ReactNode;
  /** Se o campo associado é obrigatório */
  required?: boolean;
}

/**
 * Label — Componente acessível de label
 * 
 * @example
 * <Label htmlFor="email" required>
 *   Email
 * </Label>
 * <Input id="email" type="email" />
 */
export function Label({ required, children, className, ...props }: LabelProps) {
  const classes = ['label', required && 'label--required', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes} {...props}>
      {children}
      {required && <span className="label__required" aria-label="obrigatório">*</span>}
    </label>
  );
}
