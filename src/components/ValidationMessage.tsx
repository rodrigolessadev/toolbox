import React from 'react';

export interface ValidationMessageProps {
  /** Tipo de mensagem */
  type?: 'error' | 'success' | 'warning' | 'info';
  /** Conteúdo da mensagem */
  children: React.ReactNode;
  /** Mostrar ícone */
  showIcon?: boolean;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * ValidationMessage — Componente para mensagens de validação
 * 
 * @example
 * <ValidationMessage type="error">
 *   Campo obrigatório
 * </ValidationMessage>
 * 
 * <ValidationMessage type="success" showIcon>
 *   Dados salvos com sucesso!
 * </ValidationMessage>
 */
export function ValidationMessage({
  type = 'info',
  children,
  showIcon,
  className,
}: ValidationMessageProps) {
  const icon = {
    error: '✕',
    success: '✓',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  const classes = [
    'validation-message',
    `validation-message--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert" aria-live="polite">
      {showIcon && (
        <span className="validation-message__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="validation-message__text">{children}</span>
    </div>
  );
}
