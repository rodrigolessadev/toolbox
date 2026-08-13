import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Conteúdo do botão */
  children: React.ReactNode;
}

/**
 * Button — Componente base de botão reutilizável
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Clique aqui
 * </Button>
 * 
 * <Button variant="danger" size="lg" disabled>
 *   Deletar
 * </Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
